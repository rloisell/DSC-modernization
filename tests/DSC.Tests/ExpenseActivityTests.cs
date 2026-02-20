using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Tests
{
    public class ExpenseActivityTests
    {
        private ApplicationDbContext CreateDbContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase("ExpenseActivityTests")
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var context = new ApplicationDbContext(options);
            context.Database.EnsureCreated();
            return context;
        }

        [Fact]
        public void ExpenseActivity_CanInsertAndQuery()
        {
            var context = CreateDbContext();

            context.ExpenseActivities.Add(new ExpenseActivity
            {
                ActivityId = 7001,
                DirectorCode = "DIR1234",
                ReasonCode = "RC",
                CpcCode = "C123"
            });
            context.SaveChanges();

            var record = context.ExpenseActivities.Single();
            Assert.Equal(7001, record.ActivityId);
            Assert.Equal("DIR1234", record.DirectorCode);
            Assert.Equal("RC", record.ReasonCode);
            Assert.Equal("C123", record.CpcCode);
        }
    }
}
