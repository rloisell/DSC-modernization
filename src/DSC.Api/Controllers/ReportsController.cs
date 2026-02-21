/*
 * ReportsController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * REST endpoints for reporting dashboard aggregations.
 * Privileged users (Admin/Manager/Director) see cross-user summaries;
 * regular users see only their own data.
 * AI-assisted: controller scaffolding generated with GitHub Copilot;
 * reviewed and directed by Ryan Loiselle.
 */

using System.Security.Claims;
using DSC.Api.DTOs;
using DSC.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportsController(IReportService svc) : ControllerBase
    {
        private Guid? CallerId => Guid.TryParse(
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

        /// <summary>
        /// Returns aggregated reporting data: project summaries, activity code
        /// breakdowns, and (for admin/manager/director) per-user summaries.
        /// </summary>
        [HttpGet("summary")]
        public async Task<ActionResult<ReportSummaryDto>> GetSummary(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] Guid? projectId,
            [FromQuery] Guid? userId)
            => Ok(await svc.GetSummaryAsync(from, to, projectId, userId, CallerId));
    }
}
