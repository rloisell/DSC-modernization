using System.Collections.Generic;
using System.Security.Claims;
using DSC.Api.DTOs;
using DSC.Api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController(IProjectService svc) : ControllerBase
    {
        private Guid? CallerId => Guid.TryParse(
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out var id) ? id : null;

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProjectDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<ProjectDto>>> GetAll()
            => Ok(await svc.GetAllAsync(CallerId));
    }
}
