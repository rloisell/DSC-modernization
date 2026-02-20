using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Tests
{
    public class ProjectActivityTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase("ProjectActivityTests")
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public void ProjectActivity_CanInsertAndQuery()
        {
            var context = CreateDbContext();

            context.ProjectActivities.Add(new ProjectActivity
            {
                ActivityId = 5001,
                ProjectNo = "PRJ-1001",
                NetworkNumber = 101,
                ActivityCode = 12
            });
            context.SaveChanges();

            var record = context.ProjectActivities.Single();
            Assert.Equal(5001, record.ActivityId);
            Assert.Equal("PRJ-1001", record.ProjectNo);
            Assert.Equal(101, record.NetworkNumber);
            Assert.Equal(12, record.ActivityCode);
        }
    }
}
