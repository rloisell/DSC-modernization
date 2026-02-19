using System;
using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class Project
    {
        public Guid Id { get; set; }
        // Legacy project identifier from the Java model (Project.projectNo)
        public string? ProjectNo { get; set; }

        public string Name { get; set; } = null!;
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        // Estimated total hours for the project
        public decimal? EstimatedHours { get; set; }

        // Navigation
        public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
        public ICollection<ProjectAssignment> Assignments { get; set; } = new List<ProjectAssignment>();
    }
}
