using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using DSC.Data;
using DSC.Data.Models;

namespace DSC.Api.Seeding
{
public record TestSeedResult(
    int UsersCreated, 
    int UserAuthCreated, 
    int ProjectsCreated, 
    int DepartmentsCreated, 
    int RolesCreated, 
    int ActivityCodesCreated, 
    int NetworkNumbersCreated, 
    int BudgetsCreated,
    int PositionsCreated,
    int ExpenseCategoriesCreated,
    int ExpenseOptionsCreated,
    int CpcCodesCreated,
    int DirectorCodesCreated,
    int ReasonCodesCreated,
    int UnionsCreated,
    int ActivityCategoriesCreated,
    int CalendarCategoriesCreated,
    int CalendarEntriesCreated,
    int WorkItemsCreated,
    int ProjectActivityOptionsCreated,
    int ProjectAssignmentsCreated,
    int TimeEntriesCreated
);

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
            var positionsCreated = 0;
            var expenseCategoriesCreated = 0;
            var expenseOptionsCreated = 0;
            var cpcCodesCreated = 0;
            var directorCodesCreated = 0;
            var reasonCodesCreated = 0;
            var unionsCreated = 0;
            var activityCategoriesCreated = 0;
            var calendarCategoriesCreated = 0;
            var calendarEntriesCreated = 0;
            var workItemsCreated = 0;
            var projectActivityOptionsCreated = 0;
            var projectAssignmentsCreated = 0;
            var timeEntriesCreated = 0;

            await using var transaction = await _db.Database.BeginTransactionAsync(ct);

