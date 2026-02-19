using System;

namespace DSC.Data.Models
{
    public class TimeEntry
    {
        public Guid Id { get; set; }
        public Guid WorkItemId { get; set; }
        public WorkItem WorkItem { get; set; } = null!;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public DateTimeOffset Date { get; set; }
        public decimal Hours { get; set; }
        public string? Notes { get; set; }
    }
}
