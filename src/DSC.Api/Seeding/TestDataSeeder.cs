using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Seeding
{
public record TestSeedResult(int UsersCreated, int UserAuthCreated, int ProjectsCreated, int DepartmentsCreated, int RolesCreated, int ActivityCodesCreated, int NetworkNumbersCreated, int BudgetsCreated);

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
            var budgetsCreated = 0;

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

            // Add supplemental projects
            var projectSeeds = new[]
            {
                new ProjectSeed("P1001", "Website Modernization", "Migrate legacy website to modern stack"),
                new ProjectSeed("P1002", "Mobile App Development", "Build iOS and Android applications"),
                new ProjectSeed("P1003", "Database Migration", "Migrate from Oracle to PostgreSQL"),
                new ProjectSeed("P1004", "Cloud Infrastructure", "Move on-premises workloads to AWS"),
                new ProjectSeed("P1005", "Security Hardening", "Implement security best practices"),
                new ProjectSeed("P2001", "API Gateway Implementation", "Build unified API gateway for microservices"),
                new ProjectSeed("P2002", "Analytics Platform", "Implement real-time analytics dashboard")
            };

            foreach (var seed in projectSeeds)
            {
                var proj = await _db.Projects.FirstOrDefaultAsync(p => p.ProjectNo == seed.ProjectNo, ct);
                if (proj == null)
                {
                    _db.Projects.Add(new Project
                    {
                        Id = Guid.NewGuid(),
                        ProjectNo = seed.ProjectNo,
                        Name = seed.Name,
                        Description = seed.Description,
                        IsActive = true
                    });
                    projectsCreated++;
                }
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

            // Add supplemental departments
            var departmentSeeds = new[]
            {
                new DepartmentSeed("Engineering", "Ryan Loiselle"),
                new DepartmentSeed("Quality Assurance", "Matthew Ammeter"),
                new DepartmentSeed("Product Management", "Duncan McGregor")
            };

            foreach (var seed in departmentSeeds)
            {
                var dept = await _db.Departments.FirstOrDefaultAsync(d => d.Name == seed.Name, ct);
                if (dept == null)
                {
                    _db.Departments.Add(new Department
                    {
                        Id = Guid.NewGuid(),
                        Name = seed.Name,
                        ManagerName = seed.ManagerName,
                        IsActive = true
                    });
                    departmentsCreated++;
                }
            }

            var budgetSeeds = new[]
            {
                new BudgetSeed("CAPEX"),
                new BudgetSeed("OPEX")
            };

            foreach (var seed in budgetSeeds)
            {
                var existing = await _db.Budgets.FirstOrDefaultAsync(b => b.Description == seed.Description, ct);
                if (existing == null)
                {
                    _db.Budgets.Add(new Budget
                    {
                        Id = Guid.NewGuid(),
                        Description = seed.Description,
                        IsActive = true
                    });
                    budgetsCreated++;
                }
            }

            // Seed test roles (from database schema)
            var roleSeeds = new[]
            {
                new RoleSeed("Admin", "Administrator"),
                new RoleSeed("User", "DSC User")
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

            // Seed test activity codes (from database schema + supplemental)
            var activityCodeSeeds = new[]
            {
                new ActivityCodeSeed("10", "Diagramming"),
                new ActivityCodeSeed("11", "Project Meeting"),
                new ActivityCodeSeed("DEV", "Development work"),
                new ActivityCodeSeed("TEST", "Testing and QA"),
                new ActivityCodeSeed("DOC", "Documentation"),
                new ActivityCodeSeed("ADMIN", "Administrative work"),
                new ActivityCodeSeed("MEET", "Meetings and planning"),
                new ActivityCodeSeed("TRAIN", "Training activities"),
                new ActivityCodeSeed("BUG", "Bug fixing and maintenance"),
                new ActivityCodeSeed("REV", "Code review"),
                new ActivityCodeSeed("ARCH", "Architecture and design"),
                new ActivityCodeSeed("DEPLOY", "Deployment and release")
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

            // Seed test network numbers (from database schema + supplemental)
            var networkNumberSeeds = new[]
            {
                new NetworkNumberSeed(99, "Dev"),
                new NetworkNumberSeed(100, "Test"),
                new NetworkNumberSeed(101, "Prod"),
                new NetworkNumberSeed(110, "Infrastructure"),
                new NetworkNumberSeed(111, "Database Services"),
                new NetworkNumberSeed(120, "Security Operations"),
                new NetworkNumberSeed(121, "Threat Detection"),
                new NetworkNumberSeed(130, "Network Engineering"),
                new NetworkNumberSeed(200, "Customer Support"),
                new NetworkNumberSeed(201, "Sales Engineering"),
                new NetworkNumberSeed(210, "Product Development"),
                new NetworkNumberSeed(220, "Quality Assurance")
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

                return new TestSeedResult(usersCreated, userAuthCreated, projectsCreated, departmentsCreated, rolesCreated, activityCodesCreated, networkNumbersCreated, budgetsCreated);
        }

        private record UserSeed(int EmpId, string Username, string Email, string FirstName, string LastName, string? Password);
        private record UserAuthSeed(string UserName, int EmpId, string Password, bool UpdatePassword);
        private record RoleSeed(string Name, string? Description);
        private record ActivityCodeSeed(string Code, string? Description);
        private record NetworkNumberSeed(int Number, string? Description);
        private record DepartmentSeed(string Name, string ManagerName);
        private record BudgetSeed(string Description);
        private record ProjectSeed(string ProjectNo, string Name, string? Description);
    }
}
