/*
 * AdminProjectActivityOptionsController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin CRUD controller for project-to-activity-option assignments.
 * Manages valid activity-code / network-number combinations per project; enforces referential integrity on create.
 * AI-assisted: CRUD scaffolding, EF Core include/query patterns, OpenAPI attributes; reviewed and directed by Ryan Loiselle.
 */

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
    [Route("api/admin/project-activity-options")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminProjectActivityOptionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminProjectActivityOptionsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ProjectActivityOptionDetailDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ProjectActivityOptionDetailDto[]>> GetAll([FromQuery] Guid? projectId)
        {
            IQueryable<ProjectActivityOption> query = _db.ProjectActivityOptions.AsNoTracking()
                .Include(p => p.ActivityCode)
                .Include(p => p.NetworkNumber);
                
            if (projectId.HasValue && projectId.Value != Guid.Empty)
            {
                query = query.Where(p => p.ProjectId == projectId);
            }

            var items = await query
                .Select(p => new ProjectActivityOptionDetailDto
                {
                    ProjectId = p.ProjectId,
                    ActivityCodeId = p.ActivityCodeId,
                    NetworkNumberId = p.NetworkNumberId,
                    ActivityCode = p.ActivityCode != null ? new ActivityCodeDto
                    {
                        Id = p.ActivityCode.Id,
                        Code = p.ActivityCode.Code,
                        Description = p.ActivityCode.Description,
                        IsActive = p.ActivityCode.IsActive
                    } : null,
                    NetworkNumber = p.NetworkNumber != null ? new NetworkNumberDto
                    {
                        Id = p.NetworkNumber.Id,
                        Number = p.NetworkNumber.Number,
                        Description = p.NetworkNumber.Description,
                        IsActive = p.NetworkNumber.IsActive
                    } : null
                })
                .ToArrayAsync();

            return Ok(items);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] ProjectActivityOptionCreateRequest request)
        {
            if (request.ProjectId == Guid.Empty || request.ActivityCodeId == Guid.Empty || request.NetworkNumberId == Guid.Empty)
            {
                return BadRequest(new { error = "ProjectId, ActivityCodeId, and NetworkNumberId are required." });
            }

            // Check if this combination already exists
            var exists = await _db.ProjectActivityOptions
                .AnyAsync(p => p.ProjectId == request.ProjectId 
                    && p.ActivityCodeId == request.ActivityCodeId 
                    && p.NetworkNumberId == request.NetworkNumberId);

            if (exists)
            {
                return BadRequest(new { error = "This project activity option already exists." });
            }

            var entity = new ProjectActivityOption
            {
                ProjectId = request.ProjectId,
                ActivityCodeId = request.ActivityCodeId,
                NetworkNumberId = request.NetworkNumberId
            };

            await _db.ProjectActivityOptions.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { projectId = request.ProjectId }, entity);
        }

        [HttpPost("assign-all")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AssignAllToProject([FromBody] AssignAllRequest request)
        {
            if (request.ProjectId == Guid.Empty)
            {
                return BadRequest(new { error = "ProjectId is required." });
            }

            // Verify project exists
            var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId);
            if (!projectExists)
            {
                return BadRequest(new { error = "Project not found." });
            }

            // Get all active activity codes and network numbers
            var activityCodes = await _db.ActivityCodes.Where(a => a.IsActive).ToListAsync();
            var networkNumbers = await _db.NetworkNumbers.Where(n => n.IsActive).ToListAsync();

            if (activityCodes.Count == 0 || networkNumbers.Count == 0)
            {
                return BadRequest(new { error = "No active activity codes or network numbers found." });
            }

            // Get existing assignments to avoid duplicates
            var existing = await _db.ProjectActivityOptions
                .Where(p => p.ProjectId == request.ProjectId)
                .Select(p => new { p.ActivityCodeId, p.NetworkNumberId })
                .ToHashSetAsync();

            var newAssignments = new List<ProjectActivityOption>();

            // Create all combinations
            foreach (var activityCode in activityCodes)
            {
                foreach (var networkNumber in networkNumbers)
                {
                    if (!existing.Contains(new { ActivityCodeId = activityCode.Id, NetworkNumberId = networkNumber.Id }))
                    {
                        newAssignments.Add(new ProjectActivityOption
                        {
                            ProjectId = request.ProjectId,
                            ActivityCodeId = activityCode.Id,
                            NetworkNumberId = networkNumber.Id
                        });
                    }
                }
            }

            if (newAssignments.Count > 0)
            {
                await _db.ProjectActivityOptions.AddRangeAsync(newAssignments);
                await _db.SaveChangesAsync();
            }

            return Ok(new { message = $"Created {newAssignments.Count} project activity option assignments.", totalAssignments = existing.Count + newAssignments.Count });
        }

        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Delete([FromQuery] Guid projectId, [FromQuery] Guid activityCodeId, [FromQuery] Guid networkNumberId)
        {
            if (projectId == Guid.Empty || activityCodeId == Guid.Empty || networkNumberId == Guid.Empty)
            {
                return BadRequest(new { error = "ProjectId, ActivityCodeId, and NetworkNumberId are required." });
            }

            var entity = await _db.ProjectActivityOptions
                .FirstOrDefaultAsync(p => p.ProjectId == projectId 
                    && p.ActivityCodeId == activityCodeId 
                    && p.NetworkNumberId == networkNumberId);

            if (entity == null)
            {
                return NotFound(new { error = "Project activity option not found." });
            }

            _db.ProjectActivityOptions.Remove(entity);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Project activity option deleted." });
        }
    }

    public class AssignAllRequest
    {
        public Guid ProjectId { get; set; }
    }
}
