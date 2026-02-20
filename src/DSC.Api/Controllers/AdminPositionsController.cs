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
    [Route("api/admin/positions")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminPositionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminPositionsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(PositionDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<PositionDto[]>> GetAll()
        {
            var positions = await _db.Positions.AsNoTracking()
                .OrderBy(p => p.Title)
                .Select(p => new PositionDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    IsActive = p.IsActive
                })
                .ToArrayAsync();

            return Ok(positions);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] PositionCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest(new { error = "Title is required." });
            }

            var entity = new Position
            {
                Id = Guid.NewGuid(),
                Title = request.Title.Trim(),
                Description = request.Description,
                IsActive = true
            };

            await _db.Positions.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] PositionUpdateRequest request)
        {
            var entity = await _db.Positions.FirstOrDefaultAsync(p => p.Id == id);
            if (entity == null) return NotFound();

            entity.Title = request.Title.Trim();
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
            var entity = await _db.Positions.FirstOrDefaultAsync(p => p.Id == id);
            if (entity == null) return NotFound();

            _db.Positions.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
