/*
 * WorkItemService.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * AI-assisted: LINQ query patterns, budget-type branching logic, and
 * ownership enforcement generated with GitHub Copilot;
 * reviewed and directed by Ryan Loiselle.
 */

using DSC.Api.DTOs;
using DSC.Api.Infrastructure;
using DSC.Data;
using DSC.Data.Models;
using Microsoft.EntityFrameworkCore;

namespace DSC.Api.Services;

public class WorkItemService(ApplicationDbContext db) : IWorkItemService
{
    // ── Query ──────────────────────────────────────────────────────────────────

    // returns all work items, optionally filtered to a single user, sorted newest first
    public async Task<WorkItemDto[]> GetAllAsync(Guid? userId)
    {
        IQueryable<WorkItem> query = db.WorkItems.AsNoTracking().Include(w => w.Budget);

        if (userId.HasValue)
            query = query.Where(w => w.UserId == userId);

        return await query
            .OrderByDescending(w => w.Date ?? DateTime.MinValue)
            .Select(w => new WorkItemDto
            {
                Id              = w.Id,
                ProjectId       = w.ProjectId,
                BudgetId        = w.BudgetId,
                BudgetDescription = w.Budget != null ? w.Budget.Description : null,
                ActivityType    = w.ActivityType,
                LegacyActivityId = w.LegacyActivityId,
                Date            = w.Date,
                StartTime       = w.StartTime,
                EndTime         = w.EndTime,
                PlannedDuration = w.PlannedDuration,
                ActualDuration  = w.ActualDuration,
                ActivityCode    = w.ActivityCode,
                NetworkNumber   = w.NetworkNumber != null ? int.Parse(w.NetworkNumber) : null,
                DirectorCode    = w.DirectorCode,
                ReasonCode      = w.ReasonCode,
                CpcCode         = w.CpcCode,
                Title           = w.Title,
                Description     = w.Description,
                EstimatedHours  = w.EstimatedHours,
                RemainingHours  = w.RemainingHours
            })
            .ToArrayAsync();
    }

    // returns enriched work items with project name and budget; supports named period shortcuts or explicit date range
    public async Task<WorkItemDetailDto[]> GetDetailedAsync(
        Guid? userId, DateTime? startDate, DateTime? endDate, string? period)
    {
        IQueryable<WorkItem> query = db.WorkItems.AsNoTracking()
            .Include(w => w.Project)
            .Include(w => w.Budget);

        if (userId.HasValue)
            query = query.Where(w => w.UserId == userId);

        // Resolve period to concrete date range
        if (!string.IsNullOrWhiteSpace(period))
        {
            var now = DateTime.Now;
            switch (period.ToLower())
            {
                case "day":
                    startDate = now.Date;
                    endDate   = now.Date.AddDays(1).AddSeconds(-1);
                    break;
                case "week":
                    var diff = (7 + (now.DayOfWeek - DayOfWeek.Sunday)) % 7;
                    startDate = now.Date.AddDays(-diff);
                    endDate   = startDate.Value.AddDays(7).AddSeconds(-1);
                    break;
                case "month":
                    startDate = new DateTime(now.Year, now.Month, 1);
                    endDate   = startDate.Value.AddMonths(1).AddSeconds(-1);
                    break;
                case "year":
                    startDate = new DateTime(now.Year, 1, 1);
                    endDate   = new DateTime(now.Year, 12, 31, 23, 59, 59);
                    break;
                case "all":
                case "historical":
                    startDate = null;
                    endDate   = null;
                    break;
            }
        }

        if (startDate.HasValue) query = query.Where(w => w.Date >= startDate.Value);
        if (endDate.HasValue)   query = query.Where(w => w.Date <= endDate.Value);

        return await query
            .OrderByDescending(w => w.Date ?? DateTime.MinValue)
            .Select(w => new WorkItemDetailDto
            {
                Id                   = w.Id,
                ProjectId            = w.ProjectId,
                BudgetId             = w.BudgetId,
                BudgetDescription    = w.Budget != null ? w.Budget.Description : null,
                ActivityType         = w.ActivityType,
                ProjectNo            = w.Project != null ? w.Project.ProjectNo : null,
                ProjectName          = w.Project != null ? w.Project.Name : null,
                ProjectEstimatedHours = w.Project != null ? w.Project.EstimatedHours : null,
                LegacyActivityId     = w.LegacyActivityId,
                Date                 = w.Date,
                StartTime            = w.StartTime,
                EndTime              = w.EndTime,
                PlannedDuration      = w.PlannedDuration,
                ActualDuration       = w.ActualDuration,
                ActivityCode         = w.ActivityCode,
                NetworkNumber        = w.NetworkNumber != null ? int.Parse(w.NetworkNumber) : null,
                DirectorCode         = w.DirectorCode,
                ReasonCode           = w.ReasonCode,
                CpcCode              = w.CpcCode,
                Title                = w.Title,
                Description          = w.Description,
                EstimatedHours       = w.EstimatedHours,
                RemainingHours       = w.RemainingHours
            })
            .ToArrayAsync();
    }

