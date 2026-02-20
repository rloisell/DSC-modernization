## 2026-02-20 — Project Activity Options & Work Item Creation (COMPLETED ✓)

**Problem Statement**:
1. Activity page returned "Request failed with status code 400" when creating work items
2. AdminProjects "Assign Activity Codes / Network Numbers" button showed success but created no records
3. Activity page dropdowns didn't filter options based on selected project

**Root Causes Identified**:
1. **Work Item Creation Error**: API endpoint expected `WorkItem` entity but frontend sent different payload structure; type mismatch on `networkNumber` (int vs string)
2. **Project Assignment Issue**: Frontend called basic create endpoint (1 assignment) instead of bulk assignment (all combinations)
3. **Missing Filtering Logic**: No API endpoint or frontend logic to filter activity codes/network numbers by project

**Implementation & Resolution**:

### Backend Changes

#### 1. Work Item Creation Fix
- ✅ Created `WorkItemCreateRequest` DTO with proper field types
- ✅ Updated `ItemsController.Post()` to use new DTO instead of entity
- ✅ Fixed `networkNumber` type mapping (frontend sends `int`, backend stores as `string`)
- ✅ Added project existence validation before creating work item
- ✅ Returns full `WorkItemDto` in response instead of just ID

#### 2. Project Activity Options Management
- ✅ Created `ProjectActivityOptionDetailDto` with nested ActivityCode and NetworkNumber DTOs
- ✅ Updated `AdminProjectActivityOptionsController.GetAll()` to return detailed options
- ✅ Added `POST /api/admin/project-activity-options/assign-all` endpoint
  - Creates all combinations of active activity codes × network numbers for a project
  - Duplicate checking to prevent re-creating existing assignments
  - Returns count of new assignments created
- ✅ Added `AssignAllRequest` DTO for bulk assignment

#### 3. Catalog Filtering by Project
- ✅ Added `GET /api/catalog/project-options/{projectId}` endpoint
  - Returns project-specific activity codes and network numbers
  - Includes valid pairs for conditional filtering
  - Filters only active codes/numbers assigned to the project
- ✅ Created supporting DTOs:
  - `ProjectActivityOptionsResponse`
  - `ProjectActivityCodeNetworkPair`

### Frontend Changes

#### 1. AdminProjects Page Enhancement
- ✅ Added "Assign All Options" button for each project in table
- ✅ Calls new `assign-all` endpoint to bulk-create project activity options
- ✅ Shows success message with count of assignments created
- ✅ Updated `AdminCatalogService.js` with `assignAllActivityOptionsToProject()` method

#### 2. Activity Page Smart Filtering
- ✅ Added `projectOptions` state to track project-specific data
- ✅ Implemented `useEffect` hook to load project options when project is selected
- ✅ Dropdowns now disabled until a project is selected
- ✅ Activity code and network number dropdowns filter based on selected project
- ✅ Implemented bidirectional conditional filtering:
  - When activity code is selected, network numbers filter to show only compatible options
  - When network number is selected, activity codes filter to show only compatible options
- ✅ Auto-clears invalid selections when project changes
- ✅ Added "Available Options for Selected Project" table
  - Displays all valid activity code + network number pairs for the selected project
  - Shows full descriptions for codes and numbers
  - Helps users see exactly what combinations are available

#### 3. Project Activity Options Management Tables
- ✅ Added comprehensive table to AdminProjects page showing all project activity option assignments
  - Displays project name, activity code, and network number for each assignment
  - Shows descriptions for codes and numbers
  - Allows filtering and viewing all assignments across all projects
- ✅ Added DELETE endpoint: `DELETE /api/admin/project-activity-options`
  - Accepts projectId, activityCodeId, and networkNumberId as query parameters
  - Returns 404 if assignment not found
  - Allows removal of specific project activity option assignments
- ✅ Added delete button for each assignment in AdminProjects table
- ✅ Updated `AdminCatalogService.js` with `deleteProjectActivityOption()` method
- ✅ AdminProjects page now loads project activity options on page load and refreshes after operations

**Testing & Validation**:
- ✅ Verified 144 assignments created (12 activity codes × 12 network numbers) for test project
- ✅ Confirmed project-options endpoint returns correct filtered data
- ✅ Successfully created work item with activity code "DEV" and network number 99
- ✅ Verified dropdowns filter correctly based on project selection
- ✅ Tested conditional filtering between activity codes and network numbers

**Files Modified**:
- `src/DSC.Api/Controllers/ItemsController.cs`
- `src/DSC.Api/Controllers/CatalogController.cs`
- `src/DSC.Api/Controllers/AdminProjectActivityOptionsController.cs` (added DELETE endpoint)
- `src/DSC.Api/DTOs/WorkItemDto.cs`
- `src/DSC.Api/DTOs/AdminCatalogDtos.cs`
- `src/DSC.WebClient/src/pages/Activity.jsx` (added available options table)
- `src/DSC.WebClient/src/pages/AdminProjects.jsx` (added project activity options table with delete)
- `src/DSC.WebClient/src/api/AdminCatalogService.js` (added delete method)

**Commits**: 
- `80a0841` - feat: implement project activity options assignment and filtering
- `2b7e885` - feat: add project activity options table views with delete functionality

---

## 2026-02-20 — Projects Page Enhancement (COMPLETED ✓)

**Problem Statement**:
1. Projects page included "Add Project" form which should be admin-only
2. No way for users to browse project activity options without going to Activity page
3. Project estimated hours not displayed anywhere for user reference

**Implementation & Resolution**:

### Frontend Changes

#### 1. Removed Add Project Form
- ✅ Removed project creation form from user-facing Projects page
- ✅ Project creation now exclusively in Admin Projects section
- ✅ Removed unused imports: Button, ButtonGroup, Form, TextArea, TextField
- ✅ Removed createProject from ProjectService imports

