## WebClient (React) Progress — 2026-02-21

- All static assets from legacy `WebContent` (CSS, JS, images, calendar libs) are now in `src/DSC.WebClient/public`.
- React page stubs for `Activity`, `Project`, `Administrator`, and `Login` are in `src/DSC.WebClient/src/pages/`.
- Routing matches legacy JSPs; see `src/DSC.WebClient/src/App.jsx`.
- API service layer (`src/DSC.WebClient/src/api/`) uses `axios` for backend calls. Example: `ProjectService.js`.
- `Project` page fetches and displays project data from `/api/projects`.
- All required npm dependencies installed.
- Docs updated and changes pushed.

## Activity Page — 2026-02-21 (NEW)

**What's new:**
- ✅ **Fixed 405 Error**: Added `ItemsController.GetAll()` endpoint to list work items (was missing, caused page error)
- ✅ **Project Dropdown**: Loads all projects from database with "ProjectNo — Name" format
- ✅ **Activity Code Dropdown**: Select from active activity codes in system (replaced text field)
- ✅ **Network Number Dropdown**: Select from active network numbers in system (replaced number field)
- ✅ **Catalog Service**: New public `/api/catalog` endpoints for activity codes and network numbers
- ✅ **Legacy Activity ID**: Integer field for backward compatibility, links to original Java system Activity IDs

**How to test**:
1. Start API: `cd src/DSC.Api && dotnet run`
2. Start WebClient: `cd src/DSC.WebClient && npm run dev`
3. Navigate to Activity page
4. Create a work item:
   - Select project from dropdown
   - (Optional) Enter Legacy Activity ID if linking to original system
   - Select activity code from dropdown
   - Select network number from dropdown
   - Fill date, times, durations as needed
   - Submit to create work item
5. Verify work item appears in list without errors

## Admin Management — 2026-02-21 (UPDATED)

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
- ✅ **Test Data Seeding**: 4 system roles created (Administrator, Manager, Developer, Viewer)

**How to test**:
1. Start API: `cd src/DSC.Api && dotnet run` (migrations execute automatically)
2. Seed test data: `curl -X POST http://localhost:5005/api/admin/seed/test-data -H "X-Admin-Token: local-admin-token"`
3. Start WebClient: `cd src/DSC.WebClient && npm run dev`
4. Test admin workflows:
   - [http://localhost:5173/admin/roles](http://localhost:5173/admin/roles) - create/edit/deactivate roles
   - [http://localhost:5173/admin/users](http://localhost:5173/admin/users) - assign roles, positions, departments
   - [http://localhost:5173/admin/departments](http://localhost:5173/admin/departments) - assign department managers
   - [http://localhost:5173/admin/positions](http://localhost:5173/admin/positions) - manage positions

## Admin User Management & Role System — 2026-02-19

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
- Admin catalog wiring: positions, departments, projects, expense categories/options, activity codes, and network numbers are now backed by `/api/admin/*` endpoints and wired in the UI via `AdminCatalogService`.
- Admin catalog edit workflows: admin pages now reuse create forms for edits and call update/deactivate APIs for positions, departments, projects, expense categories/options, activity codes, and network numbers.
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

