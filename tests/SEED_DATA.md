# Test Data Seeding Documentation

## Overview

The DSC API includes comprehensive test data seeding functionality to populate the database with realistic, interconnected data for development and testing purposes. The seeding is idempotent (safe to run multiple times) and creates a complete ecosystem of users, projects, activities, and catalog data.

## Seeding Endpoint

**POST** `/api/admin/seed/test-data`

**Headers**: `X-Admin-Token: local-admin-token` (development only)

**Response**: JSON object with counts of created entities

```json
{
  "usersCreated": 4,
  "userAuthCreated": 3,
  "projectsCreated": 8,
  "departmentsCreated": 4,
  "rolesCreated": 2,
  "activityCodesCreated": 12,
  "networkNumbersCreated": 12,
  "budgetsCreated": 2,
  "positionsCreated": 6,
  "expenseCategoriesCreated": 7,
  "expenseOptionsCreated": 4,
  "cpcCodesCreated": 5,
  "directorCodesCreated": 4,
  "reasonCodesCreated": 5,
  "unionsCreated": 3,
  "activityCategoriesCreated": 5,
  "calendarCategoriesCreated": 4,
  "calendarEntriesCreated": 5,
  "projectAssignmentsCreated": 6,
  "timeEntriesCreated": 10,
  "workItemsCreated": 16,
  "projectActivityOptionsCreated": 10
}
```

## Seed Data Details

### 1. Users (4 total)

| Username   | EmpId | Email                  | Name              | Password          |
|------------|-------|------------------------|-------------------|-------------------|
| rloisel1   | 1001  | ryan@example.com       | Ryan Loiselle     | test-password     |
| kduma      | 1002  | kristen@example.com    | Kristen Duma      | test-password     |
| dmcgregor  | 1003  | don@example.com        | Don McGregor      | test-password     |
| mammeter   | 1004  | mark@example.com       | Mark Ammeter      | test-password     |

**Notes**:
- All users have bcrypt-hashed passwords
- Each user is assigned a position and department via seeding
- User isolation is enforced at the WorkItem level (UserId foreign key)

### 2. Positions (6 total)

1. **Software Developer** - Entry-level development position
2. **Senior Developer** - Experienced development position
3. **Team Lead** - Technical leadership position
4. **Project Manager** - Project management position
5. **QA Analyst** - Quality assurance position
6. **Database Administrator** - Database management position

### 3. Departments (4 total)

1. **Engineering** (Manager: Alice Johnson)
2. **OSS Operations** (Manager: Bob Smith)
3. **GIS** (Manager: Carol Williams)
4. **Public Works** (Manager: David Brown)

### 4. Projects (8 total)

| Project No | Name                      | Description                           |
|------------|---------------------------|---------------------------------------|
| P00001     | Website Redesign          | Modernize public-facing website       |
| P00002     | Security Hardening        | Improve system security               |
| P00003     | Database Migration        | Migrate to new database platform      |
| P00004     | Mobile App Development    | Develop mobile app for field workers  |
| P00005     | Legacy System Integration | Integrate with legacy systems         |
| P00006     | API Modernization         | RESTful API development               |
| P00007     | Performance Optimization  | Optimize database queries             |
| P00008     | Documentation Update      | Update technical documentation        |

### 5. Budgets (2 total)

1. **CAPEX** - Capital expenditures
2. **OPEX** - Operating expenditures

### 6. Activity Codes (12 total)

Standard activity codes: DEV, TEST, MEET, DOC, TRAIN, PLAN, DEPLOY, REVIEW, RESEARCH, BUG, SUPPORT, ADMIN

### 7. Network Numbers (12 total)

Network identifiers: 1000-1011 (12 sequential network numbers)

### 8. Expense Categories (7 total, linked to budgets)

1. **Hardware** (CAPEX) - Computer hardware and peripherals
2. **Software** (CAPEX) - Software licenses and tools
3. **Travel** (OPEX) - Business travel expenses
4. **Training** (OPEX) - Professional development
5. **Cloud Services** (OPEX) - Cloud infrastructure
6. **Consulting** (OPEX) - External consulting services
7. **Maintenance** (OPEX) - Equipment maintenance

### 9. Expense Options (4 total, under Travel category)

1. **Airfare** - Flight costs
2. **Hotel** - Accommodation costs
3. **Meals** - Food expenses
4. **Ground Transportation** - Local transport costs

### 10. CPC Codes (5 total)

| Code   | Description                          |
|--------|--------------------------------------|
| CPC100 | General Operations                   |
| CPC200 | Infrastructure & Maintenance         |
| CPC300 | Development & Engineering            |
| CPC400 | Support & Training                   |
| CPC500 | Administrative & Planning            |

### 11. Director Codes (4 total)

