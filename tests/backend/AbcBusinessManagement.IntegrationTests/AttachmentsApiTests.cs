using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace AbcBusinessManagement.IntegrationTests;

/// <summary>
/// Integration test cho Bước 2: upload tệp đính kèm (POST /api/contracts/{id}/attachments)
/// và xác thực liên kết attachments khi GET /api/contracts/{id}.
/// </summary>
[Collection(ApiCollection.Name)]
public class AttachmentsApiTests(ApiDatabaseFixture fixture)
{
    private readonly HttpClient client = fixture.CreateClient();

    private static ByteArrayContent CreateFilePart(byte[] content, string fileName, string contentType)
    {
        var part = new ByteArrayContent(content);
        part.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return part;
    }

    private async Task AssertDraftUnchangedAsync(ContractDto contract)
    {
        var loaded = await client.GetFromJsonAsync<ContractDto>($"/api/contracts/{contract.Id}", TestData.Json);
        Assert.NotNull(loaded);
        Assert.Equal(contract.ContractCode, loaded.ContractCode);
        Assert.Equal("Draft", loaded.Status);
        Assert.Empty(loaded.Attachments);
        await using var db = fixture.CreateDbContext();
        var saved = await db.Contracts.AsNoTracking().SingleAsync(x => x.Id == contract.Id);
        Assert.Equal(contract.ContractCode, saved.ContractCode);
        Assert.Equal("Draft", saved.Status);
        Assert.False(await db.ContractAttachments.AnyAsync(x => x.ContractId == contract.Id));
        var folder = Path.Combine(AppContext.BaseDirectory, "uploads", "contracts", contract.Id.ToString("D"));
        Assert.True(!Directory.Exists(folder) || !Directory.EnumerateFiles(folder).Any());
    }

    [Theory]
    [InlineData(20971520, HttpStatusCode.Created)]
    [InlineData(20971521, HttpStatusCode.BadRequest)]
    public async Task UploadAttachment_SizeBoundary_IsEnforced(int length, HttpStatusCode expected)
    {
        var contract = await TestData.CreateContractAsync(client);
        using var form = new MultipartFormDataContent();
        form.Add(CreateFilePart(new byte[length], "boundary.pdf", "application/pdf"), "files", "boundary.pdf");
        using var response = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", form);
        Assert.Equal(expected, response.StatusCode);
        if (expected == HttpStatusCode.BadRequest)
        {
            var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
            Assert.Equal("INVALID_ATTACHMENT", problem!.ErrorCode);
            await AssertDraftUnchangedAsync(contract);
        }
        else
        {
            await using var db = fixture.CreateDbContext();
            var saved = await db.ContractAttachments.SingleAsync(x => x.ContractId == contract.Id);
            Assert.Equal(length, saved.FileSize);
            var path = Path.Combine(AppContext.BaseDirectory, saved.FilePath);
            Assert.Equal(length, new FileInfo(path).Length);
        }
    }

    [Fact]
    public async Task UploadMixedBatch_RejectsEntireBatchWithoutSavingFiles()
    {
        var contract = await TestData.CreateContractAsync(client);
        using var form = new MultipartFormDataContent();
        form.Add(CreateFilePart([1], "valid.pdf", "application/pdf"), "files", "valid.pdf");
        form.Add(CreateFilePart([1], "invalid.png", "image/png"), "files", "invalid.png");
        using var response = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", form);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.Equal("INVALID_ATTACHMENT", problem!.ErrorCode);
        await AssertDraftUnchangedAsync(contract);
    }

    [Fact]
    public async Task UploadFailure_ThenRetry_PreservesDraftAndCreatesOnlyOneAttachment()
    {
        var contract = await TestData.CreateContractAsync(client);
        await using var db = fixture.CreateDbContext();
        var countBefore = await db.Contracts.CountAsync();
        using var invalid = new MultipartFormDataContent();
        invalid.Add(CreateFilePart([1], "invalid.png", "image/png"), "files", "invalid.png");
        using var failed = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", invalid);
        Assert.Equal(HttpStatusCode.BadRequest, failed.StatusCode);
        await AssertDraftUnchangedAsync(contract);

        using var valid = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("%PDF-1.4 retry content");
        valid.Add(CreateFilePart(bytes, "retry.pdf", "application/pdf"), "files", "retry.pdf");
        using var retried = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", valid);
        Assert.Equal(HttpStatusCode.Created, retried.StatusCode);
        Assert.Equal(countBefore, await db.Contracts.CountAsync());
        var loaded = await client.GetFromJsonAsync<ContractDto>($"/api/contracts/{contract.Id}", TestData.Json);
        Assert.Equal(contract.ContractCode, loaded!.ContractCode);
        Assert.Equal("Draft", loaded.Status);
        Assert.Single(loaded.Attachments);
        var saved = await db.ContractAttachments.SingleAsync(x => x.ContractId == contract.Id);
        Assert.Equal("retry.pdf", saved.FileName);
        Assert.Equal(bytes, await File.ReadAllBytesAsync(Path.Combine(AppContext.BaseDirectory, saved.FilePath)));
    }

