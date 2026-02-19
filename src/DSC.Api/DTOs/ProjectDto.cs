using System;

namespace DSC.Api.DTOs
{
    public class ProjectDto
    {
        public Guid Id { get; set; }
        public string? ProjectNo { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public decimal? EstimatedHours { get; set; }
    }
}
