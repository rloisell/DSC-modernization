/*
 * ProjectDto.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Data Transfer Object representing a project available to the authenticated user.
 * AI-assisted: DTO scaffolding; reviewed and directed by Ryan Loiselle.
 */

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
