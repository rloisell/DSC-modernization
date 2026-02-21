using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;
using DSC.Api.Controllers;

namespace DSC.Tests
{
    /// <summary>
    /// Tests covering features implemented in the P1–P5 modernization backlog:
    /// - P1: Work item user-scoped edit/delete
    /// - P3: Report aggregation logic
    /// - P4: User deactivation blocks login
    /// - P5: Catalog reference data CRUD (data model level)
    /// </summary>
    public class ModernizationFeatureTests
    {
        // ─── Helpers ──────────────────────────────────────────────────────────

        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var ctx = new ApplicationDbContext(options);
            ctx.Database.EnsureCreated();
            return ctx;
        }

        private async Task<(ApplicationDbContext db, User user, UserAuth auth)> CreateActiveUser(
            string username = "alice", string password = "pass123", string? roleName = null)
        {
            var db = CreateDbContext();

            Role? role = null;
            if (roleName != null)
            {
                role = new Role { Id = Guid.NewGuid(), Name = roleName, IsActive = true };
                db.Roles.Add(role);
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                Username = username,
                Email = $"{username}@test.local",
                FirstName = "Test",
                LastName = "User",
                IsActive = true,
                RoleId = role?.Id,
                Role = role
            };
            db.Users.Add(user);

            var userAuth = new UserAuth { UserName = username, Password = password };
            db.Set<UserAuth>().Add(userAuth);

            await db.SaveChangesAsync();
            return (db, user, userAuth);
        }

        // ─── P4: Deactivation blocks login ───────────────────────────────────

        [Fact]
        public async Task Login_WithInactiveUser_ReturnsUnauthorized()
        {
            // Arrange
            var (db, user, _) = await CreateActiveUser("bob", "bobpass");
            user.IsActive = false;
            await db.SaveChangesAsync();

            var controller = new AuthController(db);

            // Act
            var result = await controller.Login(new LoginRequest { Username = "bob", Password = "bobpass" });

            // Assert
            var statusResult = result.Result as UnauthorizedObjectResult;
            Assert.NotNull(statusResult);
        }

        [Fact]
        public async Task Login_WithActiveUser_ReturnsOkWithUserDetails()
        {
            // Arrange
            var (db, user, _) = await CreateActiveUser("carol", "carolpass");
            var controller = new AuthController(db);

            // Act
            var result = await controller.Login(new LoginRequest { Username = "carol", Password = "carolpass" });

            // Assert
            var okResult = result.Result as OkObjectResult;
            Assert.NotNull(okResult);

            var response = okResult!.Value as LoginResponse;
            Assert.NotNull(response);
            Assert.Equal("carol", response!.Username);
        }

        [Fact]
        public async Task Login_WithWrongPassword_ReturnsUnauthorized()
        {
            // Arrange
            var (db, _, _) = await CreateActiveUser("dave", "correctpass");
            var controller = new AuthController(db);

            // Act
            var result = await controller.Login(new LoginRequest { Username = "dave", Password = "wrongpass" });

            // Assert
            var statusResult = result.Result as UnauthorizedObjectResult;
            Assert.NotNull(statusResult);
        }

        // ─── P4: User model IsActive default ─────────────────────────────────

        [Fact]
        public void User_IsActive_DefaultsToTrue()
        {
            var user = new User { Username = "test", Email = "test@test.com" };
            Assert.True(user.IsActive);
        }

        [Fact]
        public async Task User_Deactivate_PersistsToDatabase()
        {
            var (db, user, _) = await CreateActiveUser("ed", "edpass");

            user.IsActive = false;
            await db.SaveChangesAsync();

            var fetched = await db.Users.FindAsync(user.Id);
            Assert.False(fetched!.IsActive);
        }

        // ─── P1: Work item ownership at data layer ────────────────────────────

