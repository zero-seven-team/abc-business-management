using AbcBusinessManagement.Application.Contracts;
using AbcBusinessManagement.Application.DTOs.Contracts;
using AbcBusinessManagement.Application.Interfaces;
using AbcBusinessManagement.Domain.Common;
using AbcBusinessManagement.Domain.Constants;
using AbcBusinessManagement.Domain.Entities;
using AbcBusinessManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;

namespace AbcBusinessManagement.Infrastructure.Services;

public sealed class ContractService(
    ApplicationDbContext dbContext,
    ILogger<ContractService> logger) : IContractService
{
    public async Task<ContractDetailResponse> CreateDraftAsync(
        CreateContractRequest request,
        CancellationToken cancellationToken = default)
    {
        CreateContractValidator.Validate(request, out var trimmedName, out var trimmedPaymentTerms, out var trimmedServiceTerms);

        var customer = await dbContext.Customers
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.CustomerId, cancellationToken);

        if (customer is null)
        {
            throw new DomainException(
                "CUSTOMER_NOT_FOUND",
                $"Khách hàng với mã định danh '{request.CustomerId}' không tồn tại trong hệ thống.");
        }

        if (!string.Equals(customer.Status, AuditConstants.ActiveCustomerStatus, StringComparison.OrdinalIgnoreCase))
        {
            throw new DomainException(
                "CUSTOMER_INACTIVE",
                $"Khách hàng '{customer.CustomerCode}' hiện đang ở trạng thái ngưng hoạt động (Inactive), không thể tạo hợp đồng mới.");
        }

        var year = DateTime.UtcNow.Year;
        for (var attempt = 1; attempt <= AuditConstants.MaxContractCodeRetries; attempt++)
        {
            var nextCode = await GenerateNextContractCodeAsync(year, cancellationToken);
            var now = DateTime.UtcNow;

            var contract = new Contract
            {
                Id = Guid.NewGuid(),
                ContractCode = nextCode,
                ContractName = trimmedName,
                CustomerId = customer.Id,
                EffectiveFrom = request.EffectiveFrom,
                EffectiveTo = request.EffectiveTo,
                ContractValue = decimal.Round(request.ContractValue, 2),
                Currency = AuditConstants.DefaultCurrency,
                PaymentTerms = trimmedPaymentTerms,
                ServiceTerms = trimmedServiceTerms,
                Status = AuditConstants.DraftStatus,
                CreatedBy = AuditConstants.DefaultActor,
                CreatedAt = now,
                UpdatedAt = null
            };

            dbContext.Contracts.Add(contract);

            try
            {
                await dbContext.SaveChangesAsync(cancellationToken);
                logger.LogInformation(
                    "Created draft contract {ContractCode} ({ContractId}) for customer {CustomerCode}",
                    contract.ContractCode,
                    contract.Id,
                    customer.CustomerCode);

                return MapToDetailResponse(contract, customer, []);
            }
            catch (DbUpdateException ex) when (IsContractCodeUniqueViolation(ex))
            {
                dbContext.Entry(contract).State = EntityState.Detached;
                logger.LogWarning(
                    ex,
                    "Contract code collision detected for {ContractCode} on attempt {Attempt}/{MaxRetries}",
                    nextCode,
                    attempt,
                    AuditConstants.MaxContractCodeRetries);
            }
        }

        throw new DomainException(
            "CONTRACT_CODE_CONFLICT",
            "Hệ thống đang xử lý nhiều yêu cầu tạo hợp đồng đồng thời. Vui lòng thử lại sau giây lát.");
    }

    public async Task<ContractDetailResponse> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var contract = await dbContext.Contracts
            .AsNoTracking()
            .Include(x => x.Customer)
            .Include(x => x.Attachments)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (contract is null)
        {
            throw new DomainException(
                "CONTRACT_NOT_FOUND",
                $"Không tìm thấy hợp đồng với mã định danh '{id}'.");
        }

        var orderedAttachments = contract.Attachments
            .OrderBy(x => x.UploadedAt)
            .ThenBy(x => x.FileName)
            .ToList();

        return MapToDetailResponse(contract, contract.Customer, orderedAttachments);
    }

    private async Task<string> GenerateNextContractCodeAsync(int year, CancellationToken cancellationToken)
    {
        var prefix = $"HD-{year}-";
        var existingCodes = await dbContext.Contracts
            .AsNoTracking()
            .Where(x => x.ContractCode.StartsWith(prefix))
            .Select(x => x.ContractCode)
            .ToListAsync(cancellationToken);

        var maxSequence = 0;
        foreach (var code in existingCodes)
        {
            var suffix = code[prefix.Length..];
            if (int.TryParse(suffix, out var sequence) && sequence > maxSequence)
            {
                maxSequence = sequence;
            }
        }

        return $"{prefix}{maxSequence + 1:D3}";
    }

    private static bool IsContractCodeUniqueViolation(DbUpdateException exception)
    {
        if (exception.InnerException is PostgresException postgresException)
        {
            return postgresException.SqlState == PostgresErrorCodes.UniqueViolation &&
                   (string.IsNullOrEmpty(postgresException.ConstraintName) ||
                    postgresException.ConstraintName.Contains("contract_code", StringComparison.OrdinalIgnoreCase));
        }

        var message = exception.InnerException?.Message ?? exception.Message;
        return message.Contains("ux_contracts_contract_code", StringComparison.OrdinalIgnoreCase) ||
               message.Contains("23505", StringComparison.OrdinalIgnoreCase);
    }

    private static ContractDetailResponse MapToDetailResponse(
        Contract contract,
        Customer customer,
        IReadOnlyList<ContractAttachment> attachments)
    {
        return new ContractDetailResponse
        {
            Id = contract.Id,
            ContractCode = contract.ContractCode,
            ContractName = contract.ContractName,
            CustomerId = contract.CustomerId,
            CustomerCode = customer.CustomerCode,
            CustomerName = customer.CompanyName,
            EffectiveFrom = contract.EffectiveFrom,
            EffectiveTo = contract.EffectiveTo,
            ContractValue = contract.ContractValue,
            Currency = contract.Currency,
            PaymentTerms = contract.PaymentTerms,
            ServiceTerms = contract.ServiceTerms,
            Status = contract.Status,
            CreatedBy = contract.CreatedBy,
            CreatedAt = contract.CreatedAt,
            UpdatedAt = contract.UpdatedAt,
            Attachments = attachments.Select(x => new ContractAttachmentResponse
            {
                Id = x.Id,
                ContractId = x.ContractId,
                FileName = x.FileName,
                ContentType = x.ContentType,
                FileSize = x.FileSize,
                UploadedBy = x.UploadedBy,
                UploadedAt = x.UploadedAt
            }).ToList()
        };
    }
}
