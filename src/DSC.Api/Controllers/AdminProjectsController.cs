using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Api.DTOs;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/admin/projects")]
    public class AdminProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminProjectsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(AdminProjectDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<AdminProjectDto[]>> GetAll()
        {
            var projects = await _db.Projects.AsNoTracking()
                .OrderBy(p => p.Name)
                .Select(p => new AdminProjectDto
                {
                    Id = p.Id,
                    ProjectNo = p.ProjectNo,
                    Name = p.Name,
                    Description = p.Description,
                    EstimatedHours = p.EstimatedHours,
                    IsActive = p.IsActive
                })
                .ToArrayAsync();

            return Ok(projects);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] AdminProjectCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required." });
            }

            var entity = new Project
            {
                Id = Guid.NewGuid(),
                ProjectNo = request.ProjectNo,
                Name = request.Name.Trim(),
                Description = request.Description,
                EstimatedHours = request.EstimatedHours,
                IsActive = true
            };

            await _db.Projects.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] AdminProjectUpdateRequest request)
        {
            var entity = await _db.Projects.FirstOrDefaultAsync(p => p.Id == id);
            if (entity == null) return NotFound();

            entity.ProjectNo = request.ProjectNo;
            entity.Name = request.Name.Trim();
            entity.Description = request.Description;
            entity.EstimatedHours = request.EstimatedHours;
            entity.IsActive = request.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
