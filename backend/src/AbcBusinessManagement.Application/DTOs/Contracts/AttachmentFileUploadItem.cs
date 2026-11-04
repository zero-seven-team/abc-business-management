namespace AbcBusinessManagement.Application.DTOs.Contracts;

public sealed class AttachmentFileUploadItem
{
    public string FileName { get; init; } = string.Empty;
    public string ContentType { get; init; } = string.Empty;
    public long Length { get; init; }
    public required Func<Stream> OpenReadStream { get; init; }
}
