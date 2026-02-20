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
    [Route("api/admin/expense-options")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminExpenseOptionsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public AdminExpenseOptionsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        [ProducesResponseType(typeof(ExpenseOptionDto[]), StatusCodes.Status200OK)]
        public async Task<ActionResult<ExpenseOptionDto[]>> GetAll([FromQuery] Guid? categoryId)
        {
            IQueryable<ExpenseOption> query = _db.ExpenseOptions.AsNoTracking().Include(o => o.Category);
            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
            {
                query = query.Where(o => o.ExpenseCategoryId == categoryId);
            }

            var options = await query.OrderBy(o => o.Name)
                .Select(o => new ExpenseOptionDto
                {
                    Id = o.Id,
                    ExpenseCategoryId = o.ExpenseCategoryId,
                    ExpenseCategoryName = o.Category != null ? o.Category.Name : null,
                    Name = o.Name,
                    IsActive = o.IsActive
                })
                .ToArrayAsync();

            return Ok(options);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] ExpenseOptionCreateRequest request)
        {
            if (request.ExpenseCategoryId == Guid.Empty || string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { error = "ExpenseCategoryId and Name are required." });
            }

            var entity = new ExpenseOption
            {
                Id = Guid.NewGuid(),
                ExpenseCategoryId = request.ExpenseCategoryId,
                Name = request.Name.Trim(),
                IsActive = true
            };

            await _db.ExpenseOptions.AddAsync(entity);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = entity.Id }, new { id = entity.Id });
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(Guid id, [FromBody] ExpenseOptionUpdateRequest request)
        {
            var entity = await _db.ExpenseOptions.FirstOrDefaultAsync(o => o.Id == id);
            if (entity == null) return NotFound();

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
            var entity = await _db.ExpenseOptions.FirstOrDefaultAsync(o => o.Id == id);
            if (entity == null) return NotFound();

            _db.ExpenseOptions.Remove(entity);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}
