# Implementation Plan: 007-management-reports

**Feature**: Management Reports
**Branch**: `feature/management-reports` → `develop`
**Estimated Effort**: Medium (1 session)
**Depends on**: feature 003 (for `ReportService` pattern) and feature 005 (Team Reports tab)

---

## Phases

### Phase 1 — Auth Role Verification

1. Confirm `AuthController` includes `role` claim in response / session
2. Add role claim if missing

### Phase 2 — DTOs and Service

3. Add `ProjectEffortSummaryDto` and `ActivityAreaDeviationDto` to `ReportDtos.cs`
4. Add method signatures to `IReportService`
5. Implement in `ReportService`:
   - `GetProjectEffortSummaryAsync(Guid callerId)` — scope by role
   - `GetActivityAreaDeviationAsync(Guid callerId)` — scope by role

### Phase 3 — Controller

6. Add two endpoints to `ReportsController` with `[Authorize(Roles = "Admin,Manager,Director")]`

### Phase 4 — Frontend

7. Replace Team Reports placeholder in `Reports.jsx` with two tables
8. Wire TanStack Query hooks for both endpoints

### Phase 5 — Tests & CI

9. Add xUnit tests for both service methods
10. Verify CI passes
