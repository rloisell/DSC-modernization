/*
 * AdminCalendarCategoriesController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin CRUD controller for calendar-category reference data.
 * Thin controller — persistence is handled directly via EF Core; no service layer required for simple lookup entities.
 * AI-assisted: CRUD scaffolding, EF Core query patterns, OpenAPI attributes; reviewed and directed by Ryan Loiselle.
 */

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
    [Route("api/admin/calendar-categories")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminCalendarCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminCalendarCategoriesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(CalendarCategoryDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<CalendarCategoryDto[]>> GetAll()
        {
            var categories = await _db.CalendarCategories.AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CalendarCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToArrayAsync();

            return Ok(categories);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CalendarCategoryCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "Name is required." });
            }

            var entity = new CalendarCategory
            {
                Name = request.Name.Trim(),
                Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim()
            };

            await _db.CalendarCategories.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromBody] CalendarCategoryUpdateRequest request)
        {
            var entity = await _db.CalendarCategories.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null) return NotFound();

            entity.Name = request.Name.Trim();
            entity.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
