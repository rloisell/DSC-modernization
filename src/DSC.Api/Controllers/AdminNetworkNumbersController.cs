using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DSC.Api.DTOs;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/admin/network-numbers")]
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
    }
}
