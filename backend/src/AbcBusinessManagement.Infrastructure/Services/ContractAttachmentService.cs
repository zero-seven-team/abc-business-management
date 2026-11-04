using System.Globalization;
using AbcBusinessManagement.Application.DTOs.Contracts;
using AbcBusinessManagement.Application.Interfaces;
using AbcBusinessManagement.Domain.Common;
using AbcBusinessManagement.Domain.Constants;
using AbcBusinessManagement.Domain.Entities;
using AbcBusinessManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AbcBusinessManagement.Infrastructure.Services;

public sealed class ContractAttachmentService(
    ApplicationDbContext dbContext,
    ILogger<ContractAttachmentService> logger) : IContractAttachmentService
{
    private static readonly Dictionary<string, string> CanonicalContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".pdf"] = "application/pdf",
        [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    };

    public async Task<UploadContractAttachmentsResponse> UploadAttachmentsAsync(
        Guid contractId,
        IReadOnlyList<AttachmentFileUploadItem> files,
        CancellationToken cancellationToken = default)
    {
        var contractExists = await dbContext.Contracts
            .AsNoTracking()
            .AnyAsync(x => x.Id == contractId, cancellationToken);

        if (!contractExists)
        {
            throw new DomainException(
                "CONTRACT_NOT_FOUND",
                $"Không tìm thấy hợp đồng với mã định danh '{contractId}' để đính kèm tệp.");
        }

        if (files is null || files.Count == 0)
        {
            throw new DomainException(
                "INVALID_ATTACHMENT",
                "Vui lòng chọn ít nhất một tệp đính kèm để tải lên.");
        }

        var validationErrors = new List<string>();
        var validatedItems = new List<(AttachmentFileUploadItem Item, string SanitizedFileName, string ContentType)>();

        foreach (var file in files)
        {
            var sanitizedFileName = SanitizeFileName(file.FileName);
            var extension = Path.GetExtension(sanitizedFileName);

            if (string.IsNullOrWhiteSpace(sanitizedFileName) ||
                string.IsNullOrWhiteSpace(extension) ||
                !CanonicalContentTypes.TryGetValue(extension, out var expectedMimeType))
            {
                validationErrors.Add(
                    $"Tệp '{sanitizedFileName}' không hợp lệ. Hệ thống chỉ hỗ trợ định dạng .pdf, .docx, .xlsx.");
                continue;
            }

            var incomingContentType = file.ContentType?.Trim() ?? string.Empty;
            if (!string.IsNullOrEmpty(incomingContentType) &&
                !string.Equals(incomingContentType, expectedMimeType, StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(incomingContentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase))
            {
                validationErrors.Add(
                    $"Tệp '{sanitizedFileName}' có Content-Type '{incomingContentType}' không khớp với định dạng '{extension}'.");
                continue;
            }

            if (file.Length <= 0)
            {
                validationErrors.Add(
                    $"Tệp '{sanitizedFileName}' không được rỗng (0 byte).");
                continue;
            }

            if (file.Length > AuditConstants.MaxAttachmentSizeBytes)
            {
                var sizeMb = (file.Length / (1024.0 * 1024.0)).ToString("F1", CultureInfo.InvariantCulture);
                validationErrors.Add(
                    $"Tệp '{sanitizedFileName}' có dung lượng {sizeMb} MB, vượt quá giới hạn tối đa 20 MB/tệp.");
                continue;
            }

            validatedItems.Add((file, sanitizedFileName, expectedMimeType));
        }

        if (validationErrors.Count > 0)
        {
            throw new DomainException("INVALID_ATTACHMENT", string.Join(" ", validationErrors));
        }

        var relativeFolder = $"uploads/contracts/{contractId:D}";
        var physicalFolder = Path.Combine(AppContext.BaseDirectory, "uploads", "contracts", contractId.ToString("D"));
        Directory.CreateDirectory(physicalFolder);

        var uploadedAt = DateTime.UtcNow;
        var entities = new List<ContractAttachment>(validatedItems.Count);
        var savedPhysicalPaths = new List<string>(validatedItems.Count);

        try
        {
            foreach (var (item, sanitizedFileName, contentType) in validatedItems)
            {
                var storedFileName = $"{Guid.NewGuid():N}_{sanitizedFileName}";
                var physicalPath = Path.Combine(physicalFolder, storedFileName);

                await using (var sourceStream = item.OpenReadStream())
                await using (var targetStream = new FileStream(physicalPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                {
                    await sourceStream.CopyToAsync(targetStream, cancellationToken);
                }

                savedPhysicalPaths.Add(physicalPath);

                entities.Add(new ContractAttachment
                {
                    Id = Guid.NewGuid(),
                    ContractId = contractId,
                    FileName = sanitizedFileName,
                    StoredFileName = storedFileName,
                    FilePath = $"{relativeFolder}/{storedFileName}",
                    ContentType = contentType,
                    FileSize = item.Length,
                    UploadedBy = AuditConstants.DefaultActor,
                    UploadedAt = uploadedAt
                });
            }

            dbContext.ContractAttachments.AddRange(entities);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            foreach (var path in savedPhysicalPaths)
            {
                try
                {
                    if (File.Exists(path))
                    {
                        File.Delete(path);
                    }
                }
                catch (Exception cleanupEx)
                {
                    logger.LogWarning(cleanupEx, "Failed to clean up file {FilePath} after failed attachment upload", path);
                }
            }

            throw;
        }

        logger.LogInformation(
            "Uploaded {Count} attachment(s) for contract {ContractId}",
            entities.Count,
            contractId);

        return new UploadContractAttachmentsResponse
        {
            ContractId = contractId,
            UploadedCount = entities.Count,
            Attachments = entities.Select(x => new ContractAttachmentResponse
            {
                Id = x.Id,
                ContractId = x.ContractId,
                FileName = x.FileName,
                ContentType = x.ContentType,
                FileSize = x.FileSize,
                UploadedBy = x.UploadedBy,
                UploadedAt = x.UploadedAt
            }).ToList()
        };
    }

    private static string SanitizeFileName(string? rawFileName)
    {
        if (string.IsNullOrWhiteSpace(rawFileName))
        {
            return string.Empty;
        }

        var fileName = Path.GetFileName(rawFileName.Trim());
        foreach (var invalidChar in Path.GetInvalidFileNameChars())
        {
            fileName = fileName.Replace(invalidChar, '_');
        }

        return fileName.Length > 200 ? fileName[^200..] : fileName;
    }
}
