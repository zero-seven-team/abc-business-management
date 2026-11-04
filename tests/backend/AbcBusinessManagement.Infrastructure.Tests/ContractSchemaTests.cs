using AbcBusinessManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql;

namespace AbcBusinessManagement.Infrastructure.Tests;

public class ContractSchemaTests(PostgresFixture database) : IClassFixture<PostgresFixture>
{
    private static readonly Guid CustomerId = Guid.Parse("11111111-1111-1111-1111-111111111101");
    private static int sequence;

    [Fact]
    public async Task MigrationSeedsCustomersAndCanBeAppliedTwice()
    {
        await using var context = database.CreateContext();
        await context.Database.MigrateAsync();

        Assert.Equal(3, await context.Customers.CountAsync());
        Assert.Equal(2, await context.Customers.CountAsync(x => x.Status == "Active"));
        Assert.Equal("Inactive", (await context.Customers.SingleAsync(x => x.CustomerCode == "KH-ABC-004")).Status);
        Assert.False(context.Database.HasPendingModelChanges());
    }

    [Fact]
    public async Task DraftWithoutAttachmentsPersistsDatesValueAndUtcTimestamp()
    {
        var contract = NewContract();
        await using (var context = database.CreateContext())
        {
            context.Contracts.Add(contract);
            await context.SaveChangesAsync();
        }

        await using var reloadedContext = database.CreateContext();
        var saved = await reloadedContext.Contracts.Include(x => x.Attachments).SingleAsync(x => x.Id == contract.Id);
        Assert.Equal("Draft", saved.Status);
        Assert.Equal("VND", saved.Currency);
        Assert.Equal(contract.EffectiveFrom, saved.EffectiveFrom);
        Assert.Equal(contract.ContractValue, saved.ContractValue);
        Assert.Equal(DateTimeKind.Utc, saved.CreatedAt.Kind);
        Assert.Empty(saved.Attachments);
    }

    [Fact]
    public async Task ConcurrentDuplicateCodesAllowOnlyOneContract()
    {
        var first = NewContract();
        var second = NewContract();
        second.ContractCode = first.ContractCode;

        async Task<string?> SaveAsync(Contract contract)
        {
            await using var context = database.CreateContext();
            context.Contracts.Add(contract);
            try
            {
                await context.SaveChangesAsync();
                return null;
            }
            catch (DbUpdateException exception) when (exception.InnerException is PostgresException postgres)
            {
                Assert.Equal("ux_contracts_contract_code", postgres.ConstraintName);
                return postgres.SqlState;
            }
        }

        var results = await Task.WhenAll(SaveAsync(first), SaveAsync(second));
        Assert.Single(results, x => x is null);
        Assert.Single(results, x => x == PostgresErrorCodes.UniqueViolation);
    }

    [Theory]
    [InlineData("dates", "ck_contracts_dates")]
    [InlineData("value", "ck_contracts_value")]
    [InlineData("name", "ck_contracts_name")]
    [InlineData("currency", "ck_contracts_currency")]
    [InlineData("payment", "ck_contracts_payment_terms")]
    [InlineData("service", "ck_contracts_service_terms")]
    public async Task InvalidContractViolatesDatabaseConstraint(string field, string constraint)
    {
        var contract = NewContract();
        switch (field)
        {
            case "dates": contract.EffectiveTo = contract.EffectiveFrom.AddDays(-1); break;
            case "value": contract.ContractValue = 0; break;
            case "name": contract.ContractName = "   "; break;
            case "currency": contract.Currency = "USD"; break;
            case "payment": contract.PaymentTerms = "short"; break;
            case "service": contract.ServiceTerms = new string('a', 4001); break;
        }
        await using var context = database.CreateContext();
        context.Contracts.Add(contract);
        var exception = await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        var postgres = Assert.IsType<PostgresException>(exception.InnerException);
        Assert.Equal(PostgresErrorCodes.CheckViolation, postgres.SqlState);
        Assert.Equal(constraint, postgres.ConstraintName);
    }

