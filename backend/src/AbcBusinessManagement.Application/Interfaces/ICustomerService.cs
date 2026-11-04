using AbcBusinessManagement.Application.DTOs.Customers;

namespace AbcBusinessManagement.Application.Interfaces;

public interface ICustomerService
{
    Task<IReadOnlyList<CustomerResponse>> GetCustomersAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default);
}
