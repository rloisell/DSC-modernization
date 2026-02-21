# DSC Modernization — Development History

This document records the session-by-session development history for the DSC Modernization project.
For the product overview and architecture, see the [root README](../README.md).
For in-depth session logs, build decisions, and command history, see [AI/WORKLOG.md](../AI/WORKLOG.md).
For the full feature backlog and completion status, see [AI/nextSteps.md](../AI/nextSteps.md).

---

## Session 5: UX Improvements & Admin Auth Fix — 2026-02-20

### Admin Pages Now Respond (401 Errors Fixed)
- ✅ **Root cause**: `AdminCatalogService.js` and `AdminUserService.js` made axios calls without any auth header
- ✅ **Fix**: Added a global axios request interceptor in `main.jsx` — every outgoing axios request automatically gets `X-User-Id` header when a user is logged in; no per-service changes needed
- ✅ **Result**: All admin pages load data correctly for admin users

### Activity Code / Network Number — Table with Radio Selection
- ✅ **Root cause**: Two separate dropdowns for Activity Code and Network Number were not working and required users to memorize valid pairs
- ✅ **Fix**: Replaced both dropdowns with a combined radio-button table showing all valid pairs for the selected project
  - Selecting a row sets both Activity Code and Network Number at once
  - Invalid combinations are impossible by design
  - Clear button resets the selection
- ✅ **Result**: Users see valid pairs at a glance and select in one click

### Admin Console — Tab-Based Layout
- ✅ **Root cause**: Admin sections required navigating to separate pages; no way to switch quickly
- ✅ **Fix**: Rewrote `Administrator.jsx` as a tab-based container with 7 tabs: Users, Roles, Positions, Departments, Projects, Expense, Activity Options
- ✅ Removed "Back to Administrator" buttons from all 7 admin sub-pages
- ✅ Sub-routes (`/admin/users`, etc.) still work for direct deep-linking
- ✅ **Result**: All admin management in one place, switching tabs without reload

**Files Modified**:
- `src/DSC.WebClient/src/main.jsx` (global axios interceptor)
- `src/DSC.WebClient/src/pages/Administrator.jsx` (tab-based rewrite)
- `src/DSC.WebClient/src/pages/Activity.jsx` (pair selection table)
- All 7 admin sub-pages (removed back buttons)

---

## Authentication System — 2026-02-21

### User-Based Authentication Implemented
- ✅ **Backend**: `UserIdAuthenticationHandler` reads `X-User-Id` header from requests
  - Validates user exists in database
  - Sets `ClaimsPrincipal` for role-based access control
  - Enables `ProjectsController` to filter projects by user role and assignments
- ✅ **Frontend**: `AuthConfig.js` utility centralizes authentication header management
  - Reads user ID from localStorage (stored during login)
  - Adds `X-User-Id` header to all API requests
  - Single source of truth for auth configuration
- ✅ **API Services**: All services updated to use `AuthConfig`
  - `ProjectService.js` - for project list
  - `CatalogService.js` - for activity codes, network numbers, budgets
  - `WorkItemService.js` - for work item CRUD operations
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

## Recent Fixes & Data Improvements — 2026-02-21

### Expense Activity Form Fixed
- ✅ **Issue**: Expense activities incorrectly showed a "Remaining Hours" calculated field
- ✅ **Fix**: Removed the calculated remaining hours field from expense activities
- ✅ **Why**: Expense activities are cost-tracked, not hour-tracked like project budgets

### Seed Data Significantly Expanded
- ✅ **Previous**: 4 work items per user (3 project + 1 expense)
- ✅ **Current**: 10+ work items per user across multiple projects
- ✅ **New Structure**:
  - **Primary Project**: 6 activities showing real-world workload (including overbudget scenario)
  - **Secondary Projects**: 1 activity each showing multi-project workload
  - **Expense Activity**: 1 per user for expense tracking validation

**Files Modified**:
- `src/DSC.WebClient/src/pages/Activity.jsx`
- `src/DSC.Api/Seeding/TestDataSeeder.cs`

---

## Feature Branch Consolidation — 2026-02-20

**All feature branches successfully merged to main**:

1. ✅ **Complete Catalog System Integration**:
   - CPC Codes, Director Codes, Reason Codes - for expense activity routing
   - Union catalog - legacy union classifications
   - Activity Categories - activity classification system
   - Calendar Categories - calendar event categorization
   - All legacy junction tables mapped (DepartmentUser, UserPosition, UserUser, ProjectActivity, ExpenseActivity)

2. ✅ **New API Endpoints** (all verified working):
   - `/api/catalog/cpc-codes`, `/api/catalog/director-codes`, `/api/catalog/reason-codes`
   - `/api/admin/unions`, `/api/admin/activity-categories`, `/api/admin/calendar-categories`

3. ✅ **Build & Deployment Status**: All merge conflicts resolved, build succeeds with 0 errors

4. ✅ **Models Integrated**:
   - ActivityCategory, CalendarCategory, CalendarEntry
   - CpcCode, DirectorCode, ReasonCode, Union
   - DepartmentUser, UserPosition, UserUser (legacy junction tables)
   - ProjectActivity, ExpenseActivity (legacy activity mappings)

**Git commits**: `444c9fd` through `5e9db61` (7 commits total)

---

## Unit Testing — 2026-02-21

**16 unit tests implemented and passing**:
- ✅ Test data seeding validation (9 tests)
- ✅ API endpoint tests (4 tests)
- ✅ Integration tests (1 test)
- ✅ Framework: xUnit with Entity Framework Core InMemory database

