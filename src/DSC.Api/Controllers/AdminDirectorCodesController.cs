/*
 * AdminDirectorCodesController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin CRUD controller for director-code reference data.
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
    [Route("api/admin/director-codes")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminDirectorCodesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminDirectorCodesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(DirectorCodeDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<DirectorCodeDto[]>> GetAll()
        {
            var codes = await _db.DirectorCodes.AsNoTracking()
                .OrderBy(c => c.Code)
                .Select(c => new DirectorCodeDto
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
        public async Task<IActionResult> Create([FromBody] DirectorCodeCreateRequest request)
        {
            var code = request.Code?.Trim();
            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new { error = "Code is required." });
            }

            var entity = new DirectorCode
            {
                Code = code,
                Description = request.Description
            };

            await _db.DirectorCodes.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Code }, new { code = entity.Code });
        }

        [HttpPut("{code}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(string code, [FromBody] DirectorCodeUpdateRequest request)
        {
            var normalizedCode = code?.Trim();
            if (string.IsNullOrWhiteSpace(normalizedCode))
            {
                return NotFound();
            }

            var entity = await _db.DirectorCodes.FirstOrDefaultAsync(c => c.Code == normalizedCode);
            if (entity == null) return NotFound();

            entity.Description = request.Description;

            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}
