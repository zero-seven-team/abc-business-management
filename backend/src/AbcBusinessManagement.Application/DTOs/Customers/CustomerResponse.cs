namespace AbcBusinessManagement.Application.DTOs.Customers;

public sealed class CustomerResponse
{
    public Guid Id { get; init; }
    public string CustomerCode { get; init; } = string.Empty;
    public string CompanyName { get; init; } = string.Empty;
    public string TaxCode { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string ContactEmail { get; init; } = string.Empty;
    public string ContactPhone { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;
}
