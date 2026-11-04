using AbcBusinessManagement.Application.DTOs.Contracts;

namespace AbcBusinessManagement.Application.Interfaces;

public interface IContractAttachmentService
{
    Task<UploadContractAttachmentsResponse> UploadAttachmentsAsync(
        Guid contractId,
        IReadOnlyList<AttachmentFileUploadItem> files,
        CancellationToken cancellationToken = default);
}
