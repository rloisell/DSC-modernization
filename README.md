## Authentication System  — 2026-02-21 ✅ NEW

### User-Based Authentication Implemented
- ✅ **Backend**: UserIdAuthenticationHandler reads X-User-Id header from requests
  - Validates user exists in database
  - Sets ClaimsPrincipal for role-based access control
  - Enables ProjectsController to filter projects by user role and assignments
- ✅ **Frontend**: AuthConfig.js utility centralizes authentication header management
  - Reads user ID from localStorage (stored during login)
  - Adds X-User-Id header to all API requests
  - Single source of truth for auth configuration
- ✅ **API Services**: All services updated to use AuthConfig
  - ProjectService.js - for project list
  - CatalogService.js - for activity codes, network numbers, budgets
  - WorkItemService.js - for work item CRUD operations
- ✅ **Result**: All API endpoints now have proper authentication context
  - Projects endpoint returns only user's assigned projects (for Users)
  - Projects endpoint returns all projects (for Admin/Manager)
  - Form dropdowns populate correctly with user data

### Authentication Flow
```
Frontend Login → Store user {id, username, role} in localStorage
         ↓
API Request → AuthConfig reads user.id, adds X-User-Id header
         ↓
UserIdAuthenticationHandler → Validates user, sets up claims
         ↓
Controller → User.FindFirst(NameIdentifier) returns validated userId
         ↓
Role-based filtering applied (Admin sees all, User sees assigned)
```

**Files Modified**:
- `src/DSC.Api/Security/UserIdAuthenticationHandler.cs` (NEW)
- `src/DSC.Api/Program.cs` (registered UserId auth scheme)
- `src/DSC.WebClient/src/api/AuthConfig.js` (NEW utility)
- `src/DSC.WebClient/src/api/ProjectService.js` (updated)
- `src/DSC.WebClient/src/api/CatalogService.js` (updated)
- `src/DSC.WebClient/src/api/WorkItemService.js` (updated)

---

## Recent Fixes & Data Improvements — 2026-02-21 ✅ NEW

### Expense Activity Form Fixed
- ✅ **Issue**: Expense activities incorrectly showed a "Remaining Hours" calculated field
- ✅ **Fix**: Removed the calculated remaining hours field from expense activities
- ✅ **Why**: Expense activities are cost-tracked, not hour-tracked like project budgets
  - Project activities: Hour-budget tracking with cumulative remaining calculation
  - Expense activities: Cost tracking, estimated hours are optional user entries (no budget calculation)
- ✅ **Result**: Cleaner form with only "Estimated Hours (Optional)" for expense activities

### Seed Data Significantly Expanded
- ✅ **Previous**: 4 work items per user (3 project + 1 expense)
- ✅ **Current**: 10+ work items per user across multiple projects
- ✅ **New Structure**:
  - **Primary Project**: 6 activities showing real-world workload:
    - Development Sprint: 8 hrs actual ÷ 10 estimated = 2 hrs remaining ✓
    - Team Meeting: 2 hrs actual ÷ 2 estimated = 0 hrs remaining ✓
    - Current Development: 6 hrs actual ÷ 10 estimated = 4 hrs remaining ✓
    - Code Review & Testing: 5 hrs actual ÷ 6 estimated = 1 hr remaining ✓
    - Documentation: 4 hrs actual ÷ 4 estimated = 0 hrs remaining ✓
    - Integration Testing: **12 hrs actual ÷ 8 estimated = -4 hrs remaining ⚠️ OVERBUDGET**
  - **Secondary Projects**: 1 activity each showing multi-project workload
  - **Expense Activity**: 1 per user for expense tracking validation
- ✅ **Benefits**:
  - Real-world testing of overbudget scenarios
  - Can validate Project Summary with multiple projects
  - Can test negative remaining hours appearing in red with ⚠ OVERBUDGET label
  - Can verify cumulative calculations across multiple activities on same project

**Files Modified**:
- `src/DSC.WebClient/src/pages/Activity.jsx` (removed expense remaining hours field)
- `src/DSC.Api/Seeding/TestDataSeeder.cs` (expanded work items data)

