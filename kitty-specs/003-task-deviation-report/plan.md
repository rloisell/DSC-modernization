# Implementation Plan: 003-task-deviation-report

**Feature**: Personal Task Deviation Report
**Branch**: `feature/task-deviation-report` → `develop`
**Estimated Effort**: Low (half-session)

---

## Phases

### Phase 1 — API Layer

1. Add `TaskDeviationDto` to `ReportDtos.cs`
2. Add `GetTaskDeviationAsync` signature to `IReportService`
3. Implement in `ReportService` — LINQ query with deviation computation, role scoping
4. Add `GET /api/reports/task-deviation` to `ReportsController`

### Phase 2 — Frontend

5. Add TanStack Query hook `useTaskDeviationReport(filters)` in `src/hooks/`
6. Add "Task Deviation" tab in `Reports.jsx` (tab management already in place from Todo #5 — or add standalone div if #5 not done yet)
7. Render table with colour-coded rows using BC Gov DS

### Phase 3 — Tests & CI

8. Add xUnit test for `GetTaskDeviationAsync` with seeded data
9. Confirm CI passes

---

## Sequence Dependencies

Phase 1 → Phase 2 (API must exist before hooking up frontend)
Phase 3 runs after Phase 1 is complete
