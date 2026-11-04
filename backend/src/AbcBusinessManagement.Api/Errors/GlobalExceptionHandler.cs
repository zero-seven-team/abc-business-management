using AbcBusinessManagement.Application.Common.Exceptions;
using AbcBusinessManagement.Domain.Common;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace AbcBusinessManagement.Api.Errors;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        var problem = exception switch
        {
            RequestValidationException validation => new ValidationProblemDetails(validation.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Dữ liệu đầu vào không hợp lệ.",
                Detail = "Vui lòng kiểm tra lại các trường thông tin hợp đồng."
            },
            DomainException domain => FromDomainException(domain),
            BadHttpRequestException badRequest => ProblemResponse.FromStatusCode(badRequest.StatusCode),
            _ => new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Lỗi hệ thống.",
                Detail = "Không thể xử lý yêu cầu. Vui lòng thử lại sau.",
                Extensions = { ["errorCode"] = "INTERNAL_SERVER_ERROR" }
            }
        };

        if (problem.Status >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Request failed with status {StatusCode}", problem.Status);
        }
        else
        {
            problem.Extensions.TryGetValue("errorCode", out var errorCode);
            logger.LogWarning("Request rejected with status {StatusCode}, code {ErrorCode}",
                problem.Status, errorCode);
        }

        await ProblemResponse.WriteAsync(context, problem, cancellationToken);
        return true;
    }

    private static ProblemDetails FromDomainException(DomainException exception)
    {
        var (status, title) = exception.ErrorCode switch
        {
            "CUSTOMER_NOT_FOUND" => (404, "Không tìm thấy khách hàng."),
            "CONTRACT_NOT_FOUND" => (404, "Không tìm thấy hợp đồng."),
            "CUSTOMER_INACTIVE" => (422, "Khách hàng không đủ điều kiện lập hợp đồng."),
            "CONTRACT_CODE_CONFLICT" => (409, "Xung đột cấp mã hợp đồng."),
            "INVALID_ATTACHMENT" => (400, "Tệp đính kèm không hợp lệ."),
            _ => (422, "Yêu cầu không đáp ứng quy tắc nghiệp vụ.")
        };

        var problem = new ProblemDetails
        {
            Status = status,
            Title = title,
            Detail = exception.Message,
            Extensions = { ["errorCode"] = exception.ErrorCode }
        };
        if (exception.ErrorCode is "CUSTOMER_INACTIVE" or "INVALID_ATTACHMENT")
        {
            problem.Extensions["errors"] = new Dictionary<string, string[]>
            {
                [exception.ErrorCode == "CUSTOMER_INACTIVE" ? "customerId" : "files"] = [exception.Message]
            };
        }
        return problem;
    }
}
