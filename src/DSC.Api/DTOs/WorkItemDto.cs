using System;

namespace DSC.Api.DTOs
{
    public class WorkItemDto
    {
        public Guid Id { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? BudgetId { get; set; }
        public string? BudgetDescription { get; set; }
        public string ActivityType { get; set; } = "Project";

        // Legacy mapping fields
        public int? LegacyActivityId { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? PlannedDuration { get; set; }
        public int? ActualDuration { get; set; }
        public string? ActivityCode { get; set; }
        public int? NetworkNumber { get; set; }
        public string? DirectorCode { get; set; }
        public string? ReasonCode { get; set; }
        public string? CpcCode { get; set; }

        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? RemainingHours { get; set; }
    }

    public class WorkItemDetailDto
    {
        public Guid Id { get; set; }
        public Guid? ProjectId { get; set; }
        public Guid? BudgetId { get; set; }
        public string? BudgetDescription { get; set; }
        public string ActivityType { get; set; } = "Project";
        public string? ProjectNo { get; set; }
        public string? ProjectName { get; set; }
        public decimal? ProjectEstimatedHours { get; set; }

        // Legacy mapping fields
        public int? LegacyActivityId { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? PlannedDuration { get; set; }
        public int? ActualDuration { get; set; }
        public string? ActivityCode { get; set; }
        public int? NetworkNumber { get; set; }
        public string? DirectorCode { get; set; }
        public string? ReasonCode { get; set; }
        public string? CpcCode { get; set; }

        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? RemainingHours { get; set; }
    }

    public class WorkItemCreateRequest
    {
        public Guid? ProjectId { get; set; }
        public Guid? BudgetId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Legacy mapping fields
        public int? LegacyActivityId { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int? PlannedDuration { get; set; }
        public int? ActualDuration { get; set; }
        public string? ActivityCode { get; set; }
        public int? NetworkNumber { get; set; }
        public string? DirectorCode { get; set; }
        public string? ReasonCode { get; set; }
        public string? CpcCode { get; set; }

        public decimal? EstimatedHours { get; set; }
        public decimal? RemainingHours { get; set; }
    }
}
