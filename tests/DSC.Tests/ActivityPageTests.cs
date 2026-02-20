using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;
using DSC.Api.Seeding;
using DSC.Api.DTOs;
using DSC.Api.Controllers;

namespace DSC.Tests
{
    public class ActivityPageTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        /// <summary>
        /// Tests that the TestDataSeeder creates the correct number of activity codes
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_CreatesActivityCodes()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            var result = await seeder.SeedAsync(CancellationToken.None);

            // Assert
            Assert.Equal(12, result.ActivityCodesCreated);
            Assert.Equal(12, context.ActivityCodes.Count());
        }

        /// <summary>
        /// Tests that the TestDataSeeder creates the correct activity code values
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_ActivityCodes_HaveCorrectValues()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);
            var expectedCodes = new[]
            {
                "10",
                "11",
                "DEV",
                "TEST",
                "DOC",
                "ADMIN",
                "MEET",
                "TRAIN",
                "BUG",
                "REV",
                "ARCH",
                "DEPLOY"
            };

            // Act
            await seeder.SeedAsync(CancellationToken.None);

            // Assert
            var actualCodes = context.ActivityCodes
                .OrderBy(c => c.Code)
                .Select(c => c.Code)
                .ToList();

            Assert.Equal(expectedCodes.Length, actualCodes.Count);
            foreach (var expectedCode in expectedCodes)
            {
                Assert.Contains(expectedCode, actualCodes);
            }
        }

        /// <summary>
        /// Tests that activity codes are marked as active
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_ActivityCodes_AreActive()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            await seeder.SeedAsync(CancellationToken.None);

            // Assert
            var inactiveCount = context.ActivityCodes.Where(c => !c.IsActive).Count();
            Assert.Equal(0, inactiveCount);
        }

        /// <summary>
        /// Tests that the TestDataSeeder creates the correct number of network numbers
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_CreatesNetworkNumbers()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            var result = await seeder.SeedAsync(CancellationToken.None);

            // Assert
            Assert.Equal(12, result.NetworkNumbersCreated);
            Assert.Equal(12, context.NetworkNumbers.Count());
        }

        /// <summary>
        /// Tests that the TestDataSeeder creates the correct network number values
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_NetworkNumbers_HaveCorrectValues()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);
            var expectedNumbers = new[] { 99, 100, 101, 110, 111, 120, 121, 130, 200, 201, 210, 220 };

            // Act
            await seeder.SeedAsync(CancellationToken.None);

            // Assert
            var actualNumbers = context.NetworkNumbers
                .OrderBy(n => n.Number)
                .Select(n => n.Number)
                .ToList();

            Assert.Equal(expectedNumbers.Length, actualNumbers.Count);
            foreach (var expectedNumber in expectedNumbers)
            {
                Assert.Contains(expectedNumber, actualNumbers);
            }
        }

        /// <summary>
        /// Tests that network numbers are marked as active
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_NetworkNumbers_AreActive()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            await seeder.SeedAsync(CancellationToken.None);

            // Assert
            var inactiveCount = context.NetworkNumbers.Where(n => !n.IsActive).Count();
            Assert.Equal(0, inactiveCount);
        }

        /// <summary>
        /// Tests that activity codes have descriptions
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_ActivityCodes_HaveDescriptions()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            await seeder.SeedAsync(CancellationToken.None);

            // Assert
            var codesWithoutDescription = context.ActivityCodes
                .Where(c => string.IsNullOrWhiteSpace(c.Description))
                .Count();
            Assert.Equal(0, codesWithoutDescription);
        }

        /// <summary>
        /// Tests that network numbers have descriptions
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_NetworkNumbers_HaveDescriptions()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            await seeder.SeedAsync(CancellationToken.None);

            // Assert
            var numbersWithoutDescription = context.NetworkNumbers
                .Where(n => string.IsNullOrWhiteSpace(n.Description))
                .Count();
            Assert.Equal(0, numbersWithoutDescription);
        }

        /// <summary>
        /// Tests that seeding is idempotent (running twice creates no duplicates)
        /// </summary>
        [Fact]
        public async Task TestDataSeeder_IsIdempotent()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            var result1 = await seeder.SeedAsync(CancellationToken.None);
            var result2 = await seeder.SeedAsync(CancellationToken.None);

            // Assert - second run should create 0 new codes and numbers
            Assert.Equal(12, result1.ActivityCodesCreated);
            Assert.Equal(0, result2.ActivityCodesCreated);
            Assert.Equal(12, result1.NetworkNumbersCreated);
            Assert.Equal(0, result2.NetworkNumbersCreated);
            
            // Verify total counts remain the same
            Assert.Equal(12, context.ActivityCodes.Count());
            Assert.Equal(12, context.NetworkNumbers.Count());
        }

        /// <summary>
        /// Tests that CatalogController can retrieve activity codes
        /// </summary>
        [Fact]
        public async Task CatalogController_GetActivityCodes_ReturnsSeededData()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);
            await seeder.SeedAsync(CancellationToken.None);

            var controller = new CatalogController(context);

            // Act
            var result = await controller.GetActivityCodes();

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Result); // Should be OkObjectResult
            
            // Extract value from OkObjectResult
            var okResult = result.Result as Microsoft.AspNetCore.Mvc.OkObjectResult;
            Assert.NotNull(okResult);
            Assert.NotNull(okResult.Value);
            
            var codes = okResult.Value as ActivityCodeDto[];
            Assert.NotNull(codes);
            Assert.Equal(12, codes.Length);
            Assert.All(codes, code => Assert.True(code.IsActive));
        }

        /// <summary>
        /// Tests that CatalogController can retrieve network numbers
        /// </summary>
        [Fact]
        public async Task CatalogController_GetNetworkNumbers_ReturnsSeededData()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);
            await seeder.SeedAsync(CancellationToken.None);

            var controller = new CatalogController(context);

            // Act
            var result = await controller.GetNetworkNumbers();

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Result);
            
            var okResult = result.Result as Microsoft.AspNetCore.Mvc.OkObjectResult;
            Assert.NotNull(okResult);
            Assert.NotNull(okResult.Value);
            
            var numbers = okResult.Value as NetworkNumberDto[];
            Assert.NotNull(numbers);
            Assert.Equal(12, numbers.Length);
            Assert.All(numbers, number => Assert.True(number.IsActive));
        }

        /// <summary>
        /// Tests that ItemsController GetAll endpoint returns work items
        /// </summary>
        [Fact]
        public async Task ItemsController_GetAll_ReturnsWorkItems()
        {
            // Arrange
            var context = CreateDbContext();
            var project = new Project 
            { 
                Id = Guid.NewGuid(),
                ProjectNo = "P001",
                Name = "Test Project",
                IsActive = true
            };
            context.Projects.Add(project);

            var workItem = new WorkItem
            {
                Id = Guid.NewGuid(),
                ProjectId = project.Id,
                Title = "Test Work Item",
                Description = "Test Description"
            };
            context.WorkItems.Add(workItem);
            await context.SaveChangesAsync();

            var controller = new ItemsController(context);

            // Act
            var result = await controller.GetAll();

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Result);
            
            var okResult = result.Result as Microsoft.AspNetCore.Mvc.OkObjectResult;
            Assert.NotNull(okResult);
            Assert.NotNull(okResult.Value);
            
            var items = okResult.Value as WorkItemDto[];
            Assert.NotNull(items);
            Assert.Single(items);
            Assert.Equal("Test Work Item", items[0].Title);
        }

        /// <summary>
        /// Tests that ItemsController GetAll returns empty array when no items exist
        /// </summary>
        [Fact]
        public async Task ItemsController_GetAll_ReturnsEmptyArrayWhenNoItems()
        {
            // Arrange
            var context = CreateDbContext();
            var controller = new ItemsController(context);

            // Act
            var result = await controller.GetAll();

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Result);
            
            var okResult = result.Result as Microsoft.AspNetCore.Mvc.OkObjectResult;
            Assert.NotNull(okResult);
            Assert.NotNull(okResult.Value);
            
            var items = okResult.Value as WorkItemDto[];
            Assert.NotNull(items);
            Assert.Empty(items);
        }

        /// <summary>
        /// Integration test: Activity page can display projects, codes, and numbers
        /// </summary>
        [Fact]
        public async Task ActivityPage_Integration_AllDataSourcesAvailable()
        {
            // Arrange
            var context = CreateDbContext();
            var passwordHasher = new PasswordHasher<User>();
            var seeder = new TestDataSeeder(context, passwordHasher);

            // Act
            await seeder.SeedAsync(CancellationToken.None);

            // Assert - Verify all data sources have been seeded
            var projects = await context.Projects.CountAsync();
            var activityCodes = await context.ActivityCodes.CountAsync();
            var networkNumbers = await context.NetworkNumbers.CountAsync();

            Assert.True(projects > 0, "Projects should be seeded");
            Assert.Equal(12, activityCodes);
            Assert.Equal(12, networkNumbers);

            // Verify activity codes are properly structured for dropdown
            var codes = await context.ActivityCodes
                .Where(c => c.IsActive)
                .Select(c => new { c.Code, c.Description })
                .ToListAsync();
            Assert.All(codes, c => Assert.NotEmpty(c.Code));
            Assert.All(codes, c => Assert.NotNull(c.Description));

            // Verify network numbers are properly structured for dropdown
            var numbers = await context.NetworkNumbers
                .Where(n => n.IsActive)
                .Select(n => new { n.Number, n.Description })
                .ToListAsync();
            Assert.All(numbers, n => Assert.True(n.Number > 0));
            Assert.All(numbers, n => Assert.NotNull(n.Description));
        }
    }
}
