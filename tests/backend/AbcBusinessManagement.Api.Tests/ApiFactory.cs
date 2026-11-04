using System.Collections.Concurrent;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AbcBusinessManagement.Api.Tests;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    public TestLogProvider Logs { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Production");
        builder.ConfigureServices(services =>
        {
            services.AddControllers().AddApplicationPart(typeof(ErrorTestController).Assembly);
            services.AddSingleton<ILoggerProvider>(Logs);
        });
    }
}

public sealed record LogEntry(string Category, LogLevel Level, string Message, Exception? Exception,
    IReadOnlyDictionary<string, object?> Properties);

public sealed class TestLogProvider : ILoggerProvider, ISupportExternalScope
{
    private IExternalScopeProvider scopes = new LoggerExternalScopeProvider();
    public ConcurrentQueue<LogEntry> Entries { get; } = new();
    public ILogger CreateLogger(string categoryName) => new TestLogger(categoryName, this);
    public void SetScopeProvider(IExternalScopeProvider scopeProvider) => scopes = scopeProvider;
    public void Dispose() { }

    private sealed class TestLogger(string category, TestLogProvider provider) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => provider.scopes.Push(state);
        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            var properties = new Dictionary<string, object?>();
            provider.scopes.ForEachScope((scope, values) =>
            {
                if (scope is IEnumerable<KeyValuePair<string, object?>> fields)
                    foreach (var field in fields) values[field.Key] = field.Value;
            }, properties);
            if (state is IEnumerable<KeyValuePair<string, object?>> fields)
                foreach (var field in fields) properties[field.Key] = field.Value;
            provider.Entries.Enqueue(new LogEntry(category, logLevel, formatter(state, exception), exception, properties));
        }
    }
}
