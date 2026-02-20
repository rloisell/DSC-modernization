using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Tests
{
    public class UserPositionTests
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

        [Fact]
        public void UserPosition_CanInsertAndQuery()
        {
            var context = CreateDbContext();
            var startDate = new DateTime(2024, 6, 1);

            context.UserPositions.Add(new UserPosition
            {
                UserEmpId = 2001,
                PositionId = 42,
                StartDate = startDate,
                EndDate = null
            });
            context.SaveChanges();

            var record = context.UserPositions.Single();
            Assert.Equal(2001, record.UserEmpId);
            Assert.Equal(42, record.PositionId);
            Assert.Equal(startDate, record.StartDate);
            Assert.Null(record.EndDate);
        }
    }
}
