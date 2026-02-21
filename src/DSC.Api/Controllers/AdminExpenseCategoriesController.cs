/*
 * AdminExpenseCategoriesController.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * Admin CRUD controller for expense-category reference data.
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
    [Route("api/admin/expense-categories")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminExpenseCategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminExpenseCategoriesController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ExpenseCategoryDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ExpenseCategoryDto[]>> GetAll()
        {
            var categories = await _db.ExpenseCategories.AsNoTracking()
                .Include(c => c.Budget)
                .OrderBy(c => c.Name)
                .Select(c => new ExpenseCategoryDto
                {
                    Id = c.Id,
                    BudgetId = c.BudgetId,
                    BudgetDescription = c.Budget != null ? c.Budget.Description : null,
                    Name = c.Name,
                    IsActive = c.IsActive
                })
                .ToArrayAsync();

            return Ok(categories);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] ExpenseCategoryCreateRequest request)
        {
            if (request.BudgetId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "BudgetId and Name are required." });
            }

            var budgetExists = await _db.Budgets.AnyAsync(b => b.Id == request.BudgetId);
            if (!budgetExists)
            {
                return BadRequest(new { error = "Budget not found" });
            }

            var entity = new ExpenseCategory
            {
                Id = Guid.NewGuid(),
                BudgetId = request.BudgetId,
                Name = request.Name.Trim(),
                IsActive = true
            };

            await _db.ExpenseCategories.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] ExpenseCategoryUpdateRequest request)
        {
            var entity = await _db.ExpenseCategories.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null) return NotFound();

            if (request.BudgetId == Guid.Empty)
            {
                return BadRequest(new { error = "BudgetId is required." });
            }

            var budgetExists = await _db.Budgets.AnyAsync(b => b.Id == request.BudgetId);
            if (!budgetExists)
            {
                return BadRequest(new { error = "Budget not found" });
            }

            entity.BudgetId = request.BudgetId;
            entity.Name = request.Name.Trim();
            entity.IsActive = request.IsActive;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(Guid id)
        {
            var entity = await _db.ExpenseCategories.FirstOrDefaultAsync(c => c.Id == id);
            if (entity == null) return NotFound();

            _db.ExpenseCategories.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
