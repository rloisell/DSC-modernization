# Implementation Plan: 002-expense-category-parity

**Feature**: Expense Category Parity
**Branch**: `feature/expense-category-parity` → `develop`
**Estimated Effort**: Low (half-session)

---

## Phases

### Phase 1 — Data Layer

1. Add `Guid? ExpenseCategoryId` + navigation property to `WorkItem.cs`
2. Run `dotnet ef migrations add AddExpenseCategoryToWorkItem`
3. Verify generated migration SQL; set `ON DELETE SET NULL`
4. Verify `dotnet build` passes

### Phase 2 — Service & API Layer

5. Update `WorkItemCreateRequest` — add `Guid? ExpenseCategoryId`
6. Update `WorkItemDto` and `WorkItemDetailDto` — add `ExpenseCategoryId`, `ExpenseCategoryName`
7. Update `WorkItemService.CreateAsync()` — persist `ExpenseCategoryId`
8. Update `WorkItemService` list/detail queries — `.Include(w => w.ExpenseCategory)`;
   project `ExpenseCategoryName = w.ExpenseCategory!.Description`
9. No new controller endpoints needed

### Phase 3 — Frontend

10. In `Activity.jsx` — load expense categories on mount (TanStack Query)
11. Conditionally render required `<Select>` from BC Gov DS when `activityMode === 'expense'`
12. Include `expenseCategoryId` in POST payload

### Phase 4 — Tests & CI

13. Add/update Vitest integration test: POST work item with expense category
14. Verify `build-and-test.yml` CI passes

---

## Sequence Dependencies

Phase 1 → Phase 2 → Phase 3 (strict sequential)
Phase 4 can run in parallel with Phase 3

---

## Risks

- Migration against live data: nullable FK with `SET NULL` default mitigates this.
- BC Gov DS `<Select>` requires non-empty string keys (existing pattern from Reports fix).
