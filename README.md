## DSC Modernization Overview

**Application Purpose**: This project modernizes the legacy Java-based DSC (Director Support Center) time tracking and project management system to a modern .NET 10 stack while preserving historical data structures and maintaining backward compatibility.

**Tech Stack**:
- **Backend**: ASP.NET Core 10 Web API with Entity Framework Core
- **Frontend**: Vite-based JavaScript client with vanilla JS
- **Database**: MySQL with EF Core migrations
- **Testing**: xUnit with InMemory database provider

**Key Features**:
- Activity-based time tracking with project, activity code, and network number assignments
- Project management with budget classifications (CAPEX/OPEX)
- Catalog-driven dropdowns for activity codes and network numbers
- Legacy activity ID preservation for Java system traceability
- Comprehensive admin endpoints for managing users, departments, positions, projects, and catalog data

**Legacy Model Preservation**:
This modernization preserves five key legacy mapping tables from the original Java system:
- `Department_User`: Many-to-many relationship between users and departments with time periods
- `User_Position`: Many-to-many relationship between users and positions with time periods
- `User_User`: User hierarchy/relationship mapping with time periods
- `Project_Activity`: Maps activity codes and network numbers to projects
- `Expense_Activity`: Maps expense-related activity metadata (director codes, reason codes, CPC codes)

These tables use composite primary keys and preserve the original Java naming conventions for seamless data migration.

## Unit Testing — 2026-02-21 ✅ NEW

**16 unit tests implemented and passing**:
- ✅ Test data seeding validation (9 tests): validates TestDataSeeder creates correct activity codes, network numbers, and marks them as active
- ✅ API endpoint tests (4 tests): validates CatalogController and ItemsController endpoints return expected data
- ✅ Integration tests (1 test): validates complete data pipeline from seeding to frontend data binding
- ✅ Framework: xUnit with Entity Framework Core InMemory database (isolated, no external database required)
- ✅ Execution time: ~1 second for all tests
- ✅ Security: System.Drawing.Common pinned to 8.0.8 to address NU1904

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
- ✅ **Activity Tracking Table** (NEW 2026-02-21):
  - Comprehensive table showing all user activities with time period filtering
  - Time period options: Today, This Week, This Month, This Year, All Time
  - Displays: Project, Title, Activity Code, Network, Date, Estimated Hours, Actual Hours, Remaining Hours
  - Remaining hours calculated as: `projectEstimatedHours - actualDuration`
  - Auto-refreshes when time period changes or new work item is created
  - Empty state message when no activities found for selected period
  - Uses new `/api/items/detailed?period={period}` endpoint
- ✅ **Fixed 405 Error**: Added `ItemsController.GetAll()` endpoint to list work items (was missing, caused page error)
- ✅ **Project Dropdown**: Loads all projects from database with "ProjectNo — Name" format
- ✅ **Activity Code Dropdown**: Selects from 12 seeded test codes (DEV, TEST, DOC, ADMIN, MEET, TRAIN and additional codes)
- ✅ **Network Number Dropdown**: Selects from 12 seeded test numbers (101, 102, 103, 201, 202, 203 and additional numbers)
- ✅ **Budget Dropdown**: Loads CAPEX/OPEX budgets from `/api/catalog/budgets`
- ✅ **Budget Classification (CAPEX/OPEX)** (NEW 2026-02-21):
  - Activity create form requires a budget selection
  - Activity table displays the budget classification for each work item
  - Uses `/api/catalog/budgets` for lookup
- ✅ **Catalog Service**: New public `/api/catalog` endpoints for activity codes and network numbers
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

**What Legacy Activity ID is:**
- **Source**: Original Java Activity.activityID field from legacy DSC system
- **Type**: int? (nullable integer)
- **Purpose**: Preserve traceability when migrating historical Activity records from Java to .NET
- **When Used**: Populate this field during legacy data migration; leave empty for new items created in .NET
- **Example**: Java Activity with ID=12345 → .NET WorkItem with LegacyActivityId=12345
- **Benefit**: Allows both systems to run in parallel with links between old and new records

**How to test**:
1. Start API: `cd src/DSC.Api && dotnet run`
2. Seed test data: `curl -X POST http://localhost:5005/api/admin/seed/test-data -H "X-Admin-Token: local-admin-token"`
   - Should return counts including ActivityCodesCreated and NetworkNumbersCreated
3. Start WebClient: `cd src/DSC.WebClient && npm run dev`
4. Navigate to Activity page and create a work item:
   - Project dropdown: loads from `/api/projects`
   - Activity Code dropdown: loads DEV, TEST, DOC, ADMIN, MEET, TRAIN from `/api/catalog/activity-codes`
   - Network Number dropdown: loads 101, 102, 103, 201, 202, 203 from `/api/catalog/network-numbers`
   - (Optional) Legacy Activity ID: enter an ID if linking to original system
   - Select values and submit
   - Verify work item appears in list below with no errors

## Admin Management — 2026-02-21 (UPDATED)

### Admin Catalog Deletion (NEW 2026-02-21)
- Delete actions are available for departments, positions, projects, activity codes, network numbers, budgets, expense categories, and expense options
- Destructive actions prompt for confirmation and refresh the catalog lists after completion

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

### Legacy Department Assignments (NEW 2026-02-20)
- **Feature**: Legacy `Department_User` mapping preserved for historical assignments
- **Use case**: Reference prior department history by effective dates

### Legacy Position Assignments (NEW 2026-02-20)
- **Feature**: Legacy `User_Position` mapping preserved for historical assignments
- **Use case**: Reference prior position history by effective dates

### Legacy User Relationships (NEW 2026-02-20)
- **Feature**: Legacy `User_User` mapping preserved for historical user relationships
- **Use case**: Reference prior user associations by effective dates

### Legacy Project Activity Links (NEW 2026-02-20)
- **Feature**: Legacy `Project_Activity` mapping preserved for historical project activity links
- **Use case**: Reference prior activity assignments to project/activity/network codes

### Legacy Expense Activity Links (NEW 2026-02-20)
- **Feature**: Legacy `Expense_Activity` mapping preserved for historical expense activity links
- **Use case**: Reference prior activity assignments to Director/Reason/CPC codes

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
4. Test admin workflows:
   - [http://localhost:5173/admin/roles](http://localhost:5173/admin/roles) - create/edit/deactivate roles
   - [http://localhost:5173/admin/users](http://localhost:5173/admin/users) - assign roles, positions, departments
   - [http://localhost:5173/admin/departments](http://localhost:5173/admin/departments) - assign department managers
   - [http://localhost:5173/admin/positions](http://localhost:5173/admin/positions) - manage positions
   - [http://localhost:5173/activity](http://localhost:5173/activity) - create work items with dropdown catalogs

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

