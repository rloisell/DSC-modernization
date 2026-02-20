using System;
using System.Linq;
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
        public async Task<ActionResult<WorkItemDto[]>> GetAll([FromQuery] Guid? userId = null)
        {
            IQueryable<WorkItem> query = _db.WorkItems.AsNoTracking()
                .Include(w => w.Budget);

            // Filter by userId if provided (restrict to user's own activities)
            if (userId.HasValue)
            {
                query = query.Where(w => w.UserId == userId);
            }

            var items = await query
                .OrderByDescending(w => w.Date ?? DateTime.MinValue)
                .Select(w => new WorkItemDto
                {
                    Id = w.Id,
                    ProjectId = w.ProjectId,
                    BudgetId = w.BudgetId,
                    BudgetDescription = w.Budget != null ? w.Budget.Description : null,
                    ActivityType = w.ActivityType,
                    LegacyActivityId = w.LegacyActivityId,
                    Date = w.Date,
                    StartTime = w.StartTime,
                    EndTime = w.EndTime,
                    PlannedDuration = w.PlannedDuration,
                    ActualDuration = w.ActualDuration,
                    ActivityCode = w.ActivityCode,
                    NetworkNumber = w.NetworkNumber != null ? int.Parse(w.NetworkNumber) : null,
                    DirectorCode = w.DirectorCode,
                    ReasonCode = w.ReasonCode,
                    CpcCode = w.CpcCode,
                    Title = w.Title,
                    Description = w.Description,
                    EstimatedHours = w.EstimatedHours,
                    RemainingHours = w.RemainingHours
                })
                .ToArrayAsync();

            return Ok(items);
        }

        [HttpGet("detailed")]
        [ProducesResponseType(typeof(WorkItemDetailDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<WorkItemDetailDto[]>> GetDetailed(
            [FromQuery] Guid? userId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? period)
        {
            IQueryable<WorkItem> query = _db.WorkItems.AsNoTracking()
                .Include(w => w.Project)
                .Include(w => w.Budget);

            // Filter by userId if provided (restrict to user's own activities)
            if (userId.HasValue)
            {
                query = query.Where(w => w.UserId == userId);
            }

            // Apply date filtering based on period or explicit date range
            if (!string.IsNullOrWhiteSpace(period))
            {
                var now = DateTime.Now;
                switch (period.ToLower())
                {
                    case "day":
                        startDate = now.Date;
                        endDate = now.Date.AddDays(1).AddSeconds(-1);
                        break;
                    case "week":
                        // Start of week (Sunday)
                        var diff = (7 + (now.DayOfWeek - DayOfWeek.Sunday)) % 7;
                        startDate = now.Date.AddDays(-diff);
                        endDate = startDate.Value.AddDays(7).AddSeconds(-1);
                        break;
                    case "month":
                        startDate = new DateTime(now.Year, now.Month, 1);
                        endDate = startDate.Value.AddMonths(1).AddSeconds(-1);
                        break;
                    case "year":
                        startDate = new DateTime(now.Year, 1, 1);
                        endDate = new DateTime(now.Year, 12, 31, 23, 59, 59);
                        break;
                    case "all":
                    case "historical":
                        // No filtering, return all
                        startDate = null;
                        endDate = null;
                        break;
                }
            }

            if (startDate.HasValue)
            {
                query = query.Where(w => w.Date >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(w => w.Date <= endDate.Value);
            }

            var items = await query
                .OrderByDescending(w => w.Date ?? DateTime.MinValue)
                .Select(w => new WorkItemDetailDto
                {
                    Id = w.Id,
                    ProjectId = w.ProjectId,
                    BudgetId = w.BudgetId,
                    BudgetDescription = w.Budget != null ? w.Budget.Description : null,
                    ActivityType = w.ActivityType,
                    ProjectNo = w.Project != null ? w.Project.ProjectNo : null,
                    ProjectName = w.Project != null ? w.Project.Name : null,
                    ProjectEstimatedHours = w.Project != null ? w.Project.EstimatedHours : null,
                    LegacyActivityId = w.LegacyActivityId,
                    Date = w.Date,
                    StartTime = w.StartTime,
                    EndTime = w.EndTime,
                    PlannedDuration = w.PlannedDuration,
                    ActualDuration = w.ActualDuration,
                    ActivityCode = w.ActivityCode,
                    NetworkNumber = w.NetworkNumber != null ? int.Parse(w.NetworkNumber) : null,
                    DirectorCode = w.DirectorCode,
                    ReasonCode = w.ReasonCode,
                    CpcCode = w.CpcCode,
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
            var item = await _db.WorkItems.AsNoTracking().Include(w => w.Budget).FirstOrDefaultAsync(w => w.Id == id);
            if (item == null) return NotFound();
            var dto = new WorkItemDto
            {
                Id = item.Id,
                ProjectId = item.ProjectId,
                BudgetId = item.BudgetId,
                BudgetDescription = item.Budget != null ? item.Budget.Description : null,
                ActivityType = item.ActivityType,
                LegacyActivityId = item.LegacyActivityId,
                Date = item.Date,
                StartTime = item.StartTime,
                EndTime = item.EndTime,
                PlannedDuration = item.PlannedDuration,
                ActualDuration = item.ActualDuration,
                ActivityCode = item.ActivityCode,
                NetworkNumber = item.NetworkNumber != null ? int.Parse(item.NetworkNumber) : null,
                DirectorCode = item.DirectorCode,
                ReasonCode = item.ReasonCode,
                CpcCode = item.CpcCode,
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
            if (string.IsNullOrWhiteSpace(request.Title) || request.BudgetId == null || request.BudgetId == Guid.Empty)
            {
                return BadRequest(new { error = "Missing required fields: Title and BudgetId" });
            }

            var budget = await _db.Budgets.AsNoTracking().FirstOrDefaultAsync(b => b.Id == request.BudgetId);
            if (budget == null)
            {
                return BadRequest(new { error = "Budget not found" });
            }

            var isExpense = IsExpenseBudget(budget.Description);
            if (isExpense)
            {
                if (string.IsNullOrWhiteSpace(request.DirectorCode)
                    || string.IsNullOrWhiteSpace(request.ReasonCode)
                    || string.IsNullOrWhiteSpace(request.CpcCode))
                {
                    return BadRequest(new { error = "Missing required fields: DirectorCode, ReasonCode, and CpcCode" });
                }
            }
            else
            {
                if (request.ProjectId == null || request.ProjectId == Guid.Empty)
                {
                    return BadRequest(new { error = "Missing required field: ProjectId" });
                }

                if (string.IsNullOrWhiteSpace(request.ActivityCode) || request.NetworkNumber == null)
                {
                    return BadRequest(new { error = "Missing required fields: ActivityCode and NetworkNumber" });
                }

                var projectExists = await _db.Projects.AnyAsync(p => p.Id == request.ProjectId);
                if (!projectExists)
                {
                    return BadRequest(new { error = "Project not found" });
                }
            }

            var workItem = new WorkItem
            {
                Id = Guid.NewGuid(),
                ProjectId = request.ProjectId,
                BudgetId = request.BudgetId,
                ActivityType = isExpense ? "Expense" : "Project",
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
                DirectorCode = request.DirectorCode?.Trim(),
                ReasonCode = request.ReasonCode?.Trim(),
                CpcCode = request.CpcCode?.Trim(),
                EstimatedHours = request.EstimatedHours,
                RemainingHours = request.RemainingHours
            };

            await _db.WorkItems.AddAsync(workItem);
            await _db.SaveChangesAsync();

            var budgetDescription = await _db.Budgets.AsNoTracking()
                .Where(b => b.Id == workItem.BudgetId)
                .Select(b => b.Description)
                .FirstOrDefaultAsync();

            var responseDto = new WorkItemDto
            {
                Id = workItem.Id,
                ProjectId = workItem.ProjectId,
                BudgetId = workItem.BudgetId,
                BudgetDescription = budgetDescription,
                ActivityType = workItem.ActivityType,
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
                DirectorCode = workItem.DirectorCode,
                ReasonCode = workItem.ReasonCode,
                CpcCode = workItem.CpcCode,
                EstimatedHours = workItem.EstimatedHours,
                RemainingHours = workItem.RemainingHours
            };

            return CreatedAtAction(nameof(Get), new { id = workItem.Id }, responseDto);
        }

        private static bool IsExpenseBudget(string? description)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                return false;
            }

            var normalized = description.Trim().ToLowerInvariant();
            return normalized.Contains("opex") || normalized.Contains("expense");
        }
    }
}
