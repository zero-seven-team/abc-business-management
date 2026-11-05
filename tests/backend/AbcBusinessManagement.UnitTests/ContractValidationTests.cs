using AbcBusinessManagement.Application.Common.Exceptions;
using AbcBusinessManagement.Application.DTOs.Contracts;
using AbcBusinessManagement.Application.Contracts;

namespace AbcBusinessManagement.UnitTests;

/// <summary>Kiểm tra validation tạo hợp đồng độc lập với database và mạng.</summary>
public class ContractValidationTests
{
    private static readonly Guid ActiveCustomerId = Guid.Parse("11111111-1111-1111-1111-111111111101");

    private static CreateContractRequest ValidRequest() => new()
    {
        ContractName = "Hợp đồng dịch vụ xếp dỡ container 2026",
        CustomerId = ActiveCustomerId,
        EffectiveFrom = new DateOnly(2026, 11, 1),
        EffectiveTo = new DateOnly(2027, 10, 31),
        ContractValue = 125_000_000m,
        Currency = "VND",
        PaymentTerms = "Thanh toán chuyển khoản trong vòng 30 ngày.",
        ServiceTerms = "Cung cấp dịch vụ xếp dỡ và lưu kho container."
    };

    private static Task<RequestValidationException> AssertValidationFails(CreateContractRequest? request)
    {
        return Task.FromResult(Assert.Throws<RequestValidationException>(
            () => CreateContractValidator.Validate(request, out _, out _, out _)));
    }

    private static Task AssertPassesValidation(CreateContractRequest request)
    {
        CreateContractValidator.Validate(request, out var name, out var paymentTerms, out var serviceTerms);
        Assert.Equal(request.ContractName.Trim(), name);
        Assert.Equal(request.PaymentTerms.Trim(), paymentTerms);
        Assert.Equal(request.ServiceTerms.Trim(), serviceTerms);
        return Task.CompletedTask;
    }

    [Fact]
    public async Task NullRequest_IsRejected()
    {
        var exception = await AssertValidationFails(null);
        Assert.Contains("request", exception.Errors.Keys);
    }

    [Theory]
    [InlineData("")]
    [InlineData("    ")]
    [InlineData("HĐ")]
    [InlineData("  ab  ")]
    public async Task ContractName_TooShortOrBlank_IsRejected(string name)
    {
        var request = ValidRequest();
        request.ContractName = name;

        var exception = await AssertValidationFails(request);
        Assert.Equal(["contractName"], exception.Errors.Keys);
    }

    [Fact]
    public async Task ContractName_LongerThan255_IsRejected()
    {
        var request = ValidRequest();
        request.ContractName = new string('A', 256);

        var exception = await AssertValidationFails(request);
        Assert.Contains("contractName", exception.Errors.Keys);
    }

    [Fact]
    public async Task CustomerId_Empty_IsRejected()
    {
        var request = ValidRequest();
        request.CustomerId = Guid.Empty;

        var exception = await AssertValidationFails(request);
        Assert.Equal(["customerId"], exception.Errors.Keys);
    }

    [Fact]
    public async Task EffectiveDates_Missing_AreRejected()
    {
        var request = ValidRequest();
        request.EffectiveFrom = default;
        request.EffectiveTo = default;

        var exception = await AssertValidationFails(request);
        Assert.Contains("effectiveFrom", exception.Errors.Keys);
        Assert.Contains("effectiveTo", exception.Errors.Keys);
    }

    [Fact]
    public async Task EffectiveTo_BeforeEffectiveFrom_IsRejected()
    {
        var request = ValidRequest();
        request.EffectiveFrom = new DateOnly(2026, 12, 1);
        request.EffectiveTo = new DateOnly(2026, 11, 30);

        var exception = await AssertValidationFails(request);
        Assert.Equal(["effectiveTo"], exception.Errors.Keys);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-1")]
    [InlineData("-125000000")]
    [InlineData("1000000000000000")]
    public async Task ContractValue_NotPositiveOrTooLarge_IsRejected(string value)
    {
        var request = ValidRequest();
        request.ContractValue = decimal.Parse(value);

        var exception = await AssertValidationFails(request);
        Assert.Equal(["contractValue"], exception.Errors.Keys);
    }

    [Theory]
    [InlineData("USD")]
    [InlineData("EUR")]
    public async Task Currency_OtherThanVnd_IsRejected(string currency)
    {
        var request = ValidRequest();
        request.Currency = currency;

        var exception = await AssertValidationFails(request);
        Assert.Equal(["currency"], exception.Errors.Keys);
    }

    [Theory]
    [InlineData("paymentTerms", "")]
    [InlineData("paymentTerms", "30 ngày")]
    [InlineData("serviceTerms", "")]
    [InlineData("serviceTerms", "Xếp dỡ")]
    public async Task Terms_TooShort_AreRejected(string field, string value)
    {
        var request = ValidRequest();
        if (field == "paymentTerms") request.PaymentTerms = value;
        else request.ServiceTerms = value;

        var exception = await AssertValidationFails(request);
        Assert.Equal([field], exception.Errors.Keys);
    }

    [Fact]
    public async Task Terms_LongerThan4000_AreRejected()
    {
        var request = ValidRequest();
        request.PaymentTerms = new string('x', 4001);
        request.ServiceTerms = new string('y', 4001);

        var exception = await AssertValidationFails(request);
        Assert.Contains("paymentTerms", exception.Errors.Keys);
        Assert.Contains("serviceTerms", exception.Errors.Keys);
    }

    [Fact]
    public async Task MultipleInvalidFields_AreReportedTogether()
    {
        var request = new CreateContractRequest
        {
            ContractName = "",
            CustomerId = Guid.Empty,
            EffectiveFrom = new DateOnly(2027, 1, 1),
            EffectiveTo = new DateOnly(2026, 1, 1),
            ContractValue = 0,
            PaymentTerms = "",
            ServiceTerms = ""
        };

        var exception = await AssertValidationFails(request);
        Assert.Equal(
            new[] { "contractName", "contractValue", "customerId", "effectiveTo", "paymentTerms", "serviceTerms" },
            exception.Errors.Keys.Order().ToArray());
        Assert.All(exception.Errors.Values, messages => Assert.NotEmpty(messages));
    }

    [Fact]
    public async Task ValidRequest_PassesValidation()
    {
        await AssertPassesValidation(ValidRequest());
    }

    [Fact]
    public async Task BoundaryValues_PassValidation()
    {
        var request = ValidRequest();
        request.ContractName = "  HĐ 01  ";              // 5 ký tự sau khi trim
        request.EffectiveTo = request.EffectiveFrom;      // EffectiveFrom == EffectiveTo
        request.ContractValue = 0.01m;                    // > 0
        request.Currency = null;                          // mặc định VND
        request.PaymentTerms = "1234567890";              // đúng 10 ký tự
        request.ServiceTerms = new string('s', 4000);     // đúng 4000 ký tự

        await AssertPassesValidation(request);
    }

    [Fact]
    public async Task CurrencyLowercaseVnd_PassesValidation()
    {
        var request = ValidRequest();
        request.Currency = " vnd ";

        await AssertPassesValidation(request);
    }
}