| Code   | Description                    |
|--------|--------------------------------|
| DIR001 | Engineering Director Approval  |
| DIR002 | Operations Director Approval   |
| DIR003 | Finance Director Approval      |
| DIR004 | Executive Director Approval    |

### 12. Reason Codes (5 total)

| Code     | Description                      |
|----------|----------------------------------|
| MAINT    | Equipment Maintenance            |
| UPGRADE  | System Upgrade                   |
| SUPPORT  | Technical Support                |
| TRAINING | Staff Training & Development     |
| MEETING  | Business Meeting & Conference    |

### 13. Unions (3 total)

1. **IBEW Local 2085** (Id: 1)
2. **CUPE Local 500** (Id: 2)
3. **Non-Union** (Id: 3)

### 14. Activity Categories (5 total)

1. **Development** - Software development work
2. **Testing** - Quality assurance and testing
3. **Documentation** - Writing documentation
4. **Planning** - Project planning and estimation
5. **Support** - User support and troubleshooting

### 15. Calendar Categories (4 total)

1. **Holiday** - Statutory holidays
2. **Company Event** - Company-wide events
3. **Maintenance Window** - Scheduled maintenance
4. **Training Day** - Training events

### 16. Calendar Entries (5 total, for year 2026)

- **2026-01-01** (Holiday) - New Year's Day
- **2026-03-15** (Company Event) - Company event
- **2026-07-01** (Holiday) - Canada Day
- **2026-12-25** (Holiday) - Christmas Day
- **2026-12-26** (Holiday) - Boxing Day

### 17. Work Items (16 total, 4 per user)

Each user receives 4 work items:

1. **Development Sprint - Week 20** (2 days ago)
   - Activity Type: Project
   - Planned: 8 hours
   - Actual: 8 hours
   - Estimated: 8.0 hours

2. **Team Meeting - Sprint Planning** (5 days ago)
   - Activity Type: Project
   - Planned: 2 hours
   - Actual: 2 hours
   - Estimated: 2.0 hours

3. **Current Development Work** (Today)
   - Activity Type: Project
   - Planned: 8 hours
   - Actual: 6 hours
   - Estimated: 8.0 hours

4. **Training Conference** (10 days ago)
   - Activity Type: Expense
   - Planned: 8 hours
   - Actual: 8 hours
   - Estimated: 8.0 hours
   - Expense Category: Training

**User Isolation**: Each WorkItem has a UserId foreign key linking it to exactly one user. The Activity page filters WorkItems by the logged-in user's ID, ensuring users only see their own activities.

### 18. Project Assignments (6 total)

All users are assigned to "Security Hardening" project, with additional assignments:

| User      | Projects Assigned                        |
|-----------|------------------------------------------|
| rloisel1  | Security Hardening, Database Migration   |
| kduma     | Security Hardening                       |
| dmcgregor | Security Hardening                       |
| mammeter  | Security Hardening, Database Migration   |

### 19. Time Entries (10 total)

Time tracking entries are created for the first 10 WorkItems. Each entry includes:
- WorkItemId (foreign key)
- UserId (foreign key)
- Date (matches WorkItem.Date)
- Hours (matches WorkItem.ActualDuration)
- Notes (description of work logged)

### 20. Project Activity Options (10 total)

Cross-reference table linking projects to valid activity code and network number combinations. First 3 projects are linked to first 5 activity codes and first 3 network numbers.

## Seeding Implementation

### Location

**File**: `src/DSC.Api/Seeding/TestDataSeeder.cs`

### Key Features

1. **Idempotent Design**
   - Uses `FirstOrDefaultAsync` checks before inserting
   - Safe to run multiple times without creating duplicates
   - Transaction-based for atomicity

2. **Referential Integrity**
   - Respects foreign key relationships
   - Creates parent entities before children
   - Links entities through proper foreign keys

3. **Realistic Data**
   - Mimics production data patterns
   - Includes temporal data (past, current, future dates)
   - Interconnected relationships (users → projects → work items)

4. **Type Safety**
   - Uses proper .NET types (DateTime, TimeSpan, Guid, etc.)
   - Password hashing with bcrypt (IPasswordHasher<User>)
   - Handles nullable types appropriately

## Usage in Tests

### Example: Testing User Isolation

```csharp
[Fact]
public async Task GetWorkItems_FiltersToUserOnly()
{
    // Arrange: Seed data creates 4 users with 4 work items each
    await SeedTestData();
    var user1Id = await GetUserIdByUsername("rloisel1");
    
    // Act: Get work items for user1
    var items = await _workItemService.GetUserWorkItems(user1Id);
    
    // Assert: Should only see user1's 4 work items
    Assert.Equal(4, items.Count);
    Assert.All(items, item => Assert.Equal(user1Id, item.UserId));
}
```

### Example: Testing Project Assignments

