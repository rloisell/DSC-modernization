# Feature Specification: Weekly Summary Phase 1

**Feature Slug**: `006-weekly-summary`
**Feature Branch**: `feature/weekly-summary`
**Created**: 2026-02-22
**Status**: Ready — fully independent
**Priority**: Tier 1 (Todo #7)

Provide users with a quick `/weekly` dashboard showing this week's logged
activities, project progress bars, and a placeholder for outstanding tasks.
This is Phase 1 of a planned three-phase feature (Phase 2 adds Outlook calendar
integration; Phase 3 adds Jira integration — both are Tier 5 backlog items).

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View this week's activity summary (Priority: P1)

As a DSC User, I want a weekly summary page that shows my logged work items for
the current week so I can get a quick overview without scrolling through history.

**Independent Test**: Navigate to `/weekly`; confirm this week's work items are
listed, grouped by day or project.

**Acceptance Scenarios**:
1. **Given** I have work items logged this week, **When** I navigate to `/weekly`,
   **Then** they are listed in a summary view.
2. **Given** I have no work items this week, **When** I navigate to `/weekly`,
   **Then** a friendly "Nothing logged this week" empty state is shown.

---

### User Story 2 — Project progress bars (Priority: P2)

As a DSC User, I want to see a progress bar for each of my active projects showing
estimated vs. actual hours so I know which projects need attention.

**Acceptance Scenarios**:
1. **Given** I am assigned to projects with estimated hours, **When** the Weekly
   Summary renders, **Then** a progress bar per project shows % of estimated hours used.
2. **Given** a project is OVERBUDGET (actual > estimated), **When** rendered, **Then**
   the progress bar is red and shows a warning label.

---

### Edge Cases

- "This week" is defined as Monday 00:00 to Sunday 23:59 in the user's local timezone.
- Progress bars should use the existing `/api/items/project/{id}/remaining-hours` endpoint.
- Empty projects (no work items this week) may still be shown if the user is assigned.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-006-001**: Add `/weekly` route in `App.jsx`.
- **FR-006-002**: Create `src/DSC.WebClient/src/pages/WeeklySummary.jsx`.
- **FR-006-003**: Fetch this week's work items via `GET /api/items?timePeriod=week`
  (add `timePeriod=week` filter to backend if not present).
- **FR-006-004**: Render work items grouped by project or date with totals.
- **FR-006-005**: Render project progress bars (estimated vs. actual hours).
- **FR-006-006**: Show OVERBUDGET warning (red bar, label) when actual > estimated.
- **FR-006-007**: Add "My Week" nav link to the sidebar.
- **FR-006-008**: Placeholder section for Outstanding Tasks (static label, wired to real data in a future session).

---

## Success Criteria *(mandatory)*

- **SC-001**: `/weekly` route renders `WeeklySummary.jsx` without error.
- **SC-002**: This-week activities are correctly filtered.
- **SC-003**: Progress bars show correct percentages from API data.
- **SC-004**: OVERBUDGET projects shown in red.
- **SC-005**: Nav link present and active when on `/weekly`.
- **SC-006**: CI passes.

---

## Implementation Notes

- If `timePeriod=week` is not yet supported by the API, add it to `WorkItemController`
  as a simple date filter: `DateTime.UtcNow.StartOfWeek()` to `DateTime.UtcNow`.
- This is entirely new UI and does not modify any existing pages.
- Progress bar can be a simple `<progress>` HTML element or BC Gov DS component.

## Artifacts to Provide

- `spec/fixtures/openapi/weekly-items-response.json`
