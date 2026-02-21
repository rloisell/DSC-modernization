/*
 * IReportService.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Service interface for report summary queries. Implemented by ReportService.
 * AI-assisted: interface scaffolding; reviewed and directed by Ryan Loiselle.
 */

using DSC.Api.DTOs;

namespace DSC.Api.Services;

public interface IReportService
{
    Task<ReportSummaryDto> GetSummaryAsync(
        DateTime? from,
        DateTime? to,
        Guid? projectId,
        Guid? userId,
        Guid? requesterId);
}
