using AbcBusinessManagement.Domain.Common;

namespace AbcBusinessManagement.Domain.Entities;

public class Contract : BaseEntity
{
    public string ContractCode { get; set; } = string.Empty;
    public string ContractName { get; set; } = string.Empty;
    public Guid CustomerId { get; set; }
    public DateOnly EffectiveFrom { get; set; }
    public DateOnly EffectiveTo { get; set; }
    public decimal ContractValue { get; set; }
    public string Currency { get; set; } = "VND";
    public string PaymentTerms { get; set; } = string.Empty;
    public string ServiceTerms { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public string CreatedBy { get; set; } = string.Empty;
    public Customer Customer { get; set; } = null!;
    public ICollection<ContractAttachment> Attachments { get; set; } = new List<ContractAttachment>();
}