    [Fact]
    public async Task MissingCustomerViolatesForeignKey()
    {
        var contract = NewContract();
        contract.CustomerId = Guid.NewGuid();
        await using var context = database.CreateContext();
        context.Contracts.Add(contract);
        var exception = await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        Assert.Equal(PostgresErrorCodes.ForeignKeyViolation, Assert.IsType<PostgresException>(exception.InnerException).SqlState);
    }

    [Theory]
    [InlineData(0, "draft.pdf", "ck_contract_attachments_size")]
    [InlineData(20971521, "draft.pdf", "ck_contract_attachments_size")]
    [InlineData(100, "draft.exe", "ck_contract_attachments_extension")]
    public async Task InvalidAttachmentViolatesDatabaseConstraint(long size, string name, string constraint)
    {
        var contract = NewContract();
        contract.Attachments.Add(NewAttachment(size, name));
        await using var context = database.CreateContext();
        context.Contracts.Add(contract);
        var exception = await Assert.ThrowsAsync<DbUpdateException>(() => context.SaveChangesAsync());
        Assert.Equal(constraint, Assert.IsType<PostgresException>(exception.InnerException).ConstraintName);
    }

    [Fact]
    public async Task DeletingContractCascadesAttachmentsButKeepsCustomer()
    {
        var contract = NewContract();
        var attachment = NewAttachment(20971520, "draft.PDF");
        contract.Attachments.Add(attachment);
        await using (var context = database.CreateContext())
        {
            context.Contracts.Add(contract);
            await context.SaveChangesAsync();
        }
        await using (var context = database.CreateContext())
        {
            await context.Contracts.Where(x => x.Id == contract.Id).ExecuteDeleteAsync();
        }
        await using var reloadedContext = database.CreateContext();
        Assert.False(await reloadedContext.ContractAttachments.AnyAsync(x => x.Id == attachment.Id));
        Assert.True(await reloadedContext.Customers.AnyAsync(x => x.Id == CustomerId));
    }

    [Fact]
    public async Task CustomerWithContractCannotBeDeleted()
    {
        await using var context = database.CreateContext();
        var contract = NewContract();
        context.Contracts.Add(contract);
        await context.SaveChangesAsync();
        var exception = await Assert.ThrowsAsync<PostgresException>(() =>
            context.Customers.Where(x => x.Id == CustomerId).ExecuteDeleteAsync());
        Assert.Equal(PostgresErrorCodes.ForeignKeyViolation, exception.SqlState);
    }

    [Fact]
    public async Task MigrationCanRollbackAndReapply()
    {
        await using var context = database.CreateContext();
        var migrator = context.GetService<IMigrator>();
        await migrator.MigrateAsync("0");
        Assert.Empty(await context.Database.GetAppliedMigrationsAsync());
        await migrator.MigrateAsync();
        Assert.Equal(3, await context.Customers.CountAsync());
    }

    private static Contract NewContract() => new()
    {
        ContractCode = $"HD-2026-{Interlocked.Increment(ref sequence):D3}",
        ContractName = "Hợp đồng vận chuyển",
        CustomerId = CustomerId,
        EffectiveFrom = new DateOnly(2026, 11, 1),
        EffectiveTo = new DateOnly(2027, 11, 1),
        ContractValue = 1250000000.25m,
        PaymentTerms = "Thanh toán trong vòng 30 ngày.",
        ServiceTerms = "Vận chuyển hàng hóa theo thỏa thuận.",
        CreatedBy = "NV-KD-001 | Nguyễn Văn An"
    };

    private static ContractAttachment NewAttachment(long size, string name) => new()
    {
        FileName = name,
        StoredFileName = $"{Guid.NewGuid()}.pdf",
        FilePath = "uploads/contracts/draft.pdf",
        ContentType = "application/pdf",
        FileSize = size,
        UploadedBy = "NV-KD-001 | Nguyễn Văn An"
    };
}
