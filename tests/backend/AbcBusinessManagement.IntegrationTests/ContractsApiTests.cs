using System.Net;
using System.Net.Http.Json;
using AbcBusinessManagement.Domain.Constants;
using Microsoft.EntityFrameworkCore;

namespace AbcBusinessManagement.IntegrationTests;

/// <summary>
/// Integration test cho GET /api/customers, POST /api/contracts và GET /api/contracts/{id}
/// chạy trên PostgreSQL thật (migration + seed của TASK-05).
/// </summary>
[Collection(ApiCollection.Name)]
public class ContractsApiTests(ApiDatabaseFixture fixture)
{
    private readonly HttpClient client = fixture.CreateClient();

    [Fact]
    public async Task GetCustomers_ActiveOnly_ReturnsSeededActiveCustomers()
    {
        var customers = await client.GetFromJsonAsync<List<CustomerDto>>(
            "/api/customers?activeOnly=true", TestData.Json);

        Assert.NotNull(customers);
        Assert.Equal(["KH-ABC-001", "KH-ABC-002"], customers.Select(x => x.CustomerCode));
        Assert.All(customers, x => Assert.Equal("Active", x.Status));
    }

    [Fact]
    public async Task GetCustomers_All_IncludesInactiveCustomer()
    {
        var customers = await client.GetFromJsonAsync<List<CustomerDto>>(
            "/api/customers?activeOnly=false", TestData.Json);

        Assert.NotNull(customers);
        Assert.Equal(3, customers.Count);
        Assert.Contains(customers, x => x.Id == TestData.InactiveCustomerId && x.Status == "Inactive");
    }

    [Fact]
    public async Task CreateDraft_ValidRequest_Returns201AndPersistsToDatabase()
    {
        var before = DateTime.UtcNow.AddSeconds(-5);

        var response = await client.PostAsJsonAsync("/api/contracts", TestData.ValidContractBody());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ContractDto>(TestData.Json);
        Assert.NotNull(created);
        Assert.Equal($"/api/contracts/{created.Id}", response.Headers.Location?.OriginalString);
        Assert.Matches(@"^HD-\d{4}-\d{3,}$", created.ContractCode);
        Assert.StartsWith($"HD-{DateTime.UtcNow.Year}-", created.ContractCode);
        Assert.Equal("Draft", created.Status);
        Assert.Equal(TestData.DemoActor, created.CreatedBy);
        Assert.Equal("KH-ABC-001", created.CustomerCode);
        Assert.Empty(created.Attachments);

        // Đọc lại bằng DbContext mới để chắc chắn dữ liệu đã ghi thật vào PostgreSQL
        await using var db = fixture.CreateDbContext();
        var saved = await db.Contracts.AsNoTracking().SingleAsync(x => x.Id == created.Id);
        Assert.Equal(created.ContractCode, saved.ContractCode);
        Assert.Equal("Hợp đồng dịch vụ xếp dỡ và lưu kho container năm 2026", saved.ContractName);
        Assert.Equal(TestData.ActiveCustomerId, saved.CustomerId);
        Assert.Equal(new DateOnly(2026, 11, 1), saved.EffectiveFrom);
        Assert.Equal(new DateOnly(2027, 10, 31), saved.EffectiveTo);
        Assert.Equal(125_000_000.50m, saved.ContractValue);
        Assert.Equal("VND", saved.Currency);
        Assert.Equal(AuditConstants.DraftStatus, saved.Status);
        Assert.Equal(AuditConstants.DefaultActor, saved.CreatedBy);
        Assert.Equal(DateTimeKind.Utc, saved.CreatedAt.Kind);
        Assert.InRange(saved.CreatedAt, before, DateTime.UtcNow.AddSeconds(5));
        Assert.Null(saved.UpdatedAt);
    }

    [Fact]
    public async Task CreateDraft_TrimsTextFields()
    {
        var body = new
        {
            contractName = "   Hợp đồng vận chuyển nội địa   ",
            customerId = TestData.ActiveCustomerId,
            effectiveFrom = "2026-11-01",
            effectiveTo = "2026-11-01",
            contractValue = 1m,
            paymentTerms = "   Thanh toán 100% trước khi giao hàng.   ",
            serviceTerms = "   Vận chuyển hàng khô bằng xe tải.   "
        };

        var response = await client.PostAsJsonAsync("/api/contracts", body);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ContractDto>(TestData.Json);
        Assert.Equal("Hợp đồng vận chuyển nội địa", created!.ContractName);
        Assert.Equal("Thanh toán 100% trước khi giao hàng.", created.PaymentTerms);
        Assert.Equal("Vận chuyển hàng khô bằng xe tải.", created.ServiceTerms);
        Assert.Equal("VND", created.Currency);
    }

    [Fact]
    public async Task CreateDraft_IgnoresClientSuppliedAuditAndStatusFields()
    {
        var body = new
        {
            contractName = "Hợp đồng kiểm tra trường hệ thống",
            customerId = TestData.ActiveCustomerId,
            effectiveFrom = "2026-11-01",
            effectiveTo = "2027-11-01",
            contractValue = 50_000_000m,
            paymentTerms = "Thanh toán chuyển khoản trong 15 ngày.",
            serviceTerms = "Dịch vụ kho bãi tiêu chuẩn theo phụ lục.",
            contractCode = "HD-1999-999",
            status = "Approved",
            createdBy = "Hacker | Giả mạo",
            createdAt = "2000-01-01T00:00:00Z"
        };

        var response = await client.PostAsJsonAsync("/api/contracts", body);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<ContractDto>(TestData.Json);
        Assert.NotEqual("HD-1999-999", created!.ContractCode);
        Assert.Equal("Draft", created.Status);
        Assert.Equal(TestData.DemoActor, created.CreatedBy);
        Assert.True(created.CreatedAt > new DateTime(2020, 1, 1, 0, 0, 0, DateTimeKind.Utc));
    }

