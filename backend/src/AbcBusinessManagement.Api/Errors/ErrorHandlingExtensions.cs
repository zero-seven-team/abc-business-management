using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;

namespace AbcBusinessManagement.Api.Errors;

public static class ErrorHandlingExtensions
{
    public static IServiceCollection AddApiErrorHandling(this IServiceCollection services)
    {
        services.AddControllers(options =>
            options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider()));
        services.AddExceptionHandler<GlobalExceptionHandler>();
        services.AddProblemDetails(options =>
            options.CustomizeProblemDetails = context => ProblemResponse.Customize(context.HttpContext, context.ProblemDetails));
        services.Configure<ApiBehaviorOptions>(options =>
        {
            options.InvalidModelStateResponseFactory = context =>
            {
                var problem = new ValidationProblemDetails(context.ModelState)
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "Dữ liệu đầu vào không hợp lệ.",
                    Detail = "Vui lòng kiểm tra lại các trường thông tin hợp đồng."
                };
                ProblemResponse.Customize(context.HttpContext, problem);
                return new BadRequestObjectResult(problem) { ContentTypes = { "application/problem+json" } };
            };
        });
        return services;
    }
}
