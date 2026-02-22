# Implementation Plan: 006-weekly-summary

**Feature**: Weekly Summary Phase 1
**Branch**: `feature/weekly-summary` → `develop`
**Estimated Effort**: Low (2–4 hours) — fully independent

---

## Phases

### Phase 1 — API (if timePeriod=week not supported)

1. Add `timePeriod` query param support to `WorkItemController` / `WorkItemService`
   (`week` → filter to current Mon–Sun)

### Phase 2 — Page & Route

2. Create `WeeklySummary.jsx` with three sections:
   - This Week's Activities (fetched, grouped by project)
   - Project Progress Bars (from `/api/items/project/{id}/remaining-hours`)
   - Outstanding Tasks placeholder
3. Add `/weekly` route in `App.jsx`
4. Add "My Week" nav link in sidebar component

### Phase 3 — CI

5. Push branch; verify CI passes
