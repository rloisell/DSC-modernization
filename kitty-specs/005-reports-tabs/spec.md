# Feature Specification: Reports Page Tabbed Layout

**Feature Slug**: `005-reports-tabs`
**Feature Branch**: `feature/reports-tabs`
**Created**: 2026-02-22
**Status**: Ready — depends on feature 004 (TabBar) and feature 003 (Task Deviation API)
**Priority**: Tier 1 (Todo #5)

Restructure the Reports page using the shared `TabBar` component into three
tabs: My Summary, Task Deviation, and Team Reports. The Task Deviation tab
wires up the API from feature 003; the Team Reports tab is stubbed until
feature 007.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Tabbed Reports navigation (Priority: P1)

As a DSC User, I want the Reports page to have clearly labelled tabs so I can
navigate between summary, deviation, and team views without leaving the page.

**Acceptance Scenarios**:
1. **Given** the Reports page loads, **When** it renders, **Then** three tabs are
   visible: "My Summary", "Task Deviation", "Team Reports".
2. **Given** the user is in the "User" role, **When** they click "Team Reports",
   **Then** a "Insufficient permissions" message is displayed (not an error page).
3. **Given** the user is in the "Manager", "Director", or "Admin" role, **When**
   they click "Team Reports", **Then** placeholder or full management reports are shown.

---

### Edge Cases

- Tab state should survive component re-renders caused by query invalidation.
- The `TabBar` component from feature 004 must be merged before this feature starts.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-005-001**: Import and use `<TabBar />` from `src/components/TabBar.jsx`.
- **FR-005-002**: Tabs: `My Summary` / `Task Deviation` / `Team Reports`.
- **FR-005-003**: My Summary tab: existing summary content (unchanged).
- **FR-005-004**: Task Deviation tab: render `TaskDeviationTable` component from feature 003.
- **FR-005-005**: Team Reports tab: role-gate — show "Insufficient permissions" for `User` role; show management reports placeholder for privileged roles (populated by feature 007).

---

## Success Criteria *(mandatory)*

- **SC-001**: All three tabs render without errors.
- **SC-002**: My Summary content is unchanged from current implementation.
- **SC-003**: Task Deviation tab displays data when API (feature 003) is merged.
- **SC-004**: Team Reports tab correctly gates on role.
- **SC-005**: CI passes.

---

## Implementation Notes

- This is a thin UI feature — all API work is in features 003 and 007.
- Merge feature 004 first (for `TabBar`); or duplicate the `TabBar` logic temporarily
  and clean up on merge.
- Role is available via the existing auth context / `X-User-Id` → user query pattern.