**Build Status**: ✅ Success (0 errors, 7 nullable warnings)

---

## Feature Branch Consolidation — 2026-02-20 ✅

**All feature branches successfully merged to main**:

1. ✅ **Complete Catalog System Integration**:
   - CPC Codes, Director Codes, Reason Codes - for expense activity routing
   - Union catalog - legacy union classifications
   - Activity Categories - activity classification system
   - Calendar Categories - calendar event categorization
   - All legacy junction tables mapped (DepartmentUser, UserPosition, UserUser, ProjectActivity, ExpenseActivity)

2. ✅ **New API Endpoints** (all verified working):
   - `/api/catalog/cpc-codes` - CPC code lookup
   - `/api/catalog/director-codes` - Director code lookup  
   - `/api/catalog/reason-codes` - Reason code lookup
   - `/api/admin/unions` - Union management
   - `/api/admin/activity-categories` - Activity category management
   - `/api/admin/calendar-categories` - Calendar category management

3. ✅ **Build & Deployment Status**:
   - All merge conflicts resolved (ApplicationDbContext, DTOs, frontend services)
   - Removed duplicate DTO definitions (UnionDto)
   - Added missing DTOs (CpcCodeDto, ActivityCategoryDto, CalendarCategoryDto)
   - Build succeeds with 0 errors
   - API server running with all features functional on port 5115
   - All changes pushed to GitHub

4. ✅ **Models Integrated**:
   - ActivityCategory, CalendarCategory, CalendarEntry
   - CpcCode, DirectorCode, ReasonCode, Union
   - DepartmentUser, UserPosition, UserUser (legacy junction tables)
   - ProjectActivity, ExpenseActivity (legacy activity mappings)

**Git commits**: 444c9fd through 5e9db61 (7 commits total: 6 merges + 1 build fix)

**Next steps**:
- Add seed data for new catalog entities
- Create admin UI pages for Activity Categories and Calendar Categories
- Comprehensive end-to-end testing of all merged features

---

## Unit Testing — 2026-02-21 ✅ NEW

**16 unit tests implemented and passing**:
- ✅ Test data seeding validation (9 tests): validates TestDataSeeder creates correct activity codes, network numbers, and marks them as active
- ✅ API endpoint tests (4 tests): validates CatalogController and ItemsController endpoints return expected data
- ✅ Integration tests (1 test): validates complete data pipeline from seeding to frontend data binding
- ✅ Framework: xUnit with Entity Framework Core InMemory database (isolated, no external database required)
- ✅ Execution time: ~1 second for all tests

**How to run**:
```bash
# Run all tests
dotnet test tests/DSC.Tests/DSC.Tests.csproj

# Run Activity page tests only
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "ActivityPageTests"

# Run with verbose output
dotnet test tests/DSC.Tests/DSC.Tests.csproj --verbosity detailed
```

See [tests/howto.md](tests/howto.md) for comprehensive testing documentation, infrastructure details, and how to add new tests.

## Projects Page — 2026-02-20 (UPDATED)

**What's working:**
- ✅ **Interactive Projects Table**: Displays all projects in a tabular format with columns:
  - Project No (legacy identifier from Java system)
  - Name (primary project identifier)
  - Description (project details)
  - **Estimated Hours** (NEW) - Shows project time estimates for planning
- ✅ **Clickable Project Rows**: Click any project row to view its activity options
- ✅ **Visual Feedback**: Selected project highlighted; hover effects on all rows
- ✅ **Project Activity Options Viewer** (NEW):
  - When project is selected, displays all valid activity code + network number pairs
  - Shows full descriptions for codes and numbers
  - Helps users understand what options are available before creating work items
  - Empty state message directs users to contact admin if no options assigned
- ✅ **Admin-Only Project Creation**: "Add Project" form removed from user page (now in Admin Projects only)

**How to use:**
1. Navigate to Projects page
2. Browse projects in the table (view name, description, estimated hours)
3. Click any project row to see its activity options
4. Review valid activity code + network number combinations
5. Use this information when creating work items on the Activity page

