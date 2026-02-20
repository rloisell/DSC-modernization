using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AuthController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Check UserAuth table for authentication
            var userAuth = await _db.Set<UserAuth>()
                .FirstOrDefaultAsync(ua => ua.UserName == request.Username && ua.Password == request.Password);

            if (userAuth == null)
            {
                return Unauthorized(new { message = "Invalid credentials" });
            }

            // Fetch the full user details
            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Username == request.Username);

            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            return Ok(new LoginResponse
            {
                EmpId = user.EmpId ?? 0,
                Username = user.Username,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                RoleId = user.RoleId,
                RoleName = user.Role?.Name ?? "User"
            });
        }

        [HttpGet("user/{empId}")]
        [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<LoginResponse>> GetUser(int empId)
        {
            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.EmpId == empId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(new LoginResponse
            {
                EmpId = user.EmpId ?? 0,
                Username = user.Username,
                Email = user.Email ?? string.Empty,
                FirstName = user.FirstName ?? string.Empty,
                LastName = user.LastName ?? string.Empty,
                RoleId = user.RoleId,
                RoleName = user.Role?.Name ?? "User"
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public int EmpId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public Guid? RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
    }
}
