using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace AbcBusinessManagement.Api.Tests;

public sealed class ErrorHandlingTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Theory]
    [InlineData("CUSTOMER_NOT_FOUND", 404)]
    [InlineData("CONTRACT_NOT_FOUND", 404)]
    [InlineData("CUSTOMER_INACTIVE", 422)]
    [InlineData("CONTRACT_CODE_CONFLICT", 409)]
    [InlineData("INVALID_ATTACHMENT", 400)]
    [InlineData("OTHER_BUSINESS_RULE", 422)]
    public async Task DomainErrorsUseExpectedStatusAndCode(string code, int status)
    {
        using var client = factory.CreateClient();
        var path = $"/test/errors/domain/{code}";
        using var response = await client.GetAsync(path);
        var problem = await ReadProblem(response, status, path);
        Assert.Equal(code, problem.GetProperty("errorCode").GetString());
        Assert.Equal("Lỗi nghiệp vụ.", problem.GetProperty("detail").GetString());
        if (code == "CUSTOMER_INACTIVE")
            Assert.NotEmpty(problem.GetProperty("errors").GetProperty("customerId").EnumerateArray());
    }

    [Fact]
    public async Task ValidationExceptionPreservesFieldErrors()
    {
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/test/errors/validation");
        var problem = await ReadProblem(response, 400, "/test/errors/validation");
        Assert.Equal("Tên hợp đồng không hợp lệ.", problem.GetProperty("errors").GetProperty("contractName")[0].GetString());
    }

    [Fact]
    public async Task ModelValidationUsesCamelCaseFieldErrors()
    {
        using var client = factory.CreateClient();
        using var response = await client.PostAsJsonAsync("/test/errors/model", new { contractName = "a" });
        var problem = await ReadProblem(response, 400, "/test/errors/model");
        Assert.NotEmpty(problem.GetProperty("errors").GetProperty("contractName").EnumerateArray());
    }

    [Fact]
    public async Task MalformedJsonUsesValidationProblemDetails()
    {
        using var client = factory.CreateClient();
        using var response = await client.PostAsync("/test/errors/model", new StringContent("{", Encoding.UTF8, "application/json"));
        var problem = await ReadProblem(response, 400, "/test/errors/model");
        Assert.NotEmpty(problem.GetProperty("errors").EnumerateObject());
    }

    [Theory]
    [InlineData("/not-found", "GET", 404)]
    [InlineData("/test/errors/model", "GET", 405)]
    [InlineData("/test/errors/payload", "GET", 413)]
    public async Task HttpErrorsUseProblemDetails(string path, string method, int status)
    {
        using var client = factory.CreateClient();
        using var response = await client.SendAsync(new HttpRequestMessage(new HttpMethod(method), path));
        await ReadProblem(response, status, path);
    }

    [Fact]
    public async Task UnsupportedMediaTypeUsesProblemDetails()
    {
        using var client = factory.CreateClient();
        using var response = await client.PostAsync("/test/errors/model", new StringContent("plain text"));
        await ReadProblem(response, 415, "/test/errors/model");
    }

    [Theory]
    [InlineData("application/json")]
    [InlineData("text/plain")]
    public async Task UnexpectedErrorsHideDetailsAndLogMatchingTrace(string accept)
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Accept.ParseAdd(accept);
        using var response = await client.GetAsync("/test/errors/unexpected");
        var problem = await ReadProblem(response, 500, "/test/errors/unexpected");
        var trace = problem.GetProperty("traceId").GetString();
        Assert.Equal("INTERNAL_SERVER_ERROR", problem.GetProperty("errorCode").GetString());
        Assert.DoesNotContain("private-database-detail", problem.GetRawText());
        Assert.False(problem.TryGetProperty("stackTrace", out _));
        var error = Assert.Single(factory.Logs.Entries, x => x.Level == LogLevel.Error
            && x.Category.EndsWith("GlobalExceptionHandler") && Equals(x.Properties["TraceId"], trace));
        Assert.IsType<InvalidOperationException>(error.Exception);
        var completion = Assert.Single(factory.Logs.Entries, x => x.Category.EndsWith("RequestLoggingMiddleware")
            && Equals(x.Properties["TraceId"], trace));
        Assert.Equal(500, completion.Properties["StatusCode"]);
        Assert.True(Convert.ToDouble(completion.Properties["ElapsedMs"]) >= 0);
    }

    [Fact]
    public async Task RequestLogExcludesQueryHeadersAndBody()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new("Bearer", "private-header");
        using var response = await client.PostAsJsonAsync("/test/errors/model?token=private-query",
            new { contractName = "private-body" });
        response.EnsureSuccessStatusCode();
        var requestLog = factory.Logs.Entries.Last(x => x.Category.EndsWith("RequestLoggingMiddleware"));
        Assert.Equal("/test/errors/model", requestLog.Properties["Path"]);
        Assert.Equal("POST", requestLog.Properties["HttpMethod"]);
        Assert.Equal(200, requestLog.Properties["StatusCode"]);
        var logged = JsonSerializer.Serialize(requestLog);
        Assert.DoesNotContain("private-header", logged);
        Assert.DoesNotContain("private-query", logged);
        Assert.DoesNotContain("private-body", logged);
    }

    private static async Task<JsonElement> ReadProblem(HttpResponseMessage response, int status, string path)
    {
        Assert.Equal(status, (int)response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(status, problem.GetProperty("status").GetInt32());
        Assert.Equal(path, problem.GetProperty("instance").GetString());
        Assert.Equal("https://tools.ietf.org/html/rfc7807", problem.GetProperty("type").GetString());
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("title").GetString()));
        Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("traceId").GetString()));
        return problem;
    }
}
