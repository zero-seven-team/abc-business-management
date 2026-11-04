namespace AbcBusinessManagement.Application.DTOs.Contracts;

public sealed class CreateContractRequest
{
    public string ContractName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly EffectiveTo { get; set; }
    public decimal ContractValue { get; set; }
    public string? Currency { get; set; } = "VND";
    public string PaymentTerms { get; set; } = string.Empty;
    public string ServiceTerms { get; set; } = string.Empty;
}
