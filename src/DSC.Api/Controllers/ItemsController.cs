using System.Security.Claims;
using DSC.Api.DTOs;
using DSC.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemsController(IWorkItemService svc) : ControllerBase
    {
        private Guid? CallerId => Guid.TryParse(
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

        [HttpGet]
        [ProducesResponseType(typeof(WorkItemDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<WorkItemDto[]>> GetAll([FromQuery] Guid? userId = null)
            => Ok(await svc.GetAllAsync(userId));

        [HttpGet("detailed")]
        [ProducesResponseType(typeof(WorkItemDetailDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<WorkItemDetailDto[]>> GetDetailed(
            [FromQuery] Guid? userId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] string? period)
            => Ok(await svc.GetDetailedAsync(userId, startDate, endDate, period));

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(WorkItemDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<WorkItemDto>> Get(Guid id)
            => Ok(await svc.GetByIdAsync(id));

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Post([FromBody] WorkItemCreateRequest request)
        {
            var item = await svc.CreateAsync(request);
            return CreatedAtAction(nameof(Get), new { id = item.Id }, item);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Update(Guid id, [FromBody] WorkItemUpdateRequest request)
        {
            await svc.UpdateAsync(id, request, CallerId);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Delete(Guid id)
        {
            await svc.DeleteAsync(id, CallerId);
            return NoContent();
        }

        [HttpGet("project/{projectId}/remaining-hours")]
        [ProducesResponseType(typeof(RemainingHoursDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RemainingHoursDto>> GetProjectRemainingHours(Guid projectId)
        {
            var callerId = CallerId;
            if (callerId == null) return Unauthorized("User not authenticated");
            return Ok(await svc.GetProjectRemainingHoursAsync(projectId, callerId.Value));
        }
    }
}
