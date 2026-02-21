/*
 * AuthDtos.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Data Transfer Objects for authentication: LoginRequest (credentials in) and LoginResponse (token out).
 * AI-assisted: DTO scaffolding; reviewed and directed by Ryan Loiselle.
 */

namespace DSC.Api.DTOs;

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public Guid Id { get; set; }
    public int EmpId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Guid? RoleId { get; set; }
    public string RoleName { get; set; } = string.Empty;
}
