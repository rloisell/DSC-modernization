using System;

namespace DSC.Data.Models
{
    public class Department
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? ManagerName { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
