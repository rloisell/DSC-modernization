/*
 * IProjectService.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Service interface for project retrieval. Implemented by ProjectService.
 * AI-assisted: interface scaffolding; reviewed and directed by Ryan Loiselle.
 */

using DSC.Api.DTOs;

namespace DSC.Api.Services;

public interface IProjectService
{
    Task<IEnumerable<ProjectDto>> GetAllAsync(Guid? requesterId);
}
