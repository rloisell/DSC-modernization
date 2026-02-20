using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Api.DTOs;
using DSC.Data;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/catalog")]
    public class CatalogController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public CatalogController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("activity-codes")]
        [ProducesResponseType(typeof(ActivityCodeDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ActivityCodeDto[]>> GetActivityCodes()
        {
            var codes = await _db.ActivityCodes.AsNoTracking()
                .Where(c => c.IsActive)
                .OrderBy(c => c.Code)
                .Select(c => new ActivityCodeDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    Description = c.Description,
                    IsActive = c.IsActive
                })
                .ToArrayAsync();

            return Ok(codes);
        }

        [HttpGet("network-numbers")]
        [ProducesResponseType(typeof(NetworkNumberDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<NetworkNumberDto[]>> GetNetworkNumbers()
        {
            var numbers = await _db.NetworkNumbers.AsNoTracking()
                .Where(n => n.IsActive)
                .OrderBy(n => n.Number)
                .Select(n => new NetworkNumberDto
                {
                    Id = n.Id,
                    Number = n.Number,
                    Description = n.Description,
                    IsActive = n.IsActive
                })
                .ToArrayAsync();

            return Ok(numbers);
        }

        [HttpGet("budgets")]
        [ProducesResponseType(typeof(BudgetDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<BudgetDto[]>> GetBudgets()
        {
            var budgets = await _db.Budgets.AsNoTracking()
                .Where(b => b.IsActive)
                .OrderBy(b => b.Description)
                .Select(b => new BudgetDto
                {
                    Id = b.Id,
                    Description = b.Description,
                    IsActive = b.IsActive
                })
                .ToArrayAsync();

            return Ok(budgets);
        }

        [HttpGet("project-options/{projectId}")]
        [ProducesResponseType(typeof(ProjectActivityOptionsResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ProjectActivityOptionsResponse>> GetProjectOptions(Guid projectId)
        {
            // Verify project exists
            var project = await _db.Projects.AsNoTracking().FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
            {
                return NotFound(new { error = "Project not found" });
            }

            // Get all activity options assigned to this project
            var options = await _db.ProjectActivityOptions
                .AsNoTracking()
                .Include(p => p.ActivityCode)
                .Include(p => p.NetworkNumber)
                .Where(p => p.ProjectId == projectId 
                    && p.ActivityCode != null && p.ActivityCode.IsActive
                    && p.NetworkNumber != null && p.NetworkNumber.IsActive)
                .Select(p => new ProjectActivityCodeNetworkPair
                {
                    ActivityCodeId = p.ActivityCodeId,
                    ActivityCode = p.ActivityCode!.Code,
                    ActivityCodeDescription = p.ActivityCode.Description,
                    NetworkNumberId = p.NetworkNumberId,
                    NetworkNumber = p.NetworkNumber!.Number,
                    NetworkNumberDescription = p.NetworkNumber.Description
                })
                .ToListAsync();

            // Get distinct activity codes for this project
            var activityCodes = options
                .GroupBy(o => new { o.ActivityCodeId, o.ActivityCode, o.ActivityCodeDescription })
                .Select(g => new ActivityCodeDto
                {
                    Id = g.Key.ActivityCodeId,
                    Code = g.Key.ActivityCode,
                    Description = g.Key.ActivityCodeDescription,
                    IsActive = true
                })
                .OrderBy(a => a.Code)
                .ToArray();

            // Get distinct network numbers for this project
            var networkNumbers = options
                .GroupBy(o => new { o.NetworkNumberId, o.NetworkNumber, o.NetworkNumberDescription })
                .Select(g => new NetworkNumberDto
                {
                    Id = g.Key.NetworkNumberId,
                    Number = g.Key.NetworkNumber,
                    Description = g.Key.NetworkNumberDescription,
                    IsActive = true
                })
                .OrderBy(n => n.Number)
                .ToArray();

            return Ok(new ProjectActivityOptionsResponse
            {
                ProjectId = projectId,
                ActivityCodes = activityCodes,
                NetworkNumbers = networkNumbers,
                ValidPairs = options.ToArray()
            });
        }
    }

    public class ProjectActivityOptionsResponse
    {
        public Guid ProjectId { get; set; }
        public ActivityCodeDto[] ActivityCodes { get; set; } = Array.Empty<ActivityCodeDto>();
        public NetworkNumberDto[] NetworkNumbers { get; set; } = Array.Empty<NetworkNumberDto>();
        public ProjectActivityCodeNetworkPair[] ValidPairs { get; set; } = Array.Empty<ProjectActivityCodeNetworkPair>();
    }

    public class ProjectActivityCodeNetworkPair
    {
        public Guid ActivityCodeId { get; set; }
        public string ActivityCode { get; set; } = string.Empty;
        public string? ActivityCodeDescription { get; set; }
        public Guid NetworkNumberId { get; set; }
        public int NetworkNumber { get; set; }
        public string? NetworkNumberDescription { get; set; }
    }
}
