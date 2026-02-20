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
        [ProducesResponseType(typeof(ProjectActivityOptionDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ProjectActivityOptionDto[]>> GetAll([FromQuery] Guid? projectId)
        {
            var query = _db.ProjectActivityOptions.AsNoTracking();
            if (projectId.HasValue && projectId.Value != Guid.Empty)
            {
                query = query.Where(p => p.ProjectId == projectId);
            }

            var items = await query
                .Select(p => new ProjectActivityOptionDto
                {
                    ProjectId = p.ProjectId,
                    ActivityCodeId = p.ActivityCodeId,
                    NetworkNumberId = p.NetworkNumberId
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

            var entity = new ProjectActivityOption
            {
                ProjectId = request.ProjectId,
                ActivityCodeId = request.ActivityCodeId,
                NetworkNumberId = request.NetworkNumberId
            };

            await _db.ProjectActivityOptions.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { projectId = request.ProjectId }, new { request.ProjectId });
        }
    }
}
