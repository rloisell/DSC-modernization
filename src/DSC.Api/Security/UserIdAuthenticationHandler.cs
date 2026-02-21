/*
 * UserIdAuthenticationHandler.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Reads the X-User-Id header, validates the user against the database,
 * and builds a ClaimsPrincipal for downstream role-based access control.
 * AI-assisted: handler scaffolding generated with GitHub Copilot;
 * reviewed and directed by Ryan Loiselle.
 */

using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using DSC.Data;

namespace DSC.Api.Security;

public class UserIdAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly ApplicationDbContext _db;

    public UserIdAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ApplicationDbContext db)
        : base(options, logger, encoder)
    {
        _db = db;
    }

    // reads X-User-Id header, looks up the user in the database, and builds a ClaimsPrincipal
    // returns NoResult if the header is absent or the user is not found
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // First try to get userId from X-User-Id header (sent by frontend after login)
        if (Request.Headers.TryGetValue("X-User-Id", out var userIdHeader) && userIdHeader.Count > 0)
        {
            if (Guid.TryParse(userIdHeader[0], out var userId))
            {
                // Get user from database to verify and get claims
                var user = await _db.Users
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user != null)
                {
                    var claims = new List<Claim>
                    {
                        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                        new Claim(ClaimTypes.Name, user.Username),
                        new Claim("role", user.Role?.Name ?? "User")
                    };

                    var identity = new ClaimsIdentity(claims, Scheme.Name);
                    var principal = new ClaimsPrincipal(identity);
                    var ticket = new AuthenticationTicket(principal, Scheme.Name);

                    return AuthenticateResult.Success(ticket);
                }
            }
        }

        // Not authenticated
        return AuthenticateResult.NoResult();
    }
}
