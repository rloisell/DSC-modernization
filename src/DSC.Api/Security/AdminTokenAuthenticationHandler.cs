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
        UrlEncoder encoder,
        ISystemClock clock)
        : base(options, logger, encoder, clock)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var expectedToken = Context.RequestServices
            .GetRequiredService<IConfiguration>()
            .GetValue<string>("Admin:Token");

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
