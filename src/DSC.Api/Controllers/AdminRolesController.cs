using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using DSC.Api.DTOs;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/admin/roles")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminRolesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminRolesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(RoleDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<RoleDto[]>> GetAll()
        {
            var roles = await _db.Roles.AsNoTracking()
                .OrderBy(r => r.Name)
                .Select(r => new RoleDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    IsActive = r.IsActive
                })
                .ToArrayAsync();

            return Ok(roles);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(RoleDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RoleDto>> Get(Guid id)
        {
            var role = await _db.Roles.AsNoTracking().FirstOrDefaultAsync(r => r.Id == id);
            if (role == null) return NotFound();

            var dto = new RoleDto
            {
                Id = role.Id,
                Name = role.Name,
                Description = role.Description,
                IsActive = role.IsActive
            };

            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] RoleCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required." });
            }

            var exists = await _db.Roles.AnyAsync(r => r.Name == request.Name);
            if (exists)
            {
                return BadRequest(new { error = "Role name already exists." });
            }

            var entity = new Role
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                Description = request.Description,
                IsActive = true
            };

            _db.Roles.Add(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = entity.Id }, entity);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(Guid id, [FromBody] RoleUpdateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required." });
            }

            var entity = await _db.Roles.FirstOrDefaultAsync(r => r.Id == id);
            if (entity == null) return NotFound();

            var nameTaken = await _db.Roles.AnyAsync(r => r.Name == request.Name && r.Id != id);
            if (nameTaken)
            {
                return BadRequest(new { error = "Role name already in use." });
            }

            entity.Name = request.Name.Trim();
            entity.Description = request.Description;
            entity.IsActive = request.IsActive;
            entity.ModifiedAt = DateTime.UtcNow;

            _db.Roles.Update(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var entity = await _db.Roles.FirstOrDefaultAsync(r => r.Id == id);
            if (entity == null) return NotFound();

            _db.Roles.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
