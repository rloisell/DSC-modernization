/*
 * AdminTokenAuthenticationHandler.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Validates the X-Admin-Token header against the configured secret.
 * In development, the token requirement can be bypassed via appsettings.
 * AI-assisted: handler scaffolding generated with GitHub Copilot;
 * reviewed and directed by Ryan Loiselle.
 */

using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace DSC.Api.Security;

public class AdminTokenAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public AdminTokenAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    // validates the X-Admin-Token header against the configured secret
    // dev environments may bypass token requirement via Admin:RequireToken = false in appsettings
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var config = Context.RequestServices.GetRequiredService<IConfiguration>();
        var env = Context.RequestServices.GetRequiredService<IHostEnvironment>();
        var requireToken = config.GetValue("Admin:RequireToken", true);
        if (!requireToken)
        {
            if (!env.IsDevelopment())
            {
                return Task.FromResult(AuthenticateResult.Fail("Admin token bypass is only allowed in Development."));
            }

            var bypassClaims = new[] { new Claim(ClaimTypes.Name, "AdminBypass") };
            var bypassIdentity = new ClaimsIdentity(bypassClaims, Scheme.Name);
            var bypassPrincipal = new ClaimsPrincipal(bypassIdentity);
            var bypassTicket = new AuthenticationTicket(bypassPrincipal, Scheme.Name);

            return Task.FromResult(AuthenticateResult.Success(bypassTicket));
        }

        var expectedToken = config.GetValue<string>("Admin:Token");

        if (string.IsNullOrWhiteSpace(expectedToken))
        {
            return Task.FromResult(AuthenticateResult.Fail("Admin token not configured."));
        }

        if (!Request.Headers.TryGetValue("X-Admin-Token", out var provided) || provided.Count == 0)
        {
            return Task.FromResult(AuthenticateResult.Fail("Missing admin token."));
        }

        if (!string.Equals(provided[0], expectedToken, StringComparison.Ordinal))
        {
            return Task.FromResult(AuthenticateResult.Fail("Invalid admin token."));
        }

        var claims = new[] { new Claim(ClaimTypes.Name, "AdminToken") };
        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
