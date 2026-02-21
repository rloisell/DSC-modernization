using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using DSC.Api.DTOs;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminUsersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IPasswordHasher<User> _passwordHasher;

        public AdminUsersController(ApplicationDbContext db, IPasswordHasher<User> passwordHasher)
        {
            _db = db;
            _passwordHasher = passwordHasher;
        }

        [HttpGet]
        [ProducesResponseType(typeof(AdminUserDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<AdminUserDto[]>> GetAll()
        {
            var users = await _db.Users.AsNoTracking()
                .OrderBy(u => u.LastName)
                .ThenBy(u => u.FirstName)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    EmpId = u.EmpId,
                    Username = u.Username,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    IsActive = u.IsActive,
                    RoleId = u.RoleId,
                    PositionId = u.PositionId,
                    DepartmentId = u.DepartmentId
                })
                .ToArrayAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AdminUserDto>> Get(Guid id)
        {
            var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            var dto = new AdminUserDto
            {
                Id = user.Id,
                EmpId = user.EmpId,
                Username = user.Username,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                IsActive = user.IsActive,
                RoleId = user.RoleId,
                PositionId = user.PositionId,
                DepartmentId = user.DepartmentId
            };

            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] AdminUserCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { error = "Username and Email are required." });
            }

            var exists = await _db.Users.AnyAsync(u => u.Username == request.Username);
            if (exists)
            {
                return BadRequest(new { error = "Username already exists." });
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                EmpId = request.EmpId,
                Username = request.Username,
                Email = request.Email,
                FirstName = request.FirstName,
                LastName = request.LastName,
                RoleId = request.RoleId,
                PositionId = request.PositionId,
                DepartmentId = request.DepartmentId,
                PasswordHash = string.IsNullOrWhiteSpace(request.Password)
                    ? null
                    : _passwordHasher.HashPassword(null!, request.Password)
            };

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = user.Id }, new { id = user.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] AdminUserUpdateRequest request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            user.EmpId = request.EmpId;
            user.Email = request.Email;
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.RoleId = request.RoleId;
            user.PositionId = request.PositionId;
            user.DepartmentId = request.DepartmentId;

            if (!string.IsNullOrWhiteSpace(request.Password))
            {
                user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
            }

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/deactivate")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            user.IsActive = false;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("{id}/activate")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Activate(Guid id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            user.IsActive = true;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id);
            if (user == null) return NotFound();

            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return NoContent();
        }

    }
}
