/*
 * ReportService.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * AI-assisted: aggregation groupings and privileged-view scoping
 * generated with GitHub Copilot; reviewed and directed by Ryan Loiselle.
 */

using DSC.Api.DTOs;
using DSC.Data;
using Microsoft.EntityFrameworkCore;

namespace DSC.Api.Services;

public class ReportService(ApplicationDbContext db) : IReportService
{
    // aggregates work items into project, activity code, and user summaries
    // non-privileged users see only their own data; Admin/Manager/Director see all users
    public async Task<ReportSummaryDto> GetSummaryAsync(
        DateTime? from,
        DateTime? to,
        Guid? projectId,
        Guid? userId,
        Guid? requesterId)
    {
        bool isPrivileged = false;
        if (requesterId.HasValue)
        {
            var requester = await db.Users.AsNoTracking()
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == requesterId);
            isPrivileged = requester?.Role?.Name is "Admin" or "Manager" or "Director";
        }

        var query = db.WorkItems.AsNoTracking()
            .Include(w => w.Project)
            .Include(w => w.User)
            .AsQueryable();

        // Scope: non-privileged users see only their own data
        if (!isPrivileged && requesterId.HasValue)
            query = query.Where(w => w.UserId == requesterId);
        else if (userId.HasValue)
            query = query.Where(w => w.UserId == userId);

        if (projectId.HasValue) query = query.Where(w => w.ProjectId == projectId);
        if (from.HasValue)      query = query.Where(w => w.Date >= from.Value.Date);
        if (to.HasValue)        query = query.Where(w => w.Date <= to.Value.Date);

        var items = await query.ToListAsync();

        // Project summaries
        var projectSummaries = items
            .Where(w => w.ProjectId.HasValue)
            .GroupBy(w => w.ProjectId!.Value)
            .Select(g =>
            {
                var first    = g.First();
                var estHours = first.Project?.EstimatedHours;
                var actual   = g.Sum(w => w.ActualDuration ?? 0);
                return new ProjectReportDto
                {
                    ProjectId     = g.Key,
                    ProjectNo     = first.Project?.ProjectNo ?? string.Empty,
                    ProjectName   = first.Project?.Name ?? string.Empty,
                    EstimatedHours = estHours,
                    ActualHours   = actual,
                    Variance      = estHours.HasValue ? (decimal?)(actual - estHours.Value) : null,
                    IsOverBudget  = estHours.HasValue && actual > (double)estHours.Value,
                    ItemCount     = g.Count()
                };
            })
            .OrderByDescending(p => p.ActualHours)
            .ToList();

        // Activity code summaries
        var activitySummaries = items
            .Where(w => !string.IsNullOrWhiteSpace(w.ActivityCode))
            .GroupBy(w => w.ActivityCode!)
            .Select(g => new ActivityCodeReportDto
            {
                ActivityCode = g.Key,
                TotalHours   = g.Sum(w => w.ActualDuration ?? 0),
                ItemCount    = g.Count()
            })
            .OrderByDescending(a => a.TotalHours)
            .ToList();

        // User summaries (privileged only)
        var userSummaries = new List<UserReportDto>();
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
                        UserId       = g.Key,
                        FullName     = $"{first.User?.FirstName} {first.User?.LastName}".Trim(),
                        Username     = first.User?.Username ?? string.Empty,
                        TotalHours   = g.Sum(w => w.ActualDuration ?? 0),
                        ProjectCount = g.Where(w => w.ProjectId.HasValue)
                                        .Select(w => w.ProjectId).Distinct().Count(),
                        ItemCount    = g.Count()
                    };
                })
                .OrderByDescending(u => u.TotalHours)
                .ToList();
        }

        return new ReportSummaryDto
        {
            From              = from,
            To                = to,
            TotalHours        = items.Sum(w => w.ActualDuration ?? 0),
            TotalItems        = items.Count,
            ProjectSummaries  = projectSummaries,
            ActivityCodeSummaries = activitySummaries,
            UserSummaries     = userSummaries,
            IsPrivilegedView  = isPrivileged
        };
    }
} // end ReportService
