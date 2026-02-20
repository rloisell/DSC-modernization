using System;
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
    [Route("api/admin/activity-codes")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminActivityCodesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminActivityCodesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ActivityCodeDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ActivityCodeDto[]>> GetAll()
        {
            var codes = await _db.ActivityCodes.AsNoTracking()
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

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] ActivityCodeCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
            {
                return BadRequest(new { error = "Code is required." });
            }

            var entity = new ActivityCode
            {
                Id = Guid.NewGuid(),
                Code = request.Code.Trim(),
                Description = request.Description,
                IsActive = true
            };

            await _db.ActivityCodes.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] ActivityCodeUpdateRequest request)
        {
            var entity = await _db.ActivityCodes.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null) return NotFound();

            entity.Code = request.Code.Trim();
            entity.Description = request.Description;
            entity.IsActive = request.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var entity = await _db.ActivityCodes.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null) return NotFound();

            _db.ActivityCodes.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
