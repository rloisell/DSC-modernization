# Feature Specification: Activity Page Refactor + Frequent Task Templates

**Feature Slug**: `004-activity-page-refactor`
**Feature Branch**: `feature/activity-page-refactor`
**Created**: 2026-02-22
**Status**: Ready
**Priority**: Tier 1 (Todo #4 + #6, bundled)

The Activity page is the most-used page in the application. This feature refactors
it into a three-tab layout (New Entry / History / Templates), extracts a reusable
`TabBar` component (also consumed by the Reports page in feature 005), adds smart
budget auto-selection, adds a project synopsis panel, and introduces the
`WorkItemTemplate` model for saving and reusing frequent tasks.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Tab navigation on Activity page (Priority: P1)

As a DSC User, I want the Activity page to have tabs so I can switch between
logging a new entry, viewing my history, and managing my templates without
navigating away.

**Independent Test**: Render `Activity.jsx`; confirm three tabs exist; switching
tabs renders the correct section without a page reload.

**Acceptance Scenarios**:
1. **Given** the user lands on the Activity page, **When** it renders, **Then** three
   tabs are visible: "New Entry", "History", "Templates".
2. **Given** the "History" tab is active, **When** clicking "New Entry", **Then** the
   new entry form is displayed.
3. The `TabBar` component is a shared component importable by other pages.

---

### User Story 2 — Budget auto-selection (Priority: P2)

As a DSC User, I want the budget type to be automatically selected based on my
activity type so I don't have to set it manually.

**Acceptance Scenarios**:
1. **Given** `activityMode === 'project'`, **When** the form renders, **Then** budget
   is auto-set to CAPEX and is read-only.
2. **Given** `activityMode === 'expense'`, **When** the form renders, **Then** budget
   is auto-set to OPEX and is read-only.

---

### User Story 3 — Save and reuse a frequent task template (Priority: P2)

As a DSC User who performs the same task regularly, I want to save a work item as
a template so I can quickly create future entries with pre-filled values.

**Independent Test**: POST `/api/templates` with a valid template payload; confirm
201 response; GET `/api/templates` returns the saved template; DELETE removes it.

**Acceptance Scenarios**:
1. **Given** the user completes a work item, **When** they click "Save as Template",
   **Then** a template is created with the same fields.
2. **Given** a template exists, **When** the user clicks "Use", **Then** the New Entry
   form is pre-filled with the template values.
3. **Given** an existing template, **When** DELETE `/api/templates/{id}`, **Then** 204
   response and template no longer appears in the list.

---

### User Story 4 — Project synopsis panel (Priority: P3)

As a DSC User viewing their history tab, I want to see a project synopsis
(estimated vs actual hours) so I can track budget health at a glance.

**Acceptance Scenarios**:
1. **Given** the History tab is active and a project is selected, **When** the tab
   renders, **Then** a synopsis panel shows estimated hours, total planned, total
   actual, and OVERBUDGET warning if applicable.

---

### Edge Cases

- `TabBar` must handle keyboard navigation (tab/arrow keys) for accessibility.
- Budget auto-set should not override a manually chosen budget if the user
  explicitly changes the activity type mid-form.
- Templates with deleted projects should still render gracefully (project name shown
  as "Unknown Project").

---

## Requirements *(mandatory)*

### Functional Requirements

**TabBar component:**
- **FR-004-001**: Create `src/DSC.WebClient/src/components/TabBar.jsx` with props:
  `tabs: { id: string, label: string }[]`, `activeTab: string`, `onChange: (id) => void`.
- **FR-004-002**: Replace tab markup in `Administrator.jsx` with `<TabBar />`.

**Activity page restructure:**
- **FR-004-003**: Convert Activity page to three tabs: New Entry / History / Templates.
- **FR-004-004**: Auto-select CAPEX for project activities; OPEX for expense activities.
- **FR-004-005**: Project synopsis panel on History tab showing budget vs. actual summary.

**WorkItemTemplate (Todo #6):**
- **FR-004-006**: Add `WorkItemTemplate` entity: `Id`, `UserId`, `TemplateName`,
  `ActivityCode`, `NetworkNumber`, `ProjectId`, `PlannedDurationHours`,
  `ActualDurationHours`, `BudgetType`, `Notes`, `CreatedAt`.
- **FR-004-007**: EF Core migration `AddWorkItemTemplates`.
- **FR-004-008**: `GET /api/templates` — returns templates for calling user.
- **FR-004-009**: `POST /api/templates` — creates a new template.
- **FR-004-010**: `DELETE /api/templates/{id}` — deletes template if owned by caller.
- **FR-004-011**: Templates tab in Activity page: list templates with "Use" and "Delete".
- **FR-004-012**: "Use" action pre-fills the New Entry form and switches to that tab.
- **FR-004-013**: "Save as Template" button on the New Entry form.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `TabBar` renders correctly in Activity and can replace tab markup in Administrator.
- **SC-002**: Budget auto-set logic works; existing expense category selector still functions.
- **SC-003**: Template CRUD roundtrip works end-to-end (create → list → use → delete).
- **SC-004**: History tab shows project synopsis with correct cumulative hours.
- **SC-005**: CI passes on feature branch.

---

## Implementation Notes

- `TabBar.jsx` is a **pure presentational component** — no API calls, no state.
- Do not break `Administrator.jsx` existing tab functionality when replacing markup.
- `WorkItemTemplate` does not need soft-delete; hard delete is fine (owned by user).
- Project synopsis is computed client-side from data already fetched for the history list.

## Artifacts to Provide

- `spec/fixtures/openapi/template-create-request.json`
- `spec/fixtures/openapi/template-response.json`
- `spec/fixtures/db/work-item-template-migration.sql`
