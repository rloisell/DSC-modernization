/*
 * IAuthService.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Service interface for authentication operations. Implemented by AuthService.
 * AI-assisted: interface scaffolding; reviewed and directed by Ryan Loiselle.
 */

using DSC.Api.DTOs;

namespace DSC.Api.Services;

public interface IAuthService
{
    /// <exception cref="Infrastructure.UnauthorizedException"/>
    Task<LoginResponse> AuthenticateAsync(string username, string password);

    /// <returns>null when no user with that empId exists.</returns>
    Task<LoginResponse?> GetByEmpIdAsync(int empId);
}
