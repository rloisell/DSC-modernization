/*
 * AdminProjectAssignmentsController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin controller for project-assignment CRUD. Each write endpoint validates the caller's
 * role (Admin / Manager / Director) via claims before allowing assignment changes.
 * Enforces duplicate-assignment prevention and existence checks for both project and user.
 * AI-assisted: Claims-based role check pattern, EF Include chains, duplicate-guard query; reviewed and directed by Ryan Loiselle.
 */

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;
using DSC.Api.DTOs;
using System.Security.Claims;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminProjectAssignmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminProjectAssignmentsController(ApplicationDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Get all project assignments
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProjectAssignmentDto>>> GetAll([FromQuery] Guid? projectId = null)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
            if (user == null)
            {
                return Unauthorized("User not found");
            }

            // Only allow Admin, Manager, Director to view assignments
            if (user.Role?.Name != "Admin" && user.Role?.Name != "Manager" && user.Role?.Name != "Director")
            {
                return Forbid("Insufficient permissions");
            }

            var query = _db.ProjectAssignments
                .Include(pa => pa.Project)
                .Include(pa => pa.User).ThenInclude(u => u.Position)
                .AsQueryable();

            if (projectId.HasValue)
            {
                query = query.Where(pa => pa.ProjectId == projectId.Value);
            }

            var assignments = await query
                .Select(pa => new ProjectAssignmentDto
                {
                    ProjectId = pa.ProjectId,
                    ProjectNo = pa.Project.ProjectNo,
                    ProjectName = pa.Project.Name,
                    UserId = pa.UserId,
                    Username = pa.User.Username,
                    UserFullName = $"{pa.User.FirstName} {pa.User.LastName}",
                    Role = pa.Role,
                    UserPosition = pa.User.Position != null ? pa.User.Position.Title : null,
                    EstimatedHours = pa.EstimatedHours
                })
                .ToListAsync();

            return Ok(assignments);
        }

        /// <summary>
        /// Get assignments for a specific project
        /// </summary>
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<ProjectAssignmentDto>>> GetByProject(Guid projectId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
            if (user == null)
            {
                return Unauthorized("User not found");
            }

            // Only allow Admin, Manager, Director to view assignments
            if (user.Role?.Name != "Admin" && user.Role?.Name != "Manager" && user.Role?.Name != "Director")
            {
                return Forbid("Insufficient permissions");
            }

            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId);
            if (project == null)
            {
                return NotFound("Project not found");
            }

            var assignments = await _db.ProjectAssignments
                .Where(pa => pa.ProjectId == projectId)
                .Include(pa => pa.Project)
                .Include(pa => pa.User).ThenInclude(u => u.Position)
                .Select(pa => new ProjectAssignmentDto
                {
                    ProjectId = pa.ProjectId,
                    ProjectNo = pa.Project.ProjectNo,
                    ProjectName = pa.Project.Name,
                    UserId = pa.UserId,
                    Username = pa.User.Username,
                    UserFullName = $"{pa.User.FirstName} {pa.User.LastName}",
                    Role = pa.Role,
                    UserPosition = pa.User.Position != null ? pa.User.Position.Title : null,
                    EstimatedHours = pa.EstimatedHours
                })
                .ToListAsync();

            return Ok(assignments);
        }

        /// <summary>
        /// Create a new project assignment
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<ProjectAssignmentDto>> Create(ProjectAssignmentCreateRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
            if (user == null)
            {
                return Unauthorized("User not found");
            }

            // Only allow Admin, Manager, Director to create assignments
            if (user.Role?.Name != "Admin" && user.Role?.Name != "Manager" && user.Role?.Name != "Director")
            {
                return Forbid("Insufficient permissions");
            }

            // Validate project exists
            var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == request.ProjectId);
            if (project == null)
            {
                return BadRequest("Project not found");
            }

            // Validate user exists
            var assignedUser = await _db.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (assignedUser == null)
            {
                return BadRequest("User not found");
            }

            // Check for duplicate assignment
            var existingAssignment = await _db.ProjectAssignments
                .FirstOrDefaultAsync(pa => pa.ProjectId == request.ProjectId && pa.UserId == request.UserId);
            
            if (existingAssignment != null)
            {
                return BadRequest("User is already assigned to this project");
            }

            var assignment = new ProjectAssignment
            {
                ProjectId = request.ProjectId,
                UserId = request.UserId,
                Role = request.Role ?? "Contributor",
                EstimatedHours = request.EstimatedHours
            };

            _db.ProjectAssignments.Add(assignment);
            await _db.SaveChangesAsync();

            var dto = new ProjectAssignmentDto
            {
                ProjectId = project.Id,
                ProjectNo = project.ProjectNo,
                ProjectName = project.Name,
                UserId = assignedUser.Id,
                Username = assignedUser.Username,
                UserFullName = $"{assignedUser.FirstName} {assignedUser.LastName}",
                Role = assignment.Role,
                UserPosition = null, // position not loaded in create path — client will refresh
                EstimatedHours = assignment.EstimatedHours
            };

            return CreatedAtAction(nameof(GetByProject), new { projectId = assignment.ProjectId }, dto);
        }

        /// <summary>
        /// Update a project assignment (role and/or estimated hours)
        /// </summary>
        [HttpPut("{projectId}/{assignedUserId}")]
        public async Task<IActionResult> Update(Guid projectId, Guid assignedUserId, ProjectAssignmentUpdateRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
            if (user == null)
            {
                return Unauthorized("User not found");
            }

            // Only allow Admin, Manager, Director to update assignments
            if (user.Role?.Name != "Admin" && user.Role?.Name != "Manager" && user.Role?.Name != "Director")
            {
                return Forbid("Insufficient permissions");
            }

            var assignment = await _db.ProjectAssignments
                .FirstOrDefaultAsync(pa => pa.ProjectId == projectId && pa.UserId == assignedUserId);
            
            if (assignment == null)
            {
                return NotFound("Project assignment not found");
            }

            if (!string.IsNullOrEmpty(request.Role))
            {
                assignment.Role = request.Role;
            }

            if (request.EstimatedHours.HasValue)
            {
                assignment.EstimatedHours = request.EstimatedHours.Value;
            }

            _db.ProjectAssignments.Update(assignment);
            await _db.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Delete a project assignment
        /// </summary>
        [HttpDelete("{projectId}/{assignedUserId}")]
        public async Task<IActionResult> Delete(Guid projectId, Guid assignedUserId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("User ID not found in token");
            }

            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == Guid.Parse(userId));
            if (user == null)
            {
                return Unauthorized("User not found");
            }

            // Only allow Admin, Manager, Director to delete assignments
            if (user.Role?.Name != "Admin" && user.Role?.Name != "Manager" && user.Role?.Name != "Director")
            {
                return Forbid("Insufficient permissions");
            }

            var assignment = await _db.ProjectAssignments
                .FirstOrDefaultAsync(pa => pa.ProjectId == projectId && pa.UserId == assignedUserId);
            
            if (assignment == null)
            {
                return NotFound("Project assignment not found");
            }

            _db.ProjectAssignments.Remove(assignment);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