```csharp
[Fact]
public async Task GetUserProjects_ReturnsAssignedProjects()
{
    // Arrange: Seed creates project assignments
    await SeedTestData();
    var rloiselId = await GetUserIdByUsername("rloisel1");
    
    // Act: Get projects for rloisel1
    var projects = await _projectService.GetUserProjects(rloiselId);
    
    // Assert: Should have 2 assigned projects
    Assert.Equal(2, projects.Count);
    Assert.Contains(projects, p => p.Name == "Security Hardening");
    Assert.Contains(projects, p => p.Name == "Database Migration");
}
```

### Example: Testing Time Tracking

```csharp
[Fact]
public async Task TimeEntries_LinkedToWorkItems()
{
    // Arrange: Seed creates 10 time entries for first 10 work items
    await SeedTestData();
    
    // Act: Get all time entries
    var entries = await _timeEntryRepository.GetAll();
    
    // Assert: Each entry should link to a work item
    Assert.Equal(10, entries.Count);
    Assert.All(entries, entry => 
    {
        Assert.NotNull(entry.WorkItem);
        Assert.NotNull(entry.User);
        Assert.Equal(entry.WorkItem.UserId, entry.UserId);
    });
}
```

## Database Reset & Re-seed

### Development Environment

```bash
# 1. Drop and recreate database
mysql --socket=/tmp/mysql.sock -uroot -proot_local_pass --skip-ssl \
  -e "DROP DATABASE IF EXISTS dsc_dev; CREATE DATABASE dsc_dev;"

# 2. Start API (auto-applies migrations)
cd src/DSC.Api && dotnet run

# 3. Call seed endpoint
curl -X POST http://localhost:5115/api/admin/seed/test-data \
  -H "X-Admin-Token: local-admin-token"
```

### Verification Queries

```sql
-- Check user work item counts (should be 4 each)
SELECT u.Username, COUNT(w.Id) as WorkItemCount 
FROM Users u 
LEFT JOIN WorkItems w ON u.Id = w.UserId 
GROUP BY u.Username;

-- Check project assignments
SELECT u.Username, p.Name as Project 
FROM ProjectAssignments pa 
JOIN Users u ON pa.UserId = u.Id 
JOIN Projects p ON pa.ProjectId = p.Id;

-- Check time entries
SELECT COUNT(*) as TimeEntryCount FROM TimeEntries;

-- Check calendar entries
SELECT c.Date, cc.categoryName as Category 
FROM Calendar c 
JOIN Calendar_Category cc ON c.CalendarCategoryId = cc.Id;
```

## Key Data Relationships

```
Users (4)
  └─ WorkItems (16, 4 per user) [USER ISOLATION]
      └─ TimeEntries (10, linked to work items)
  └─ ProjectAssignments (6)
      └─ Projects (8)
          └─ ProjectActivityOptions (10)
              ├─ ActivityCodes (12)
              └─ NetworkNumbers (12)

Budgets (2: CAPEX, OPEX)
  └─ ExpenseCategories (7)
      └─ ExpenseOptions (4, under Travel)
      └─ WorkItems (expense activities)

Calendar
  └─ CalendarCategory (4: Holiday, Event, Maintenance, Training)
      └─ CalendarEntry (5: holidays and events for 2026)
```

## Important Notes

1. **User Isolation**: WorkItems have a required UserId foreign key. The Activity page filters by this to ensure users only see their own work.

2. **Password Security**: All user passwords are hashed using bcrypt. Default test password is `test-password` for all users.

3. **Temporal Data**: WorkItems have dates ranging from 10 days ago to today, allowing time-based filtering tests.

4. **Referential Integrity**: All foreign keys are properly set. If a parent entity is missing, the child entity seeding is skipped.

5. **Development Only**: The admin seed endpoint requires an admin token and should NEVER be exposed in production.

## Troubleshooting

### Issue: "Table already exists" errors
**Solution**: Database was not fully reset. Drop and recreate the database before starting the API.

### Issue: "Pending changes" migration warning
**Solution**: The API uses `EnsureCreated()` in development mode. This bypasses migrations but ensures the database schema matches the model.

### Issue: Seed endpoint returns 0 for all counts
**Solution**: Data already exists. The seeder is idempotent and won't create duplicates. Drop and recreate the database to re-seed.

### Issue: WorkItems showing for all users
**Solution**: Check that WorkItem.UserId is populated and the Activity page is filtering by `user?.Id`.

## Future Enhancements

1. **Configurable Seed Data**: Allow configuration of user count, work items per user, date ranges
2. **Realistic Names**: Use a name generator library for more varied test data
3. **Integration Test Suite**: Full test suite using seed data as baseline
4. **Performance Seed**: Larger dataset for performance testing (1000s of work items)
5. **Scenario-Based Seeding**: Different seed profiles (light, medium, heavy load)
