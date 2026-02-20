using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using DSC.Api.DTOs;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/admin/reason-codes")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminReasonCodesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminReasonCodesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ReasonCodeDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ReasonCodeDto[]>> GetAll()
        {
            var codes = await _db.ReasonCodes.AsNoTracking()
                .OrderBy(c => c.Code)
                .Select(c => new ReasonCodeDto
                {
                    Code = c.Code,
                    Description = c.Description
                })
                .ToArrayAsync();

            return Ok(codes);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] ReasonCodeCreateRequest request)
        {
            var code = request.Code?.Trim();
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new { error = "Code is required." });
            }

            var entity = new ReasonCode
            {
                Code = code,
                Description = request.Description
            };

            await _db.ReasonCodes.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Code }, new { code = entity.Code });
        }

        [HttpPut("{code}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(string code, [FromBody] ReasonCodeUpdateRequest request)
        {
            var normalizedCode = code?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedCode))
            {
                return NotFound();
            }

            var entity = await _db.ReasonCodes.FirstOrDefaultAsync(c => c.Code == normalizedCode);
            if (entity == null) return NotFound();

            entity.Description = request.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
