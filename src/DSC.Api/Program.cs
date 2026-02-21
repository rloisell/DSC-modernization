using System.Threading.RateLimiting;
using DSC.Api.Infrastructure;
using DSC.Api.Security;
using DSC.Api.Seeding;
using DSC.Api.Services;
using DSC.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ─── CORS ────────────────────────────────────────────────────────────────────
// In production, replace the wildcard with explicit allowed origins.
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5175", "https://localhost:5001")
              .AllowAnyMethod()
              .AllowAnyHeader());
    options.AddPolicy("ProdCors", policy =>
        policy.WithOrigins(
            builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                ?? Array.Empty<string>())
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<DSC.Api.Swagger.WorkItemExamplesOperationFilter>();
});

// ─── Global exception handling / ProblemDetails ───────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddAuthentication("UserId")
    .AddScheme<AuthenticationSchemeOptions, UserIdAuthenticationHandler>("UserId", null)
    .AddScheme<AuthenticationSchemeOptions, AdminTokenAuthenticationHandler>("AdminToken", null);
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireAuthenticatedUser());
});
builder.Services.AddScoped<IPasswordHasher<DSC.Data.Models.User>, PasswordHasher<DSC.Data.Models.User>>();
builder.Services.AddScoped<TestDataSeeder>();

// ─── Domain Services ─────────────────────────────────────────────────────────
builder.Services.AddScoped<IWorkItemService, WorkItemService>();
builder.Services.AddScoped<IReportService,   ReportService>();
builder.Services.AddScoped<IProjectService,  ProjectService>();
builder.Services.AddScoped<IAuthService,     AuthService>();

builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("Admin", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 60,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

// ─── Health Checks ───────────────────────────────────────────────────────────
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database");

// Register ApplicationDbContext - connection string from configuration
var conn = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(conn))
{
    throw new InvalidOperationException("Missing connection string: ConnectionStrings:DefaultConnection");
}
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(conn, ServerVersion.AutoDetect(conn)));

var app = builder.Build();

// Apply pending migrations automatically on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        // Apply pending EF Core migrations automatically on startup.
        // EnsureCreated() was replaced with Migrate() so incremental schema
        // changes are applied without data loss.
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"Failed to ensure database: {ex.Message}");
        // Don't throw - allow app to start anyway for development
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global exception handler must be first so it wraps everything
app.UseExceptionHandler();

app.UseRouting();
app.UseCors(app.Environment.IsDevelopment() ? "DevCors" : "ProdCors");
app.UseRateLimiter();

// Security headers — defence-in-depth for all responses
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    // API-only CSP: no HTML served, so restrict everything
    context.Response.Headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check endpoints — consumed by OpenShift liveness / readiness probes
app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");

app.Run();

