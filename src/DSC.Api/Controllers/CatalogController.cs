using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Api.DTOs;
using DSC.Data;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/catalog")]
    public class CatalogController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public CatalogController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("activity-codes")]
        [ProducesResponseType(typeof(ActivityCodeDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ActivityCodeDto[]>> GetActivityCodes()
        {
            var codes = await _db.ActivityCodes.AsNoTracking()
                .Where(c => c.IsActive)
                .OrderBy(c => c.Code)
                .Select(c => new ActivityCodeDto
                {
                    Id = c.Id,
                    Code = c.Code,
                    Description = c.Description,
                    IsActive = c.IsActive
                })
                .ToArrayAsync();

            return Ok(codes);
        }

        [HttpGet("network-numbers")]
        [ProducesResponseType(typeof(NetworkNumberDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<NetworkNumberDto[]>> GetNetworkNumbers()
        {
            var numbers = await _db.NetworkNumbers.AsNoTracking()
                .Where(n => n.IsActive)
                .OrderBy(n => n.Number)
                .Select(n => new NetworkNumberDto
                {
                    Id = n.Id,
                    Number = n.Number,
                    Description = n.Description,
                    IsActive = n.IsActive
                })
                .ToArrayAsync();

            return Ok(numbers);
        }
    }
}
