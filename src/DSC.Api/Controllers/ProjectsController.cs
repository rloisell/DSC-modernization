using System;
using System.Linq;
using System.Threading.Tasks;
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
        public async Task<IActionResult> GetAll()
        {
            var projects = await _db.Projects.AsNoTracking()
                .Select(p => new ProjectDto { Id = p.Id, ProjectNo = p.ProjectNo, Name = p.Name, Description = p.Description, EstimatedHours = p.EstimatedHours })
                .ToListAsync();
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return NotFound();
            var dto = new ProjectDto { Id = project.Id, ProjectNo = project.ProjectNo, Name = project.Name, Description = project.Description, EstimatedHours = project.EstimatedHours };
            return Ok(dto);
        }

        [HttpPost]
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
