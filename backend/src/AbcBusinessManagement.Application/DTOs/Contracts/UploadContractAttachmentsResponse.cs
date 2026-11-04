namespace AbcBusinessManagement.Application.DTOs.Contracts;

public sealed class UploadContractAttachmentsResponse
{
    public Guid ContractId { get; init; }
    public int UploadedCount { get; init; }
    public IReadOnlyList<ContractAttachmentResponse> Attachments { get; init; } = [];
}
