using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using DSC.Api.Seeding;

namespace DSC.Api.Controllers
{
    [ApiController]
    [Route("api/admin/seed")]
    [Authorize(Policy = "AdminOnly")]
    [EnableRateLimiting("Admin")]
    public class AdminSeedController : ControllerBase
    {
        private readonly TestDataSeeder _seeder;

        public AdminSeedController(TestDataSeeder seeder)
        {
            _seeder = seeder;
        }

        [HttpPost("test-data")]
        [ProducesResponseType(typeof(TestSeedResult), StatusCodes.Status200OK)]
        public async Task<ActionResult<TestSeedResult>> SeedTestData(CancellationToken ct)
        {
            var result = await _seeder.SeedAsync(ct);
            return Ok(result);
        }
    }
}
