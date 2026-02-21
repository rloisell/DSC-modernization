/*
 * ProjectService.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * AI-assisted: role-based project visibility logic generated with
 * GitHub Copilot; reviewed and directed by Ryan Loiselle.
 */

using DSC.Api.DTOs;
using DSC.Data;
using Microsoft.EntityFrameworkCore;

namespace DSC.Api.Services;

public class ProjectService(ApplicationDbContext db) : IProjectService
{
    // returns all projects for Admin/Manager/Director; returns only assigned projects for regular users
    public async Task<IEnumerable<ProjectDto>> GetAllAsync(Guid? requesterId)
    {
        if (!requesterId.HasValue)
            return [];

        var user = await db.Users.AsNoTracking()
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Id == requesterId);

        if (user == null)
            return [];

        IQueryable<Data.Models.Project> query = db.Projects.AsNoTracking();

        // Privileged users see all projects
        if (user.Role?.Name is "Admin" or "Manager" or "Director")
        {
            return await query
                .Select(p => new ProjectDto
                {
                    Id             = p.Id,
                    ProjectNo      = p.ProjectNo,
                    Name           = p.Name,
                    Description    = p.Description,
                    EstimatedHours = p.EstimatedHours
                })
                .ToListAsync();
        }

        // Regular user: only assigned projects
        return await query
            .Where(p => db.ProjectAssignments
                .Any(pa => pa.ProjectId == p.Id && pa.UserId == user.Id))
            .Select(p => new ProjectDto
            {
                Id             = p.Id,
                ProjectNo      = p.ProjectNo,
                Name           = p.Name,
                Description    = p.Description,
                EstimatedHours = p.EstimatedHours
            })
            .ToListAsync();
    }
} // end ProjectService
