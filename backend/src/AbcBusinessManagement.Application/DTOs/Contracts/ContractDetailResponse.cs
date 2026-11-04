namespace AbcBusinessManagement.Application.DTOs.Contracts;

public sealed class ContractDetailResponse
{
    public Guid Id { get; init; }
    public string ContractCode { get; init; } = string.Empty;
    public string ContractName { get; init; } = string.Empty;
    public Guid CustomerId { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public DateOnly EffectiveFrom { get; init; }
    public DateOnly EffectiveTo { get; init; }
    public decimal ContractValue { get; init; }
    public string Currency { get; init; } = "VND";
    public string PaymentTerms { get; init; } = string.Empty;
    public string ServiceTerms { get; init; } = string.Empty;
    public string Status { get; init; } = "Draft";
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public IReadOnlyList<ContractAttachmentResponse> Attachments { get; init; } = [];
}
