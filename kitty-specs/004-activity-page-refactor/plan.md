# Implementation Plan: 004-activity-page-refactor

**Feature**: Activity Page Refactor + Frequent Task Templates
**Branch**: `feature/activity-page-refactor` → `develop`
**Estimated Effort**: Medium (1 full session, parallelizable parts)

---

## Phases

### Phase 1 — Shared TabBar Component (do first — unblocks activity and reports)

1. Create `src/DSC.WebClient/src/components/TabBar.jsx`
2. Replace `Administrator.jsx` tab markup with `<TabBar />`
3. Smoke-test Administrator tabs still work

### Phase 2 — WorkItemTemplate Data Layer

4. Create `WorkItemTemplate` entity in `src/DSC.Api/Infrastructure/`
5. Register DbSet in `ApplicationDbContext`
6. Create migration `AddWorkItemTemplates`

### Phase 3 — Template Service & API

7. Create `ITemplateService` + `TemplateService`
8. Add `TemplatesController` with GET/POST/DELETE
9. Register service in `Program.cs`

### Phase 4 — Activity Page Restructure

10. Convert `Activity.jsx` to three-tab layout using `<TabBar />`
11. Implement budget auto-set logic (CAPEX/OPEX)
12. Add project synopsis panel to History tab
13. Add Templates tab: list, "Use", "Delete", "Save as Template"
14. Wire "Use" to pre-fill New Entry form and switch tab

### Phase 5 — Tests & CI

15. Test template CRUD via API
16. Verify CI passes
