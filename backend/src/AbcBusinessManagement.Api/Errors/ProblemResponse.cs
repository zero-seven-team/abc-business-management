using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace AbcBusinessManagement.Api.Errors;

internal static class ProblemResponse
{
    public static void Customize(HttpContext context, ProblemDetails problem)
    {
        problem.Type = "https://tools.ietf.org/html/rfc7807";
        problem.Instance = context.Request.Path;
        problem.Extensions["traceId"] = Activity.Current?.Id ?? context.TraceIdentifier;
    }

    public static async Task WriteAsync(HttpContext context, ProblemDetails problem, CancellationToken cancellationToken)
    {
        Customize(context, problem);
        context.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsJsonAsync((object)problem, options: null,
            contentType: "application/problem+json", cancellationToken: cancellationToken);
    }

    public static ProblemDetails FromStatusCode(int statusCode) => new()
    {
        Status = statusCode,
        Title = ReasonPhrases.GetReasonPhrase(statusCode)
    };
}