            var userSeeds = new[]
            {
                new UserSeed(15298, "rloisel1", "ryan.loiselle@azonicnet.com", "Ryan", "Loiselle", "test-password-updated"),
                new UserSeed(10101, "dmcgregor", "duncan.mcgregor@mtsallstream.com", "Duncan", "McGregor", null),
                new UserSeed(15299, "kduma", "snipe_187@hotmail.com", "Keith", "Duma", "test-password-updated"),
                new UserSeed(99901, "mammeter", "acs-39093-and-mts-project-2009@googlegroups.com", "Matthew", "Ammeter", "test-password-updated")
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

                    // Always update password hash from seed if provided (allows password resets during seeding)
                    if (!string.IsNullOrWhiteSpace(seed.Password))
                    {
                        user.PasswordHash = _passwordHasher.HashPassword(user, seed.Password);
                    }
                }
            }

            var userAuthSeeds = new[]
            {
                new UserAuthSeed("rloisel1", 15298, "test-password-updated", true),
                new UserAuthSeed("kduma", 15299, "test-password-updated", true),
                new UserAuthSeed("mammeter", 99901, "test-password-updated", true)
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

            var existingProject = await _db.Projects.FirstOrDefaultAsync(p => p.ProjectNo == "P99999", ct);
            if (existingProject == null)
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

            // Save roles before assigning them to users
            await _db.SaveChangesAsync(ct);

            // Assign roles to users
            var adminRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "Admin", ct);
            var userRole = await _db.Roles.FirstOrDefaultAsync(r => r.Name == "User", ct);

            if (adminRole != null)
            {
                var adminUser = await _db.Users.FirstOrDefaultAsync(u => u.Username == "rloisel1", ct);
                if (adminUser != null && adminUser.RoleId == null)
                {
                    adminUser.RoleId = adminRole.Id;
                }
            }

            if (userRole != null)
            {
                var regularUsers = await _db.Users
                    .Where(u => u.RoleId == null && u.Username != "rloisel1")
                    .ToListAsync(ct);
                
                foreach (var user in regularUsers)
                {
                    user.RoleId = userRole.Id;
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
            
            // Now seed comprehensive catalog data and work items
            
            // Seed positions
            var positionSeeds = new[]
            {
                new PositionSeed("Software Developer", "Develops and maintains software applications"),              new PositionSeed("Senior Developer", "Senior software development role"),
                new PositionSeed("Team Lead", "Leads development teams"),
                new PositionSeed("Project Manager", "Manages software projects"),
                new PositionSeed("QA Analyst", "Quality assurance and testing"),
                new PositionSeed("Systems Analyst", "Analyzes system requirements")
            };

            foreach (var seed in positionSeeds)
            {
                var existing = await _db.Positions.FirstOrDefaultAsync(p => p.Title == seed.Title, ct);
                if (existing == null)
                {
                    _db.Positions.Add(new Position
                    {
                        Id = Guid.NewGuid(),
                        Title = seed.Title,
                        Description = seed.Description,
                        IsActive = true
                    });
                    positionsCreated++;
                }
            }

            // Seed expense categories
            var capexBudget = await _db.Budgets.FirstOrDefaultAsync(b => b.Description == "CAPEX", ct);
            var opexBudget = await _db.Budgets.FirstOrDefaultAsync(b => b.Description == "OPEX", ct);

            if (capexBudget != null)
            {
                var expenseCategorySeeds = new[]
                {
                    new ExpenseCategorySeed("Hardware", capexBudget.Id),
                    new ExpenseCategorySeed("Software Licenses", capexBudget.Id),
                    new ExpenseCategorySeed("Infrastructure", capexBudget.Id)
                };

                foreach (var seed in expenseCategorySeeds)
                {
                    var existing = await _db.ExpenseCategories.FirstOrDefaultAsync(ec => ec.Name == seed.Name && ec.BudgetId == seed.BudgetId, ct);
                    if (existing == null)
                    {
                        _db.ExpenseCategories.Add(new ExpenseCategory
                        {
                            Id = Guid.NewGuid(),
                            Name = seed.Name,
                            BudgetId = seed.BudgetId,
                            IsActive = true
                        });
                        expenseCategoriesCreated++;
                    }
                }
            }

            if (opexBudget != null)
            {
                var opexCategorySeeds = new[]
                {
                    new ExpenseCategorySeed("Travel", opexBudget.Id),
                    new ExpenseCategorySeed("Training", opexBudget.Id),
                    new ExpenseCategorySeed("Supplies", opexBudget.Id),
                    new ExpenseCategorySeed("Consulting", opexBudget.Id)
                };

                foreach (var seed in opexCategorySeeds)
                {
                    var existing = await _db.ExpenseCategories.FirstOrDefaultAsync(ec => ec.Name == seed.Name && ec.BudgetId == seed.BudgetId, ct);
                    if (existing == null)
                    {
                        _db.ExpenseCategories.Add(new ExpenseCategory
                        {
                            Id = Guid.NewGuid(),
                            Name = seed.Name,
                            BudgetId = seed.BudgetId,
                            IsActive = true
                        });
                        expenseCategoriesCreated++;
                    }
                }
            }

            await _db.SaveChangesAsync(ct);

            // Seed expense options
            var travelCategory = await _db.ExpenseCategories.FirstOrDefaultAsync(ec => ec.Name == "Travel", ct);
            if (travelCategory != null)
            {
                var travelOptions = new[] { "Airfare", "Hotel", "Meals", "Ground Transportation" };
                foreach (var optionName in travelOptions)
                {
                    var existing = await _db.ExpenseOptions.FirstOrDefaultAsync(eo => eo.Name == optionName && eo.ExpenseCategoryId == travelCategory.Id, ct);
                    if (existing == null)
                    {
                        _db.ExpenseOptions.Add(new ExpenseOption
                        {
                            Id = Guid.NewGuid(),
                            Name = optionName,
                            ExpenseCategoryId = travelCategory.Id,
                            IsActive = true
                        });
                        expenseOptionsCreated++;
                    }
                }
            }

            // Seed CPC codes
            var cpcCodeSeeds = new[]
            {
                new CpcCodeSeed("CPC100", "General Operations"),
                new CpcCodeSeed("CPC200", "IT Services"),
                new CpcCodeSeed("CPC300", "Sales and Marketing"),
                new CpcCodeSeed("CPC400", "Research and Development"),
                new CpcCodeSeed("CPC500", "Customer Support")
            };

            foreach (var seed in cpcCodeSeeds)
            {
                var existing = await _db.Set<CpcCode>().FirstOrDefaultAsync(c => c.Code == seed.Code, ct);
                if (existing == null)
                {
                    _db.Set<CpcCode>().Add(new CpcCode
                    {
                        Code = seed.Code,
                        Description = seed.Description
                    });
                    cpcCodesCreated++;
                }
            }

            // Seed director codes
            var directorCodeSeeds = new[]
            {
                new DirectorCodeSeed("DIR001", "Engineering Director"),
                new DirectorCodeSeed("DIR002", "Operations Director"),
                new DirectorCodeSeed("DIR003", "Product Director"),
                new DirectorCodeSeed("DIR004", "Finance Director")
            };

            foreach (var seed in directorCodeSeeds)
            {
                var existing = await _db.Set<DirectorCode>().FirstOrDefaultAsync(c => c.Code == seed.Code, ct);
                if (existing == null)
                {
                    _db.Set<DirectorCode>().Add(new DirectorCode
                    {
                        Code = seed.Code,
                        Description = seed.Description
                    });
                    directorCodesCreated++;
                }
            }

            // Seed reason codes
            var reasonCodeSeeds = new[]
            {
                new ReasonCodeSeed("MAINT", "System Maintenance"),
                new ReasonCodeSeed("UPGRADE", "System Upgrade"),
                new ReasonCodeSeed("SUPPORT", "Customer Support"),
                new ReasonCodeSeed("TRAINING", "Staff Training"),
                new ReasonCodeSeed("MEETING", "Business Meeting")
            };

            foreach (var seed in reasonCodeSeeds)
            {
                var existing = await _db.Set<ReasonCode>().FirstOrDefaultAsync(c => c.Code == seed.Code, ct);
                if (existing == null)
                {
                    _db.Set<ReasonCode>().Add(new ReasonCode
                    {
                        Code = seed.Code,
                        Description = seed.Description
                    });
                    reasonCodesCreated++;
                }
            }

            // Seed unions
            var unionSeeds = new[]
            {
                new UnionSeed(1, "IBEW Local 2085"),
                new UnionSeed(2, "CUPE Local 500"),
                new UnionSeed(3, "Non-Union")
            };

            foreach (var seed in unionSeeds)
            {
                var existing = await _db.Set<Union>().FirstOrDefaultAsync(u => u.Id == seed.Id, ct);
                if (existing == null)
                {
                    _db.Set<Union>().Add(new Union
                    {
                        Id = seed.Id,
                        Name = seed.Name
                    });
                    unionsCreated++;
                }
            }

            // Seed activity categories
            var activityCategorySeeds = new[]
            {
                new ActivityCategorySeed("Development"),
                new ActivityCategorySeed("Testing"),
                new ActivityCategorySeed("Documentation"),
                new ActivityCategorySeed("Planning"),
                new ActivityCategorySeed("Support")
            };

            foreach (var seed in activityCategorySeeds)
            {
                var existing = await _db.Set<ActivityCategory>().FirstOrDefaultAsync(ac => ac.Name == seed.Name, ct);
                if (existing == null)
                {
                    _db.Set<ActivityCategory>().Add(new ActivityCategory
                    {
                        Id = 0, // Auto-increment
                        Name = seed.Name
                    });
                    activityCategoriesCreated++;
                }
            }

            // Seed calendar categories
            var calendarCategorySeeds = new[]
            {
                new CalendarCategorySeed("Holiday", "Statutory holidays"),
                new CalendarCategorySeed("Company Event", "Company-wide events"),
                new CalendarCategorySeed("Maintenance Window", "Scheduled maintenance periods"),
                new CalendarCategorySeed("Training Day", "Scheduled training days")
            };

            foreach (var seed in calendarCategorySeeds)
            {
                var existing = await _db.Set<CalendarCategory>().FirstOrDefaultAsync(cc => cc.Name == seed.Name, ct);
                if (existing == null)
                {
                    _db.Set<CalendarCategory>().Add(new CalendarCategory
                    {
                        Id = 0, // Auto-increment
                        Name = seed.Name,
                        Description = seed.Description
                    });
                    calendarCategoriesCreated++;
                }
            }

            await _db.SaveChangesAsync(ct);

            // Get reference data for work items
            var users = await _db.Users.ToListAsync(ct);
            var projects = await _db.Projects.ToListAsync(ct);
            var budgets = await _db.Budgets.ToListAsync(ct);
            var activityCodes = await _db.ActivityCodes.ToListAsync(ct);
            var networkNumbers = await _db.NetworkNumbers.ToListAsync(ct);

            // Create project activity options (link projects to activity codes and network numbers)
            foreach (var project in projects.Take(3)) // Just first 3 projects
            {
                foreach (var activityCode in activityCodes.Take(5)) // First 5 activity codes
                {
                    foreach (var networkNumber in networkNumbers.Take(3)) // First 3 network numbers
                    {
                        var existing = await _db.ProjectActivityOptions.FirstOrDefaultAsync(
                            pao => pao.ProjectId == project.Id && pao.ActivityCodeId == activityCode.Id && pao.NetworkNumberId == networkNumber.Id, ct);
                        
                        if (existing == null)
                        {
                            _db.ProjectActivityOptions.Add(new ProjectActivityOption
                            {
                                ProjectId = project.Id,
                                ActivityCodeId = activityCode.Id,
                                NetworkNumberId = networkNumber.Id
                            });
                            projectActivityOptionsCreated++;
                        }
                    }
                }
            }

            await _db.SaveChangesAsync(ct);

            // Seed work items with proper user associations
            if (users.Any() && projects.Any() && budgets.Any())
            {
                var capex = budgets.FirstOrDefault(b => b.Description == "CAPEX");
                var opex = budgets.FirstOrDefault(b => b.Description == "OPEX");

                // Create work items for each user
                foreach (var user in users)
                {
                    // Create 2-3 work items per user
                    var userProject = projects.FirstOrDefault();
                    var userActivityCode = activityCodes.FirstOrDefault();
                    var userNetworkNumber = networkNumbers.FirstOrDefault();

                    if (userProject != null && capex != null && userActivityCode != null && userNetworkNumber != null)
                    {
                        // Work item 1: Recent project work
                        var workItem1 = await _db.WorkItems.FirstOrDefaultAsync(
                            w => w.UserId == user.Id && w.Title.Contains("Development Sprint"), ct);
                        
                        if (workItem1 == null)
                        {
                            _db.WorkItems.Add(new WorkItem
                            {
                                Id = Guid.NewGuid(),
                                UserId = user.Id,
                                ProjectId = userProject.Id,
                                BudgetId = capex.Id,
                                Title = $"Development Sprint - Week {DateTime.Now.Day}",
                                Description = $"Working on development tasks for {userProject.Name}",
                                Date = DateTime.Now.AddDays(-2),
                                ActivityType = "Project",
                                ActivityCode = userActivityCode.Code,
                                NetworkNumber = userNetworkNumber.Number.ToString(),
                                PlannedDuration = TimeSpan.FromHours(8),
                                ActualDuration = 8,
                                EstimatedHours = 8.0m,
                                RemainingHours = 0.5m
                            });
                            workItemsCreated++;
                        }

                        // Work item 2: Meeting
                        var workItem2 = await _db.WorkItems.FirstOrDefaultAsync(
                            w => w.UserId == user.Id && w.Title.Contains("Team Meeting"), ct);
                        
                        if (workItem2 == null)
                        {
                            _db.WorkItems.Add(new WorkItem
                            {
                                Id = Guid.NewGuid(),
                                UserId = user.Id,
                                ProjectId = userProject.Id,
                                BudgetId = capex.Id,
                                Title = "Team Meeting - Sprint Planning",
                                Description = "Sprint planning and task assignments",
                                Date = DateTime.Now.AddDays(-1),
                                ActivityType = "Project",
                                ActivityCode = "MEET",
                                NetworkNumber = userNetworkNumber.Number.ToString(),
                                PlannedDuration = TimeSpan.FromHours(2),
                                ActualDuration = 2,
                                EstimatedHours = 2.0m,
                                RemainingHours = 0m
                            });
                            workItemsCreated++;
                        }

                        // Work item 3: Today's work
                        var workItem3 = await _db.WorkItems.FirstOrDefaultAsync(
                            w => w.UserId == user.Id && w.Date.HasValue && w.Date.Value.Date == DateTime.Now.Date, ct);
                        
                        if (workItem3 == null)
                        {
                            _db.WorkItems.Add(new WorkItem
                            {
                                Id = Guid.NewGuid(),
                                UserId = user.Id,
                                ProjectId = userProject.Id,
                                BudgetId = capex.Id,
                                Title = "Current Development Work",
                                Description = $"Active development on {userProject.Name}",
                                Date = DateTime.Now,
                                ActivityType = "Project",
                                ActivityCode = userActivityCode.Code,
                                NetworkNumber = userNetworkNumber.Number.ToString(),
                                PlannedDuration = TimeSpan.FromHours(8),
                                ActualDuration = 4,
                                EstimatedHours = 8.0m,
                                RemainingHours = 4.0m
                            });
                            workItemsCreated++;
                        }
                    }

                    // Add one expense activity per user
                    if (opex != null)
                    {
                        var directorCode = await _db.Set<DirectorCode>().FirstOrDefaultAsync(ct);
                        var reasonCode = await _db.Set<ReasonCode>().FirstOrDefaultAsync(ct);
                        var cpcCode = await _db.Set<CpcCode>().FirstOrDefaultAsync(ct);

                        if (directorCode != null && reasonCode != null && cpcCode != null)
                        {
                            var expenseItem = await _db.WorkItems.FirstOrDefaultAsync(
                                w => w.UserId == user.Id && w.ActivityType == "Expense", ct);
                            
                            if (expenseItem == null)
                            {
                                _db.WorkItems.Add(new WorkItem
                                {
                                    Id = Guid.NewGuid(),
                                    UserId = user.Id,
                                    BudgetId = opex.Id,
                                    Title = "Training Conference",
                                    Description = "Attended technical training conference",
                                    Date = DateTime.Now.AddDays(-5),
                                    ActivityType = "Expense",
                                    DirectorCode = directorCode.Code,
                                    ReasonCode = reasonCode.Code,
                                    CpcCode = cpcCode.Code,
                                    PlannedDuration = TimeSpan.FromHours(16),
                                    ActualDuration = 16,
                                    EstimatedHours = 16.0m,
                                    RemainingHours = 0m
                                });
                                workItemsCreated++;
                            }
                        }
                    }
                }
            }

            await _db.SaveChangesAsync(ct);

            // Seed calendar entries
            var holidayCategory = await _db.Set<CalendarCategory>().FirstOrDefaultAsync(cc => cc.Name == "Holiday", ct);
            var companyEventCategory = await _db.Set<CalendarCategory>().FirstOrDefaultAsync(cc => cc.Name == "Company Event", ct);

            if (holidayCategory != null)
            {
                // Add some holidays for current year
                var holidays = new[]
                {
                    new { Date = new DateTime(2026, 1, 1), CategoryId = holidayCategory.Id }, // New Year
                    new { Date = new DateTime(2026, 7, 1), CategoryId = holidayCategory.Id }, // Canada Day
                    new { Date = new DateTime(2026, 12, 25), CategoryId = holidayCategory.Id }, // Christmas
                    new { Date = new DateTime(2026, 12, 26), CategoryId = holidayCategory.Id }  // Boxing Day
                };

                foreach (var holiday in holidays)
                {
                    var existing = await _db.Set<CalendarEntry>().FirstOrDefaultAsync(ce => ce.Date == holiday.Date, ct);
                    if (existing == null)
                    {
                        _db.Set<CalendarEntry>().Add(new CalendarEntry
                        {
                            Date = holiday.Date,
                            CalendarCategoryId = holiday.CategoryId
                        });
                        calendarEntriesCreated++;
                    }
                }
            }

            if (companyEventCategory != null)
            {
                // Add a company event
                var eventDate = new DateTime(2026, 3, 15);
                var existing = await _db.Set<CalendarEntry>().FirstOrDefaultAsync(ce => ce.Date == eventDate, ct);
                if (existing == null)
                {
                    _db.Set<CalendarEntry>().Add(new CalendarEntry
                    {
                        Date = eventDate,
                        CalendarCategoryId = companyEventCategory.Id
                    });
                    calendarEntriesCreated++;
                }
            }

            await _db.SaveChangesAsync(ct);

            // Seed project assignments (assign users to projects)
            if (users.Any() && projects.Any())
            {
                // Assign first project to all users
                var firstProject = projects.First();
                foreach (var user in users)
                {
                    var existing = await _db.ProjectAssignments.FirstOrDefaultAsync(
                        pa => pa.ProjectId == firstProject.Id && pa.UserId == user.Id, ct);
                    
                    if (existing == null)
                    {
                        _db.ProjectAssignments.Add(new ProjectAssignment
                        {
                            ProjectId = firstProject.Id,
                            UserId = user.Id
                        });
                        projectAssignmentsCreated++;
                    }
                }

                // Assign second project to first two users if available
                if (projects.Count() > 1 && users.Count() >= 2)
                {
                    var secondProject = projects.Skip(1).First();
                    foreach (var user in users.Take(2))
                    {
                        var existing = await _db.ProjectAssignments.FirstOrDefaultAsync(
                            pa => pa.ProjectId == secondProject.Id && pa.UserId == user.Id, ct);
                        
                        if (existing == null)
                        {
                        _db.ProjectAssignments.Add(new ProjectAssignment
                        {
                            ProjectId = secondProject.Id,
                            UserId = user.Id
                        });
                        projectAssignmentsCreated++;
                        }
                    }
                }
            }

            await _db.SaveChangesAsync(ct);

            // Seed time entries for work items
            var allWorkItems = await _db.WorkItems.Include(w => w.User).ToListAsync(ct);
            foreach (var workItem in allWorkItems.Where(w => w.UserId != null).Take(10)) // Limit to first 10 for test data
            {
                // Add 1-2 time entries per work item
                var timeEntry1 = await _db.TimeEntries.FirstOrDefaultAsync(
                    te => te.WorkItemId == workItem.Id && te.Date == workItem.Date, ct);
                
                if (timeEntry1 == null && workItem.UserId.HasValue && workItem.Date.HasValue)
                {
                    _db.TimeEntries.Add(new TimeEntry
                    {
                        Id = Guid.NewGuid(),
                        WorkItemId = workItem.Id,
                        UserId = workItem.UserId.Value,
                        Date = new DateTimeOffset(workItem.Date.Value),
                        Hours = workItem.ActualDuration ?? 8,
                        Notes = $"Time logged for {workItem.Title}"
                    });
                    timeEntriesCreated++;
                }
            }

            await _db.SaveChangesAsync(ct);

            // Assign positions and departments to users
            if (users.Any())
            {
                var developerPosition = await _db.Positions.FirstOrDefaultAsync(p => p.Title == "Software Developer", ct);
                var seniorPosition = await _db.Positions.FirstOrDefaultAsync(p => p.Title == "Senior Developer", ct);
                var engineeringDept = await _db.Departments.FirstOrDefaultAsync(d => d.Name == "Engineering", ct);
                var ossDept = await _db.Departments.FirstOrDefaultAsync(d => d.Name == "OSS Operations", ct);

                if (developerPosition != null && engineeringDept != null)
                {
                    // Assign first user to developer position and engineering department
                    var firstUser = users.First();
                    if (!firstUser.PositionId.HasValue)
                    {
                        firstUser.PositionId = developerPosition.Id;
                        firstUser.DepartmentId = engineeringDept.Id;
                    }
                }

                if (seniorPosition != null && ossDept != null && users.Count() > 1)
                {
                    // Assign second user to senior position and OSS department
                    var secondUser = users.Skip(1).First();
                    if (!secondUser.PositionId.HasValue)
                    {
                        secondUser.PositionId = seniorPosition.Id;
                        secondUser.DepartmentId = ossDept.Id;
                    }
                }

                // Assign remaining users to available positions/departments
                if (developerPosition != null && engineeringDept != null)
                {
                    foreach (var user in users.Skip(2).Where(u => !u.PositionId.HasValue))
                    {
                        user.PositionId = developerPosition.Id;
                        user.DepartmentId = engineeringDept.Id;
                    }
                }
            }

            await _db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);

            return new TestSeedResult(
                usersCreated, 
                userAuthCreated, 
                projectsCreated, 
                departmentsCreated, 
                rolesCreated, 
                activityCodesCreated, 
                networkNumbersCreated, 
                budgetsCreated,
                positionsCreated,
                expenseCategoriesCreated,
                expenseOptionsCreated,
                cpcCodesCreated,
                directorCodesCreated,
                reasonCodesCreated,
                unionsCreated,
                activityCategoriesCreated,
                calendarCategoriesCreated,
                calendarEntriesCreated,
                projectAssignmentsCreated,
                timeEntriesCreated,
                workItemsCreated,
                projectActivityOptionsCreated
            );
        }

        private record UserSeed(int EmpId, string Username, string Email, string FirstName, string LastName, string? Password);
        private record UserAuthSeed(string UserName, int EmpId, string Password, bool UpdatePassword);
        private record RoleSeed(string Name, string? Description);
        private record ActivityCodeSeed(string Code, string? Description);
        private record NetworkNumberSeed(int Number, string? Description);
        private record DepartmentSeed(string Name, string ManagerName);
        private record BudgetSeed(string Description);
        private record ProjectSeed(string ProjectNo, string Name, string? Description);
        private record PositionSeed(string Title, string? Description);
        private record ExpenseCategorySeed(string Name, Guid BudgetId);
        private record CpcCodeSeed(string Code, string? Description);
        private record DirectorCodeSeed(string Code, string? Description);
        private record ReasonCodeSeed(string Code, string? Description);
        private record UnionSeed(int Id, string? Name);
        private record ActivityCategorySeed(string Name);
        private record CalendarCategorySeed(string Name, string? Description);
    }
}
