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
    [Route("api/admin/unions")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminUnionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminUnionsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(UnionDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<UnionDto[]>> GetAll()
        {
            var unions = await _db.Unions.AsNoTracking()
                .OrderBy(u => u.Name)
                .Select(u => new UnionDto
                {
                    Id = u.Id,
                    Name = u.Name
                })
                .ToArrayAsync();

            return Ok(unions);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] UnionCreateRequest request)
        {
            if (request.Id <= 0)
            {
                return BadRequest(new { error = "Id must be greater than zero." });
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required." });
            }

            var entity = new Union
            {
                Id = request.Id,
                Name = request.Name.Trim()
            };

            await _db.Unions.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] UnionUpdateRequest request)
        {
            var entity = await _db.Unions.FirstOrDefaultAsync(u => u.Id == id);
            if (entity == null) return NotFound();

            entity.Name = request.Name?.Trim();

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
