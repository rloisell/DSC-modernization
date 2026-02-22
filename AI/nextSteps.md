# Work Plan & Todo List — DSC Modernization

**Author**: Ryan Loiselle — Developer / Architect
**AI tool**: GitHub Copilot — AI pair programmer / code generation
**Updated**: February 2026

> **Structure**: Master TODO is always the first section — scan it at the start of every session.
> Session history follows in reverse chronological order (newest first). See `AI/WORKLOG.md` for
> full session narratives. Status: ✅ = done, ⬜ = pending.

---

## 📋 MASTER TODO

### Git Branching Strategy

All feature work flows through the `develop` integration branch.

```
main          ← production-ready; protected; PRs only from develop
  └─ develop  ← integration branch; CI runs on every push
        ├─ feature/seed-data-expansion        (Todo #1) ✅ MERGED 2026-02-22
        ├─ feature/expense-category-parity    (Todo #2)
        ├─ feature/task-deviation-report      (Todo #3)
        ├─ feature/activity-page-refactor     (Todo #4 + #6)
        ├─ feature/reports-tabs               (Todo #5)
        ├─ feature/weekly-summary             (Todo #7)
        ├─ feature/management-reports         (Todo #8)
        └─ feature/dept-roster-org-chart      (Todo #9)
```

**Per-session workflow:**
```bash
git checkout develop && git pull
git checkout -b feature/<name>
# ... do work, commit incrementally ...
git push -u origin feature/<name>
# Open PR → develop; CI + Copilot code review run automatically
```

---

### 🟥 Tier 1 — Immediate Application Value (Next 2–3 Sessions)

