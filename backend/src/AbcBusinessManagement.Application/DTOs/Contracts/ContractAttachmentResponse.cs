namespace AbcBusinessManagement.Application.DTOs.Contracts;

public sealed class ContractAttachmentResponse
{
    public Guid Id { get; init; }
    public Guid ContractId { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long FileSize { get; init; }
    public string UploadedBy { get; init; } = string.Empty;
    public DateTime UploadedAt { get; init; }
}
