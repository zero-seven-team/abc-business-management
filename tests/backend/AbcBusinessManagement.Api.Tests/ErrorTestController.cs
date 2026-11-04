using System.ComponentModel.DataAnnotations;
using AbcBusinessManagement.Application.Common.Exceptions;
using AbcBusinessManagement.Domain.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AbcBusinessManagement.Api.Tests;

[ApiController]
[Route("test/errors")]
public sealed class ErrorTestController : ControllerBase
{
    [HttpGet("domain/{code}")]
    public IActionResult Domain(string code) => throw new DomainException(code, "Lỗi nghiệp vụ.");

    [HttpGet("validation")]
    public IActionResult Validation() => throw new RequestValidationException(new Dictionary<string, string[]>
    {
        ["contractName"] = ["Tên hợp đồng không hợp lệ."]
    });

    [HttpGet("unexpected")]
    public IActionResult Unexpected() => throw new InvalidOperationException("private-database-detail");

    [HttpGet("payload")]
    public IActionResult Payload() => throw new BadHttpRequestException("private-parser-detail", 413);

    [HttpPost("model")]
    public IActionResult Model([FromBody] TestContractRequest request) => Ok(request);
}

public sealed class TestContractRequest
{
    [Required]
    [StringLength(255, MinimumLength = 5)]
    public string? ContractName { get; set; }
}
