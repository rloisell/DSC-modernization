using System.Threading.RateLimiting;
using DSC.Api.Security;
using DSC.Api.Seeding;
using DSC.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.OperationFilter<DSC.Api.Swagger.WorkItemExamplesOperationFilter>();
});

builder.Services.AddAuthentication("AdminToken")
    .AddScheme<AuthenticationSchemeOptions, AdminTokenAuthenticationHandler>("AdminToken", null);
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireAuthenticatedUser());
});
builder.Services.AddScoped<IPasswordHasher<DSC.Data.Models.User>, PasswordHasher<DSC.Data.Models.User>>();
builder.Services.AddScoped<TestDataSeeder>();

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
        // EnsureCreated creates the database schema without using migrations
        db.Database.EnsureCreated();
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

app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

