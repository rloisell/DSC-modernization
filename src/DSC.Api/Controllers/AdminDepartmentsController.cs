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
    [Route("api/admin/departments")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminDepartmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminDepartmentsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(DepartmentDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<DepartmentDto[]>> GetAll()
        {
            var departments = await _db.Departments.AsNoTracking()
                .OrderBy(d => d.Name)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.Name,
                    ManagerName = d.ManagerName,
                    IsActive = d.IsActive
                })
                .ToArrayAsync();

            return Ok(departments);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] DepartmentCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required." });
            }

            var entity = new Department
            {
                Id = Guid.NewGuid(),
                Name = request.Name.Trim(),
                ManagerName = request.ManagerName,
                IsActive = true
            };

            await _db.Departments.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] DepartmentUpdateRequest request)
        {
            var entity = await _db.Departments.FirstOrDefaultAsync(d => d.Id == id);
            if (entity == null) return NotFound();

            entity.Name = request.Name.Trim();
            entity.ManagerName = request.ManagerName;
            entity.IsActive = request.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
