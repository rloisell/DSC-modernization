using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Seeding
{
    public record TestSeedResult(int UsersCreated, int UserAuthCreated, int ProjectsCreated, int DepartmentsCreated);

    public class TestDataSeeder
    {
        private readonly ApplicationDbContext _db;
        private readonly IPasswordHasher<User> _passwordHasher;

        public TestDataSeeder(ApplicationDbContext db, IPasswordHasher<User> passwordHasher)
        {
            _db = db;
            _passwordHasher = passwordHasher;
        }

        public async Task<TestSeedResult> SeedAsync(CancellationToken ct)
        {
            var usersCreated = 0;
            var userAuthCreated = 0;
            var projectsCreated = 0;
            var departmentsCreated = 0;

            await using var transaction = await _db.Database.BeginTransactionAsync(ct);

            var userSeeds = new[]
            {
                new UserSeed(15298, "rloisel1", "ryan.loiselle@azonicnet.com", "Ryan", "Loiselle", "test-password-updated"),
                new UserSeed(10101, "dmcgregor", "duncan.mcgregor@mtsallstream.com", "Duncan", "McGregor", null),
                new UserSeed(15299, "kduma", "snipe_187@hotmail.com", "Keith", "Duma", "test-password"),
                new UserSeed(99901, "mammeter", "acs-39093-and-mts-project-2009@googlegroups.com", "Matthew", "Ammeter", "test-password")
            };

            foreach (var seed in userSeeds)
            {
                var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == seed.Username, ct);
                if (user == null)
                {
                    user = new User
                    {
                        Id = Guid.NewGuid(),
                        EmpId = seed.EmpId,
                        Username = seed.Username,
                        Email = seed.Email,
                        FirstName = seed.FirstName,
                        LastName = seed.LastName
                    };

                    if (!string.IsNullOrWhiteSpace(seed.Password))
                    {
                        user.PasswordHash = _passwordHasher.HashPassword(user, seed.Password);
                    }

                    _db.Users.Add(user);
                    usersCreated++;
                }
                else
                {
                    if (user.EmpId == null)
                    {
                        user.EmpId = seed.EmpId;
                    }

                    if (string.IsNullOrWhiteSpace(user.Email))
                    {
                        user.Email = seed.Email;
                    }

                    if (string.IsNullOrWhiteSpace(user.FirstName))
                    {
                        user.FirstName = seed.FirstName;
                    }

                    if (string.IsNullOrWhiteSpace(user.LastName))
                    {
                        user.LastName = seed.LastName;
                    }

                    if (string.IsNullOrWhiteSpace(user.PasswordHash) && !string.IsNullOrWhiteSpace(seed.Password))
                    {
                        user.PasswordHash = _passwordHasher.HashPassword(user, seed.Password);
                    }
                }
            }

            var userAuthSeeds = new[]
            {
                new UserAuthSeed("rloisel1", 15298, "test-password-updated", true),
                new UserAuthSeed("kduma", 15299, "test-password", false),
                new UserAuthSeed("mammeter", 99901, "test-password", false)
            };

            foreach (var seed in userAuthSeeds)
            {
                var userAuth = await _db.Set<UserAuth>()
                    .FirstOrDefaultAsync(ua => ua.UserName == seed.UserName, ct);

                if (userAuth == null)
                {
                    userAuth = new UserAuth
                    {
                        UserName = seed.UserName,
                        Password = seed.Password,
                        EmpId = seed.EmpId
                    };

                    _db.Set<UserAuth>().Add(userAuth);
                    userAuthCreated++;
                }
                else
                {
                    if (seed.UpdatePassword && userAuth.Password != seed.Password)
                    {
                        userAuth.Password = seed.Password;
                    }

                    if (userAuth.EmpId == null)
                    {
                        userAuth.EmpId = seed.EmpId;
                    }
                }
            }

            var project = await _db.Projects.FirstOrDefaultAsync(p => p.ProjectNo == "P99999", ct);
            if (project == null)
            {
                _db.Projects.Add(new Project
                {
                    Id = Guid.NewGuid(),
                    ProjectNo = "P99999",
                    Name = "ANOTHER TEST PROJECT",
                    Description = "ANOTHER TEST PROJECT",
                    IsActive = true
                });
                projectsCreated++;
            }

            var department = await _db.Departments.FirstOrDefaultAsync(d => d.Name == "OSS Operations", ct);
            if (department == null)
            {
                _db.Departments.Add(new Department
                {
                    Id = Guid.NewGuid(),
                    Name = "OSS Operations",
                    ManagerName = "Duncan McGregor",
                    IsActive = true
                });
                departmentsCreated++;
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return new TestSeedResult(usersCreated, userAuthCreated, projectsCreated, departmentsCreated);
        }

        private record UserSeed(int EmpId, string Username, string Email, string FirstName, string LastName, string? Password);
        private record UserAuthSeed(string UserName, int EmpId, string Password, bool UpdatePassword);
    }
}
