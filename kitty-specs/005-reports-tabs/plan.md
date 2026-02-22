# Implementation Plan: 005-reports-tabs

**Depends on**: `feature/activity-page-refactor` (for `TabBar.jsx`), `feature/task-deviation-report` (for API)
**Estimated Effort**: Low (2–3 hours)

---

## Phases

### Phase 1 — Tabbed Layout

1. Import `<TabBar />` (or create inline if 004 not merged yet)
2. Restructure `Reports.jsx` to three tabs
3. Role-gate Team Reports tab

### Phase 2 — Wire Task Deviation Tab

4. Import `useTaskDeviationReport` hook (from feature 003)
5. Render deviation table in the tab

### Phase 3 — CI

6. Push branch; verify CI passes
