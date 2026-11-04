using AbcBusinessManagement.Application.DTOs.Customers;
using AbcBusinessManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AbcBusinessManagement.Api.Controllers;

[ApiController]
[Route("api/customers")]
public sealed class CustomersController(ICustomerService customerService) : ControllerBase
{
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<CustomerResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default)
    {
        var customers = await customerService.GetCustomersAsync(activeOnly, cancellationToken);
        return Ok(customers);
    }
}
