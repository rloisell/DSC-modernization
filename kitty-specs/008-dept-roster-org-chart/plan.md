# Implementation Plan: 008-dept-roster-org-chart

**Feature**: Department Roster & Org Chart
**Branch**: `feature/dept-roster-org-chart` → `develop`
**Estimated Effort**: Medium (1 session)
**Dependencies**: None (data model already exists)

---

## Phases

### Phase 1 — DTOs

1. Add `DepartmentMemberDto`, `DepartmentRosterDto`, `OrgChartDto` to `AdminCatalogDtos.cs`

### Phase 2 — Service

2. Create `IDepartmentService` with `GetDepartmentRosterAsync` and `GetOrgChartAsync`
3. Implement `DepartmentService`:
   - Query `Users` filtered by `DepartmentId`; include `Department`
   - Identify manager by role within department
   - Enforce caller role access control (403 via `ForbiddenException`)
4. Register service in `Program.cs`

### Phase 3 — Controller

5. Create `DepartmentsController`:
   - `GET /api/departments/{id}/members`
   - `GET /api/org-chart`

### Phase 4 — Frontend: My Team page

6. Create `MyTeam.jsx` and `useMyTeam.js` hook
7. Add `/myteam` route in `App.jsx`
8. Add "My Team" nav link

### Phase 5 — Frontend: Admin Org Chart tab

9. Create `OrgChart.jsx` component (department cards)
10. Add "Team" tab to `Administrator.jsx` tab bar

### Phase 6 — Tests & CI

11. Test roster scoping (User → own dept, Manager → own dept, Director → any)
12. Test org chart role gating
13. CI verification