See [tests/howto.md](../tests/howto.md) for comprehensive testing documentation.

---

## Projects Page — 2026-02-20

- ✅ **Interactive Projects Table** with Project No, Name, Description, Estimated Hours
- ✅ **Project Activity Options Viewer**: lists all valid activity code + network number pairs per project
- ✅ **Admin-Only Project Creation**: creation form moved to Admin Projects page
- ✅ **Admin Instructions**: Assign All Options button for bulk activity/network assignment

---

## Activity Page — 2026-02-21

- ✅ **Project Summary Table**: cumulative budget status per project; red/⚠ OVERBUDGET for negative remaining
- ✅ **Activity Tracking Table**: time-period filtered list of all user work items
- ✅ **Budget Classification (CAPEX/OPEX)**: required field on create form; displayed in list
- ✅ **Project vs Expense Activity Split**: budget type toggles project vs expense field set
- ✅ **Project Hour Estimates in Form**: estimated hours, current cumulative remaining, projected remaining
- ✅ **Project-Specific Filtering**: activity code and network number dropdowns filter by selected project
- ✅ **Available Options Table**: shows valid pairs when a project is selected

---

## Admin Management — 2026-02-21

### Admin Users Page
- Enhanced Users Table: Employee ID, Name, Email, LAN ID, Role, Position, Department
- Interactive User Selection: click row to edit
- User Management: create, edit, delete, password management

### Project Activity Options Assignment
- "Assign All Options" bulk assignment (activity codes × network numbers per project)
- Project Activity Options Table: view and delete assignments

### Catalog Management
- Unions: legacy union classifications
- Roles: create, edit, deactivate
- Positions & Departments with manager assignment dropdown

---

## Admin User Management & Role System — Previous Work 2026-02-19

### Spec-Kitty Driven Workflow — Initial Project Setup

# DSC-modernization — Original Project Description

Spec-driven modernization of the DSC Java application to .NET 10, using a Spec-Kitty-driven workflow.

This repository contains the Spec artifacts, the .NET solution, and incremental work to port the original Java DSC application to .NET 10 (ASP.NET Core + EF Core).

**Key points:**
- We use the Spec-Kitty toolkit (fork: https://github.com/Priivacy-ai/spec-kitty) to drive feature specification, implementation, and validation.
- Projects have been updated to target `.NET 10` and a local development environment using MariaDB is recommended.
- See `AI/nextSteps.md` for a concise guide on how to create features, run agent workflows, and build the Spec.

**Data model & porting notes:**
- The repository includes an EF Core data model scaffold under `src/DSC.Data` to serve as the starting point for porting the Java `DSC` application.
- We intentionally kept legacy mapping fields (e.g., `User.EmpId` and a `UserAuth` entity) and added an `ExternalIdentity` entity to support an incremental migration from local accounts to brokered OIDC (Keycloak).

**ORM compatibility:**
- Entity Framework Core with `Pomelo.EntityFrameworkCore.MySql` provider for MariaDB/MySQL.

**Authentication migration plan:**
- Current: local accounts (`username/password` stored in `user_auth` mapping)
- Target: brokered identity using OpenID Connect (Keycloak)

---

## Architecture Recommendations Implemented — commit `78a7041`

### Rec 1 — EF Core Migrations (HIGH — Done)
- `Program.cs`: replaced `db.Database.EnsureCreated()` with `db.Database.Migrate()`

### Rec 2 — Service Layer (HIGH — Done)
- Created `src/DSC.Api/Services/`: `IWorkItemService`, `IReportService`, `IProjectService`, `IAuthService`
- Created `src/DSC.Api/Infrastructure/DomainExceptions.cs`: `NotFoundException`, `ForbiddenException`, `BadRequestException`, `UnauthorizedException`
- All 4 controllers reduced to thin HTTP delegates; tests updated to 36/36 passing

### Rec 3 — Global Exception Handler / ProblemDetails (HIGH — Done)
- `GlobalExceptionHandler.cs`: maps domain exceptions to RFC 7807 `ProblemDetails`
- `Program.cs`: `AddExceptionHandler`, `AddProblemDetails`, `UseExceptionHandler`

### Rec 4 — TanStack Query v5 (MEDIUM — Done)
- `npm install @tanstack/react-query@5`; `QueryClientProvider` in `main.jsx`
- Created `src/hooks/useProjects.js`, `useWorkItems.js`, `useReport.js`

---

## SVG Diagram Exports + Missing Diagram Coverage — 2026-02-20

- Exported all 10 existing `diagrams/drawio/*.drawio` → `diagrams/drawio/svg/` (11 SVGs total)
- Exported both `diagrams/data-model/*.drawio` → `diagrams/data-model/svg/`
- Created 3 new sequence diagrams: `sequence-admin-seed.drawio`, `sequence-reporting-dashboard.puml/.drawio`, `sequence-admin-crud.puml/.drawio`
- `diagrams/README.md` fully rewritten with directory map, all 13 diagrams documented

---

## Project Assignments Fix + Button Consistency + ERD Diagrams — 2026-02-20

- **Bug**: AdminProjectAssignments "Role" column → renamed to "Position" (data source fixed)
- **Feature**: User + Position filters on assignments page
- **UI Fix**: Button variant consistency across all admin pages (Edit=tertiary, Deactivate=tertiary+danger, Delete=secondary+danger)
- **ERD Diagrams**: `diagrams/data-model/erd-current.puml/.drawio` and `erd-java-legacy.puml/.drawio`
- **Compare/contrast doc**: `docs/data-model/README.md`
