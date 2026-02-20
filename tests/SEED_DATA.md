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

Each user receives 4 work items with properly calculated estimated and remaining hours:

1. **Development Sprint - Week 20** (2 days ago)
   - Activity Type: Project
   - Planned: 8 hours
   - Actual: 8 hours
   - **Estimated: 10.0 hours**
   - **Remaining: 2.0 hours** (10.0 - 8 = 2.0)

2. **Team Meeting - Sprint Planning** (5 days ago)
   - Activity Type: Project
   - Planned: 2 hours
   - Actual: 2 hours
   - **Estimated: 2.0 hours**
   - **Remaining: 0.0 hours** (2.0 - 2 = 0, completed)

3. **Current Development Work** (Today)
   - Activity Type: Project
   - Planned: 8 hours
   - Actual: 6 hours
   - **Estimated: 10.0 hours**
   - **Remaining: 4.0 hours** (10.0 - 6 = 4.0)

4. **Training Conference** (5 days ago)
   - Activity Type: Expense
   - Planned: 16 hours
   - Actual: 16 hours
   - **Estimated: 16.0 hours**
   - **Remaining: 0.0 hours** (16.0 - 16 = 0, completed)

**User Isolation**: Each WorkItem has a UserId foreign key linking it to exactly one user. The Activity page filters WorkItems by the logged-in user's ID, ensuring users only see their own activities.

**Remaining Hours Calculation**: The system automatically calculates RemainingHours using the formula:
```
RemainingHours = EstimatedHours - ActualDuration
```

This calculation is applied:
- When creating new work items via the API
- When seeding test data
- Values cannot go negative (minimum is 0)

**Reporting Benefits**: 
- Directors can track project progress by monitoring remaining hours
- Activities with RemainingHours > 0 indicate incomplete work
- Activities with RemainingHours = 0 are completed
- Sum of RemainingHours across activities shows total work left on a project/network

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

6. **Remaining Hours Calculation**: The system automatically calculates remaining hours for project tracking and reporting.

## Remaining Hours Calculation Logic

### Overview

The DSC system automatically calculates `RemainingHours` for each work item to track progress and support director-level reporting on project status. This feature enables project managers and directors to monitor:

- How much work remains on specific activities
- Overall project completion status
- Resource allocation and planning
- Budget forecasting based on hours remaining

### Calculation Formula

```csharp
RemainingHours = EstimatedHours - ActualDuration
```

**Where**:
- `EstimatedHours`: The total estimated hours originally allocated to the work item (decimal)
- `ActualDuration`: The actual hours logged/worked on the activity (integer)
- `RemainingHours`: The calculated hours left to complete the work (decimal, minimum 0)

### Automatic Calculation

The calculation is automatically applied in the following scenarios:

1. **Creating Work Items** (via POST `/api/items`)
   - When a new work item is created, `RemainingHours` is calculated from `EstimatedHours` and `ActualDuration`
   - The client does NOT need to provide `RemainingHours` in the request
   - Example:
     ```json
     POST /api/items
     {
       "title": "Feature Development",
       "estimatedHours": 20.0,
       "actualDuration": 12
       // RemainingHours automatically set to 8.0
     }
     ```

2. **Seeding Test Data**
   - All seeded work items have properly calculated `RemainingHours`
   - Examples from seed data:
     - Development Sprint: 10.0 estimated - 8 actual = **2.0 remaining**
     - Current Work: 10.0 estimated - 6 actual = **4.0 remaining**
     - Meeting: 2.0 estimated - 2 actual = **0.0 remaining** (completed)

3. **Updating Work Items** (future enhancement)
   - When `ActualDuration` is updated, `RemainingHours` should be recalculated
   - When `EstimatedHours` changes, `RemainingHours` should be recalculated

### Business Rules

1. **Non-negative Values**: `RemainingHours` cannot go negative
   - If `ActualDuration` exceeds `EstimatedHours`, `RemainingHours` = 0
   - Example: Estimated 8 hours, Actual 10 hours → Remaining = 0 (over budget)

2. **Null Handling**: 
   - If `EstimatedHours` is null, `RemainingHours` is null
   - If `ActualDuration` is null, it's treated as 0

3. **Precision**: 
   - `EstimatedHours` is decimal (supports fractional hours like 1.5)
   - `ActualDuration` is integer (whole hours)
   - `RemainingHours` is decimal (allows precise tracking)

### Reporting Use Cases

