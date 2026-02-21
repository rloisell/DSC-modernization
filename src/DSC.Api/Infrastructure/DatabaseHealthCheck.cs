/*
 * DatabaseHealthCheck.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * ASP.NET Core health check that verifies database connectivity using EF Core CanConnectAsync.
 * Registered as the "database" check; consumed by /health/live and /health/ready probes.
 * AI-assisted: IHealthCheck implementation pattern, scope factory usage; reviewed and directed by Ryan Loiselle.
 */

using DSC.Data;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace DSC.Api.Infrastructure;

/// <summary>
/// Health check that verifies the database is reachable.
/// Does not require any additional NuGet packages beyond the existing EF Core setup.
/// </summary>
public sealed class DatabaseHealthCheck(IServiceScopeFactory scopeFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken ct = default)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var canConnect = await db.Database.CanConnectAsync(ct);
            return canConnect
                ? HealthCheckResult.Healthy("Database is reachable")
                : HealthCheckResult.Unhealthy("Database did not respond to connection check");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database connection failed", ex);
        }
    }
}
