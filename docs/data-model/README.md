# Data Model Documentation

**Author**: Ryan Loiselle — Developer / Architect
**AI tool**: GitHub Copilot — AI pair programmer / code generation
**Updated**: February 2026

> DSC Modernization — Data Model: Java Legacy vs. .NET Current

## Contents

- [Overview](#overview)
- [Diagram Files](#diagram-files)
- [Table Mapping](#table-mapping)
- [Key Structural Differences](#key-structural-differences)
- [Entity-by-Entity Compare](#entity-by-entity-compare)
- [New Entities in .NET Model](#new-entities-in-net-model)
- [Removed / Collapsed Entities](#removed--collapsed-entities)
- [Legacy Bridge Tables](#legacy-bridge-tables)
- [Data Type Evolution](#data-type-evolution)
- [Design Philosophy Shift](#design-philosophy-shift)

---

## Overview

The DSC application was originally built as a Java web application using Hibernate ORM backed by MariaDB.  
The modernization effort produced a new ASP.NET Core 10 / EF Core 9 API with a redesigned schema that preserves
the core business domain while rationalising historical design decisions, upgrading key infrastructure patterns,
and preparing the system for OIDC-based authentication.

Both schema generations share the same underlying MariaDB database server but inhabit logically separate schemas
during the migration period.

---

## Diagram Files

| Format | Current (.NET) | Java Legacy |
|--------|---------------|-------------|
| PlantUML | [`erd-current.puml`](../../diagrams/data-model/erd-current.puml) | [`erd-java-legacy.puml`](../../diagrams/data-model/erd-java-legacy.puml) |
| Draw.io | [`erd-current.drawio`](../../diagrams/data-model/erd-current.drawio) | [`erd-java-legacy.drawio`](../../diagrams/data-model/erd-java-legacy.drawio) |

---

## Table Mapping

| Java Entity | .NET Entity | Change Type | Notes |
|-------------|-------------|-------------|-------|
| `User` | `Users` | Evolved | UUID PK; roleID now FK to `Roles` table |
| `User_Auth` | `UserAuth` (bridge) | Kept as bridge | Still present for legacy auth migration; new path via `ExternalIdentities` |
| `User_User` | *(removed)* | Removed | Manager hierarchy not yet modelled in new schema |
| `Department` | `Departments` | Renamed / evolved | UUID PK; otherwise structurally similar |
| `Department_User` | *(removed as junction)* | Collapsed | Replaced by direct FK `Users.DepartmentId` |
| `Department_Category` | *(not present)* | Removed | No per-department expense category restriction in new model |
| `Position` | `Positions` | Renamed / evolved | UUID PK; `unionID` FK removed (Union not in new schema) |
| `User_Position` | `UserPositions` (bridge) | Kept as bridge | Historical position records; current position now also denormalised to `Users.PositionId` |
| `Union` | *(not present)* | Removed | Union classification not required in current scope |
| `Project` | `Projects` | Evolved | PK changed from `projectNo (VARCHAR)` → UUID; `ProjectNo` kept as separate field |
| `Project_Activity` | `ProjectActivityOptions` | Renamed | Composite PK retained; FK target renamed |
| `Activity` | `WorkItems` + `TimeEntries` | Split | Monolithic activity entity split for cleaner time-tracking semantics |
| `Expense_Activity` | *(implicit in WorkItems)* | Folded | Expense details now carried as fields on `WorkItems` |
| `Activity_Codes` | `ActivityCodes` | Renamed | String code + UUID PK replaces INT PK |
| `Network_Numbers` | `NetworkNumbers` | Renamed | Similarly UUID PK |
| `Budget` | `Budgets` | Renamed / evolved | UUID PK |
| `Category` (expense) | `ExpenseCategories` | Renamed / evolved | Clearer name; UUID PK; `BudgetId` FK retained |
| *(not present)* | `ExpenseOptions` | New | Sub-options within an expense category |
| `CPC_Code` | `CpcCodes` | Renamed | UUID PK |
| `Director_Code` | `DirectorCodes` | Renamed | UUID PK |
| `Reason_Code` | `ReasonCodes` | Renamed | UUID PK |
| `Calendar` | `CalendarEntries` | Renamed | Date PK retained |
| `Calendar_Category` | `CalendarCategories` | Renamed | INT PK retained |
| *(not present)* | `Roles` | New | Normalised roles table replaces raw `roleID` int on User |
| *(not present)* | `ExternalIdentities` | New | OIDC subject/provider pairs for Keycloak integration |

---

## Key Structural Differences

### 1. Primary Key Strategy

| Aspect | Java Legacy | .NET Current |
|--------|-------------|--------------|
| User PK | `userID INT AUTO_INCREMENT` | `Id UUID` |
| Project PK | `projectNo VARCHAR` (natural key) | `Id UUID` + separate `ProjectNo VARCHAR` |
| All reference tables | `INT AUTO_INCREMENT` | `UUID` |
| Calendar | `date DATE` (natural key — unchanged) | `Date DATE` (natural key — unchanged) |

**Impact**: All foreign-key columns changed from `INT` to `UUID`. Natural string PK on Project replaced with surrogate UUID to decouple identifier from business code.

---

### 2. Authentication & Identity

| Aspect | Java Legacy | .NET Current |
|--------|-------------|--------------|
| Auth storage | `User_Auth` (userName + bcrypt hash on same table) | `UserAuth` (bridge, preserved) + `ExternalIdentities` |
| OIDC readiness | None | `ExternalIdentities(Provider, Subject)` table ready for Keycloak OIDC tokens |
| Role storage | `roleID INT` raw on `User` row | Separate `Roles` table with UUID PK; `Users.RoleId` FK |

---

### 3. User-Department Relationship

| Java | .NET |
|------|------|
| Two separate relationships: `User.departmentID` (primary) + `Department_User` junction (secondary memberships) | Single direct FK: `Users.DepartmentId` |

The old `Department_User` many-to-many junction is removed; a user belongs to exactly one department (current scope). Multi-department membership can be reintroduced via a junction table if required.

---

### 4. User-Position Relationship

| Java | .NET |
|------|------|
| `User_Position` junction table with `effectiveDate` and `isCurrent` columns — full position history | `Users.PositionId` (current position only, direct FK) + `UserPositions` bridge (preserved for history migration) |

The new model prioritises the *current* position via a fast direct FK lookup. Historical records remain accessible via the `UserPositions` bridge table during the migration window.

---

### 5. Management Hierarchy

| Java | .NET |
|------|------|
| `User_User(userID, managerID)` junction table | No equivalent — not yet modelled |

The manager-subordinate relationship captured in `User_User` has not been re-introduced in the new schema. This is a known gap to be addressed if approval-workflow or delegation features are required.

---

### 6. Activity / Time-Tracking Split

| Java `Activity` | .NET Equivalent |
|-----------------|-----------------|
| All time entry + planning data in one wide table (18+ columns) | Split into `WorkItems` (planning, coding, context) + `TimeEntries` (actual hours logged per day) |

**Benefits of split**:
- `WorkItems` holds planning intent, estimated hours, activity codes, reference codes
- `TimeEntries` holds individual date+hours records against a work item
- Supports multiple partial-day entries against the same work item
- Cleaner audit trail per time entry

---

### 7. Expense Tracking

| Java | .NET |
|------|------|
| `Expense_Activity` as separate entity linked to `Activity` | Expense details carried as fields on `WorkItems`; `ExpenseCategories` / `ExpenseOptions` provide the lookup hierarchy |
| `Category` (expense) with `Budget` parent | `ExpenseCategories` with `BudgetId` FK + new `ExpenseOptions` child table |

The new `ExpenseOptions` entity adds a sub-category level below `ExpenseCategory`, allowing more granular classification without schema changes.

---

### 8. Project Reference Codes

In the Java model, reference code lookups (`activityCodeID`, `networkID`, `directorID`, `cpcID`, `reasonID`) were stored as plain INT foreign keys on the `Activity` row using numeric IDs. In the .NET model, these are stored as **strings** (the actual code values) directly on `WorkItems`. The lookup tables still exist for admin management but the denormalised string copy on the work item row makes the record self-describing without requiring joins for reporting.

---

## New Entities in .NET Model

| Entity | Purpose |
|--------|---------|
| `Roles` | Normalised role table replacing the raw `roleID` int; supports named roles with descriptions |
| `ExternalIdentities` | OIDC identity provider binding (Keycloak/BCGov); one user can have multiple external identities |
| `ExpenseOptions` | Sub-options within an `ExpenseCategory`; adds a granularity level not present in Java model |

---

## Removed / Collapsed Entities

| Java Entity | Disposition in .NET |
|-------------|---------------------|
| `User_User` | Removed — manager hierarchy not in current scope |
| `Department_User` | Collapsed — replaced by direct FK on `Users.DepartmentId` |
| `Department_Category` | Removed — per-department expense restriction not in current scope |
| `Union` | Removed — union classification out of scope for modernization phase 1 |

---

## Legacy Bridge Tables

The following tables are retained in the .NET schema with `Legacy` semantics to support data migration from the Java schema. They are not part of the primary domain model and may be deprecated once migration is complete.

| Bridge Table | Purpose | Source |
|-------------|---------|--------|
| `UserAuth` | Maps old `userName`/`password` credentials; supports phased auth migration | Java `User_Auth` |
| `UserPositions` | Preserves historical position records per user | Java `User_Position` |
| `DepartmentUsers` | Retains legacy multi-department memberships | Java `Department_User` |
| `UserUsers` | Preserves legacy manager-subordinate pairs | Java `User_User` |
| `ProjectActivities` | Legacy junction for project-activity codes | Java `Project_Activity` |
| `ExpenseActivities` | Legacy expense entries linked to old activities | Java `Expense_Activity` |

---

## Data Type Evolution

| Column Type | Java / MySQL Legacy | .NET / EF Core Current |
|-------------|---------------------|------------------------|
| Surrogate PKs | `INT AUTO_INCREMENT` | `UUID CHAR(36)` (or `BINARY(16)`) |
| Boolean flags | `TINYINT(1)` | `BIT(1)` / `BOOL` |
| Text fields | `VARCHAR(255)` (implicit limit) | `VARCHAR(NN)` with explicit `MaxLength` attributes |
| Date/time | `DATE`, `DATETIME` | `DateOnly`, `DateTimeOffset` |
| Decimal amounts | `DECIMAL(10,2)` | `DECIMAL(18,4)` (more precision) |
| Large text | `TEXT` | `LONGTEXT` via EF fluent config |

---

## Design Philosophy Shift

| Concern | Java Legacy Approach | .NET Modern Approach |
|---------|---------------------|---------------------|
| Keys | Natural & integer surrogate | UUID surrogate throughout |
| Auth | Table-per-app credentials | OIDC-first via ExternalIdentities |
| Roles | Magic int constant on User row | Named entity with FK |
| User-Org | Mixed direct FK + junctions | Direct FK (simplified); junctions preserved for history |
| Position history | Explicit junction with dates | Current-only FK; history in bridge table |
| Activity granularity | Wide single-table record | Split into Work Intent (WorkItem) + Time Log (TimeEntry) |
| Expense hierarchy | 2-level (Budget → Category) | 3-level (Budget → ExpenseCategory → ExpenseOption) |
| Code references | INT FK join required | Denormalised string on work item + lookup tables for admin |

---

*Generated: 2026-02-20 | DSC Modernization Project*
