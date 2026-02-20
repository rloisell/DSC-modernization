using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Seeding
{
public record TestSeedResult(int UsersCreated, int UserAuthCreated, int ProjectsCreated, int DepartmentsCreated, int RolesCreated, int ActivityCodesCreated, int NetworkNumbersCreated);

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
            var rolesCreated = 0;
            var activityCodesCreated = 0;
            var networkNumbersCreated = 0;

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

            // Seed test roles
            var roleSeeds = new[]
            {
                new RoleSeed("Administrator", "System administrator with full access"),
                new RoleSeed("Manager", "Project manager role"),
                new RoleSeed("Developer", "Development team member"),
                new RoleSeed("Viewer", "Read-only access to projects")
            };

            foreach (var seed in roleSeeds)
            {
                var role = await _db.Roles.FirstOrDefaultAsync(r => r.Name == seed.Name, ct);
                if (role == null)
                {
                    _db.Roles.Add(new Role
                    {
                        Id = Guid.NewGuid(),
                        Name = seed.Name,
                        Description = seed.Description,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        ModifiedAt = DateTime.UtcNow
                    });
                    rolesCreated++;
                }
            }

            // Seed test activity codes
            var activityCodeSeeds = new[]
            {
                new ActivityCodeSeed("DEV", "Development work"),
                new ActivityCodeSeed("TEST", "Testing and QA"),
                new ActivityCodeSeed("DOC", "Documentation"),
                new ActivityCodeSeed("ADMIN", "Administrative work"),
                new ActivityCodeSeed("MEET", "Meetings and planning"),
                new ActivityCodeSeed("TRAIN", "Training activities")
            };

            foreach (var seed in activityCodeSeeds)
            {
                var code = await _db.ActivityCodes.FirstOrDefaultAsync(ac => ac.Code == seed.Code, ct);
                if (code == null)
                {
                    _db.ActivityCodes.Add(new ActivityCode
                    {
                        Id = Guid.NewGuid(),
                        Code = seed.Code,
                        Description = seed.Description,
                        IsActive = true
                    });
                    activityCodesCreated++;
                }
            }

            // Seed test network numbers
            var networkNumberSeeds = new[]
            {
                new NetworkNumberSeed(101, "Network Infrastructure"),
                new NetworkNumberSeed(102, "Data Center Operations"),
                new NetworkNumberSeed(103, "Customer Support"),
                new NetworkNumberSeed(201, "Engineering"),
                new NetworkNumberSeed(202, "Security Operations"),
                new NetworkNumberSeed(203, "Cloud Services")
            };

            foreach (var seed in networkNumberSeeds)
            {
                var number = await _db.NetworkNumbers.FirstOrDefaultAsync(nn => nn.Number == seed.Number, ct);
                if (number == null)
                {
                    _db.NetworkNumbers.Add(new NetworkNumber
                    {
                        Id = Guid.NewGuid(),
                        Number = seed.Number,
                        Description = seed.Description,
                        IsActive = true
                    });
                    networkNumbersCreated++;
                }
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return new TestSeedResult(usersCreated, userAuthCreated, projectsCreated, departmentsCreated, rolesCreated, activityCodesCreated, networkNumbersCreated);
        }

        private record UserSeed(int EmpId, string Username, string Email, string FirstName, string LastName, string? Password);
        private record UserAuthSeed(string UserName, int EmpId, string Password, bool UpdatePassword);
        private record RoleSeed(string Name, string? Description);
        private record ActivityCodeSeed(string Code, string? Description);
        private record NetworkNumberSeed(int Number, string? Description);
    }
}
