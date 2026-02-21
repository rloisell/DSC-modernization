/*
 * ReportDtos.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Data Transfer Objects for the reporting endpoints: summary aggregation (ReportSummaryDto)
 * and individual line-item shapes.
 * AI-assisted: DTO scaffolding; reviewed and directed by Ryan Loiselle.
 */

namespace DSC.Api.DTOs;

public class ReportSummaryDto
{
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int TotalHours { get; set; }
    public int TotalItems { get; set; }
    public bool IsPrivilegedView { get; set; }
    public List<ProjectReportDto> ProjectSummaries { get; set; } = new();
    public List<ActivityCodeReportDto> ActivityCodeSummaries { get; set; } = new();
    public List<UserReportDto> UserSummaries { get; set; } = new();
}

public class ProjectReportDto
{
    public Guid ProjectId { get; set; }
    public string ProjectNo { get; set; } = string.Empty;
    public string ProjectName { get; set; } = string.Empty;
    public decimal? EstimatedHours { get; set; }
    public int ActualHours { get; set; }
    public decimal? Variance { get; set; }
    public bool IsOverBudget { get; set; }
    public int ItemCount { get; set; }
}

public class ActivityCodeReportDto
{
    public string ActivityCode { get; set; } = string.Empty;
    public int TotalHours { get; set; }
    public int ItemCount { get; set; }
}

public class UserReportDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public int TotalHours { get; set; }
    public int ProjectCount { get; set; }
    public int ItemCount { get; set; }
}