    [Fact]
    public async Task CreateDraft_InvalidFields_Returns400ValidationProblemAndSavesNothing()
    {
        await using var db = fixture.CreateDbContext();
        var countBefore = await db.Contracts.CountAsync();

        var body = new
        {
            contractName = "",
            customerId = Guid.Empty,
            effectiveFrom = "2027-01-01",
            effectiveTo = "2026-01-01",
            contractValue = 0m,
            paymentTerms = "ngắn",
            serviceTerms = ""
        };

        var response = await client.PostAsJsonAsync("/api/contracts", body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.NotNull(problem?.Errors);
        foreach (var field in new[] { "contractName", "customerId", "effectiveTo", "contractValue", "paymentTerms", "serviceTerms" })
        {
            Assert.True(problem.Errors.ContainsKey(field), $"Thiếu lỗi cho trường {field}");
        }

        Assert.Equal(countBefore, await db.Contracts.CountAsync());
    }

    [Fact]
    public async Task CreateDraft_InactiveCustomer_Returns422()
    {
        var body = new
        {
            contractName = "Hợp đồng cho khách hàng ngưng hoạt động",
            customerId = TestData.InactiveCustomerId,
            effectiveFrom = "2026-11-01",
            effectiveTo = "2027-11-01",
            contractValue = 10_000_000m,
            paymentTerms = "Thanh toán chuyển khoản trong 30 ngày.",
            serviceTerms = "Dịch vụ vận chuyển hàng hóa nội địa."
        };

        var response = await client.PostAsJsonAsync("/api/contracts", body);

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.Equal("CUSTOMER_INACTIVE", problem!.ErrorCode);
        Assert.True(problem.Errors!.ContainsKey("customerId"));
    }

    [Fact]
    public async Task CreateDraft_UnknownCustomer_Returns404()
    {
        var body = new
        {
            contractName = "Hợp đồng cho khách hàng không tồn tại",
            customerId = Guid.NewGuid(),
            effectiveFrom = "2026-11-01",
            effectiveTo = "2027-11-01",
            contractValue = 10_000_000m,
            paymentTerms = "Thanh toán chuyển khoản trong 30 ngày.",
            serviceTerms = "Dịch vụ vận chuyển hàng hóa nội địa."
        };

        var response = await client.PostAsJsonAsync("/api/contracts", body);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.Equal("CUSTOMER_NOT_FOUND", problem!.ErrorCode);
    }

    [Fact]
    public async Task CreateDraft_SequentialRequests_GetIncreasingUniqueCodes()
    {
        var first = await TestData.CreateContractAsync(client);
        var second = await TestData.CreateContractAsync(client);

        Assert.NotEqual(first.ContractCode, second.ContractCode);
        var firstSequence = int.Parse(first.ContractCode.Split('-')[2]);
        var secondSequence = int.Parse(second.ContractCode.Split('-')[2]);
        Assert.True(secondSequence > firstSequence);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    public async Task CreateDraft_TwoConcurrentRequests_BothSucceedWithDistinctCodes(int round)
    {
        using var clientA = fixture.CreateClient();
        using var clientB = fixture.CreateClient();
        using var gate = new SemaphoreSlim(0, 2);

        async Task<HttpResponseMessage> SendAsync(HttpClient http, string suffix)
        {
            await gate.WaitAsync();
            return await http.PostAsJsonAsync(
                "/api/contracts",
                TestData.ValidContractBody($"Hợp đồng đồng thời vòng {round} - {suffix}"));
        }

        var taskA = SendAsync(clientA, "A");
        var taskB = SendAsync(clientB, "B");
        gate.Release(2);
        var responses = await Task.WhenAll(taskA, taskB);

        Assert.All(responses, r => Assert.Equal(HttpStatusCode.Created, r.StatusCode));
        var created = await Task.WhenAll(responses.Select(r => r.Content.ReadFromJsonAsync<ContractDto>(TestData.Json)));
        Assert.NotEqual(created[0]!.ContractCode, created[1]!.ContractCode);

        await using var db = fixture.CreateDbContext();
        var ids = created.Select(x => x!.Id).ToList();
        var saved = await db.Contracts.AsNoTracking().Where(x => ids.Contains(x.Id)).ToListAsync();
        Assert.Equal(2, saved.Count);
        Assert.Equal(2, saved.Select(x => x.ContractCode).Distinct().Count());
    }

    [Fact]
    public async Task ContractCodes_AreUniqueAcrossDatabase()
    {
        await using var db = fixture.CreateDbContext();
        var codes = await db.Contracts.AsNoTracking().Select(x => x.ContractCode).ToListAsync();

        Assert.Equal(codes.Count, codes.Distinct().Count());
    }

    [Fact]
    public async Task GetById_ReturnsSavedDraftWithoutAttachments()
    {
        var created = await TestData.CreateContractAsync(client);

        var response = await client.GetAsync($"/api/contracts/{created.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var loaded = await response.Content.ReadFromJsonAsync<ContractDto>(TestData.Json);
        Assert.Equal(created.ContractCode, loaded!.ContractCode);
        Assert.Equal("Draft", loaded.Status);
        Assert.Equal("KH-ABC-001", loaded.CustomerCode);
        Assert.Empty(loaded.Attachments);
    }

    [Fact]
    public async Task GetById_UnknownContract_Returns404Problem()
    {
        var response = await client.GetAsync($"/api/contracts/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDto>(TestData.Json);
        Assert.Equal("CONTRACT_NOT_FOUND", problem!.ErrorCode);
    }
}