    [Fact]
    public async Task UploadSingleAttachment_ValidPdf_Returns201AndPersistsAttachment()
    {
        var contract = await TestData.CreateContractAsync(client, "Hợp đồng kiểm tra tải 1 file PDF");
        var pdfBytes = Encoding.UTF8.GetBytes("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>%%EOF");

        using var form = new MultipartFormDataContent();
        form.Add(CreateFilePart(pdfBytes, "dieu_khoan.pdf", "application/pdf"), "files", "dieu_khoan.pdf");

        var response = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", form);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<UploadResultDto>(TestData.Json);
        Assert.NotNull(result);
        Assert.Equal(contract.Id, result.ContractId);
        Assert.Equal(1, result.UploadedCount);
        Assert.Single(result.Attachments);

        var attachment = result.Attachments[0];
        Assert.Equal("dieu_khoan.pdf", attachment.FileName);
        Assert.Equal("application/pdf", attachment.ContentType);
        Assert.Equal(pdfBytes.Length, attachment.FileSize);
        Assert.Equal(TestData.DemoActor, attachment.UploadedBy);

        // Kiểm tra GET contract đã liên kết attachment
        var getResponse = await client.GetAsync($"/api/contracts/{contract.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
        var loaded = await getResponse.Content.ReadFromJsonAsync<ContractDto>(TestData.Json);
        Assert.Single(loaded!.Attachments);
        Assert.Equal(attachment.Id, loaded.Attachments[0].Id);
    }

    [Fact]
    public async Task UploadMultipleAttachments_PdfDocxXlsx_Returns201AndPreservesAll()
    {
        var contract = await TestData.CreateContractAsync(client, "Hợp đồng kiểm tra tải nhiều file");

        var pdfContent = Encoding.UTF8.GetBytes("%PDF-1.4 sample content");
        var docxContent = Encoding.UTF8.GetBytes("PK fake docx content");
        var xlsxContent = Encoding.UTF8.GetBytes("PK fake xlsx content");

        using var form = new MultipartFormDataContent();
        form.Add(CreateFilePart(pdfContent, "phu_luc.pdf", "application/pdf"), "files", "phu_luc.pdf");
        form.Add(CreateFilePart(docxContent, "thoa_thuan.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"), "files", "thoa_thuan.docx");
        form.Add(CreateFilePart(xlsxContent, "bang_gia.xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), "files", "bang_gia.xlsx");

        var response = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", form);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var result = await response.Content.ReadFromJsonAsync<UploadResultDto>(TestData.Json);
        Assert.NotNull(result);
        Assert.Equal(3, result.UploadedCount);
        Assert.Equal(3, result.Attachments.Count);

        // Kiểm tra database trực tiếp
        await using var db = fixture.CreateDbContext();
        var savedCount = await db.ContractAttachments.CountAsync(x => x.ContractId == contract.Id);
        Assert.Equal(3, savedCount);
    }

    [Fact]
    public async Task UploadAttachment_InvalidExtension_Returns400BadRequest()
    {
        var contract = await TestData.CreateContractAsync(client, "Hợp đồng kiểm tra định dạng sai");
        var exeBytes = Encoding.UTF8.GetBytes("MZ fake executable");

        using var form = new MultipartFormDataContent();
        form.Add(CreateFilePart(exeBytes, "virus.exe", "application/octet-stream"), "files", "virus.exe");

        var response = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", form);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.Equal("INVALID_ATTACHMENT", problem!.ErrorCode);
        await AssertDraftUnchangedAsync(contract);
    }

    [Fact]
    public async Task UploadAttachment_EmptyFile_Returns400BadRequest()
    {
        var contract = await TestData.CreateContractAsync(client, "Hợp đồng kiểm tra file 0 byte");

        using var form = new MultipartFormDataContent();
        form.Add(CreateFilePart([], "empty.pdf", "application/pdf"), "files", "empty.pdf");

        var response = await client.PostAsync($"/api/contracts/{contract.Id}/attachments", form);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.Equal("INVALID_ATTACHMENT", problem!.ErrorCode);
        await AssertDraftUnchangedAsync(contract);
    }

    [Fact]
    public async Task UploadAttachment_NonExistentContract_Returns404NotFound()
    {
        var dummyId = Guid.NewGuid();
        var pdfBytes = Encoding.UTF8.GetBytes("%PDF-1.4 fake content");

        using var form = new MultipartFormDataContent();
        form.Add(CreateFilePart(pdfBytes, "sample.pdf", "application/pdf"), "files", "sample.pdf");

        var response = await client.PostAsync($"/api/contracts/{dummyId}/attachments", form);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.Equal("CONTRACT_NOT_FOUND", problem!.ErrorCode);
    }
}