#### 1. Project Status Dashboard
Query total remaining hours across all activities in a project:
```sql
SELECT 
    p.Name as Project,
    SUM(w.EstimatedHours) as TotalEstimated,
    SUM(w.ActualDuration) as TotalActual,
    SUM(w.RemainingHours) as TotalRemaining,
    (SUM(w.ActualDuration) / SUM(w.EstimatedHours) * 100) as PercentComplete
FROM WorkItems w
JOIN Projects p ON w.ProjectId = p.Id
WHERE w.ActivityType = 'Project'
GROUP BY p.Name;
```

#### 2. Network-Level Tracking
Track hours by network number for budget allocation:
```sql
SELECT 
    w.NetworkNumber,
    COUNT(*) as ActivityCount,
    SUM(w.RemainingHours) as HoursRemaining
FROM WorkItems w
WHERE w.ActivityType = 'Project'
  AND w.RemainingHours > 0
GROUP BY w.NetworkNumber
ORDER BY SUM(w.RemainingHours) DESC;
```

#### 3. User Workload Analysis
Identify users with heavy workloads:
```sql
SELECT 
    u.Username,
    COUNT(*) as ActiveActivities,
    SUM(w.RemainingHours) as TotalHoursRemaining
FROM WorkItems w
JOIN Users u ON w.UserId = u.Id
WHERE w.RemainingHours > 0
GROUP BY u.Username
ORDER BY SUM(w.RemainingHours) DESC;
```

#### 4. Activity Completion Status
List incomplete activities requiring attention:
```sql
SELECT 
    w.Title,
    u.Username,
    w.EstimatedHours,
    w.ActualDuration,
    w.RemainingHours,
    CASE 
        WHEN w.RemainingHours = 0 THEN 'Complete'
        WHEN w.RemainingHours > 0 AND w.RemainingHours <= 2 THEN 'Nearly Complete'
        ELSE 'In Progress'
    END as Status
FROM WorkItems w
JOIN Users u ON w.UserId = u.Id
WHERE w.ActivityType = 'Project'
ORDER BY w.RemainingHours DESC;
```

### API Response Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Current Development Work",
  "estimatedHours": 10.0,
  "actualDuration": 6,
  "remainingHours": 4.0,
  "activityType": "Project",
  "date": "2026-02-20T00:00:00Z"
}
```

### Future Enhancements

1. **Time Entry Integration**: Recalculate `RemainingHours` when `TimeEntry` records are added
   - Sum all `TimeEntry.Hours` for a WorkItem
   - `RemainingHours = EstimatedHours - SUM(TimeEntry.Hours)`

2. **Automatic Updates**: Add database trigger or application logic to recalculate on:
   - `UPDATE WorkItems SET ActualDuration = ...`
   - `UPDATE WorkItems SET EstimatedHours = ...`
   - `INSERT INTO TimeEntries ...`

3. **Warning Alerts**: Notify when:
   - `RemainingHours` approaches 0 but work isn't complete
   - `ActualDuration` exceeds `EstimatedHours` (over budget)

4. **Bulk Recalculation**: Admin endpoint to recalculate all `RemainingHours`:
   ```
   POST /api/admin/recalculate-remaining-hours
   ```

### Testing Remaining Hours

```csharp
[Fact]
public async Task CreateWorkItem_CalculatesRemainingHours()
{
    // Arrange
    var request = new WorkItemCreateRequest
    {
        Title = "Test Activity",
        EstimatedHours = 20.0m,
        ActualDuration = 12
    };
    
    // Act
    var response = await _controller.Post(request);
    var workItem = ExtractWorkItemFromResponse(response);
    
    // Assert
    Assert.Equal(20.0m, workItem.EstimatedHours);
    Assert.Equal(12, workItem.ActualDuration);
    Assert.Equal(8.0m, workItem.RemainingHours); // 20 - 12 = 8
}

[Fact]
public async Task RemainingHours_DoesNotGoNegative()
{
    // Arrange: Actual exceeds estimated (over budget scenario)
    var request = new WorkItemCreateRequest
    {
        Title = "Overran Activity",
        EstimatedHours = 8.0m,
        ActualDuration = 12
    };
    
    // Act
    var response = await _controller.Post(request);
    var workItem = ExtractWorkItemFromResponse(response);
    
    // Assert
    Assert.Equal(0m, workItem.RemainingHours); // Should be 0, not -4
}
```

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
