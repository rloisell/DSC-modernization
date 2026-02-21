using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Data;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public ReportsController(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Returns aggregated reporting data: project summaries, activity code
        /// breakdowns, and (for admin/manager) per-user summaries.
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<ReportSummaryDto>> GetSummary(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] Guid? projectId,
            [FromQuery] Guid? userId)
        {
            var requesterId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            bool isPrivileged = false;
            if (!string.IsNullOrEmpty(requesterId))
            {
                var requester = await _db.Users.AsNoTracking()
                    .Include(u => u.Role)
                    .FirstOrDefaultAsync(u => u.Id == Guid.Parse(requesterId));
                isPrivileged = requester?.Role?.Name == "Admin"
                    || requester?.Role?.Name == "Manager"
                    || requester?.Role?.Name == "Director";
            }

            var query = _db.WorkItems.AsNoTracking()
                .Include(w => w.Project)
                .Include(w => w.User)
                .AsQueryable();

            // Non-privileged users can only see their own data
            if (!isPrivileged && !string.IsNullOrEmpty(requesterId))
                query = query.Where(w => w.UserId == Guid.Parse(requesterId));
            else if (userId.HasValue)
                query = query.Where(w => w.UserId == userId);

            if (projectId.HasValue)
                query = query.Where(w => w.ProjectId == projectId);

            if (from.HasValue)
                query = query.Where(w => w.Date >= from.Value.Date);

            if (to.HasValue)
                query = query.Where(w => w.Date <= to.Value.Date);

            var items = await query.ToListAsync();

            // --- Project summaries ---
            var projectGroups = items
                .Where(w => w.ProjectId.HasValue)
                .GroupBy(w => w.ProjectId!.Value)
                .Select(g =>
                {
                    var first = g.First();
                    var estHours = first.Project?.EstimatedHours;
                    var actualHours = g.Sum(w => w.ActualDuration ?? 0);
                    return new ProjectReportDto
                    {
                        ProjectId = g.Key,
                        ProjectNo = first.Project?.ProjectNo ?? string.Empty,
                        ProjectName = first.Project?.Name ?? string.Empty,
                        EstimatedHours = estHours,
                        ActualHours = actualHours,
                        Variance = estHours.HasValue ? (decimal?)((decimal)actualHours - estHours.Value) : null,
                        IsOverBudget = estHours.HasValue && actualHours > (double)estHours.Value,
                        ItemCount = g.Count()
                    };
                })
                .OrderByDescending(p => p.ActualHours)
                .ToList();

            // --- Activity code summaries ---
            var activityGroups = items
                .Where(w => !string.IsNullOrWhiteSpace(w.ActivityCode))
                .GroupBy(w => w.ActivityCode!)
                .Select(g => new ActivityCodeReportDto
                {
                    ActivityCode = g.Key,
                    TotalHours = g.Sum(w => w.ActualDuration ?? 0),
                    ItemCount = g.Count()
                })
                .OrderByDescending(a => a.TotalHours)
                .ToList();

            // --- User summaries (privileged only) ---
            var userSummaries = new System.Collections.Generic.List<UserReportDto>();
            if (isPrivileged)
            {
                userSummaries = items
                    .Where(w => w.UserId.HasValue)
                    .GroupBy(w => w.UserId!.Value)
                    .Select(g =>
                    {
                        var first = g.First();
                        return new UserReportDto
                        {
                            UserId = g.Key,
                            FullName = $"{first.User?.FirstName} {first.User?.LastName}".Trim(),
                            Username = first.User?.Username ?? string.Empty,
                            TotalHours = g.Sum(w => w.ActualDuration ?? 0),
                            ProjectCount = g.Where(w => w.ProjectId.HasValue).Select(w => w.ProjectId).Distinct().Count(),
                            ItemCount = g.Count()
                        };
                    })
                    .OrderByDescending(u => u.TotalHours)
                    .ToList();
            }

            return Ok(new ReportSummaryDto
            {
                From = from,
                To = to,
                TotalHours = items.Sum(w => w.ActualDuration ?? 0),
                TotalItems = items.Count,
                ProjectSummaries = projectGroups,
                ActivityCodeSummaries = activityGroups,
                UserSummaries = userSummaries,
                IsPrivilegedView = isPrivileged
            });
        }
    }

    public class ReportSummaryDto
    {
        public DateTime? From { get; set; }
        public DateTime? To { get; set; }
        public int TotalHours { get; set; }
        public int TotalItems { get; set; }
        public bool IsPrivilegedView { get; set; }
        public System.Collections.Generic.List<ProjectReportDto> ProjectSummaries { get; set; } = new();
        public System.Collections.Generic.List<ActivityCodeReportDto> ActivityCodeSummaries { get; set; } = new();
        public System.Collections.Generic.List<UserReportDto> UserSummaries { get; set; } = new();
    }

    public class ProjectReportDto
    {
        public Guid ProjectId { get; set; }
        public string ProjectNo { get; set; } = string.Empty;
        public string ProjectName { get; set; } = string.Empty;
        public decimal? EstimatedHours { get; set; }
        public int ActualHours { get; set; }
        public decimal? Variance { get; set; }
        public bool IsOverBudget { get; set; }
        public int ItemCount { get; set; }
    }

    public class ActivityCodeReportDto
    {
        public string ActivityCode { get; set; } = string.Empty;
        public int TotalHours { get; set; }
        public int ItemCount { get; set; }
    }

    public class UserReportDto
    {
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public int TotalHours { get; set; }
        public int ProjectCount { get; set; }
        public int ItemCount { get; set; }
    }
}
