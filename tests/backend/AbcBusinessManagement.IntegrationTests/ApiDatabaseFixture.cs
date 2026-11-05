using AbcBusinessManagement.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Testcontainers.PostgreSql;

namespace AbcBusinessManagement.IntegrationTests;

/// <summary>
/// Khởi tạo PostgreSQL thật cho integration test và host API qua WebApplicationFactory.
/// - Nếu có biến môi trường TEST_POSTGRES_CONNECTION (CI service container hoặc PostgreSQL cài trên máy):
///   tạo một database riêng tên abc_it_xxx, chạy migration, xóa database khi kết thúc.
/// - Nếu không có: tự khởi động container postgres:17-alpine bằng Testcontainers (cần Docker).
/// </summary>
public sealed class ApiDatabaseFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    public const string ConnectionEnvironmentVariable = "TEST_POSTGRES_CONNECTION";

    private PostgreSqlContainer? container;
    private string? adminConnectionString;
    private string? databaseName;

    public string ConnectionString { get; private set; } = string.Empty;

    public ApplicationDbContext CreateDbContext() => new(
        new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(ConnectionString).Options);

    async Task IAsyncLifetime.InitializeAsync()
    {
        var external = Environment.GetEnvironmentVariable(ConnectionEnvironmentVariable);

        if (!string.IsNullOrWhiteSpace(external))
        {
            adminConnectionString = external;
            databaseName = $"abc_it_{Guid.NewGuid():N}"[..30];

            await using (var admin = new NpgsqlConnection(adminConnectionString))
            {
                await admin.OpenAsync();
                await using var create = new NpgsqlCommand($"CREATE DATABASE \"{databaseName}\"", admin);
                await create.ExecuteNonQueryAsync();
            }

            ConnectionString = new NpgsqlConnectionStringBuilder(adminConnectionString)
            {
                Database = databaseName
            }.ConnectionString;
        }
        else
        {
            container = new PostgreSqlBuilder("postgres:17-alpine").Build();
            await container.StartAsync();
            ConnectionString = container.GetConnectionString();
        }

        await using var context = CreateDbContext();
        await context.Database.MigrateAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:DefaultConnection", ConnectionString);
    }

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        NpgsqlConnection.ClearAllPools();

        if (container is not null)
        {
            await container.DisposeAsync();
            return;
        }

        if (adminConnectionString is not null && databaseName is not null)
        {
            await using var admin = new NpgsqlConnection(adminConnectionString);
            await admin.OpenAsync();
            await using var drop = new NpgsqlCommand($"DROP DATABASE IF EXISTS \"{databaseName}\" WITH (FORCE)", admin);
            await drop.ExecuteNonQueryAsync();
        }
    }
}
