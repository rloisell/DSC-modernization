using System;
using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class WorkItem
    {
        public Guid Id { get; set; }
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public string Title { get; set; } = null!;
        public string? Description { get; set; }

        // Estimated and remaining hours for this work item
        public decimal? EstimatedHours { get; set; }
        public decimal? RemainingHours { get; set; }

        // Navigation
        public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
    }
}