    // fetches a single work item by id; throws NotFoundException (404) if not found
    public async Task<WorkItemDto> GetByIdAsync(Guid id)
    {
        var item = await db.WorkItems.AsNoTracking()
            .Include(w => w.Budget)
            .FirstOrDefaultAsync(w => w.Id == id)
            ?? throw new NotFoundException($"Work item {id} not found");

        return MapToDto(item);
    }

    // ── Mutations ──────────────────────────────────────────────────────────────

    // validates and persists a new work item; enforces project or expense field requirements based on budget type
    public async Task<WorkItemDto> CreateAsync(WorkItemCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Title) || request.BudgetId == null || request.BudgetId == Guid.Empty)
            throw new BadRequestException("Missing required fields: Title and BudgetId");

        var budget = await db.Budgets.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == request.BudgetId)
            ?? throw new BadRequestException("Budget not found");

        var isExpense = IsExpenseBudget(budget.Description);

        if (isExpense)
        {
            if (string.IsNullOrWhiteSpace(request.DirectorCode)
                || string.IsNullOrWhiteSpace(request.ReasonCode)
                || string.IsNullOrWhiteSpace(request.CpcCode))
                throw new BadRequestException("Missing required fields: DirectorCode, ReasonCode, and CpcCode");
        }
        else
        {
            if (request.ProjectId == null || request.ProjectId == Guid.Empty)
                throw new BadRequestException("Missing required field: ProjectId");

            if (string.IsNullOrWhiteSpace(request.ActivityCode) || request.NetworkNumber == null)
                throw new BadRequestException("Missing required fields: ActivityCode and NetworkNumber");

            var projectExists = await db.Projects.AnyAsync(p => p.Id == request.ProjectId);
            if (!projectExists)
                throw new BadRequestException("Project not found");
        }

        var workItem = new WorkItem
        {
            Id              = Guid.NewGuid(),
            ProjectId       = request.ProjectId,
            BudgetId        = request.BudgetId,
            ActivityType    = isExpense ? "Expense" : "Project",
            Title           = request.Title,
            Description     = request.Description,
            LegacyActivityId = request.LegacyActivityId,
            Date            = request.Date,
            StartTime       = request.StartTime,
            EndTime         = request.EndTime,
            PlannedDuration = request.PlannedDuration.HasValue
                                ? TimeSpan.FromHours(request.PlannedDuration.Value)
                                : null,
            ActualDuration  = request.ActualDuration,
            ActivityCode    = request.ActivityCode,
            NetworkNumber   = request.NetworkNumber?.ToString(),
            DirectorCode    = request.DirectorCode?.Trim(),
            ReasonCode      = request.ReasonCode?.Trim(),
            CpcCode         = request.CpcCode?.Trim(),
            EstimatedHours  = request.EstimatedHours,
            RemainingHours  = CalculateRemainingHours(request.EstimatedHours, request.ActualDuration)
        };

        await db.WorkItems.AddAsync(workItem);
        await db.SaveChangesAsync();

        var budgetDescription = await db.Budgets.AsNoTracking()
            .Where(b => b.Id == workItem.BudgetId)
            .Select(b => b.Description)
            .FirstOrDefaultAsync();

        return MapToDto(workItem, budgetDescription);
    }

    // applies a partial update to an existing work item; requester must own the item or hold Admin/Manager role
    public async Task UpdateAsync(Guid id, WorkItemUpdateRequest request, Guid? requesterId)
    {
        var item = await db.WorkItems.FirstOrDefaultAsync(w => w.Id == id)
            ?? throw new NotFoundException($"Work item {id} not found");

        await EnforceOwnershipAsync(item, requesterId);

        if (request.Title != null)           item.Title          = request.Title;
        if (request.Description != null)     item.Description    = request.Description;
        if (request.Date.HasValue)           item.Date           = request.Date;
        if (request.StartTime.HasValue)      item.StartTime      = request.StartTime;
        if (request.EndTime.HasValue)        item.EndTime        = request.EndTime;
        if (request.PlannedDuration.HasValue) item.PlannedDuration = TimeSpan.FromHours(request.PlannedDuration.Value);
        if (request.ActualDuration.HasValue) item.ActualDuration = request.ActualDuration;
        if (request.ActivityCode != null)    item.ActivityCode   = request.ActivityCode;
        if (request.NetworkNumber.HasValue)  item.NetworkNumber  = request.NetworkNumber.ToString();
        if (request.DirectorCode != null)    item.DirectorCode   = request.DirectorCode;
        if (request.ReasonCode != null)      item.ReasonCode     = request.ReasonCode;
        if (request.CpcCode != null)         item.CpcCode        = request.CpcCode;
        if (request.EstimatedHours.HasValue) item.EstimatedHours = request.EstimatedHours;

        await db.SaveChangesAsync();
    }

    // removes a work item by id; requester must own the item or hold Admin/Manager role
    public async Task DeleteAsync(Guid id, Guid? requesterId)
    {
        var item = await db.WorkItems.FirstOrDefaultAsync(w => w.Id == id)
            ?? throw new NotFoundException($"Work item {id} not found");

        await EnforceOwnershipAsync(item, requesterId);

        db.WorkItems.Remove(item);
        await db.SaveChangesAsync();
    }

    // returns cumulative hour usage vs. estimate for a project/user pair; RemainingHours is null when no estimate is set
    public async Task<RemainingHoursDto> GetProjectRemainingHoursAsync(Guid projectId, Guid requesterId)
    {
        var project = await db.Projects.FirstOrDefaultAsync(p => p.Id == projectId)
            ?? throw new NotFoundException($"Project {projectId} not found");

        if (!project.EstimatedHours.HasValue)
            return new RemainingHoursDto
            {
                ProjectId      = projectId,
                ProjectNo      = project.ProjectNo,
                ProjectName    = project.Name,
                EstimatedHours = null,
                ActualHoursUsed = 0,
                RemainingHours = null
            };

        var actualHoursUsed = await db.WorkItems
            .Where(w => w.ProjectId == projectId && w.UserId == requesterId)
            .SumAsync(w => w.ActualDuration ?? 0);

        return new RemainingHoursDto
        {
            ProjectId       = projectId,
            ProjectNo       = project.ProjectNo,
            ProjectName     = project.Name,
            EstimatedHours  = project.EstimatedHours,
            ActualHoursUsed = actualHoursUsed,
            RemainingHours  = project.EstimatedHours.Value - actualHoursUsed
        };
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    // throws ForbiddenException (403) if the requester does not own the item and is not Admin or Manager
    private async Task EnforceOwnershipAsync(WorkItem item, Guid? requesterId)
    {
        if (requesterId == null || item.UserId == null || item.UserId == requesterId)
            return;

        var role = await db.Users.AsNoTracking()
            .Where(u => u.Id == requesterId)
            .Select(u => u.Role!.Name)
            .FirstOrDefaultAsync();

        if (role != "Admin" && role != "Manager")
            throw new ForbiddenException("You are not allowed to modify this work item");
    }

    // returns true if the budget description contains "opex" or "expense" (case-insensitive)
    private static bool IsExpenseBudget(string? description)
    {
        if (string.IsNullOrWhiteSpace(description)) return false;
        var n = description.Trim().ToLowerInvariant();
        return n.Contains("opex") || n.Contains("expense");
    }

    // returns estimated minus actual hours; null if no estimate is provided
    private static decimal? CalculateRemainingHours(decimal? estimatedHours, int? actualDuration)
    {
        if (!estimatedHours.HasValue) return null;
        return estimatedHours.Value - (actualDuration ?? 0);
    }

    // maps a WorkItem entity to its DTO for API responses
    private static WorkItemDto MapToDto(WorkItem w, string? budgetDescription = null) => new()
    {
        Id              = w.Id,
        ProjectId       = w.ProjectId,
        BudgetId        = w.BudgetId,
        BudgetDescription = budgetDescription ?? w.Budget?.Description,
        ActivityType    = w.ActivityType,
        LegacyActivityId = w.LegacyActivityId,
        Date            = w.Date,
        StartTime       = w.StartTime,
        EndTime         = w.EndTime,
        PlannedDuration = w.PlannedDuration,
        ActualDuration  = w.ActualDuration,
        ActivityCode    = w.ActivityCode,
        NetworkNumber   = w.NetworkNumber != null ? int.Parse(w.NetworkNumber) : null,
        DirectorCode    = w.DirectorCode,
        ReasonCode      = w.ReasonCode,
        CpcCode         = w.CpcCode,
        Title           = w.Title,
        Description     = w.Description,
        EstimatedHours  = w.EstimatedHours,
        RemainingHours  = w.RemainingHours
    };
} // end WorkItemService