**For Admins:**
- To create new projects: Use Admin Projects page
- To assign activity options: Use "Assign All Options" button in Admin Projects
- To manage individual assignments: Use Project Activity Options table in Admin Projects

## Activity Page — 2026-02-21 (UPDATED)

**What's working:**
- ✅ **Project Summary Table** (NEW 2026-02-21):
  - Displays cumulative budget status for all projects in your activity list
  - Shows for each project: Estimated Hours, Actual Hours Used, Cumulative Remaining
  - Cumulative Remaining = Sum of ALL your activities on that project vs project estimated hours
  - Can show negative values (indicates overbudget on that project)
  - Visual warning: Red background with ⚠ OVERBUDGET label for projects running over budget
  - Automatically loads and updates as you add new activities
  - Example: Project P1004 has 10 estimated hours, you have 4 activities of 6 hours each = 24 actual hours = -14 hours remaining (overbudget by 14 hours)

- ✅ **Activity Tracking Table** (2026-02-21):
  - Comprehensive table showing all user activities with time period filtering
  - Time period options: Today, This Week, This Month, This Year, All Time
  - Displays: Project, Title, Activity Code, Network, Date, Estimated Hours, Actual Hours, Remaining Hours
  - Remaining hours calculated as: `projectEstimatedHours - actualDuration` (per activity)
  - Auto-refreshes when time period changes or new work item is created
  - Empty state message when no activities found for selected period
  - Uses new `/api/items/detailed?period={period}` endpoint
- ✅ **Fixed 405 Error**: Added `ItemsController.GetAll()` endpoint to list work items (was missing, caused page error)
- ✅ **Project Dropdown**: Loads all projects from database with "ProjectNo — Name" format
- ✅ **Activity Code Dropdown**: Selects from 6 test codes (DEV, TEST, DOC, ADMIN, MEET, TRAIN)
- ✅ **Network Number Dropdown**: Selects from 6 test numbers (101, 102, 103, 201, 202, 203)
- ✅ **Budget Classification (CAPEX/OPEX)** (NEW 2026-02-21):
  - Activity create form requires a budget selection
  - Activity table displays the budget classification for each work item
  - Uses `/api/catalog/budgets` for lookup
- ✅ **Project vs Expense Activity Split** (NEW 2026-02-20):
  - Budget selection toggles project fields vs expense fields
  - Project budgets require Project/Activity Code/Network Number
  - Expense budgets require Director/Reason/CPC codes
  - Budget dropdown labels show the budget description and type
- ✅ **Project Hour Estimates in Form** (NEW 2026-02-21):
  - **Project Activities** show 3 disabled fields:
    - "Project Estimated Hours" - total hours available for the project (from database)
    - "Current Cumulative Remaining" - sum of all your hours spent on that project  
    - "Projected Remaining After Entry" - updates dynamically as you enter actual hours
    - Example: P1004 with 10 estimated hours where you've used 24 = Est: 10, Current: -14, Projected (after entering 5 more): -19
  - **Expense Activities** show 1 field:
    - "Estimated Hours (Optional)" - user can optionally enter estimated hours
    - No remaining hours calculation for expenses (cost-tracked, not hour-budgeted)
- ✅ **Catalog Service**: New public `/api/catalog` endpoints for activity codes and network numbers
- ✅ **Expense Catalogs**: Director/Reason/CPC codes exposed via `/api/catalog/director-codes`, `/api/catalog/reason-codes`, `/api/catalog/cpc-codes`
- ✅ **Test Data Seeding**: Activity Codes and Network Numbers automatically seeded with test data
- ✅ **Legacy Activity ID**: Optional integer field for backward compatibility with Java system Activity IDs
- ✅ **Project-Specific Filtering** (NEW 2026-02-21):
  - Activity code and network number dropdowns now filter based on selected project
  - Only shows valid activity code + network number pairs assigned to the project via `ProjectActivityOption` table
  - Bidirectional conditional filtering: selecting code filters compatible numbers (and vice versa)
  - Dropdowns disabled until project is selected
  - Auto-clears invalid selections when project changes
  - Uses new `/api/catalog/project-options/{projectId}` endpoint for filtered data
