using DSC.Api.DTOs;

namespace DSC.Api.Services;

public interface IAuthService
{
    /// <exception cref="Infrastructure.UnauthorizedException"/>
    Task<LoginResponse> AuthenticateAsync(string username, string password);

    /// <returns>null when no user with that empId exists.</returns>
    Task<LoginResponse?> GetByEmpIdAsync(int empId);
}
