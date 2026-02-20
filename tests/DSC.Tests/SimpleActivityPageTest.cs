using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;
using DSC.Api.Seeding;

namespace DSC.Tests
{
    public class SimpleActivityPageTest
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public async Task TestDataSeeder_CreatesActivityCodes_Simple()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            var result = await seeder.SeedAsync(CancellationToken.None);

            // Assert - Log the result
            Assert.NotNull(result);
            Assert.Equal(6, result.ActivityCodesCreated);
            
            // Verify codes are in database
            var count = await context.ActivityCodes.CountAsync();
            Assert.Equal(6, count);
        }
    }
}