| Status | # | Item | Effort | Parallelizable | Branch |
|--------|---|------|--------|----------------|--------|
| ✅ | ~~**1**~~ | ~~[Seed data expansion](#todo-1) — 7 new users, 5 SW/telecom projects, 36 variance work items~~ **DONE 2026-02-22** | Low | — | ~~`feature/seed-data-expansion`~~ |
| ⬜ | **2** | [Expense category parity](#todo-2) — `ExpenseCategoryId` FK on `WorkItem` + EF migration; `<Select>` on expense form | Low | ✅ Yes | `feature/expense-category-parity` |
| ⬜ | **3** | [Personal task deviation report](#todo-3) — `GET /api/reports/task-deviation`; colour-coded deviations tab on Reports page | Low | ✅ After #1 | `feature/task-deviation-report` |
| ⬜ | **4** | [Activity page refactor](#todo-4) — extract `TabBar`; 3 tabs (New Entry / History / Templates); auto-set budget; project synopsis | Medium | ✅ After #1 | `feature/activity-page-refactor` |
| ⬜ | **5** | [Reports page tabbed layout](#todo-5) — My Summary / Task Deviation / Team Reports using shared `TabBar` | Low | ✅ After #3, #4 | `feature/reports-tabs` |
| ⬜ | **6** | [Frequent task templates](#todo-6) — `WorkItemTemplate` table + migration; Templates tab on Activity page | Medium | Bundled with #4 | (part of #4 branch) |
| ⬜ | **7** | [Weekly summary Phase 1](#todo-7) — `/weekly` route, `WeeklySummary.jsx`; this-week activities + project progress bars | Low | ✅ Fully independent | `feature/weekly-summary` |

---

### 🟧 Tier 2 — Management & Team Features (After Tier 1)

| Status | # | Item | Effort | Depends On |
|--------|---|------|--------|------------|
| ⬜ | **8** | [Management reports](#todo-8) — project effort summary + activity area deviation; role-gated to Manager/Director/Admin | Medium | #1, #3 |
| ⬜ | **9** | [Department roster & org chart](#todo-9) — list employees per department; role-appropriate views (User sees own dept, Manager sees team, Director/Admin sees full org chart) | Medium | — |

---

### 🟨 Tier 3 — Security & Compliance (Interleaved)

| Status | # | Item | Effort | Notes |
|--------|---|------|--------|-------|
| ⬜ | **10** | Audit log table — `AuditLog` entity + EF migration + `SaveChangesInterceptor` | Low | Standalone feature branch |
| ⬜ | **11** | HTTPS enforcement — `UseHttpsRedirection()` + HSTS in `Program.cs` | Low | Bundle into any feature branch |
| ⬜ | **12** | `UserAuth` password migration — replace SHA-256 with `IPasswordHasher<User>` | Low–Med | Required before production |
| ⬜ | **13** | OWASP Dependency Check — GitHub Actions workflow | Medium | Slow first run (~15 min NVD download) |
| ⬜ | **14** | OWASP ZAP DAST scan — nightly scheduled scan against `be808f-dev` | Medium | Requires deployed app URL |
| ⬜ | **15** | JWT / OIDC migration (Keycloak) — replace `X-User-Id` with bearer tokens | High | See `AI/securityNextSteps.md` |

---

### 🟦 Tier 4 — Architecture Quality (Ongoing Hygiene)

| Status | # | Item | Effort | Notes |
|--------|---|------|--------|-------|
| ⬜ | **16** | Verify `VITE_API_URL` / `window.__env__` — no hardcoded `localhost` in service files | Low | Quick audit; bundle into any PR |
| ⬜ | **17** | Structured logging (Serilog) — JSON console sink + rolling file | Low–Med | Required for BC Gov log aggregation |
| ⬜ | **18** | Standardise API response shape — `{ items, totalCount }` envelope for lists | Medium | Breaking change; coordinate with frontend |
| ⬜ | **19** | Migrate frontend to TypeScript — `.jsx` → `.tsx`; generate types from OpenAPI spec | High | Long-term; start with service files |

---

### 🔲 Tier 5 — Future / Lower Priority

| Status | # | Item | Effort | Notes |
|--------|---|------|--------|-------|
| ⬜ | **20** | Weekly summary Phase 2 — Outlook calendar (MSAL.js OAuth) | High | Confirm BC Gov tenant OAuth consent first |
| ⬜ | **21** | Weekly summary Phase 3 — Jira integration (OAuth 2.0; `UserIntegration` table; encrypted tokens) | High | Depends on #20 |
| ⬜ | **22** | Trend charts — burn-down / hours-over-time in reporting dashboard | Medium | Needs chart library decision |
| ⬜ | **23** | Email notifications — on project assignment or deactivation | Medium | Requires SMTP / MS Graph mail config |
| ⬜ | **24** | Mobile-responsive layout improvements | Medium | BC Gov DS components partially responsive |
| ⬜ | **25** | Production DB migration to managed Emerald database service | High | Requires Platform Services provisioning |

---

### Plan of Attack — Session Sequence

```
Session A  ── Seed data expansion
              Todo #1 ✅ COMPLETE — PR #19/#20, main 265f435 (2026-02-22)
              Todo #2 (expense category) ⬜ NEXT
              Branch: feature/seed-data-expansion → develop ✅ merged
                      feature/expense-category-parity → develop (next)

Session B  ── Deviation report
              Todo #3 (task deviation API + report section)
              Branch: feature/task-deviation-report → develop

Session C  ── Activity page refactor (largest single item)
              Todo #4 + #6: TabBar component, Activity tabs, budget auto-set,
              project synopsis, WorkItemTemplate model + API + Templates tab
              Branch: feature/activity-page-refactor → develop

Session D  ── Reports polish + Weekly summary
              Todo #5 (Reports tabs — uses TabBar from Session C)
              Todo #7 (Weekly summary Phase 1 — standalone, can start early)

Session E  ── Management reports + role verification
              Todo #8 (management report endpoints + Team Reports tab)

Session F  ── Dept roster + org chart
              Todo #9 (department member listing, role-gated views, org chart)
              Branch: feature/dept-roster-org-chart → develop

Session G  ── Security hardening sprint
              Todo #10–#12 (audit log, HTTPS, password migration)

Session H  ── DevSecOps
              Todo #13–#15 (OWASP + JWT/OIDC)
```

> Todo #7 (weekly summary Phase 1) and Todo #9 (dept roster) are fully independent
> and can slot into any session with spare capacity.

---

## 📌 Todo Specifications

### Todo #1 — Seed Data Expansion ✅ COMPLETE 2026-02-22
**Branch:** `feature/seed-data-expansion` → develop (PR #19) → main (PR #20)
**Commits:** `573324b`, `d7a9869` (EF Core List<string> fix), `f8c08e6` (merge develop), `265f435` (main)

Added to `TestDataSeeder.cs`: 7 new users (jbennett/tclarke = Director, mfields/rchang = Manager,
swright/pgarcia/dkim = User), 5 SW/telecom projects (P3001–P3005), 36 variance work items,
project assignments. Fixed Director role never being assigned (pre-existing bug). Fixed EF Core
`ReadOnlySpan<string>` conflict on x64 Linux by using `List<string>` for all LINQ collection vars.

**EF Core rule (DO NOT FORGET):** On .NET 10 x64 Linux, `new[]` implicit string arrays in LINQ
`.Where()` pick up the `ReadOnlySpan<string>.Contains()` overload. EF Core cannot translate this.
**Always use `List<string>` for collection variables in LINQ expressions.**

---

### Todo #2 — Expense Category Parity
**Files:** `WorkItem.cs`, `WorkItemDto.cs`, `WorkItemService.cs`, `Activity.jsx`, new EF migration

1. Add `Guid? ExpenseCategoryId` + navigation property `ExpenseCategory?` to `WorkItem`
2. `dotnet ef migrations add AddExpenseCategoryToWorkItem`
3. Add `ExpenseCategoryId` and `ExpenseCategoryName` to `WorkItemCreateRequest`, `WorkItemDto`, `WorkItemDetailDto`
4. Update `WorkItemService` — persist on create; project in queries
5. In `Activity.jsx`: load from `/api/catalog/expense-categories`; render required `<Select>` when `activityMode === 'expense'`

---

### Todo #3 — Personal Task Deviation Report
**Files:** `ReportDtos.cs`, `IReportService.cs`, `ReportService.cs`, `ReportsController.cs`, `Reports.jsx`

1. Add `TaskDeviationDto`: `{ WorkItemId, Title, ProjectId, ProjectName, Date, PlannedDurationHours, ActualDurationHours, DeviationHours, DeviationPercent }`
2. Add `GetTaskDeviationAsync(DateTime? from, DateTime? to, Guid? projectId, Guid? callerId)` to `IReportService`
3. Implement in `ReportService` — LINQ over `WorkItems`, compute deviation, scope by caller role
4. Add `GET /api/reports/task-deviation` to `ReportsController`
5. Deviation tab in `Reports.jsx` with colour-coded rows (green ≤ 0%, red ≥ +10%, neutral otherwise)

---

### Todo #4 + #6 — Activity Page Refactor + Frequent Task Templates
**Files:** New `TabBar.jsx`, `Activity.jsx`, new `WorkItemTemplate` migration, `TemplateService.cs`

**Part A — Shared `TabBar` component** (do first — also used by Todo #5)
- Create `src/DSC.WebClient/src/components/TabBar.jsx`
- Props: `tabs: { id, label }[]`, `activeTab`, `onChange`
- Replace tab markup in `Administrator.jsx` with `<TabBar />`

**Part B–E:** Activity tabs (New Entry / History / Templates), budget auto-set
(CAPEX for project, OPEX for expense), project synopsis panel on History tab,
`WorkItemTemplate` model + API (`GET/POST/DELETE /api/templates`), Templates tab
with Use/Delete/Save-as-Template actions.

---

### Todo #5 — Reports Page Tabbed Layout
**File:** `Reports.jsx`

Import `<TabBar />`. Tabs: My Summary | Task Deviation | Team Reports.
Team Reports tab: role-gated — "Insufficient permissions" for User role; full Team Reports content from Todo #8.

---

### Todo #7 — Weekly Summary Phase 1
**Files:** New `WeeklySummary.jsx`, `App.jsx` route, sidebar nav

Sections: This Week's Activities (`/api/items?timePeriod=week`), Project Progress bars,
Outstanding Tasks placeholder. Route `/weekly`. Nav link added.

---

### Todo #8 — Management Reports
**Files:** `ReportDtos.cs`, `IReportService.cs`, `ReportService.cs`, `ReportsController.cs`, `Reports.jsx`

1. Verify `AuthController` issues `role` claim; add if missing
2. `ProjectEffortSummaryDto`: `{ ProjectId, ProjectNo, ProjectName, EstimatedHours, TotalPlannedHours, TotalActualHours, EstimateVsActualPct, PlannedVsActualPct }`
3. `ActivityAreaDeviationDto`: `{ ActivityCode, ActivityDescription, TotalPlannedHours, TotalActualHours, DeviationHours, DeviationPct }`
4. Implement both in `ReportService` — aggregate across users, scoped by Manager's team / Director's full view
5. `GET /api/reports/project-effort-summary` and `GET /api/reports/activity-area-deviation` with `[Authorize(Roles = "Admin,Manager,Director")]`
6. Populate Team Reports tab in `Reports.jsx` (wired up as placeholder in Todo #5)

---

### Todo #9 — Department Roster & Org Chart

**Background:** The data model (`Department` → `User`) already captures which employees belong to
which department. Neither the legacy Java app nor the modernization currently exposes this as a
browsable list. Identified as missing feature during testing on 2026-02-22.

**Role-based views:**

| Role | What they see |
|------|--------------|
| **User** | Their own department name, manager name, and roster of direct teammates |
| **Manager** | Full department roster with position and role per member; workload summary per person |
| **Director** | All departments in scope: each card shows manager + member count; drillable into any dept |
| **Admin** | Full org chart: all departments, all managers, all members; exportable |

**A — API endpoints**
- `GET /api/departments/{id}/members` — returns `DepartmentRosterDto`; role-gated (User → own dept only, Manager → their dept, Director/Admin → any)
- `GET /api/org-chart` — Director/Admin only; returns `OrgChartDto`

**B — DTOs** (add to `AdminCatalogDtos.cs`):
```csharp
public record DepartmentMemberDto(Guid UserId, string FullName, string Username, string Position, string Role, bool IsActive);
public record DepartmentRosterDto(Guid DepartmentId, string DepartmentName, DepartmentMemberDto? Manager, DepartmentMemberDto[] Members);
public record OrgChartDto(DepartmentRosterDto[] Departments);
```

**C — Service layer**
- `GetDepartmentRosterAsync(Guid deptId, Guid callerId)` in `IDepartmentService`
- `GetOrgChartAsync()` — Director/Admin only

**D — Frontend**

*Admin → "Team" tab (add to Administrator.jsx tab bar):*
- Renders `OrgChart.jsx`: list of department cards (name, manager, member count); click to expand roster

*User-facing "My Team" page:*
- Route `/myteam`, component `MyTeam.jsx`
- Shows: department name, manager name + contact, list of teammates (name, position)
- **My Team** nav link in sidebar

**E — Org chart visual (optional enhancement, same branch)**
- Simple tree-view `OrgChartTree.jsx` using CSS nested lists or react-d3-tree
- "View as chart" toggle on Admin org chart page

**Branch:** `feature/dept-roster-org-chart`  
**Effort:** Medium (data model already there; mostly API + UI)  
**Dependencies:** None

---

## 📅 Session History (most recent first)

---

### 2026-02-22 — Session A: Seed Data Expansion (Todo #1)

**Commits:**
- `573324b` feat: expand seed data (7 users, 5 projects, 36 work items)
- `d7a9869` fix: use List<string> for EF Core LINQ collections (x64 Linux ReadOnlySpan conflict)
- `f8c08e6` Merge PR #19 → develop
- `265f435` Merge PR #20 → main
- `6012594` docs: mark Todo #1 complete in nextSteps.md
- `2142c8a` docs: update AI tracking files
- `24aea17` Merge PR #21 → main
- `c2f8c34` Merge PR #22 → main

**Files changed:** `src/DSC.Api/Seeding/TestDataSeeder.cs` (+178/-15 lines), `AI/nextSteps.md`, `AI/WORKLOG.md`, `AI/CHANGES.csv`, `AI/COMMIT_INFO.txt`, `AI/COMMANDS.sh`

**Key decisions:**
- EF Core + .NET 10 x64 Linux: `new[]` arrays pick up `ReadOnlySpan<string>.Contains()` overload — must use `List<string>` in all LINQ `.Where()` expressions
- Director role had been seeded but never assigned — fixed in this session
- All 12 projects: P99999, P1001–P1005, P2001–P2002, P3001–P3005
- All 11 users now seeded with correct roles

---

### 2026-02-21 — Standards Compliance & DevOps Hardening

**Commits:** `ca9d5be`, `c621b2c`

**Gaps closed:**
- C1: `dotnet.yml` → `build-and-test.yml` (.NET 10, develop branch trigger, frontend tests)
- C2: Vitest + React Testing Library installed; 9 passing tests
- C3: Trivy image scans in `build-and-push.yml`
- C4: Datree policy coverage extended to `charts/dsc-app` in gitops repo
- C5: Stale TODO in gitops `ci.yml` removed
- P2: `publish-on-tag.yml` GitHub Releases on `v*` tags
- P3: `codeql.yml` CodeQL SAST
- P6: Branch protection Ruleset `13091113` active on `main` ✅
- P7: `dependabot.yml`
- P8: `copilot-review.yml` AI code review on every non-draft PR

---

### 2026-02-21 — Architecture, ERDs, Admin Polish, Bug Fix

**Commits:** `d46f97f`, `eed1def`, `2862998`, `1789957`, `876d9b0`, `108c5bb`, `392a6b1`

- ERD diagrams: `erd-current.drawio/.puml` and `erd-java-legacy.drawio/.puml`
- `docs/data-model/README.md` — entity mapping guide between Java and .NET models
- Admin Project Assignments: "Role" → "Position" column; user/position filter dropdowns; button variant consistency
- Bug fix: Reports page 400 on filter clear — BCGOV React Aria Select requires non-empty item keys; sentinel `'__all__'` pattern
- All 9 original backlog priorities shipped ✅

---

### 2026-02-20 — UX Polish, Auth Fix, Admin Tabs, Project Assignments

**Commits:** `78a7041`, `72354be`

- Global axios interceptor: auto-attaches `X-User-Id` — fixed Admin 401 errors
- Activity Code / Network Number: replaced two dropdowns with radio-button pair-selection table
- `Administrator.jsx`: rewritten as 7-tab container
- Role-based project filtering: User → assigned projects only; Admin/Manager/Director → all projects
- `AdminProjectAssignmentsController`: full CRUD + `EstimatedHours` per assignment
- Budget auto-selection: CAPEX (project) / OPEX (expense)
- Service layer architecture established; global exception handler (RFC 7807 ProblemDetails)

---

### Earlier Development — Sessions 1–5 (Feb 2026)

- Cumulative remaining hours endpoint `/api/items/project/{id}/remaining-hours`
- Project summary table in Activity page with OVERBUDGET visual warnings
- EF Core migrations replacing `EnsureCreated()`; TanStack Query v5 on frontend
- Health check endpoints; initial seed data; `AdminProjectAssignments` foundation
- Form fixes: expense activities hide hour fields; project activities show 3 cumulative hour fields

*See `AI/WORKLOG.md` for full session narratives.*
