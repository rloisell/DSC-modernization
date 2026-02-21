/*
 * AdminNetworkNumbersController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin CRUD controller for network-number (WBS element) reference data.
 * Thin controller — persistence is handled directly via EF Core; no service layer required for simple lookup entities.
 * AI-assisted: CRUD scaffolding, EF Core query patterns, OpenAPI attributes; reviewed and directed by Ryan Loiselle.
 */

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
    [Route("api/admin/network-numbers")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminNetworkNumbersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminNetworkNumbersController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(NetworkNumberDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<NetworkNumberDto[]>> GetAll()
        {
            var numbers = await _db.NetworkNumbers.AsNoTracking()
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

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] NetworkNumberCreateRequest request)
        {
            if (request.Number <= 0)
            {
                return BadRequest(new { error = "Number must be greater than zero." });
            }

            var entity = new NetworkNumber
            {
                Id = Guid.NewGuid(),
                Number = request.Number,
                Description = request.Description,
                IsActive = true
            };

            await _db.NetworkNumbers.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] NetworkNumberUpdateRequest request)
        {
            var entity = await _db.NetworkNumbers.FirstOrDefaultAsync(n => n.Id == id);
            if (entity == null) return NotFound();

            entity.Number = request.Number;
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
            var entity = await _db.NetworkNumbers.FirstOrDefaultAsync(n => n.Id == id);
            if (entity == null) return NotFound();

            _db.NetworkNumbers.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
