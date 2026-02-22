# Feature Specification: Department Roster & Org Chart

**Feature Slug**: `008-dept-roster-org-chart`
**Feature Branch**: `feature/dept-roster-org-chart`
**Created**: 2026-02-22
**Status**: Ready — no dependencies
**Priority**: Tier 2 (Todo #9)

The `Department → User` relationship is already modelled in the database but is
not exposed to users. This feature adds role-appropriate views: a "My Team" page
for Users, team management for Managers, cross-department views for Directors, and
a full org chart for Admins.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — User views own department roster (Priority: P1)

As a DSC User, I want to see a list of my teammates in my department so I know
who is on my team and who my manager is.

**Independent Test**: GET `/api/departments/{id}/members` with `X-User-Id` set to
a User in that department; expect 200 with `DepartmentRosterDto` containing the
user's teammates.

**Acceptance Scenarios**:
1. **Given** I am in Department A, **When** GET `/api/departments/{deptId}/members`,
   **Then** response returns `DepartmentRosterDto` with my department's members.
2. **Given** I try to access a different department's roster, **When** GET with a
   different `deptId`, **Then** 403 Forbidden.
3. **Given** I navigate to `/myteam`, **When** the page renders, **Then** I see my
   department name, my manager's name, and my teammates listed.

---

### User Story 2 — Manager views full team roster (Priority: P1)

As a Manager, I want to see my full department roster with each member's position
and role so I can see my team composition.

**Acceptance Scenarios**:
1. **Given** I am a Manager, **When** GET `/api/departments/{my-dept-id}/members`,
   **Then** response includes all members with `position`, `role`, and `isActive`.
2. **Given** I try to access another Manager's department, **When** GET, **Then** 403.

---

### User Story 3 — Director/Admin views org chart (Priority: P2)

As a Director or Admin, I want to see all departments in a single org chart view
so I can understand the organisation's structure.

**Independent Test**: GET `/api/org-chart` as Director; expect 200 with
`OrgChartDto` containing all departments.

**Acceptance Scenarios**:
1. **Given** I am a Director or Admin, **When** GET `/api/org-chart`, **Then** response
   includes all departments, each with `manager` and `members` array.
2. **Given** I am a User or Manager, **When** GET `/api/org-chart`, **Then** 403.

---

### Edge Cases

- Departments with no assigned manager: `DepartmentRosterDto.Manager` is null.
- Inactive users: included in the roster with `isActive: false` (not hidden).
- Admin org chart is exportable (CSV download button in a future iteration; placeholder in this feature).

---

## Requirements *(mandatory)*

### Functional Requirements

**API:**
- **FR-008-001**: `GET /api/departments/{id}/members` → `DepartmentRosterDto`; role-gated:
  - User → own department only (403 for others)
  - Manager → their department only
  - Director/Admin → any department
- **FR-008-002**: `GET /api/org-chart` → `OrgChartDto`; Director/Admin only (403 for User/Manager).

**DTOs** (add to `AdminCatalogDtos.cs`):
```csharp
public record DepartmentMemberDto(Guid UserId, string FullName, string Username, string Position, string Role, bool IsActive);
public record DepartmentRosterDto(Guid DepartmentId, string DepartmentName, DepartmentMemberDto? Manager, DepartmentMemberDto[] Members);
public record OrgChartDto(DepartmentRosterDto[] Departments);
```

**Service:**
- **FR-008-003**: `GetDepartmentRosterAsync(Guid deptId, Guid callerId)` in `IDepartmentService` — enforces role-based access.
- **FR-008-004**: `GetOrgChartAsync()` — Director/Admin only.

**Frontend:**
- **FR-008-005**: Route `/myteam` → `MyTeam.jsx` — shows department name, manager, teammates.
- **FR-008-006**: Sidebar nav link "My Team".
- **FR-008-007**: Admin "Team" tab in `Administrator.jsx` → `OrgChart.jsx` component showing department cards (name, manager, member count); click to expand roster.
- **FR-008-008**: Optional enhancement (same branch): "View as chart" toggle in Admin org chart using CSS-nested-list tree view.

---

## Success Criteria *(mandatory)*

- **SC-001**: User sees only their department; 403 for other departments.
- **SC-002**: Manager sees full roster with position and role per member.
- **SC-003**: Director/Admin GET `/api/org-chart` returns all departments.
- **SC-004**: `/myteam` route renders correctly for a seeded User.
- **SC-005**: Admin org chart tab shows all departments with expand/collapse.
- **SC-006**: CI passes.

---

## Implementation Notes

- The `Department` table and `User.DepartmentId` FK already exist — no new migration needed.
- `Manager` is identified by `User.Role == "Manager"` within the department (or a future `DepartmentManagerId` FK — keep as role-based lookup for now).
- `FullName` is `User.FirstName + " " + User.LastName` (or however the User entity stores name).

## Artifacts to Provide

- `spec/fixtures/openapi/department-roster-response.json`
- `spec/fixtures/openapi/org-chart-response.json`
