/*
 * GlobalExceptionHandler.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Maps domain exceptions to RFC 7807 ProblemDetails HTTP responses.
 * Registered via AddExceptionHandler<GlobalExceptionHandler>() in Program.cs.
 * AI-assisted: exception-to-status mapping generated with GitHub Copilot;
 * reviewed and directed by Ryan Loiselle.
 */

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace DSC.Api.Infrastructure;

/// <summary>
/// Converts domain exceptions into RFC 7807 ProblemDetails responses.
/// Registered via builder.Services.AddExceptionHandler&lt;GlobalExceptionHandler&gt;().
/// </summary>
public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx,
        Exception exception,
        CancellationToken ct)
    {
        var (status, title) = exception switch
        {
            NotFoundException       => (StatusCodes.Status404NotFound,            "Not Found"),
            ForbiddenException      => (StatusCodes.Status403Forbidden,           "Forbidden"),
            BadRequestException     => (StatusCodes.Status400BadRequest,          "Bad Request"),
            UnauthorizedException   => (StatusCodes.Status401Unauthorized,        "Unauthorized"),
            _                       => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        if (status == StatusCodes.Status500InternalServerError)
            logger.LogError(exception, "Unhandled exception on {Method} {Path}",
                ctx.Request.Method, ctx.Request.Path);

        ctx.Response.StatusCode = status;
        await ctx.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = status,
            Title  = title,
            Detail = exception.Message,
            Instance = ctx.Request.Path
        }, ct);

        return true;
    }
}
