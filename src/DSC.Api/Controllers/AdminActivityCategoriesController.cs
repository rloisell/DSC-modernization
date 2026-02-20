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
    [Route("api/admin/activity-categories")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminActivityCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminActivityCategoriesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ActivityCategoryDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ActivityCategoryDto[]>> GetAll()
        {
            var categories = await _db.ActivityCategories.AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new ActivityCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name
                })
                .ToArrayAsync();

            return Ok(categories);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] ActivityCategoryCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required." });
            }

            var entity = new ActivityCategory
            {
                Name = request.Name.Trim()
            };

            await _db.ActivityCategories.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] ActivityCategoryUpdateRequest request)
        {
            var entity = await _db.ActivityCategories.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null) return NotFound();

            entity.Name = request.Name.Trim();
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
