# Feature Specification: Expense Category Parity

**Feature Slug**: `002-expense-category-parity`
**Feature Branch**: `feature/expense-category-parity`
**Created**: 2026-02-22
**Status**: Ready
**Priority**: Tier 1 (Todo #2)

The current Work Item model captures activity but does not link expense-type
activities to the `ExpenseCategory` catalogue table. This feature adds the FK
relationship, the EF Core migration, and the front-end selector so that expense
work items carry a valid category.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Log an expense work item with a category (Priority: P1)

As a DSC User creating an expense activity, I want to select an expense category
from a dropdown so that my work item is classified correctly for reporting.

**Why this priority**: Reporting on expense vs. project time requires the category FK.

**Independent Test**: Create an expense work item via POST `/api/items` with
`expenseCategoryId` set; confirm the item is returned with `expenseCategoryName`
populated on subsequent GET.

**Acceptance Scenarios**:
1. **Given** a valid `expenseCategoryId`, **When** POST `/api/items`, **Then** returns
   201 with `expenseCategoryId` and `expenseCategoryName` in the response body.
2. **Given** `activityMode === 'expense'` in the Activity page, **When** the form
   renders, **Then** a required Expense Category `<Select>` is visible and populated
   from `/api/catalog/expense-categories`.
3. **Given** a null or missing `expenseCategoryId` for an expense activity, **When**
   POST `/api/items`, **Then** returns 400 with a validation error.

---

### User Story 2 — View category on work item history (Priority: P2)

As a DSC User viewing my activity history, I want to see the expense category name
alongside each expense work item so I can verify my entries.

**Independent Test**: GET `/api/items?userId=<id>` for a user with expense items;
confirm `expenseCategoryName` is present in the response.

**Acceptance Scenarios**:
1. **Given** an expense work item has `expenseCategoryId` set, **When** GET
   `/api/items`, **Then** each expense item includes `expenseCategoryName`.
2. **Given** a non-expense work item, **When** returned via GET, **Then**
   `expenseCategoryId` is null and `expenseCategoryName` is null or absent.

---

### Edge Cases

- Expense category may be nullable for backward-compatible migration of existing data.
- The `ExpenseCategory` dropdown must only appear when `activityMode === 'expense'`.
- If the expense categories catalogue endpoint returns an empty list, the form
  should show an error/fallback rather than a blank selector.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-002-001**: Add `Guid? ExpenseCategoryId` FK and `ExpenseCategory? ExpenseCategory`
  navigation property to the `WorkItem` entity.
- **FR-002-002**: Create an EF Core migration `AddExpenseCategoryToWorkItem`.
- **FR-002-003**: Extend `WorkItemCreateRequest`, `WorkItemDto`, and `WorkItemDetailDto`
  to include `ExpenseCategoryId` and `ExpenseCategoryName`.
- **FR-002-004**: Update `WorkItemService` — persist `ExpenseCategoryId` on create;
  project `ExpenseCategoryName` via a JOIN in all list/detail queries.
- **FR-002-005**: In `Activity.jsx`, load categories from `/api/catalog/expense-categories`
  and render a required `<Select>` component when `activityMode === 'expense'`.

### Key Entities

- **WorkItem**: add `ExpenseCategoryId Guid?`, `ExpenseCategory? ExpenseCategory`
- **ExpenseCategory**: existing catalogue table — `Id (Guid)`, `Code`, `Description`

### API Contract Changes

- `POST /api/items` — accepts `expenseCategoryId` (nullable Guid) in request body
- `GET /api/items` / `GET /api/items/{id}` — returns `expenseCategoryId` and
  `expenseCategoryName` in response

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: EF Core migration applies cleanly on a fresh DB and on top of existing
  seeded data without data loss.
- **SC-002**: POST `/api/items` with `expenseCategoryId` stores and returns the value;
  existing work items with null `expenseCategoryId` still return without error.
- **SC-003**: Activity page renders the Expense Category selector only for expense
  activities, and submission includes `expenseCategoryId` in the request payload.
- **SC-004**: CI (`.github/workflows/build-and-test.yml`) passes with no regressions.

---

## Implementation Notes

- Migration must set `ON DELETE SET NULL` to protect existing rows.
- EF Core `.NET 10` rule: use `List<string>` (not `new[]`) in all LINQ `.Where()` 
  expressions to avoid `ReadOnlySpan<string>.Contains()` translation error.
- The `ExpenseCategory` dropdown data is already served by the existing catalogue 
  endpoint — no new API endpoint required.

## Artifacts to Provide

- `spec/fixtures/openapi/work-item-with-category.json` — sample request/response
- `spec/fixtures/db/expense-category-migration.sql` — migration SQL preview
