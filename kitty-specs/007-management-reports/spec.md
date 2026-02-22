# Feature Specification: Management Reports

**Feature Slug**: `007-management-reports`
**Feature Branch**: `feature/management-reports`
**Created**: 2026-02-22
**Status**: Ready — depends on feature 003 (deviation report patterns) and feature 005 (Team Reports tab placeholder)
**Priority**: Tier 2 (Todo #8)

Provide Managers, Directors, and Admins with two aggregate reports: a
Project Effort Summary showing estimate vs. actual utilisation per project,
and an Activity Area Deviation showing average planned vs. actual hours per
activity code across their team.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Manager views project effort summary (Priority: P1)

As a Manager, I want to see a table of all projects in my team showing estimated,
planned, and actual hours so I can identify which projects are over or under
utilising budget.

**Independent Test**: GET `/api/reports/project-effort-summary` with `X-User-Id`
set to a Manager; expect 200 with `ProjectEffortSummaryDto[]` scoped to that
Manager's team.

**Acceptance Scenarios**:
1. **Given** a Manager with multiple team members on multiple projects, **When** GET
   `/api/reports/project-effort-summary`, **Then** one row per project with
   `estimatedHours`, `totalPlannedHours`, `totalActualHours`,
   `estimateVsActualPct`, `plannedVsActualPct`.
2. **Given** a Director, **When** GET `/api/reports/project-effort-summary`, **Then**
   all projects across all departments are returned.
3. **Given** a User role, **When** GET `/api/reports/project-effort-summary`, **Then**
   403 Forbidden.

---

### User Story 2 — Manager views activity area deviation (Priority: P2)

As a Manager, I want to see how my team's actual hours compare to planned hours
per activity code so I can identify patterns of under-reporting or overrun.

**Independent Test**: GET `/api/reports/activity-area-deviation` as Manager; expect
200 with `ActivityAreaDeviationDto[]`.

**Acceptance Scenarios**:
1. **Given** a Manager's team has work items across multiple activity codes, **When**
   GET `/api/reports/activity-area-deviation`, **Then** one row per activity code with
   aggregate planned and actual hours and deviation.
2. **Given** an empty result (no items for that scope), **When** GET, **Then** `[]`
   with 200.

---

### Edge Cases

- `estimateVsActualPct` when `estimatedHours == 0` → return null (not divide-by-zero).
- Activity codes with only one entry should still appear in the deviation table.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-007-001**: Add `ProjectEffortSummaryDto`: `{ ProjectId, ProjectNo, ProjectName, EstimatedHours, TotalPlannedHours, TotalActualHours, EstimateVsActualPct, PlannedVsActualPct }`.
- **FR-007-002**: Add `ActivityAreaDeviationDto`: `{ ActivityCode, ActivityDescription, TotalPlannedHours, TotalActualHours, DeviationHours, DeviationPct }`.
- **FR-007-003**: Implement both in `ReportService` — aggregate across users in scope, scoped by Manager's team / Director's full view.
- **FR-007-004**: Add `GET /api/reports/project-effort-summary` — role-gated to Manager/Director/Admin.
- **FR-007-005**: Add `GET /api/reports/activity-area-deviation` — role-gated to Manager/Director/Admin.
- **FR-007-006**: Populate the Team Reports tab in `Reports.jsx` (stubbed in feature 005) with both tables.

---

## Success Criteria *(mandatory)*

- **SC-001**: Both endpoints return accurate aggregates for seeded data.
- **SC-002**: Role-gating: 403 for User role; 200 for Manager/Director/Admin.
- **SC-003**: `ProjectEffortSummaryDto.EstimateVsActualPct` is null when estimated = 0.
- **SC-004**: Team Reports tab displays both tables, each with correct column headers.
- **SC-005**: CI passes.

---

## Implementation Notes

- Verify `AuthController` issues a `role` claim in the JWT/X-User-Id response; add if missing.
- Use `[Authorize(Roles = "Admin,Manager,Director")]` on both controller actions.
- Scope logic: Manager → filter by `User.DepartmentId == caller.DepartmentId`; Director → all departments.

## Artifacts to Provide

- `spec/fixtures/openapi/project-effort-summary-response.json`
- `spec/fixtures/openapi/activity-area-deviation-response.json`
