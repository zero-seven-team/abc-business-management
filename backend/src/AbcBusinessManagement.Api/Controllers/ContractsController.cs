using AbcBusinessManagement.Application.DTOs.Contracts;
using AbcBusinessManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AbcBusinessManagement.Api.Controllers;

[ApiController]
[Route("api/contracts")]
public sealed class ContractsController(
    IContractService contractService,
    IContractAttachmentService contractAttachmentService) : ControllerBase
{
    private const long MaxMultipartRequestSizeBytes = 100L * 1024L * 1024L;

    [HttpPost]
    [ProducesResponseType(typeof(ContractDetailResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CreateDraft(
        [FromBody] CreateContractRequest request,
        CancellationToken cancellationToken)
    {
        var created = await contractService.CreateDraftAsync(request, cancellationToken);
        return Created($"/api/contracts/{created.Id}", created);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ContractDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var contract = await contractService.GetByIdAsync(id, cancellationToken);
        return Ok(contract);
    }

    [HttpPost("{id:guid}/attachments")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxMultipartRequestSizeBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxMultipartRequestSizeBytes)]
    [ProducesResponseType(typeof(UploadContractAttachmentsResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UploadAttachments(
        Guid id,
        [FromForm] List<IFormFile>? files,
        CancellationToken cancellationToken)
    {
        var resolvedFiles = files is { Count: > 0 }
            ? files
            : Request.HasFormContentType
                ? Request.Form.Files.ToList()
                : [];

        var items = resolvedFiles.Select(file => new AttachmentFileUploadItem
        {
            FileName = file.FileName,
            ContentType = file.ContentType,
            Length = file.Length,
            OpenReadStream = file.OpenReadStream
        }).ToList();

        var result = await contractAttachmentService.UploadAttachmentsAsync(id, items, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }
}
