using AbcBusinessManagement.Application.Common.Exceptions;
using AbcBusinessManagement.Application.DTOs.Contracts;
using AbcBusinessManagement.Domain.Constants;

namespace AbcBusinessManagement.Application.Contracts;

public static class CreateContractValidator
{
    public static void Validate(
        CreateContractRequest? request,
        out string trimmedName,
        out string trimmedPaymentTerms,
        out string trimmedServiceTerms)
    {
        var errors = new Dictionary<string, string[]>();

        trimmedName = request?.ContractName?.Trim() ?? string.Empty;
        trimmedPaymentTerms = request?.PaymentTerms?.Trim() ?? string.Empty;
        trimmedServiceTerms = request?.ServiceTerms?.Trim() ?? string.Empty;

        if (request is null)
        {
            errors["request"] = ["Dữ liệu yêu cầu tạo hợp đồng không được để trống."];
            throw new RequestValidationException(errors);
        }

        if (trimmedName.Length is < 5 or > 255)
        {
            errors["contractName"] = ["Tên hợp đồng là bắt buộc và phải có độ dài từ 5 đến 255 ký tự."];
        }

        if (request.CustomerId == Guid.Empty)
        {
            errors["customerId"] = ["Vui lòng chọn khách hàng cho hợp đồng."];
        }

        if (request.EffectiveFrom == default)
        {
            errors["effectiveFrom"] = ["Ngày bắt đầu hiệu lực là bắt buộc."];
        }

        if (request.EffectiveTo == default)
        {
            errors["effectiveTo"] = ["Ngày kết thúc hiệu lực là bắt buộc."];
        }
        else if (request.EffectiveFrom != default && request.EffectiveTo < request.EffectiveFrom)
        {
            errors["effectiveTo"] = ["Ngày kết thúc hiệu lực phải lớn hơn hoặc bằng ngày bắt đầu hiệu lực."];
        }

        if (request.ContractValue <= 0 || request.ContractValue > 999_999_999_999_999.99m)
        {
            errors["contractValue"] = ["Giá trị hợp đồng phải lớn hơn 0."];
        }

        var currency = string.IsNullOrWhiteSpace(request.Currency)
            ? AuditConstants.DefaultCurrency
            : request.Currency.Trim().ToUpperInvariant();

        if (!string.Equals(currency, AuditConstants.DefaultCurrency, StringComparison.Ordinal))
        {
            errors["currency"] = ["Đơn vị tiền tệ ở Sprint 01 chỉ hỗ trợ VND."];
        }

        if (trimmedPaymentTerms.Length is < 10 or > 4000)
        {
            errors["paymentTerms"] = ["Điều khoản thanh toán là bắt buộc và phải có độ dài từ 10 đến 4000 ký tự."];
        }

        if (trimmedServiceTerms.Length is < 10 or > 4000)
        {
            errors["serviceTerms"] = ["Điều khoản dịch vụ là bắt buộc và phải có độ dài từ 10 đến 4000 ký tự."];
        }

        if (errors.Count > 0)
        {
            throw new RequestValidationException(errors);
        }
    }

}
