using DSC.Api.DTOs;
using DSC.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController(IAuthService svc) : ControllerBase
    {
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
            => Ok(await svc.AuthenticateAsync(request.Username, request.Password));

        [HttpGet("user/{empId}")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LoginResponse>> GetUser(int empId)
        {
            var user = await svc.GetByEmpIdAsync(empId);
            return user == null ? NotFound() : Ok(user);
        }
    }
}
