using System;
using System.Collections.Generic;

namespace DSC.Data.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? FullName { get; set; }

        // Local authentication fields (will be deprecated when moving to OIDC)
        public string? PasswordHash { get; set; }

        // Navigation
        public ICollection<TimeEntry> TimeEntries { get; set; } = new List<TimeEntry>();
        public ICollection<ProjectAssignment> ProjectAssignments { get; set; } = new List<ProjectAssignment>();
    }
}
