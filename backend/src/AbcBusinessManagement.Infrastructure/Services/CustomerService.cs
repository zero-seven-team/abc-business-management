using AbcBusinessManagement.Application.DTOs.Customers;
using AbcBusinessManagement.Application.Interfaces;
using AbcBusinessManagement.Domain.Constants;
using AbcBusinessManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AbcBusinessManagement.Infrastructure.Services;

public sealed class CustomerService(ApplicationDbContext dbContext) : ICustomerService
{
    public async Task<IReadOnlyList<CustomerResponse>> GetCustomersAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Customers.AsNoTracking();

        if (activeOnly)
        {
            query = query.Where(x => x.Status == AuditConstants.ActiveCustomerStatus);
        }

        return await query
            .OrderBy(x => x.CustomerCode)
            .Select(x => new CustomerResponse
            {
                Id = x.Id,
                CustomerCode = x.CustomerCode,
                CompanyName = x.CompanyName,
                TaxCode = x.TaxCode,
                ContactPerson = x.ContactPerson,
                ContactEmail = x.ContactEmail,
                ContactPhone = x.ContactPhone,
                Address = x.Address,
                Status = x.Status
            })
            .ToListAsync(cancellationToken);
    }
}
