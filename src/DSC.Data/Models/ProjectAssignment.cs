using System;

namespace DSC.Data.Models
{
    public class ProjectAssignment
    {
        public Guid ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        // Role on the project: e.g., Owner, Contributor, Supervisor
        public string Role { get; set; } = "Contributor";
    }
}
