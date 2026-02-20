using System;
using System.Threading.Tasks;
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
    public class ItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ItemsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(WorkItemDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<WorkItemDto[]>> GetAll()
        {
            var items = await _db.WorkItems.AsNoTracking()
                .OrderByDescending(w => w.Date ?? DateTime.MinValue)
                .Select(w => new WorkItemDto
                {
                    Id = w.Id,
                    ProjectId = w.ProjectId,
                    LegacyActivityId = w.LegacyActivityId,
                    Date = w.Date,
                    StartTime = w.StartTime,
                    EndTime = w.EndTime,
                    PlannedDuration = w.PlannedDuration,
                    ActualDuration = w.ActualDuration,
                    ActivityCode = w.ActivityCode,
                    NetworkNumber = w.NetworkNumber != null ? int.Parse(w.NetworkNumber) : null,
                    Title = w.Title,
                    Description = w.Description,
                    EstimatedHours = w.EstimatedHours,
                    RemainingHours = w.RemainingHours
                })
                .ToArrayAsync();

            return Ok(items);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(WorkItemDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WorkItemDto>> Get(Guid id)
        {
            var item = await _db.WorkItems.AsNoTracking().FirstOrDefaultAsync(w => w.Id == id);
            if (item == null) return NotFound();
            var dto = new WorkItemDto
            {
                Id = item.Id,
                ProjectId = item.ProjectId,
                LegacyActivityId = item.LegacyActivityId,
                Date = item.Date,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                PlannedDuration = item.PlannedDuration,
                ActualDuration = item.ActualDuration,
                ActivityCode = item.ActivityCode,
                NetworkNumber = item.NetworkNumber != null ? int.Parse(item.NetworkNumber) : null,
                Title = item.Title,
                Description = item.Description,
                EstimatedHours = item.EstimatedHours,
                RemainingHours = item.RemainingHours
            };
            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Post([FromBody] WorkItemCreateRequest request)
        {
            // Basic server-side validation
            if (string.IsNullOrWhiteSpace(request.Title) || request.ProjectId == Guid.Empty)
            {
                return BadRequest(new { error = "Missing required fields: Title and ProjectId" });
            }

            // Verify project exists
            var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId);
            if (!projectExists)
            {
                return BadRequest(new { error = "Project not found" });
            }

            var workItem = new WorkItem
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                Title = request.Title,
                Description = request.Description,
                LegacyActivityId = request.LegacyActivityId,
                Date = request.Date,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                PlannedDuration = request.PlannedDuration.HasValue ? TimeSpan.FromHours(request.PlannedDuration.Value) : null,
                ActualDuration = request.ActualDuration,
                ActivityCode = request.ActivityCode,
                NetworkNumber = request.NetworkNumber?.ToString(),
                EstimatedHours = request.EstimatedHours,
                RemainingHours = request.RemainingHours
            };

            await _db.WorkItems.AddAsync(workItem);
            await _db.SaveChangesAsync();

            var responseDto = new WorkItemDto
            {
                Id = workItem.Id,
                ProjectId = workItem.ProjectId,
                Title = workItem.Title,
                Description = workItem.Description,
                LegacyActivityId = workItem.LegacyActivityId,
                Date = workItem.Date,
                StartTime = workItem.StartTime,
                EndTime = workItem.EndTime,
                PlannedDuration = workItem.PlannedDuration,
                ActualDuration = workItem.ActualDuration,
                ActivityCode = workItem.ActivityCode,
                NetworkNumber = workItem.NetworkNumber != null ? int.Parse(workItem.NetworkNumber) : null,
                EstimatedHours = workItem.EstimatedHours,
                RemainingHours = workItem.RemainingHours
            };

            return CreatedAtAction(nameof(Get), new { id = workItem.Id }, responseDto);
        }
    }
}
