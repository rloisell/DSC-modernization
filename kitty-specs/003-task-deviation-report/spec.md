# Feature Specification: Personal Task Deviation Report

**Feature Slug**: `003-task-deviation-report`
**Feature Branch**: `feature/task-deviation-report`
**Created**: 2026-02-22
**Status**: Ready
**Priority**: Tier 1 (Todo #3)

Provide each user with a report showing the variance between planned and actual
hours per work item, colour-coded for quick scanning.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View my own task deviation (Priority: P1)

As a DSC User, I want to see a report of how much my actual hours deviate from
planned hours so I can identify tasks where I consistently over- or under-run.

**Independent Test**: GET `/api/reports/task-deviation` as a standard User; expect
200 with an array of `TaskDeviationDto` scoped to the requesting user's work items.

**Acceptance Scenarios**:
1. **Given** I have work items with both `plannedDurationHours` and `actualDurationHours`,
   **When** GET `/api/reports/task-deviation`, **Then** response includes deviation
   hours and percentage for each item.
2. **Given** I filter by `projectId`, **When** GET with `?projectId=<id>`, **Then**
   only items for that project are returned.
3. **Given** I filter by date range, **When** GET with `?from=<date>&to=<date>`, **Then**
   only items within the range are included.

---

### User Story 2 — Colour-coded deviation table (Priority: P2)

As a DSC User viewing the Task Deviation tab, I want rows colour-coded by severity
so I can immediately spot problematic items.

**Independent Test**: Render the Task Deviation tab in a test user's Reports page;
verify row CSS classes match the deviation threshold rules.

**Acceptance Scenarios**:
1. **Given** `deviationPercent <= 0`, **When** row renders, **Then** row has green
   indicator (on time or under).
2. **Given** `deviationPercent >= 10`, **When** row renders, **Then** row has red
   indicator (overrun ≥ 10%).
3. **Given** deviation is between 1–9%, **When** row renders, **Then** row has a
   neutral/amber indicator.

---

### Edge Cases

- Work items with `plannedDurationHours == 0` should show deviation as `N/A` not divide-by-zero.
- Admin/Manager/Director receive all items across their scope; User receives only their own.
- Empty result set returns `[]` with 200, not 404.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-003-001**: Add `TaskDeviationDto` record:
  `{ WorkItemId, Title, ProjectId, ProjectName, Date, PlannedDurationHours, ActualDurationHours, DeviationHours, DeviationPercent }`.
- **FR-003-002**: Add `GetTaskDeviationAsync(DateTime? from, DateTime? to, Guid? projectId, Guid? callerId)` to `IReportService`.
- **FR-003-003**: Implement in `ReportService` — LINQ over WorkItems, compute deviation, scope result by caller role.
- **FR-003-004**: Add `GET /api/reports/task-deviation` endpoint to `ReportsController`; accepts optional `from`, `to`, `projectId` query params.
- **FR-003-005**: Add a "Task Deviation" tab to `Reports.jsx` with colour-coded rows.

### Key Computation

```
deviationHours   = actualDurationHours - plannedDurationHours
deviationPercent = plannedDurationHours > 0
                     ? (deviationHours / plannedDurationHours) * 100
                     : null
```

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: API returns correctly computed deviation values for seeded test data.
- **SC-002**: User role only sees their own items; Manager/Director/Admin see their scope.
- **SC-003**: Frontend tab renders with correct colour classes for all three deviation bands.
- **SC-004**: CI passes on feature branch.

---

## Implementation Notes

- `DeviationPercent` should be `decimal?` to handle the null-on-zero-planned case.
- Use the existing `callerId` role-scoping pattern from `WorkItemService` for auth.
- Colour-coding via inline style or Tailwind/BC Gov DS utility classes on the `<tr>` element.

## Artifacts to Provide

- `spec/fixtures/openapi/task-deviation-response.json` — example API response