- ✅ **Available Options Table** (NEW 2026-02-21):
  - When a project is selected, displays a table showing all valid activity code + network number pairs
  - Shows full descriptions for codes and numbers
  - Helps users understand what combinations are available before creating work items
- ✅ **Expanded Test Data** (NEW 2026-02-21):
  - Each user now has 10+ work items across multiple projects
  - Primary project: 6 activities including one overbudget item (-4 hours)
  - Secondary projects: 1 activity each for multi-project workload testing
  - Realistic scenarios for validating cumulative hours and overbudget warnings

**What Legacy Activity ID is:**
- **Source**: Original Java Activity.activityID field from legacy DSC system
- **Type**: int? (nullable integer)
- **Purpose**: Preserve traceability when migrating historical Activity records from Java to .NET
- **When Used**: Populate this field during legacy data migration; leave empty for new items created in .NET
- **Example**: Java Activity with ID=12345 → .NET WorkItem with LegacyActivityId=12345
- **Benefit**: Allows both systems to run in parallel with links between old and new records

**How to test cumulative remaining hours**:
1. Start API: `cd src/DSC.Api && dotnet run`
2. Seed test data: `curl -X POST http://localhost:5005/api/admin/seed/test-data -H "X-Admin-Token: local-admin-token"`
   - Should return counts including work items created across multiple projects
3. Start WebClient: `cd src/DSC.WebClient && npm run dev`
4. Navigate to Activity page and verify:
   - Project Summary shows all projects with cumulative hours
   - Projects with overbudget (negative remaining) show red background + ⚠ OVERBUDGET
   - Form fields populate when selecting a project
   - Projected remaining updates dynamically as you enter actual duration

4. Navigate to Activity page and test cumulative hours:
   - Verify Project Summary table shows all projects with cumulative hours
   - Verify projects with negative remaining hours show red background + ⚠ OVERBUDGET
   - Select a project in the form
   - Verify form shows: Project Estimated Hours, Current Cumulative Remaining, Projected Remaining After Entry
   - Enter an actual duration value
   - Verify Projected Remaining updates dynamically (current remaining - your entered hours)
   - Submit and verify new activity appears in list and updates project summary

**Troubleshooting**:
- If form fields are blank: Open browser DevTools (Cmd+Option+I), go to Console tab, select a project, and check for "Remaining hours data" log message
- If API error shown: Check the error message in console (shows HTTP status and error details)
- If projected remaining not calculating: Make sure you're entering a valid number in the "Actual Duration" field

## Next Steps & Priorities (2026-02-21)

### 🔴 HIGH PRIORITY — Next Features to Build

1. **Create AdminProjectAssignments.jsx UI Page**
   - Purpose: Manage user-to-project role assignments and estimated hours
   - Endpoints available: `/api/admin-project-assignments` (GET, POST, PUT, DELETE) 
   - Features needed: List all assignments, filter by project/user, create/edit/delete assignments
   - Business logic: Users assigned to projects have access to those projects on Activity page
   - Test data ready: Run migrations and seed data includes assignments from TestDataSeeder

2. **Run Database Migration**
   - Command: `dotnet ef database update --project src/DSC.Data --startup-project src/DSC.Api`
   - Applies: `AddEstimatedHoursToProjectAssignment` migration
   - Adds EstimatedHours column to ProjectAssignments table for per-user estimated hours

3. **Role-Based Filtering Testing**
   - Login as kduma (User role) → should see only P1001, P1002
   - Login as dmcgregor (Manager role) → should see all projects
   - Login as rloisel1 (Admin role) → should see all projects
   - Verify role-based project visibility working correctly

4. **Add Unit Tests for Filtering Logic**
   - Test ProjectsController GetAll with different user roles
   - Test that User role returns only assigned projects
   - Test that Admin/Manager/Director return all projects
   - Test permission checks on AdminProjectAssignmentsController

5. **Admin Project Assignment Search/Filter UI**
   - Add search by project name or number
   - Add filter by user name  
   - Add filter by role
   - Display results in table with sorting capabilities
   - Show "no results" message when search returns empty

---

