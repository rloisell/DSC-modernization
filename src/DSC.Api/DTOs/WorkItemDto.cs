using System;

namespace DSC.Api.DTOs
{
    public class WorkItemDto
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }

        // Legacy mapping fields
        public int? LegacyActivityId { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public TimeSpan? PlannedDuration { get; set; }
        public int? ActualDuration { get; set; }
        public string? ActivityCode { get; set; }
        public string? NetworkNumber { get; set; }

        public string Title { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? RemainingHours { get; set; }
    }
}
