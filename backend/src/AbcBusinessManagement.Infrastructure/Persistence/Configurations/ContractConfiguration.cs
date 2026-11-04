using AbcBusinessManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AbcBusinessManagement.Infrastructure.Persistence.Configurations;

public class ContractConfiguration : IEntityTypeConfiguration<Contract>
{
    public void Configure(EntityTypeBuilder<Contract> builder)
    {
        builder.ToTable("contracts", table =>
        {
            table.HasCheckConstraint("ck_contracts_code", "contract_code ~ '^HD-[0-9]{4}-[0-9]{3,}$'");
            table.HasCheckConstraint("ck_contracts_name", "char_length(btrim(contract_name)) BETWEEN 5 AND 255");
            table.HasCheckConstraint("ck_contracts_dates", "effective_from <= effective_to");
            table.HasCheckConstraint("ck_contracts_value", "contract_value > 0");
            table.HasCheckConstraint("ck_contracts_currency", "currency = 'VND'");
            table.HasCheckConstraint("ck_contracts_payment_terms", "char_length(btrim(payment_terms)) BETWEEN 10 AND 4000");
            table.HasCheckConstraint("ck_contracts_service_terms", "char_length(btrim(service_terms)) BETWEEN 10 AND 4000");
        });
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ContractCode).HasColumnName("contract_code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.ContractName).HasColumnName("contract_name").HasMaxLength(255).IsRequired();
        builder.Property(x => x.CustomerId).HasColumnName("customer_id");
        builder.Property(x => x.EffectiveFrom).HasColumnName("effective_from").HasColumnType("date");
        builder.Property(x => x.EffectiveTo).HasColumnName("effective_to").HasColumnType("date");
        builder.Property(x => x.ContractValue).HasColumnName("contract_value").HasPrecision(18, 2);
        builder.Property(x => x.Currency).HasColumnName("currency").HasMaxLength(10).HasDefaultValue("VND").IsRequired();
        builder.Property(x => x.PaymentTerms).HasColumnName("payment_terms").HasColumnType("text").IsRequired();
        builder.Property(x => x.ServiceTerms).HasColumnName("service_terms").HasColumnType("text").IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(30).HasDefaultValue("Draft").IsRequired();
        builder.Property(x => x.CreatedBy).HasColumnName("created_by").HasMaxLength(100).IsRequired();
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").HasColumnType("timestamp with time zone");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at").HasColumnType("timestamp with time zone");
        builder.HasIndex(x => x.ContractCode).IsUnique().HasDatabaseName("ux_contracts_contract_code");
        builder.HasOne(x => x.Customer).WithMany(x => x.Contracts).HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