## Admin Management — 2026-02-21 (UPDATED)

### Admin Users Page (UPDATED 2026-02-20)
- **Enhanced Users Table**: Displays comprehensive user information in an easy-to-read format
  - Columns: Employee ID, Name, Email, LAN ID, Role, Position, Department
  - Shows actual role, position, and department names (not just IDs)
  - Placeholder "—" for unassigned or empty values
- **Interactive User Selection**: Click any user row to edit their information
  - Visual feedback: selected row highlighted, hover effects
  - Works alongside dropdown selector for flexibility
  - Consistent UX with Projects page table interactions
- **User Management Features**:
  - Create new users with role, position, and department assignments
  - Edit existing users (update details, change assignments)
  - Delete users with confirmation
  - Password management for local accounts

### Project Activity Options Assignment (NEW 2026-02-21)
- **Feature**: Bulk assignment of activity codes and network numbers to projects
- **How it works**:
  - "Assign All Options" button on AdminProjects page for each project
  - Creates all combinations (activity codes × network numbers) for the selected project
  - Stores assignments in `ProjectActivityOption` junction table
  - Used by Activity page to filter dropdowns based on selected project
  - Example: 12 activity codes × 12 network numbers = 144 assignments per project
  - API endpoint: `POST /api/admin/project-activity-options/assign-all`
  - Returns count of new assignments created (skips duplicates)

### Project Activity Options Table (NEW 2026-02-21)
- **Feature**: View and manage all project activity option assignments
- **Location**: AdminProjects page, below the assignment form
- **What it shows**:
  - Complete table of all project activity option assignments across all projects
  - Displays: Project name (with ProjectNo), Activity Code (with description), Network Number (with description)
  - Delete button for each assignment to remove specific combinations
- **API endpoints**:
  - `GET /api/admin/project-activity-options` - retrieves all assignments with nested objects
  - `DELETE /api/admin/project-activity-options?projectId={guid}&activityCodeId={guid}&networkNumberId={guid}` - removes specific assignment
- **Use cases**:
  - Audit what activity codes and network numbers are available for each project
  - Remove incorrect or obsolete assignments
  - Verify bulk assignments were created correctly

### Unions Catalog (NEW 2026-02-20)
- **Feature**: Admin management for legacy `Union` catalog entries
- **API endpoint**: `GET/POST/PUT /api/admin/unions`
- **Use case**: Maintain union entries referenced by legacy position data

### Manager Field Bug Fix in AdminDepartments
- **Fixed**: Manager field is now a user selection dropdown (was plain text input)
- **How it works**: 
  - Dropdown loads all active users from system
  - Users display with full name and email as description
  - Selected user is stored with their full name
  - When editing, stored name is matched back to user ID for dropdown pre-selection
  - Manager assignment is optional

### User Management & Role System
- ✅ **Role Management**: `AdminRoles` page allows admins to create, edit, and deactivate roles
- ✅ **Position & Department Dropdowns**: `AdminUsers` loads positions and departments from database (no longer empty)
- ✅ **User Role Assignment**: Users can be assigned to roles when creating or editing
- ✅ **Comprehensive Data Model**:
  - `Role` entity with Id, Name, Description, IsActive fields
  - `User` entity with RoleId, PositionId, DepartmentId foreign keys
  - Full relationship configuration in `ApplicationDbContext`
- ✅ **API Endpoints**:
  - `/api/admin/roles` CRUD endpoints
  - `/api/admin/users` accepts and persists role/position/department assignments
- ✅ **Database Migrations**: Automatic migration execution on API startup
- ✅ **Test Data Seeding**: 4 system roles + 6 activity codes + 6 network numbers automatically seeded

**How to test**:
1. Start API: `cd src/DSC.Api && dotnet run` (migrations execute automatically)
2. Seed test data: `curl -X POST http://localhost:5005/api/admin/seed/test-data -H "X-Admin-Token: local-admin-token"`
3. Start WebClient: `cd src/DSC.WebClient && npm run dev`
4. Login with test account:
   - Username: `kduma`
   - Password: `test-password-updated`
   - Role: User (will see 4 assigned projects)