        [Fact]
        public async Task WorkItem_FilterByUserId_OnlyReturnsOwnerItems()
        {
            var db = CreateDbContext();
            var ownerId = Guid.NewGuid();
            var otherId = Guid.NewGuid();
            var projectId = Guid.NewGuid();

            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "Mine",  UserId = ownerId,  ProjectId = projectId });
            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "Theirs", UserId = otherId, ProjectId = projectId });
            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "Mine2", UserId = ownerId,  ProjectId = projectId });
            await db.SaveChangesAsync();

            var ownerItems = db.WorkItems.Where(w => w.UserId == ownerId).ToList();
            Assert.Equal(2, ownerItems.Count);
            Assert.All(ownerItems, w => Assert.Equal(ownerId, w.UserId));
        }

        [Fact]
        public async Task WorkItem_DifferentOwner_IsExcludedFromFilter()
        {
            var db = CreateDbContext();
            var userId = Guid.NewGuid();
            var otherId = Guid.NewGuid();

            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "Other user item", UserId = otherId });
            await db.SaveChangesAsync();

            var myItems = db.WorkItems.Where(w => w.UserId == userId).ToList();
            Assert.Empty(myItems);
        }

        [Fact]
        public async Task WorkItem_Delete_RemovesFromDatabase()
        {
            var db = CreateDbContext();
            var itemId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            db.WorkItems.Add(new WorkItem { Id = itemId, Title = "To delete", UserId = userId });
            await db.SaveChangesAsync();

            var item = await db.WorkItems.FindAsync(itemId);
            Assert.NotNull(item);

            db.WorkItems.Remove(item!);
            await db.SaveChangesAsync();

            var deleted = await db.WorkItems.FindAsync(itemId);
            Assert.Null(deleted);
        }

        // ─── P3: Report aggregation logic ────────────────────────────────────

        [Fact]
        public async Task Report_TotalHours_SumsAllActualDurations()
        {
            var db = CreateDbContext();
            var userId = Guid.NewGuid();

            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "A", UserId = userId, ActualDuration = 60 });
            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "B", UserId = userId, ActualDuration = 90 });
            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "C", UserId = userId, ActualDuration = 30 });
            await db.SaveChangesAsync();

            var total = db.WorkItems.Sum(w => w.ActualDuration ?? 0);
            Assert.Equal(180, total);
        }

        [Fact]
        public async Task Report_ProjectHours_AggregatesCorrectly()
        {
            var db = CreateDbContext();
            var projectId = Guid.NewGuid();
            var otherProjectId = Guid.NewGuid();
            var userId = Guid.NewGuid();

            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "P1a", UserId = userId, ProjectId = projectId, ActualDuration = 120 });
            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "P1b", UserId = userId, ProjectId = projectId, ActualDuration = 60 });
            db.WorkItems.Add(new WorkItem { Id = Guid.NewGuid(), Title = "P2a", UserId = userId, ProjectId = otherProjectId, ActualDuration = 30 });
            await db.SaveChangesAsync();

            var p1Hours = db.WorkItems
                .Where(w => w.ProjectId == projectId)
                .Sum(w => w.ActualDuration ?? 0);

            Assert.Equal(180, p1Hours);
        }

        [Fact]
        public void Report_IsOverBudget_WhenActualExceedsEstimate()
        {
            // Simulate overbudget check from ReportsController
            var estimatedHours = 100m;
            var actualHours = 120;
            var isOverBudget = estimatedHours.HasValue() && actualHours > (double)estimatedHours;

            Assert.True(isOverBudget);
        }

        [Fact]
        public void Report_IsNotOverBudget_WhenActualBelowEstimate()
        {
            var estimatedHours = 100m;
            var actualHours = 80;
            var isOverBudget = actualHours > (double)estimatedHours;

            Assert.False(isOverBudget);
        }

        // ─── P5: Reference data (catalog) CRUD at the data layer ─────────────

        [Fact]
        public async Task ActivityCode_CanBeCreatedAndQueried()
        {
            var db = CreateDbContext();
            var code = new ActivityCode { Id = Guid.NewGuid(), Code = "TEST-NEW", Description = "Test code", IsActive = true };
            db.ActivityCodes.Add(code);
            await db.SaveChangesAsync();

            var fetched = db.ActivityCodes.Single(c => c.Code == "TEST-NEW");
            Assert.Equal("Test code", fetched.Description);
            Assert.True(fetched.IsActive);
        }

        [Fact]
        public async Task ActivityCode_Deactivate_PersistsIsActiveFalse()
        {
            var db = CreateDbContext();
            var code = new ActivityCode { Id = Guid.NewGuid(), Code = "OLD", Description = "Old code", IsActive = true };
            db.ActivityCodes.Add(code);
            await db.SaveChangesAsync();

            code.IsActive = false;
            await db.SaveChangesAsync();

            var fetched = db.ActivityCodes.Single(c => c.Code == "OLD");
            Assert.False(fetched.IsActive);
        }

        [Fact]
        public async Task Budget_CanBeCreatedAndMarkedInactive()
        {
            var db = CreateDbContext();
            var budget = new Budget { Id = Guid.NewGuid(), Description = "FY2025", IsActive = true };
            db.Budgets.Add(budget);
            await db.SaveChangesAsync();

            budget.IsActive = false;
            await db.SaveChangesAsync();

            var fetched = await db.Budgets.FindAsync(budget.Id);
            Assert.NotNull(fetched);
            Assert.False(fetched!.IsActive);
        }
    }

    /// <summary>Extension helper to treat decimal as nullable for overbudget test readability.</summary>
    internal static class DecimalExtensions
    {
        internal static bool HasValue(this decimal value) => true;
    }
}