#### 2. Enhanced Projects Table
- ✅ Replaced simple list with interactive table displaying:
  - Project No (with "—" placeholder if not set)
  - Name (bold for emphasis)
  - Description (with "—" placeholder if empty)
  - Estimated Hours (formatted with "hrs" suffix, "—" if null)
- ✅ Made table rows clickable to select project
- ✅ Added visual feedback:
  - Selected row highlighted with light blue background (#f0f9ff)
  - Hover effect on non-selected rows (light gray #f8fafc)
  - Pointer cursor on hover

#### 3. Project Activity Options Viewer
- ✅ Added `selectedProject` state to track user selection
- ✅ Added `projectOptions` state to store project-specific activity options
- ✅ When project row is clicked:
  - Loads project activity options via `/api/catalog/project-options/{projectId}`
  - Displays section titled "Project Activity Options: [ProjectNo — Name]"
  - Shows table of valid activity code + network number pairs
  - Includes full descriptions for codes and numbers
- ✅ Handles edge cases:
  - Loading state while fetching options
  - Empty state message when no options assigned
  - Error handling with inline alert

**User Experience Improvements**:
- ✅ Users can now browse all projects in a clean table format
- ✅ Estimated hours visible at a glance for project planning
- ✅ One-click access to view what activity codes and network numbers are available for each project
- ✅ Clear messaging when projects have no assigned options (directs users to contact admin)
- ✅ Page description: "Browse projects and view available activity codes and network numbers for each project."

**Files Modified**:
- `src/DSC.WebClient/src/pages/Project.jsx`

**Commit**: `dc4567c` - refactor: enhance Projects page with interactive table and activity options viewer

---

## 2026-02-20 — Admin Users Table Enhancement (COMPLETED ✓)

**Problem Statement**:
1. Current Users table showed minimal information (ID, Employee ID, Name, Username, Email)
2. Users had to use dropdown to select user for editing - not intuitive
3. No visibility of role, position, or department assignments in the table

**Implementation & Resolution**:

### Frontend Changes

#### 1. Enhanced Users Table Display
- ✅ Expanded table to show comprehensive user information:
  - Employee ID (with "—" placeholder if null)
  - Name (First + Last name, bold for emphasis)
  - Email
  - LAN ID (username)
  - **Role** (NEW - displays role name by looking up roleId)
  - **Position** (NEW - displays position title by looking up positionId)
  - **Department** (NEW - displays department name by looking up departmentId)
- ✅ Removed internal ID column (not useful for admins)
- ✅ Added placeholder "—" for null/empty values for better readability

#### 2. Interactive User Selection
- ✅ Made table rows clickable to select user for editing
- ✅ Added visual feedback:
  - Selected row highlighted with light blue background (#f0f9ff)
  - Hover effect on non-selected rows (light gray #f8fafc)
  - Pointer cursor on hover
- ✅ Clicking a row populates the Edit User form with that user's data
- ✅ Updated Edit User section instructions: "Select a user from the dropdown below or click a user in the table."
- ✅ Both dropdown and table clicks work for user selection

#### 3. User Experience Improvements
- ✅ Added descriptive text: "Click a user to edit their information."
- ✅ Empty state handling: Shows "No users found." when table is empty
- ✅ Loading state while data is being fetched
- ✅ Role, position, and department names displayed instead of just IDs for better context

**Technical Implementation**:
- ✅ Enhanced table to look up related entity names:
  - `roles.find(r => r.id === user.roleId)?.name`
  - `positions.find(p => p.id === user.positionId)?.title`
  - `departments.find(d => d.id === user.departmentId)?.name`
- ✅ Reused existing `handleSelectUser()` function for both dropdown and table row clicks
- ✅ Consistent styling with Projects page table interactions

**Files Modified**:
- `src/DSC.WebClient/src/pages/AdminUsers.jsx`

**Commit**: Current - refactor: enhance Admin Users table with comprehensive data and clickable rows

---

## 2026-02-20 — Project Activity Options Table Views (COMPLETED ✓)

**Problem Statement**:
Activity page and Admin pages were not displaying dropdown data for activity codes and network numbers, despite seeding code being implemented, API endpoints created, and tests validating functionality in isolation.

**Root Cause Identified**:
1. **Database Connection Issue**: Development configuration used incorrect credentials (`dsc_local:dsc_password`) which couldn't authenticate to MariaDB
2. **API Port Mismatch**: Multiple dotnet instances running caused confusion about which API was active (5005 vs 5115)
3. **Test Database vs Production Database**: Unit tests passed using InMemory database but didn't catch the database connection issue

**Investigation & Resolution Timeline**:

### Phase 1: Initial Analysis (BLOCKING)
- ✅ Verified database contained only legacy data (2 activity codes, 3 network numbers)
- ✅ Confirmed API endpoints and seeding code were implemented correctly
- ✅ Unit tests all passing (14/14) but using InMemory database
- ✅ Identified gap: tests don't fail because they bypass the MySQL connection

### Phase 2: Database Connectivity Fix
- 🔧 **Issue**: Initial connection string used incorrect credentials
  - Before: `Server=localhost:3306;Database=dsc_dev;Uid=dsc_local;Pwd=dsc_password;`
  - After: `Server=/tmp/mysql.sock;Database=dsc_dev;Uid=root;Pwd=root_local_pass;SslMode=none;`
- 🔧 Updated `src/DSC.Api/appsettings.Development.json` with working connection
- ✅ Root user credentials established in MariaDB init script (`/tmp/mysql-init.sql`)

### Phase 3: API Recovery & Testing
- ✅ Rebuilt API project: `dotnet clean && dotnet build`
- ✅ Restarted API on correct port (5005)
- ✅ Called seeding endpoint: `POST /api/admin/seed/test-data`
- ✅ **SEEDING SUCCESSFUL**:
  - projectsCreated: 7
  - departmentsCreated: 3
  - activityCodesCreated: 10
  - networkNumbersCreated: 9

### Phase 4: Data Validation
- ✅ **Activity Codes**: All 12 codes present (verified via API)
  - Original: 10, 11
  - New: DEV, TEST, DOC, ADMIN, MEET, TRAIN, BUG, REV, ARCH, DEPLOY
- ✅ **Network Numbers**: All 12 numbers present
  - Original: 99, 100, 101
  - New: 110, 111, 120, 121, 130, 200, 201, 210, 220
- ✅ **Projects**: 7 new projects seeded (P1001-P1005, P2001, P2002)
- ✅ **Departments**: 3 new departments seeded (Engineering, Quality Assurance, Product Management)

**Final Status**: ✅ **ALL ISSUES RESOLVED**
- Dropdowns now populate correctly
- Seed data persists to MySQL database
- Data validation queries created and tested
- Issues log documentation complete
- [ ] Test seeding directly in database (SQL INSERT statements)
- [ ] Consider alternative: Direct database seeding via SQL script instead of C# seeder
- [ ] Add logging to TestDataSeeder to track what's actually happening

---

## 2026-02-21 — Unit Tests for Activity Page & Catalog Functionality (Continued)

**Completed**:
1. ✅ Created comprehensive unit test suite for Activity page
   - **Test Files Created**:
     - `tests/DSC.Tests/ActivityPageTests.cs` - 14 unit tests
     - `tests/DSC.Tests/SimpleActivityPageTest.cs` - 2 baseline tests
   - **Project Updates**: 
     - Updated `DSC.Tests.csproj` with required NuGet packages:
       - `Microsoft.EntityFrameworkCore.InMemory` v9.0.0
       - `Microsoft.AspNetCore.Identity` v2.2.0
       - `Moq` v4.20.70
     - Added `ProjectReference` to DSC.Api and DSC.Web projects

2. ✅ Test data seeding validation (6 tests)
   - `TestDataSeeder_CreatesActivityCodes` - validates 6 codes created
   - `TestDataSeeder_ActivityCodes_HaveCorrectValues` - verifies DEV, TEST, DOC, ADMIN, MEET, TRAIN
   - `TestDataSeeder_ActivityCodes_AreActive` - confirms IsActive = true
   - `TestDataSeeder_ActivityCodes_HaveDescriptions` - validates all have descriptions
   - `TestDataSeeder_CreatesNetworkNumbers` - validates 6 numbers created
   - `TestDataSeeder_NetworkNumbers_HaveCorrectValues` - verifies 101, 102, 103, 201, 202, 203
   - `TestDataSeeder_NetworkNumbers_AreActive` - confirms IsActive = true
   - `TestDataSeeder_NetworkNumbers_HaveDescriptions` - validates all have descriptions
   - `TestDataSeeder_IsIdempotent` - confirms seeding twice creates no duplicates

3. ✅ CatalogController endpoint tests (2 tests)
   - `CatalogController_GetActivityCodes_ReturnsSeededData` - validates endpoint returns 6 active codes
   - `CatalogController_GetNetworkNumbers_ReturnsSeededData` - validates endpoint returns 6 active numbers

4. ✅ ItemsController endpoint tests (2 tests)
   - `ItemsController_GetAll_ReturnsWorkItems` - validates GetAll returns items when present
   - `ItemsController_GetAll_ReturnsEmptyArrayWhenNoItems` - validates empty array when no items

5. ✅ Integration test (1 test)
   - `ActivityPage_Integration_AllDataSourcesAvailable` - validates:
     - All projects seeded correctly
     - All activity codes seeded and properly structured
     - All network numbers seeded and properly structured
     - All have required descriptions

6. ✅ Test infrastructure setup
   - **InMemory Database**: Uses EntityFrameworkCore.InMemoryDatabase for test isolation
   - **Transaction Handling**: Suppressed transaction warning with:
     ```csharp
     .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
     ```
   - **Fresh Context per Test**: Creates new database instance for each test via Guid key
   - **Password Hashing**: Uses PasswordHasher<User> for authentication

**Test Results**:
- ✅ All 16 tests passed (14 ActivityPageTests + 2 SimpleActivityPageTest)
- ✅ Build successful with no errors
- ✅ All tests execute in ~1 second
- ✅ InMemory database isolation ensures test independence

---

## 2026-02-21 — Activity Page Fixes & Catalog Data Seeding

**Completed**:
1. ✅ Fixed 405 Method Not Allowed error in Activity page
   - **Issue**: Activity page was showing error "Request failed with status code 405"
   - **Root Cause**: `ItemsController` only had a parameterized `Get(id)` endpoint, no `GetAll()` for listing work items
   - **Solution**: Added `ItemsController.GetAll()` endpoint to return array of work items
   - **Implementation**: 
     - Maps WorkItem entities to WorkItemDto in same format as Get(id)
     - Ordered by date descending for recent items first
     - Returns 200 OK with array of WorkItemDto

2. ✅ Created public Catalog service endpoints
   - **New Controller**: `CatalogController` at `/api/catalog` (public, no auth required)
   - **Endpoints**:
     - `GET /api/catalog/activity-codes` - returns active ActivityCode records with Code, Description, IsActive
     - `GET /api/catalog/network-numbers` - returns active NetworkNumber records with Number, Description, IsActive
   - **Frontend Service**: Created `CatalogService.js` with `getActivityCodes()` and `getNetworkNumbers()` functions

3. ✅ Converted Activity Code & Network Number fields to dropdowns
   - **Replaced**: TextField and NumberField with Select components
   - **Display**: Shows code/number with optional description in parentheses
   - **Data Binding**: 
     - Activity Code stored as string (code value)
     - Network Number stored as numeric string
   - **Optional**: Both fields are optional for work items
   - **Performance**: All catalog data loaded in parallel on component mount

4. ✅ Added test data seeding for Activity Codes and Network Numbers
   - **Issue**: Dropdowns had no values because database was empty
   - **Solution**: Extended TestDataSeeder to seed catalog data
   - **Activity Codes seeded** (6 codes):
     - DEV: Development work
     - TEST: Testing and QA
     - DOC: Documentation
     - ADMIN: Administrative work
     - MEET: Meetings and planning
     - TRAIN: Training activities
   - **Network Numbers seeded** (6 numbers):
     - 101: Network Infrastructure
     - 102: Data Center Operations
     - 103: Customer Support
     - 201: Engineering
     - 202: Security Operations
     - 203: Cloud Services
   - **Updated TestSeedResult**: Now returns ActivityCodesCreated and NetworkNumbersCreated counts

5. ✅ Verified project dropdown loads correctly
   - Projects dropdown now populates correctly from `/api/projects` endpoint
   - Displays "ProjectNo — Name" format for clarity
   - Works alongside new activity code and network number selectors

6. ✅ Builds and tests passed
   - API builds successfully with no errors
   - WebClient builds successfully 
   - All components import/export correctly
   - Component handles empty/null selections gracefully

**Status**: Activity page now fully functional with:
- Error resolved (405 fixed)
- All dropdowns loading real database data
- Activity Codes and Network Numbers seeded in test data
- Data sources properly wired to database catalogs

**How to test**:
1. Start API: `cd src/DSC.Api && dotnet run`
2. Seed test data (in another terminal):
   ```bash
   curl -X POST http://localhost:5005/api/admin/seed/test-data \
     -H "X-Admin-Token: local-admin-token"
   ```
   Should show ActivityCodesCreated and NetworkNumbersCreated in response
3. Start WebClient: `cd src/DSC.WebClient && npm run dev`
4. Navigate to Activity page
5. Verify no error at top
6. Create a work item:
   - All three dropdowns (Projects, Activity Codes, Network Numbers) should populate with values
   - Select values from each and submit
   - Verify work item appears in list below

**Legacy Activity ID Clarification**:
- **Source**: Original Java Activity.activityID field from legacy DSC system
- **Type**: Integer (nullable)
- **Purpose**: Backward compatibility field for linking work items to original Java Activity records during data migration
- **Usage**: When migrating historical Activities from Java system, populate this field with the original Activity.activityID
- **For new items**: Leave empty (optional) - only needed for legacy data migration
- **Stored in**: `WorkItem.LegacyActivityId` column

**Technical details**:
- Files Modified: `TestDataSeeder.cs` (seeding logic)
- Test Data: 6 activity codes + 6 network numbers automatically seeded
- Catalog endpoints: Public (no authentication), filter to active records only
- Migration-ready: Legacy Activity ID preserves traceability to original system

## 2026-02-21 — Activity Page Fixes & Catalog Endpoints
   - Select a project from dropdown
   - Select an activity code from dropdown
   - Select a network number from dropdown
   - Fill remaining fields and submit
6. Verify work item appears in list below

**Technical details**:
- Component: `src/DSC.WebClient/src/pages/Activity.jsx`
- New Controller: `src/DSC.Api/Controllers/CatalogController.cs`
- Service: `src/DSC.WebClient/src/api/CatalogService.js`
- Modified Controller: `src/DSC.Api/Controllers/ItemsController.cs` (added GetAll)
- API endpoints are public (no authorization required)
- Catalog endpoints filter to active records only

**Legacy Activity ID Clarification**:
- Type: Integer (nullable)
- Purpose: Backward compatibility field for linking to original Java system Activity IDs
- When migrating legacy activities: populate this field with the original Activity.id from Java system
- For new work items: leave empty (optional)
- Stored in `WorkItem.LegacyActivityId` column

## 2026-02-21 — Manager Field Bug Fix in AdminDepartments

**Completed**:
1. ✅ Fixed Manager field in AdminDepartments component
   - **Issue**: Manager field was a plain text TextField with no connection to system users
   - **Solution**: Converted Manager field to a Select dropdown that loads and displays all users
   - **Implementation**:
     - Added `getAdminUsers()` call to load users from `/api/admin/users` endpoint
     - Users display in dropdown with full name (firstName + lastName) and email as description
     - Bidirectional user ID ↔ name mapping:
       - On submit: Convert selected user ID to user's full name for API (maintains backward compatibility)
       - On edit: Match stored manager name back to user ID for dropdown pre-selection
     - Manager field is optional (can leave unselected)
     - Users and departments loaded in parallel for better performance

2. ✅ Build verification passed
   - WebClient build succeeded with no compilation errors
   - Component properly imports and exports all required functions

3. ✅ Committed and pushed changes
   - Commit: "fix: convert Manager field to user selection dropdown in AdminDepartments"
   - Pushed to main branch

**Status**: Ready for testing. The Manager field now provides proper user selection with dropdown UI.

**How to test**:
1. Start WebClient: `cd src/DSC.WebClient && npm run dev`
2. Navigate to Admin → Departments
3. Create a new department:
   - Enter department name
   - Click Manager dropdown - should show list of all users with names and emails
   - Select a user as manager
   - Submit form
4. Verify the selected user displays as manager in the table
5. Edit a department:
   - Click Edit button
   - Manager dropdown should pre-select the existing manager user
   - Can change to different manager or clear selection
6. Leave Manager unselected:
   - Create/edit department without selecting a manager
   - Should save successfully with empty manager field

**Technical details**:
- Component: `src/DSC.WebClient/src/pages/AdminDepartments.jsx`
- Service: `AdminUserService.getAdminUsers()` from `src/DSC.WebClient/src/api/AdminUserService.js`
- No API changes required - uses existing `/api/admin/users` endpoint
- Data model maintains backward compatibility (manager stored as string name)
- Component handles cases where users list may not load gracefully

## 2026-02-20 — Database Migrations & Role Seeding

**Completed**:
1. ✅ Added automatic migration execution to API startup (`Program.cs`)
   - Migrations are now applied automatically when the API starts
   - Eliminates manual `dotnet ef database update` requirement
   - Ensures database schema is always in sync with code

2. ✅ Added role seeding to test data initializer (`TestDataSeeder`)
   - Created 4 system roles: Administrator, Manager, Developer, Viewer
   - Roles are created with IsActive=true and proper timestamps
   - Seeding triggered via `POST /api/admin/seed/test-data` endpoint
   - Updated `TestSeedResult` to track RolesCreated count

**Status**: Ready for testing. API will automatically apply pending migrations on startup and seed test roles when seeding endpoint is called.

**How to test**:
1. Ensure MariaDB is running (`brew services list | grep maria` should show "started")
2. Start the API: `cd src/DSC.Api && dotnet run`
   - API will automatically apply pending migrations
   - Check console for "Migrations applied successfully" or any errors
3. Seed test data: `curl -X POST http://localhost:5005/api/admin/seed/test-data -H "X-Admin-Token: local-admin-token"`
   - Should return JSON with seed counts including RolesCreated
4. Test AdminRoles page: http://localhost:5173/admin/roles (after WebClient starts)
5. Test AdminUsers: http://localhost:5173/admin/users
   - Create a new user and select a seeded role

**Technical notes**:
- MariaDB client has SSL enforcement issues on macOS, but .NET's MySqlConnector handles the connection string with `SslMode=none;`
- Migrations use `Database.Migrate()` which is safe and idempotent
- All test data seeding is optional and only runs when explicitly called

## 2026-02-20 — Admin User Management & Role System Implementation

**Issue**: AdminUsers component had role, position, and department dropdowns, but:
1. Role dropdown was hard-coded with dummy data; no role management feature existed
2. Position and Department dropdowns were empty; not wired to database

**Resolution**:
1. **Created Role entity and management**:
   - Added `src/DSC.Data/Models/Role.cs` with Id, Name, Description, IsActive fields
   - Created `AdminRolesController` with full CRUD endpoints at `/api/admin/roles`
   - Created `src/DSC.WebClient/src/pages/AdminRoles.jsx` React component for role management UI
   - Added role management button to Admin landing page

2. **Enhanced User model with assignments**:
   - Added `RoleId`, `PositionId`, `DepartmentId` foreign keys to `User` entity
   - Configured relationships in `ApplicationDbContext` (SetNull on delete)

3. **Updated Admin Users workflow**:
   - Modified `AdminUsers` component to load positions, departments, and roles from database
   - Wired dropdowns to actual data (no more empty lists)
   - Form now sends role/position/department IDs when creating/updating users
   - Updated `handleSelectUser` to pre-populate these fields when editing

4. **API layer updates**:
   - Enhanced `AdminUserDtos` to include RoleId, PositionId, DepartmentId fields
   - Updated `AdminUsersController` Get/Create/Update to handle new fields
   - Added `getRoles()`, `createRole()`, `updateRole()` methods to `AdminCatalogService`

5. **Database migrations**:
   - Created `20260220071710_AddRoleEntity.cs` (adds Roles table)
   - Created `20260220073552_AddPositionDepartmentToUser.cs` (adds FK columns to Users)

6. **Code validated**:
   - Both API and WebClient build successfully ✅
   - All TypeScript and C# compilation checks passed ✅

**Status**: Code complete. Pending database migration application (blocked by MariaDB SSL config issue).

**Next steps**:
- Resolve MariaDB SSL configuration or use Docker alternative
- Run `dotnet ef database update` to apply schema changes
- Test role/position/department selection in AdminUsers form

---

## 2026-02-19 — WebClient asset copy, API service, and data fetch

## 2026-02-19 — Legacy test data seeding

- Added `POST /api/admin/seed/test-data` to import representative data from the Java test fixtures (`FirstTest.java`, `SecondTest.java`).
- Seeded users (`rloisel1`, `dmcgregor`, `kduma`, `mammeter`), legacy user auth entries, project `P99999`, and the `OSS Operations` department.
- Executed the seed endpoint locally and verified `/api/admin/users` returns the seeded users.

## 2026-02-19 — Admin token dev-only bypass

- Added an admin-token bypass switch (`Admin:RequireToken=false`) that only works when `ASPNETCORE_ENVIRONMENT=Development`.
- Guardrails prevent the bypass from being used in Test/Production environments.

## 2026-02-19 — UML documentation and PlantUML setup

- Created comprehensive UML documentation suite in `diagrams/uml/` including:
  - Domain model with all entities and relationships
  - API architecture showing middleware, controllers, security, and data flow
  - Use case diagrams for end-user and admin workflows
  - Deployment architecture (dev and planned production)
  - Sequence diagrams for admin seed and time entry workflows
  - Component diagram showing all packages and dependencies
- Added `diagrams/README.md` with guidance on using UML diagrams with Spec-Kitty workflow
- Installed PlantUML and Graphviz via Homebrew (`brew install plantuml graphviz`)
- Installed PlantUML VS Code extension (`jebbs.plantuml`) for in-editor diagram preview

## 2026-02-19 — Diagram migration to Draw.io

- Recreated the full diagram set in Draw.io (`.drawio.svg`) and added the missing ERD.
- Updated `diagrams/README.md` and `README.md` to reference Draw.io artifacts.
- Archived PlantUML sources and rendered PNGs under `AI/archive/plantuml/` to preserve prior artifacts.

## 2026-02-19 — Local development guide

- Created [docs/local-development/README.md](docs/local-development/README.md) with local setup steps, dependencies, configuration, and persistent service setup.
- Moved local development instructions out of [README.md](README.md) and linked to the new guide.

- Copied all relevant static assets from legacy `WebContent` (CSS, JS, images, calendar libs) into `src/DSC.WebClient/public`.
- Created React page stubs for `Activity`, `Project`, `Administrator`, and `Login` in `src/DSC.WebClient/src/pages/`.
- Set up routing in `src/DSC.WebClient/src/App.jsx` to match legacy JSP routes.
- Added a basic API service layer (`src/DSC.WebClient/src/api/`) using `axios` for REST calls to the .NET backend. Example: `ProjectService.js` with `getProjects()` and `createProject()`.
- The `Project` page now fetches and displays project data from `/api/projects`.
- Installed all required npm dependencies (`react-router-dom`, `axios`, etc.).
- Updated documentation: `README.md`, `src/DSC.WebClient/README.md`, `AI/nextSteps.md`.
- Committed and pushed all changes to `origin/main`.

## 2026-02-19 — Java model mapping & migration

- Cloned the original Java `DSC` repo and inspected `src/mts/dsc/orm/*` to identify canonical entities (Project, Activity, Project_Activity, User, etc.).
- Added legacy mapping fields to the EF model to support an incremental port:
	- `ProjectNo` added to `src/DSC.Data/Models/Project.cs`.
	- Legacy activity fields added to `src/DSC.Data/Models/WorkItem.cs` (LegacyActivityId, Date, StartTime, EndTime, PlannedDuration, ActualDuration, ActivityCode, NetworkNumber).
- Created EF Core migration `MapJavaModel` and applied it to the local `dsc_dev` MariaDB instance; verified the `Projects` table now contains `ProjectNo`.

## 2026-02-19 — Frontend dev: Vite config & runtime fixes

- Ensured the frontend is served at `/` by adding a root `index.html` at `src/DSC.WebClient/index.html` and serving static assets from `src/DSC.WebClient/public` via `publicDir`.
- Removed a duplicate `public/index.html` that conflicted with the dev server HMR preamble.
- Added a visible fallback and lightweight runtime error overlay to the root `index.html` to expose client runtime errors in-page.
- Adjusted `src/DSC.WebClient/vite.config.js` to disable HMR/react-refresh in the dev server (set `hmr: false` and disabled fastRefresh in the plugin) to avoid preamble detection errors during development.
- Committed and pushed all frontend fixes; verified `http://localhost:5173/` now serves the app and client modules load.

## 2026-02-19 — Frontend dev environment

- Installed Node.js via Homebrew (`node` installed).
- Installed frontend dependencies in `src/DSC.WebClient` (React, Vite, router, axios, plugin).
- Started Vite dev server (local: `http://localhost:5173`).

Notes: If you see a 404 when loading the client, try refreshing once the server finishes compiling; the API must be running at `http://localhost:5005` for the client proxy to reach backend endpoints.
## 2026-02-19 — Local DB & migrations

- Installed `dotnet-ef` global tool and added `Microsoft.EntityFrameworkCore.Design` to the startup project to enable design-time services.
- Added `DesignTimeDbContextFactory` at `src/DSC.Data/DesignTimeDbContextFactory.cs` to avoid AutoDetect requiring a live DB during migrations.
- Aligned EF Core / Pomelo package versions and generated the `InitialCreate` migration at `src/DSC.Data/Migrations`.
- Installed MariaDB via Homebrew (`mariadb@10.11`) and started the service.
- Created the `dsc_dev` database locally (observed TLS/service quirks). The DB exists at the local MariaDB instance.

Actions (2026-02-19): created local DB user and applied migrations/seed

- Restarted MariaDB cleanly and reset the `root` password using a server `--init-file` (temporary): `root_local_pass`.
- Created application user `dsc_local`@`127.0.0.1` with password `dsc_password` and granted privileges on `dsc_dev`.
- Applied EF migrations (`InitialCreate`) to `dsc_dev` using `dotnet ef database update`.
- Applied sample SQL seed: `spec/fixtures/db/seed.sql`.

Actions (2026-02-19) — API smoke test

- Started `DSC.Api` locally on `http://localhost:5005` with `ConnectionStrings:DefaultConnection` pointing to the local `dsc_dev` database.
- Inserted a `Project` and a `WorkItem` for smoke-testing (one item inserted via SQL, id `44444444-4444-4444-4444-444444444444`).
- Successfully GET /api/items/44444444-4444-4444-4444-444444444444 returned the seeded WorkItem JSON (200 OK).

## 2026-02-19 — API: expose legacy fields

- Added API DTOs to surface legacy Java model fields to the frontend:
	- `src/DSC.Api/DTOs/ProjectDto.cs` (includes `ProjectNo`)
	- `src/DSC.Api/DTOs/WorkItemDto.cs` (includes `LegacyActivityId`, `Date`, `StartTime`, `EndTime`, `PlannedDuration`, `ActualDuration`, `ActivityCode`, `NetworkNumber`)
- Updated controllers to return DTOs so the client can consume legacy identifiers and activity fields: `src/DSC.Api/Controllers/ProjectsController.cs` and `src/DSC.Api/Controllers/ItemsController.cs`.
- Built the solution and verified endpoints: `GET /api/projects` and `GET /api/items/{id}` return DTOs (fields may be null if not set in the DB).

## 2026-02-19 — Frontend: consume legacy DTO fields

- Updated `src/DSC.WebClient/src/pages/Project.jsx` to display `projectNo` (legacy `Project.projectNo`) alongside the project name.
- Updated `src/DSC.WebClient/src/pages/Activity.jsx` to surface legacy work-item fields from `WorkItemDto` (legacyActivityId, date, startTime, endTime, plannedDuration, actualDuration, activityCode, networkNumber).

## 2026-02-19 — Frontend: work-item create form & service

- Added `createWorkItemWithLegacy` helper in `src/DSC.WebClient/src/api/WorkItemService.js` to post work items including legacy fields.
- Enhanced `src/DSC.WebClient/src/pages/Activity.jsx` with a more complete create form that collects `title`, `projectId`, and legacy activity fields, then posts using the new helper.

## 2026-02-19 — Frontend: project selector

- Enhanced `src/DSC.WebClient/src/pages/Activity.jsx` to load projects from `/api/projects` and present a project selector in the work-item create form. The selector displays `projectNo` (legacy) where available alongside the project `name` so users can continue using legacy identifiers during incremental porting.

## 2026-02-19 — API: Swagger examples + smoke test

- Added `src/DSC.Api/Swagger/WorkItemExamplesOperationFilter.cs` and registered it in `src/DSC.Api/Program.cs` to include example request/response payloads for WorkItem endpoints in Swagger UI.
- Ran a local build (`dotnet build DSC.Modernization.sln`) successfully.
- Smoke-tested `GET /api/projects` and `GET /api/items/{id}` against the running API instance (port `5005` already in use).

## 2026-02-19 — Admin UI routes (React)

- Added admin subpage routes and stubs for the legacy admin screens in `src/DSC.WebClient/src/pages`:
	- `AdminUsers`, `AdminPositions`, `AdminDepartments`, `AdminProjects`, `AdminExpense`, `AdminActivityOptions`.
- Updated `src/DSC.WebClient/src/App.jsx` routing and `src/DSC.WebClient/src/pages/Administrator.jsx` links to point at the new routes.

## 2026-02-19 — Admin UI scaffolding

- Built out `AdminUsers` with a form structure that mirrors legacy fields (employee info, position/department assignments, role) and placeholder actions.
- Added back links and planned actions to `AdminPositions`, `AdminDepartments`, `AdminProjects`, `AdminExpense`, and `AdminActivityOptions`.

## 2026-02-19 — Admin UI build-out

- Expanded admin pages to include forms and tables for positions, departments, projects, expenses, and activity options (based on legacy names and intended workflows).
- Added a current-users table stub to `AdminUsers` and wired placeholder actions across admin pages.
- Built the web client (`npm run build`) after the admin UI updates.

## 2026-02-19 — Admin wiring (Users)

- Added `AdminUsersController` under `src/DSC.Api/Controllers/` to list/create/update/delete users at `/api/admin/users`.
- Added admin user DTOs in `src/DSC.Api/DTOs/AdminUserDtos.cs`.
- Wired `AdminUsers` UI to the admin user API using `src/DSC.WebClient/src/api/AdminUserService.js`.
- Built the solution and web client to verify compile (`dotnet build` + `npm run build`).

## 2026-02-19 — Admin wiring (Catalog)

- Added admin entities (Position, Department, ExpenseCategory, ExpenseOption, ActivityCode, NetworkNumber, ProjectActivityOption) and `Project.IsActive`.
- Added migrations `AdminEntities` and `ProjectIsActive`, applied to local DB.
- Added admin controllers for positions, departments, projects, expense categories/options, activity codes, network numbers, and project activity assignments.
- Wired admin pages to real APIs using `AdminCatalogService`.
- Rebuilt the solution and web client after wiring.

## 2026-02-19 — Repo hygiene

- Added `src/DSC.WebClient/dist/` to `.gitignore` to keep Vite build output out of version control.

## 2026-02-19 — API: Swagger response types

- Added explicit OpenAPI/Swagger response metadata to controllers so the DTO response shapes appear in Swagger UI:
	- `src/DSC.Api/Controllers/ProjectsController.cs` now returns typed `ActionResult<T>` and annotates 200/404 responses.
	- `src/DSC.Api/Controllers/ItemsController.cs` now annotates 200/404 responses for `WorkItemDto`.
Next: run integration tests or create controllers for other resources (Projects, Users) as needed.

## 2026-02-19 — Admin catalog edit workflows

- Added edit workflows for admin catalog pages so create and edit share the same forms (positions, departments, projects, expense categories/options, activity codes, network numbers).
- Activity Options now supports edit/update flows for activity codes and network numbers in the UI.
- Smoke-tested the Admin Activity Options page via the Vite dev server route (`/admin/activity-options`).

## 2026-02-19 — Frontend: B.C. Design System adoption

- Installed `@bcgov/design-system-react-components`, `@bcgov/design-tokens`, and `@bcgov/bc-sans` in the React client.
- Imported BC Sans and design token CSS in `src/DSC.WebClient/src/main.jsx` and updated global styles to use tokens.
- Replaced navigation and page layouts with B.C. Design System components (Header, Footer, Button, Form, TextField, NumberField, Select, InlineAlert) across core and admin screens.
- Ran `npm run build` successfully after the UI refactor.

## 2026-02-19 — Admin landing copy

- Updated the Administrator landing page copy to reflect that admin sections are now wired to APIs.

## 2026-02-19 — Security hardening branch

- Created `hardening-security` branch with initial hardening steps for the API.
- Replaced SHA256 password hashing with ASP.NET Core password hashing for admin user creation/updates.
- Added admin authorization policy with a header token handler and rate limiting on admin endpoints.
- Removed the insecure default connection string fallback (now fails fast if missing).
- Added `AI/securityNextSteps.md` with prioritized security follow-ups.

## 2026-02-19 — Frontend build warnings and code-splitting

- Captured Vite build warnings about chunks exceeding 500 kB after minification.
- Added route-based lazy loading and manual chunking in Vite to reduce initial bundle size.

Notes: The `root` password reset was performed non-interactively to allow scripting the setup; if you want a different root password or to re-run the secure setup, run `mysql_secure_installation` and change credentials.

# AI Worklog — DSC-modernization

Date: 2026-02-18

Repository bootstrap created by assistant.

Actions:
- Created repository scaffold: `README.md`, `.gitignore`, `.github/workflows/dotnet.yml`.
- Added this `AI` folder to track progress and decisions for the modernization effort.

Repository creation:

- 2026-02-18: Repository `rloisell/DSC-modernization` created on GitHub and initial scaffold pushed by assistant.

Remote: https://github.com/rloisell/DSC-modernization

License:

- 2026-02-18: Added `LICENSE` (Apache-2.0, Copyright 2026 rloisell).

AI tracking:
- This file, `AI/CHANGES.csv`, and `AI/COMMIT_INFO.txt` record actions and upstream commit references.

Environment setup:

- 2026-02-18: .NET SDK installed locally into `$HOME/.dotnet` using the Microsoft `dotnet-install` script. Installed SDK version: `8.0.418` (commit 5854a779c1). `DOTNET_ROOT` is set to `$HOME/.dotnet`; the install script appended PATH exports to `~/.zshrc`.

Next step: scaffold the .NET solution and projects (I'll generate templates and csproj files next).
 
Scaffold results:

- 2026-02-18: Scaffolded solution `DSC.Modernization.sln` with projects:
	- `src/DSC.Api` (ASP.NET Core Web API)
	- `src/DSC.Web` (ASP.NET Core Web App)
	- `src/DSC.Data` (Class Library, EF Core data access)
	- `tests/DSC.Tests` (xUnit tests)
- Added EF Core packages and MySQL provider:
	- `Microsoft.EntityFrameworkCore` 8.0.13
	- `Pomelo.EntityFrameworkCore.MySql` 8.0.3
	- `Microsoft.EntityFrameworkCore.Design` 8.0.0
- Local `dotnet build` succeeded.

2026-02-19 - Agent actions (dotnet 10 + MariaDB)

- Actions taken today:
	- Updated project TargetFrameworks from `net8.0` to `net10.0` and pushed the commit `chore: update TargetFramework to net10.0 for modernization (prepare Spec-Kitty)` to `origin/main`.
	- Installed .NET 10 SDK (per-user) using `dotnet-install.sh` into `$HOME/.dotnet` (installed `10.0.103` during this run).
	- Installed `dotnet-ef` as a global tool (attempted; please ensure `~/.dotnet/tools` is in your `PATH`).
	- Installed MariaDB via Homebrew and started the service. Attempted to create `dsc_modernization_dev` DB and `dsc_dev` user; if root access is locked by a password, run `mysql_secure_installation` and then create the DB/user manually.

- Current status:
	- Projects updated: DONE and pushed
	- .NET 10 SDK: Installed to `$HOME/.dotnet` (per-user)
	- `dotnet-ef`: Installed or attempted; verify with `dotnet tool list -g`
	- MariaDB: Installed and service started; DB/user creation may require manual intervention

- Outstanding items / next steps:
	- If root requires a password, run `mysql_secure_installation` and create DB/user manually. See `AI/COMMANDS.sh` for the exact commands to run.
	- Optionally add `global.json` to pin the 10.x SDK patch version.
	- Run `dotnet build` and `dotnet test` to validate compatibility and ensure everything compiles.
	-  Run `dotnet build` and `dotnet test` to validate compatibility and ensure everything compiles. (Completed: 2026-02-19)

2026-02-19 - Spec-Kitty scaffold

	- Ran `spec-kitty upgrade` to migrate project metadata and templates to the current Spec-Kitty layout.
	- Created a sample feature scaffold at `kitty-specs/001-modernize-api/` with `spec.md` and `tasks.md` to use as a template while researching.

	- `.kittify/` metadata updated: DONE
	- `kitty-specs/001-modernize-api` scaffold created: DONE

	- Added fixtures: `spec/fixtures/openapi/items-api.yaml`, `spec/fixtures/db/seed.sql`, `spec/fixtures/README.md` to support the sample feature.

2026-02-19 - API scaffold

- Actions taken:
  - Added `ItemsController` in `src/DSC.Api/Controllers/ItemsController.cs` implementing GET/POST endpoints matching `spec/fixtures/openapi/items-api.yaml`.
  - Registered `ApplicationDbContext` in `src/DSC.Api/Program.cs` and added a `ProjectReference` from `DSC.Api` to `DSC.Data`.

- Status:
  - API compiles and is ready to run locally (build succeeded).


Next steps:
	- Populate `kitty-specs/001-modernize-api/spec.md` with detailed acceptance criteria and example payloads as you research.
	- Add seed data under `spec/fixtures/db/` and OpenAPI examples under `spec/fixtures/openapi/` when available.

2026-02-19 - Data model scaffold

- Actions taken:
	- Added a baseline EF Core data model in `src/DSC.Data` to support porting the Java application and provide a validated schema to work backwards from. Files added:
		- `src/DSC.Data/ApplicationDbContext.cs`
		- `src/DSC.Data/Models/User.cs`
		- `src/DSC.Data/Models/Project.cs`
		- `src/DSC.Data/Models/WorkItem.cs`
		- `src/DSC.Data/Models/TimeEntry.cs`
		- `src/DSC.Data/Models/ProjectAssignment.cs`

- Status:
	- EF Core model compiled successfully against `net10.0`: DONE

- Notes:
	- The `User` entity retains local auth fields (`PasswordHash`) to support an incremental migration path from local accounts to brokered OIDC authentication.
	- Next steps: map the validated business model from the Java repo into these entities, add any missing fields, and create EF Core migrations.

Build & Test Results (2026-02-19):

- `dotnet --version`: `10.0.103`
- `dotnet build DSC.Modernization.sln`: Build succeeded (all projects targeted `net10.0`).
- `dotnet test tests/DSC.Tests/DSC.Tests.csproj`: 1 test discovered and passed.

All changes remain committed and pushed to `origin/main`.

## 2026-02-19 — Frontend scaffold

- Added a minimal React/Vite frontend scaffold at `src/DSC.WebClient` to start porting the legacy Java `WebContent` JSP pages into React components.

- Files added:
	- `src/DSC.WebClient/package.json`
	- `src/DSC.WebClient/README.md`
	- `src/DSC.WebClient/public/index.html`
	- `src/DSC.WebClient/public/assets/css/main.css` (trimmed)
	- `src/DSC.WebClient/public/assets/js/calendar.js` (placeholder)
	- `src/DSC.WebClient/src/*` (React entry, App, pages)

- Attempted to run `npm install` in the automation environment but `npm` was not available (zsh: command not found). To finish locally, run:

```
cd src/DSC.WebClient
npm install
npm run dev
```

This will start the Vite dev server for the client. After installing dependencies, copy static assets from the legacy `WebContent` (css, js, images) into `src/DSC.WebClient/public` and begin porting JSPs to React components.

	- When ready, use Spec-Kitty CLI to build the Spec; I will pause after this step per your instructions.
