using System;
using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class WorkItem
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        public Guid? BudgetId { get; set; }
        public Budget? Budget { get; set; }

        // Legacy mapping fields from Java `Activity`
        public int? LegacyActivityId { get; set; }
        public DateTime? Date { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        // Planned duration tracked as a TimeSpan
        public TimeSpan? PlannedDuration { get; set; }
        public int? ActualDuration { get; set; }

        public string Title { get; set; } = null!;
        public string? Description { get; set; }

        // Optional legacy lookup/code fields
        public string? ActivityCode { get; set; }
        public string? NetworkNumber { get; set; }

        // Estimated and remaining hours for this work item
        public decimal? EstimatedHours { get; set; }
        public decimal? RemainingHours { get; set; }

        // Navigation
        public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
    }
}
