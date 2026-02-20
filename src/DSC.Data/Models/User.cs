using System;
using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class User
    {
        public Guid Id { get; set; }
        // Legacy numeric employee id from the Java system (optional)
        public int? EmpId { get; set; }

        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }

        // Local authentication fields (will be deprecated when moving to OIDC)
        public string? PasswordHash { get; set; }

        // Role assignment
        public Guid? RoleId { get; set; }
        public Role? Role { get; set; }

        // Position and Department assignments
        public Guid? PositionId { get; set; }
        public Position? Position { get; set; }
        public Guid? DepartmentId { get; set; }
        public Department? Department { get; set; }

        // Navigation
        public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
        public ICollection<ProjectAssignment> ProjectAssignments { get; set; } = new List<ProjectAssignment>();
        public ICollection<WorkItem> WorkItems { get; set; } = new List<WorkItem>();
    }
}
