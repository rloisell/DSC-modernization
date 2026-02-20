using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Tests
{
    public class DepartmentUserTests
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
        public void DepartmentUser_CanInsertAndQuery()
        {
            var context = CreateDbContext();
            var startDate = new DateTime(2024, 1, 1);

            context.DepartmentUsers.Add(new DepartmentUser
            {
                UserEmpId = 1001,
                DepartmentId = 10,
                StartDate = startDate,
                EndDate = null
            });
            context.SaveChanges();

            var record = context.DepartmentUsers.Single();
            Assert.Equal(1001, record.UserEmpId);
            Assert.Equal(10, record.DepartmentId);
            Assert.Equal(startDate, record.StartDate);
            Assert.Null(record.EndDate);
        }
    }
}
