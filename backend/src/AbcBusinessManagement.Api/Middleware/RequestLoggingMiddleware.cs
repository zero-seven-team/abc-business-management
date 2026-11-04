using System.Diagnostics;

namespace AbcBusinessManagement.Api.Middleware;

public sealed class RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        using var scope = logger.BeginScope(new Dictionary<string, object?>
        {
            ["TraceId"] = Activity.Current?.Id ?? context.TraceIdentifier,
            ["HttpMethod"] = context.Request.Method,
            ["Path"] = context.Request.Path.Value
        });
        var started = Stopwatch.GetTimestamp();
        try
        {
            await next(context);
        }
        finally
        {
            logger.LogInformation("HTTP request completed with status {StatusCode} in {ElapsedMs} ms",
                context.Response.StatusCode, Stopwatch.GetElapsedTime(started).TotalMilliseconds);
        }
    }
}
