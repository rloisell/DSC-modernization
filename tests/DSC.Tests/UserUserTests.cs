using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Tests
{
    public class UserUserTests
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
        public void UserUser_CanInsertAndQuery()
        {
            var context = CreateDbContext();
            var startDate = new DateTime(2023, 3, 15);

            context.UserUsers.Add(new UserUser
            {
                UserEmpId = 3001,
                UserEmpId2 = 3002,
                StartDate = startDate,
                EndDate = null
            });
            context.SaveChanges();

            var record = context.UserUsers.Single();
            Assert.Equal(3001, record.UserEmpId);
            Assert.Equal(3002, record.UserEmpId2);
            Assert.Equal(startDate, record.StartDate);
            Assert.Null(record.EndDate);
        }
    }
}
