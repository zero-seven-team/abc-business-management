using AbcBusinessManagement.Application;
using AbcBusinessManagement.Api.Errors;
using AbcBusinessManagement.Api.Middleware;
using AbcBusinessManagement.Infrastructure;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddFilter("Microsoft.AspNetCore.Hosting.Diagnostics", LogLevel.Warning);
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.UseUtcTimestamp = true;
    options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fffZ";
});

builder.Services.AddApiErrorHandling();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ABC Business Management API - Sprint 01",
        Version = "v1",
        Description = "API quản lý nghiệp vụ kinh doanh và hợp đồng - Công ty ABC"
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

var app = builder.Build();

app.UseMiddleware<RequestLoggingMiddleware>();
app.UseExceptionHandler();
app.UseStatusCodePages(async context =>
    await ProblemResponse.WriteAsync(context.HttpContext,
        ProblemResponse.FromStatusCode(context.HttpContext.Response.StatusCode), context.HttpContext.RequestAborted));

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ABC Business Management API - Sprint 01 v1");
    });
}

app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "Healthy",
    service = "ABC Business Management API",
    sprint = "Sprint 01"
})).WithTags("Health");

app.Run();

public partial class Program
{
}
