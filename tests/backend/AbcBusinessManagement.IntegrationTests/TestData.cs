using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AbcBusinessManagement.IntegrationTests;

[CollectionDefinition(Name)]
public sealed class ApiCollection : ICollectionFixture<ApiDatabaseFixture>
{
    public const string Name = "PostgreSQL API";
}

/// <summary>Dữ liệu mẫu và hàm tiện ích dùng chung cho các lớp integration test.</summary>
internal static class TestData
{
    // Khớp CustomerSeedData (TASK-05): KH-ABC-001, KH-ABC-002 Active; KH-ABC-004 Inactive
    public static readonly Guid ActiveCustomerId = Guid.Parse("11111111-1111-1111-1111-111111111101");
    public static readonly Guid InactiveCustomerId = Guid.Parse("11111111-1111-1111-1111-111111111104");
    public const string DemoActor = "NV-KD-001 | Nguyễn Văn An";

    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public static object ValidContractBody(string? name = null) => new
    {
        contractName = name ?? "Hợp đồng dịch vụ xếp dỡ và lưu kho container năm 2026",
        customerId = ActiveCustomerId,
        effectiveFrom = "2026-11-01",
        effectiveTo = "2027-10-31",
        contractValue = 125_000_000.50m,
        currency = "VND",
        paymentTerms = "Thanh toán chuyển khoản trong vòng 30 ngày kể từ ngày nhận hóa đơn.",
        serviceTerms = "Cung cấp dịch vụ xếp dỡ, nâng hạ container và lưu kho theo bảng giá."
    };

    public static async Task<ContractDto> CreateContractAsync(HttpClient client, string? name = null)
    {
        var response = await client.PostAsJsonAsync("/api/contracts", ValidContractBody(name));
        response.EnsureSuccessStatusCode();
        return (await response.Content.ReadFromJsonAsync<ContractDto>(Json))!;
    }
}

internal sealed record ContractDto(
    Guid Id,
    string ContractCode,
    string ContractName,
    Guid CustomerId,
    string CustomerCode,
    string CustomerName,
    DateOnly EffectiveFrom,
    DateOnly EffectiveTo,
    decimal ContractValue,
    string Currency,
    string PaymentTerms,
    string ServiceTerms,
    string Status,
    string CreatedBy,
    DateTime CreatedAt,
    List<AttachmentDto> Attachments);

internal sealed record AttachmentDto(
    Guid Id,
    Guid ContractId,
    string FileName,
    string ContentType,
    long FileSize,
    string UploadedBy,
    DateTime UploadedAt);

internal sealed record UploadResultDto(Guid ContractId, int UploadedCount, List<AttachmentDto> Attachments);

internal sealed record CustomerDto(Guid Id, string CustomerCode, string CompanyName, string TaxCode, string Status);

internal sealed record ProblemDto(
    int Status,
    string? Title,
    string? Detail,
    string? ErrorCode,
    Dictionary<string, string[]>? Errors);
