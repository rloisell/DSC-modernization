using System;

namespace DSC.Data.Models
{
    public class ActivityCode
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
