using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ItemsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var item = await _db.WorkItems.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id);
            if (item == null) return NotFound();
            return Ok(new {
                id = item.Id,
                title = item.Title,
                description = item.Description,
                projectId = item.ProjectId,
                estimatedHours = item.EstimatedHours,
                remainingHours = item.RemainingHours
            });
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] WorkItem dto)
        {
            // Basic server-side validation
            if (string.IsNullOrWhiteSpace(dto.Title) || dto.ProjectId == Guid.Empty)
            {
                return BadRequest(new { error = "Missing required fields: Title and ProjectId" });
            }

            dto.Id = Guid.NewGuid();
            await _db.WorkItems.AddAsync(dto);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = dto.Id }, new { id = dto.Id });
        }
    }
}
