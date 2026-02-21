/*
 * AuthService.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * AI-assisted: credential lookup and DTO mapping generated with
 * GitHub Copilot; reviewed and directed by Ryan Loiselle.
 */

using DSC.Api.DTOs;
using DSC.Api.Infrastructure;
using DSC.Data;
using Microsoft.EntityFrameworkCore;

namespace DSC.Api.Services;

public class AuthService(ApplicationDbContext db) : IAuthService
{
    // validates username/password against UserAuth; throws UnauthorizedException on bad credentials or inactive account
    public async Task<LoginResponse> AuthenticateAsync(string username, string password)
    {
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            throw new UnauthorizedException("Invalid credentials");

        var userAuth = await db.Set<Data.Models.UserAuth>()
            .FirstOrDefaultAsync(ua => ua.UserName == username && ua.Password == password);

        if (userAuth == null)
            throw new UnauthorizedException("Invalid credentials");

        var user = await db.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Username == username);

        if (user == null)
            throw new UnauthorizedException("User not found");

        if (!user.IsActive)
            throw new UnauthorizedException("Account is deactivated");

        return ToResponse(user);
    }

    // returns login response for a user matched by employee ID; null if not found
    public async Task<LoginResponse?> GetByEmpIdAsync(int empId)
    {
        var user = await db.Users.AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.EmpId == empId);

        return user == null ? null : ToResponse(user);
    }

    // maps a User entity to the login response DTO
    private static LoginResponse ToResponse(Data.Models.User u) => new()
    {
        Id        = u.Id,
        EmpId     = u.EmpId ?? 0,
        Username  = u.Username,
        Email     = u.Email ?? string.Empty,
        FirstName = u.FirstName ?? string.Empty,
        LastName  = u.LastName ?? string.Empty,
        RoleId    = u.RoleId,
        RoleName  = u.Role?.Name ?? "User"
    };
} // end AuthService
