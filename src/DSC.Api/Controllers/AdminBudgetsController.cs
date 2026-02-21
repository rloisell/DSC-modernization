/*
 * AdminBudgetsController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin CRUD controller for budget reference data.
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
    [Route("api/admin/budgets")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminBudgetsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminBudgetsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(BudgetDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<BudgetDto[]>> GetAll()
        {
            var budgets = await _db.Budgets.AsNoTracking()
                .OrderBy(b => b.Description)
                .Select(b => new BudgetDto
                {
                    Id = b.Id,
                    Description = b.Description,
                    IsActive = b.IsActive
                })
                .ToArrayAsync();

            return Ok(budgets);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] BudgetCreateRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new { error = "Description is required." });
            }

            var entity = new Budget
            {
                Id = Guid.NewGuid(),
                Description = request.Description.Trim(),
                IsActive = true
            };

            await _db.Budgets.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] BudgetUpdateRequest request)
        {
            var entity = await _db.Budgets.FirstOrDefaultAsync(b => b.Id == id);
            if (entity == null) return NotFound();

            entity.Description = request.Description.Trim();
            entity.IsActive = request.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var entity = await _db.Budgets.FirstOrDefaultAsync(b => b.Id == id);
            if (entity == null) return NotFound();

            var hasCategories = await _db.ExpenseCategories.AnyAsync(c => c.BudgetId == id);
            if (hasCategories)
            {
                return Conflict(new { error = "Budget has expense categories and cannot be deleted." });
            }

            _db.Budgets.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