5. Test user workflows:
   - [http://localhost:5173/activity](http://localhost:5173/activity) - work item tracking with cumulative hours
   - [http://localhost:5173/projects](http://localhost:5173/projects) - project list (filtered by assignment)
   - Add new work item with proper project/activity code/network selection
   - Verify cumulative remaining hours calculations
6. Test admin workflows (login as rloisel1):
   - [http://localhost:5173/admin/roles](http://localhost:5173/admin/roles) - create/edit/deactivate roles
   - [http://localhost:5173/admin/users](http://localhost:5173/admin/users) - assign roles, positions, departments
   - [http://localhost:5173/admin/departments](http://localhost:5173/admin/departments) - assign department managers
   - [http://localhost:5173/admin/positions](http://localhost:5173/admin/positions) - manage positions
   - [http://localhost:5173/admin/projects](http://localhost:5173/admin/projects) - manage projects (see all 8)

### Test Accounts
- **kduma** (User) - test-password-updated - assigned to 4 projects
- **dmcgregor** (Manager) - test-password-updated - can see all projects
- **rloisel1** (Admin) - test-password-updated - can access admin features
- **mammeter** (User) - test-password-updated - assigned to 3 projects

## Previous Work — 2026-02-19

### Admin User Management & Role System

# DSC-modernization

Spec-driven modernization of the DSC Java application to .NET 10, using a Spec-Kitty-driven workflow.

This repository contains the Spec artifacts, the .NET solution, and incremental work to port the original Java DSC application to .NET 10 (ASP.NET Core + EF Core).

Key points
- We use the Spec-Kitty toolkit (fork: https://github.com/Priivacy-ai/spec-kitty) to drive feature specification, implementation, and validation.
- Spec Kit subtree and setup docs were removed; Spec-Kitty is the sole spec workflow for this repo.
- Projects have been updated to target `.NET 10` and a local development environment using MariaDB is recommended.
- See `AI/nextSteps.md` for a concise guide on how to create features, run agent workflows, and build the Spec.

Data model & porting notes
- The repository includes an EF Core data model scaffold under `src/DSC.Data` to serve as the starting point for porting the Java `DSC` application (the Java model lives at https://github.com/rloisell/DSC/tree/master/src/mts/dsc/orm).
- We intentionally kept legacy mapping fields (e.g., `User.EmpId` and a `UserAuth` entity) and added an `ExternalIdentity` entity to support an incremental migration from local accounts to brokered OIDC (Keycloak).

ORM compatibility
- Yes — continued use of an ORM is supported. The project uses Entity Framework Core (EF Core) and the `Pomelo.EntityFrameworkCore.MySql` provider to interact with MariaDB/MySQL. This allows a direct mapping from the existing Java ORM-generated model into EF Core entities and migrations.

Authentication migration plan
- Current: local accounts (legacy username/password stored in `user_auth` mapping). The EF scaffold preserves these fields for migration.
- Target: brokered identity using OpenID Connect (Keycloak). We recommend adding an `ExternalIdentity` table to map provider `sub` values to `User` records, and integrating Keycloak with `DSC.Api` using OIDC middleware. Local password fields are removed only after migration is complete.

Current status (high level)
- Project target frameworks updated to `net10.0` (all `src/*` and `tests/*` projects).
- Local prerequisites documented and partially installed in `AI/WORKLOG.md` and `AI/COMMANDS.sh` (dotnet 10 SDK, `dotnet-ef`, MariaDB).
- A successful local build and unit test run was completed (see `AI/WORKLOG.md` for results).

Local development

Local environment setup, dependencies, commands, and persistent service configuration are documented in [docs/local-development/README.md](docs/local-development/README.md).

If you'd like, I can scaffold example features with `spec-kitty specify` and run an initial `spec-kitty orchestrate` in a disposable worktree. Stop me if you prefer to author the first feature text yourself.

## Recent mapping update

- An EF Core migration `MapJavaModel` was created and applied locally to add legacy mapping fields (for example, `ProjectNo`) to support the Java → EF incremental port.

### Local GUI test (quick)

See [docs/local-development/README.md](docs/local-development/README.md) for current run commands, environment variables, and verification steps.

API update: The API now exposes legacy Java model fields via DTOs so the frontend can consume them (e.g. `ProjectDto.ProjectNo`, and legacy activity fields on `WorkItemDto`). See `src/DSC.Api/DTOs` and `src/DSC.Api/Controllers` for details.

- Swagger/OpenAPI: controller actions are now annotated with response types so `ProjectDto` and `WorkItemDto` response schemas appear in Swagger UI (see `src/DSC.Api/Controllers/ProjectsController.cs` and `ItemsController.cs`).

- Frontend: `src/DSC.WebClient/src/pages/Project.jsx` and `src/DSC.WebClient/src/pages/Activity.jsx` were updated to render the legacy `projectNo` and work-item legacy fields respectively.

- Work-item create: Added `src/DSC.WebClient/src/api/WorkItemService.js` helper `createWorkItemWithLegacy` and an enhanced create form in `src/DSC.WebClient/src/pages/Activity.jsx` to post legacy activity fields.

- Project selector: `src/DSC.WebClient/src/pages/Activity.jsx` now fetches projects from `/api/projects` and shows a project dropdown (displays `projectNo` when available next to the project name).

- Swagger examples: `src/DSC.Api/Swagger/WorkItemExamplesOperationFilter.cs` injects example request/response payloads for WorkItem endpoints in Swagger UI.

- Admin UI routing: React stubs exist for the legacy admin pages (Users, Positions, Departments, Projects, Expense, Activity Options) under `src/DSC.WebClient/src/pages/`. The Admin landing page links to these routes.

- Admin UI scaffolding: `AdminUsers` now mirrors the legacy form fields (employee info, position/department assignment, role) with placeholder actions. Other admin pages include planned action lists and back links.
- Admin UI build-out: positions, departments, projects, expense, and activity options pages now include draft forms and placeholder tables based on intended legacy workflows.
- Admin Users wiring: `/api/admin/users` endpoints are available and `AdminUsers` now uses real API calls for list/create/update/delete (other admin pages still use placeholders).
- Admin catalog wiring: positions, departments, projects, budgets, expense categories, activity codes, and network numbers are now backed by `/api/admin/*` endpoints and wired in the UI via `AdminCatalogService`.
- Admin catalog edit workflows: admin pages now reuse create forms for edits and call update/deactivate APIs for positions, departments, projects, budgets, expense categories, activity codes, and network numbers.
- Admin Expense improvements: Admin Expense now manages budgets (CAPEX/OPEX) and categories, with budget assignment required for categories.
- Frontend design system: the React UI now uses the B.C. Design System component library with BC Sans and design tokens for layout, navigation, forms, and tables.
- Admin landing page: updated copy to reflect the admin sections are wired to APIs.
- Security notes: see `AI/securityNextSteps.md` for current risks and hardening actions.

- Frontend build output: `src/DSC.WebClient/dist/` is ignored in git to avoid committing Vite build artifacts.

Architecture Documentation

Comprehensive Draw.io diagrams documenting the application architecture are available in `diagrams/drawio/`:

- **Domain Model** (`diagrams/drawio/domain-model.drawio.svg`): Domain entities and relationships
- **ERD** (`diagrams/drawio/erd.drawio.svg`): Database tables with PK/FK focus
- **API Architecture** (`diagrams/drawio/api-architecture.drawio.svg`): Middleware pipeline, controllers, security, DTOs
- **Use Cases** (`diagrams/drawio/use-cases.drawio.svg`): User and admin workflows
- **Deployment** (`diagrams/drawio/deployment.drawio.svg`): Development and production environments
- **Admin Seed Sequence** (`diagrams/drawio/sequence-admin-seed.drawio.svg`): Test data seeding flow
- **Time Entry Sequence** (`diagrams/drawio/sequence-time-entry.drawio.svg`): Work item creation flow
- **Component Diagram** (`diagrams/drawio/component-diagram.drawio.svg`): Major packages and dependencies

See [diagrams/README.md](diagrams/README.md) for detailed guidance on using these diagrams with the Spec-Kitty workflow.

