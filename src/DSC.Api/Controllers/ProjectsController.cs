using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;
using DSC.Api.DTOs;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ProjectsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProjectDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
        {
            // Get current user from claims
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                // If no user context, return empty list
                return Ok(new List<ProjectDto>());
            }

            var user = await _db.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));

            if (user == null)
            {
                return Ok(new List<ProjectDto>());
            }

            IQueryable<Project> query = _db.Projects.AsNoTracking();

            // If user is Admin, Manager, or Director, return all projects
            if (user.Role != null && (user.Role.Name == "Admin" || user.Role.Name == "Manager" || user.Role.Name == "Director"))
            {
                // Return all projects with estimated hours
                var allProjects = await query
                    .Select(p => new ProjectDto 
                    { 
                        Id = p.Id, 
                        ProjectNo = p.ProjectNo, 
                        Name = p.Name, 
                        Description = p.Description, 
                        EstimatedHours = p.EstimatedHours 
                    })
                    .ToListAsync();
                return Ok(allProjects);
            }

            // Regular user: return only projects they're assigned to
            var assignedProjects = await query
                .Where(p => _db.ProjectAssignments
                    .Any(pa => pa.ProjectId == p.Id && pa.UserId == user.Id))
                .Select(p => new ProjectDto 
                { 
                    Id = p.Id, 
                    ProjectNo = p.ProjectNo, 
                    Name = p.Name, 
                    Description = p.Description, 
                    EstimatedHours = p.EstimatedHours 
                })
                .ToListAsync();

            return Ok(assignedProjects);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProjectDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProjectDto>> Get(Guid id)
        {
            var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return NotFound();
            var dto = new ProjectDto { Id = project.Id, ProjectNo = project.ProjectNo, Name = project.Name, Description = project.Description, EstimatedHours = project.EstimatedHours };
            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Post([FromBody] Project dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name)) return BadRequest(new { error = "Missing required field: Name" });

            dto.Id = Guid.NewGuid();
            await _db.Projects.AddAsync(dto);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = dto.Id }, new { id = dto.Id });
        }
    }
}
