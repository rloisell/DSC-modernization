# DSC Modernization — Diagram Documentation

This directory contains all architecture, data model, and workflow diagrams for the DSC (Daily Status & Charges) modernization project.

---

## Directory Structure

```
diagrams/
├── README.md                  ← this file
├── drawio/                    ← editable Draw.io source files (.drawio)
│   ├── svg/                   ← exported SVG files — render natively on GitHub
│   │   ├── api-architecture.svg
│   │   ├── component-diagram.svg
│   │   ├── deployment.svg
│   │   ├── domain-model.svg
│   │   ├── health-check-sequence.svg
│   │   ├── sequence-admin-crud.svg
│   │   ├── sequence-admin-seed.svg
│   │   ├── sequence-reporting-dashboard.svg
│   │   ├── sequence-time-entry.svg
│   │   ├── service-layer.svg
│   │   └── use-cases.svg
│   ├── api-architecture.drawio
│   ├── component-diagram.drawio
│   ├── deployment.drawio
│   ├── domain-model.drawio
│   ├── health-check-sequence.drawio
│   ├── sequence-admin-crud.drawio
│   ├── sequence-admin-seed.drawio
│   ├── sequence-reporting-dashboard.drawio
│   ├── sequence-time-entry.drawio
│   ├── service-layer.drawio
│   └── use-cases.drawio
├── plantuml/                  ← PlantUML source files (.puml)
│   ├── png/                   ← exported PNG files — native GitHub rendering
│   │   ├── api-architecture.png
│   │   ├── component-diagram.png
│   │   ├── deployment.png
│   │   ├── domain-model.png
│   │   ├── health-check-sequence.png
│   │   ├── sequence-admin-crud.png
│   │   ├── sequence-admin-seed.png
│   │   ├── sequence-reporting-dashboard.png
│   │   ├── sequence-time-entry.png
│   │   ├── service-layer.png
│   │   └── use-cases.png
│   ├── activity-admin-users.puml
│   ├── activity-time-entry.puml
│   ├── api-architecture.puml
│   ├── component-diagram.puml
│   ├── deployment.puml
│   ├── domain-model.puml
│   ├── erd-physical.puml
│   ├── health-check-sequence.puml
│   ├── sequence-admin-crud.puml
│   ├── sequence-admin-seed.puml
│   ├── sequence-reporting-dashboard.puml
│   ├── sequence-time-entry.puml
│   ├── service-layer.puml
│   ├── state-user.puml
│   ├── state-workitem.puml
│   └── use-cases.puml
└── data-model/                ← ERD source files + exported SVGs and PNGs
    ├── svg/
    │   ├── erd-current.svg
    │   └── erd-java-legacy.svg
    ├── png/
    │   ├── erd-current.png
    │   └── erd-java-legacy.png
    ├── erd-current.drawio
    ├── erd-current.puml
    ├── erd-java-legacy.drawio
    └── erd-java-legacy.puml
```

---

## Format Convention

| Format | File extension | Purpose |
|--------|----------------|---------|
| Draw.io | `.drawio` | Primary editable source — open in [draw.io](https://app.diagrams.net) or VS Code Draw.io extension |
| PlantUML | `.puml` | Text-based alternative — version-control friendly, renderable in GitHub |

SVG exports (from Draw.io) use `background="#ffffff"` and `strokeWidth=2` on edges for consistent GitHub rendering.

---

## Required Diagrams

Per `CODING_STANDARDS.md` §7, every project must produce the complete set below.
Diagrams marked _scales with features_ should have one instance per major use case or lifecycle, not one globally.

| # | Diagram | UML Type | Perspective | Requirement | Status |
|---|---------|----------|-------------|-------------|--------|
| 1 | System architecture | Component | Structural | **Required** | ✅ `api-architecture` |
| 2 | Domain class model | Class | Structural | **Required** | ✅ `domain-model` |
| 3 | Package / module organisation | Package | Structural | **Required** | ✅ `component-diagram` |
| 4 | Use case overview | Use Case | Behavioural | **Required** | ✅ `use-cases` |
| 5 | Key sequence flows | Sequence | Behavioural | One per major user-facing feature | ✅ 5 sequences |
| 6 | Key workflows | Activity | Behavioural | One per complex multi-step workflow | ✅ `activity-time-entry` · `activity-admin-users` |
| 7 | Entity lifecycle | State | Behavioural | For entities with non-trivial state transitions | ✅ `state-workitem` · `state-user` |
| 8 | Entity-Relationship Diagram (ERD) | ERD | Data | **Required** | ✅ `erd-current` |
| 9 | Physical schema | Schema | Data | **Required** | ✅ `erd-physical` |
| 10 | Deployment topology | Deployment | Infrastructure | **Required** | ✅ `deployment` |

---

## Diagram Overview

### Architecture Diagrams

#### 1. Domain Model
**Source:** [`drawio/domain-model.drawio`](drawio/domain-model.drawio) | **SVG:** [`drawio/svg/domain-model.svg`](drawio/svg/domain-model.svg) | **PlantUML:** [`plantuml/domain-model.puml`](plantuml/domain-model.puml)

Entity overview and key relationships for the current (.NET) model.
- Core entities: User, Project, WorkItem, TimeEntry, ProjectAssignment
- Catalog entities: Position, Department, Role, ExpenseCategory, ExpenseOption, ActivityCode, NetworkNumber, Budget, CpcCode, DirectorCode, ReasonCode, CalendarCategory
- Auth entities: ExternalIdentity, UserAuth (legacy bridge)

---

#### 2. API Architecture
**Source:** [`drawio/api-architecture.drawio`](drawio/api-architecture.drawio) | **SVG:** [`drawio/svg/api-architecture.svg`](drawio/svg/api-architecture.svg) | **PlantUML:** [`plantuml/api-architecture.puml`](plantuml/api-architecture.puml)

Component view of the API layers, middleware pipeline, controllers, and data flow.
- Middleware pipeline: CORS → Rate Limiting → Authentication → Authorization → Routing
- Public controllers vs. admin controllers (token-gated)
- DTO patterns, global exception handler, seeding services

---

#### 3. Service Layer Architecture
**Source:** [`drawio/service-layer.drawio`](drawio/service-layer.drawio) | **SVG:** [`drawio/svg/service-layer.svg`](drawio/svg/service-layer.svg) | **PlantUML:** [`plantuml/service-layer.puml`](plantuml/service-layer.puml)

Detailed class-level view of the service layer introduced in the modernization sprint.
- Service interfaces & implementations: `IWorkItemService`, `IReportService`, `IProjectService`, `IAuthService`
- Infrastructure: `GlobalExceptionHandler`, `DatabaseHealthCheck`, `DomainException` hierarchy
- Controller → Service → DbContext wiring

---

#### 4. Component Diagram
**Source:** [`drawio/component-diagram.drawio`](drawio/component-diagram.drawio) | **SVG:** [`drawio/svg/component-diagram.svg`](drawio/svg/component-diagram.svg) | **PlantUML:** [`plantuml/component-diagram.puml`](plantuml/component-diagram.puml)

Logical component view of all major packages and dependencies.
- Frontend components: pages, services, hooks, UI components
- Backend: controllers, security, data services
- Data layer: EF Core entities and migrations

---

#### 5. Deployment Architecture
**Source:** [`drawio/deployment.drawio`](drawio/deployment.drawio) | **SVG:** [`drawio/svg/deployment.svg`](drawio/svg/deployment.svg) | **PlantUML:** [`plantuml/deployment.puml`](plantuml/deployment.puml)

Development and production deployment topology.
- Development: Vite dev server + Kestrel API + MariaDB on localhost
- Production: reverse proxy + app server + managed DB tier
- Planned: Keycloak / BC Gov OIDC integration

---

#### 6. Use Cases
**Source:** [`drawio/use-cases.drawio`](drawio/use-cases.drawio) | **SVG:** [`drawio/svg/use-cases.svg`](drawio/svg/use-cases.svg) | **PlantUML:** [`plantuml/use-cases.puml`](plantuml/use-cases.puml)

Actor-based use case diagram.
- End-user: time tracking (create/edit/delete own work items), project viewing, reporting dashboard
- Administrator: user management, catalog administration, project assignments, reporting, data seeding
- OpenShift Probe: liveness/readiness health checks

---

### Sequence Diagrams

#### 7. Time Entry Creation
**Source:** [`drawio/sequence-time-entry.drawio`](drawio/sequence-time-entry.drawio) | **SVG:** [`drawio/svg/sequence-time-entry.svg`](drawio/svg/sequence-time-entry.svg) | **PlantUML:** [`plantuml/sequence-time-entry.puml`](plantuml/sequence-time-entry.puml)

End-to-end flow for a user creating a work item with legacy activity fields.
Covers auth validation, WorkItemService, EF Core insert, response mapping.

---

#### 8. Admin Seed Test Data
**Source:** [`drawio/sequence-admin-seed.drawio`](drawio/sequence-admin-seed.drawio) | **SVG:** [`drawio/svg/sequence-admin-seed.svg`](drawio/svg/sequence-admin-seed.svg) | **PlantUML:** [`plantuml/sequence-admin-seed.puml`](plantuml/sequence-admin-seed.puml)

Flow for seeding legacy test data via `POST /api/admin/seed/test-data`.
Covers admin token auth (with dev bypass), TestDataSeeder, transactional upsert of users, UserAuth, project, and department.

---

#### 9. Health Check Monitoring
**Source:** [`drawio/health-check-sequence.drawio`](drawio/health-check-sequence.drawio) | **SVG:** [`drawio/svg/health-check-sequence.svg`](drawio/svg/health-check-sequence.svg) | **PlantUML:** [`plantuml/health-check-sequence.puml`](plantuml/health-check-sequence.puml)

Flow for liveness (`/health/live`) and readiness (`/health/ready`) probe endpoints.
Covers DatabaseHealthCheck using `db.Database.CanConnectAsync()`, browser health dashboard polling.

---

#### 10. Reporting Dashboard *(new)*
**Source:** [`drawio/sequence-reporting-dashboard.drawio`](drawio/sequence-reporting-dashboard.drawio) | **SVG:** [`drawio/svg/sequence-reporting-dashboard.svg`](drawio/svg/sequence-reporting-dashboard.svg) | **PlantUML:** [`plantuml/sequence-reporting-dashboard.puml`](plantuml/sequence-reporting-dashboard.puml)

Full flow for generating a time/expense summary report.
- Page load: project list loaded for filter dropdown
- Report generation: `GET /api/reports/summary?from=...&to=...[&projectId=UUID]`
- ReportService: single wide JOIN query on WorkItems + TimeEntries, in-process aggregation (no N+1)
- Output: summary cards, project breakdown, user breakdown (admin), activity code breakdown
- Error cases: invalid date range (400), malformed GUID (400), cross-user access by non-admin (403)

---

#### 11. Admin Project Assignments CRUD *(new)*
**Source:** [`drawio/sequence-admin-crud.drawio`](drawio/sequence-admin-crud.drawio) | **SVG:** [`drawio/svg/sequence-admin-crud.svg`](drawio/svg/sequence-admin-crud.svg) | **PlantUML:** [`plantuml/sequence-admin-crud.puml`](plantuml/sequence-admin-crud.puml)

Full CRUD flow for the Admin Project Assignments page.
- Page load: `GetAll` with `ThenInclude(u => u.Position)` for UserPosition column
- Client-side filtering: Project / User / Position dropdowns via `useMemo` (no extra API calls)
- Create: duplicate check → INSERT → 201 Created (or 409 if duplicate)
- Edit: SELECT → UPDATE → 200 OK (or 404 if not found)
- Remove: DELETE → 204 No Content
- All endpoints protected by AdminToken auth handler + rate limiting

---

### Data Model ERDs

#### 12. ERD — Current (.NET / EF Core 9) *(new)*
**Source:** [`data-model/erd-current.drawio`](data-model/erd-current.drawio) | **SVG:** [`data-model/svg/erd-current.svg`](data-model/svg/erd-current.svg) | **PlantUML:** [`data-model/erd-current.puml`](data-model/erd-current.puml)

Database ERD of the current .NET / EF Core 9 / MariaDB schema.
Entity groups: Identity & Auth, Organisation, Projects, Work Tracking, Expense & Catalog, Calendar.
See [docs/data-model/README.md](../docs/data-model/README.md) for full compare/contrast with Java legacy.

---

#### 13. ERD — Java Legacy (Hibernate ORM) *(new)*
**Source:** [`data-model/erd-java-legacy.drawio`](data-model/erd-java-legacy.drawio) | **SVG:** [`data-model/svg/erd-java-legacy.svg`](data-model/svg/erd-java-legacy.svg) | **PlantUML:** [`data-model/erd-java-legacy.puml`](data-model/erd-java-legacy.puml)

Database ERD of the original Java application's Hibernate ORM model.
Entity groups: Person & Authentication, Organisation & Department, Project & Activity, Reference / Catalog, Calendar.
See [docs/data-model/README.md](../docs/data-model/README.md) for full compare/contrast with current .NET model.

---

### Activity Diagrams

> PlantUML source only (no Draw.io equivalent). Pre-generated PNGs are in [`plantuml/png/`](plantuml/png/).

#### 14. Activity — Time Entry Creation *(new)*
**PlantUML:** [`plantuml/activity-time-entry.puml`](plantuml/activity-time-entry.puml) | **PNG:** `plantuml/png/Activity — Time Entry Creation.png`

Step-by-step workflow for a user creating a work item and recording hours against a project.
- Project availability guard — no assigned projects blocks the form
- Activity-type branch: Expense (budget + category/option) vs. Project/Time (activity code + network number)
- Client-side required-field validation before POST
- API-side: project existence check in `WorkItemService.CreateAsync()` → 400 if not found
- RemainingHours computed on save; 201 response returned; TanStack Query cache invalidated

---

#### 15. Activity — Admin User Management *(new)*
**PlantUML:** [`plantuml/activity-admin-users.puml`](plantuml/activity-admin-users.puml) | **PNG:** `plantuml/png/Activity — Admin User Management.png`

Full admin workflow for managing user accounts (Create / Edit / Deactivate-Reactivate / Delete).
- Create: unique-username check → User + UserAuth records created → 201
- Edit: partial-update PATCH → fields updated → 204
- Deactivate: `IsActive = false` → `AuthService` returns 401 "Account is deactivated" on next login
- Reactivate: `IsActive = true` → immediate access restored
- Delete: confirmation guard → permanent removal of User record → 204

---

### State Diagrams

> PlantUML source only (no Draw.io equivalent). Pre-generated PNGs are in [`plantuml/png/`](plantuml/png/).

#### 16. State — WorkItem Lifecycle *(new)*
**PlantUML:** [`plantuml/state-workitem.puml`](plantuml/state-workitem.puml) | **PNG:** `plantuml/png/State — WorkItem Lifecycle.png`

Lifecycle states for a `WorkItem` entity driven by user and admin actions.
- **Active** (sub-states: Logged → TimeTracked): created, editable, hours logged against it
- **Frozen**: parent project deactivated (`Project.IsActive = false`); data preserved, read-only for new entries
- **Deleted**: via `DELETE /api/items/{id}`; ownership enforced by `EnforceOwnershipAsync()`
- Frozen → Active transition possible on project reactivation

---

#### 17. State — User Lifecycle *(new)*
**PlantUML:** [`plantuml/state-user.puml`](plantuml/state-user.puml) | **PNG:** `plantuml/png/State — User Lifecycle.png`

Lifecycle states for a `User` entity driven by the `IsActive` flag and admin actions.
- **Active** (sub-states: Provisioned → Authenticated): admin creates account, user logs in successfully
- **Inactive**: `IsActive = false`; `AuthService.AuthenticateAsync()` throws 401 "Account is deactivated"
- Active ↔ Inactive toggleable via admin PATCH; both states permit permanent deletion
- Future state: **OIDC Provisioned** via `ExternalIdentity` table + Keycloak JWT (roadmap in `AI/securityNextSteps.md`)

---

### Physical Schema

> PlantUML source only (no Draw.io equivalent). Pre-generated PNG is in [`plantuml/png/`](plantuml/png/).

#### 18. Physical Schema — dsc_dev *(new)*
**PlantUML:** [`plantuml/erd-physical.puml`](plantuml/erd-physical.puml) | **PNG:** `plantuml/png/Physical Schema — DSC Database (dsc_dev).png`

DDL-level schema for the MariaDB `dsc_dev` database as managed by EF Core migrations.
- **Core tables:** `Users`, `Projects`, `WorkItems`, `TimeEntries`, `ProjectAssignments`
- **Catalog tables:** `Budgets`, `Roles`, `Positions`, `Departments`, `ExpenseCategories`, `ExpenseOptions`
- **Auth tables:** `UserAuth` (legacy, to be deprecated post-OIDC), `ExternalIdentities` (future Keycloak)
- Column types follow MariaDB EF Core conventions: GUIDs as `CHAR(36)`, decimals as `DECIMAL(10,2)`, booleans as `TINYINT(1)`
- Legacy fields (`start_time`, `end_time`, `legacy_activity_id`) annotated inline for migration context

---

## Editing Diagrams

### Option 1: Draw.io Desktop App
Open any `.drawio` file directly in the Draw.io desktop application (installed at `/Applications/draw.io.app`).

### Option 2: diagrams.net (Web)
Visit [https://app.diagrams.net](https://app.diagrams.net) and drag/drop any `.drawio` file.

### Option 3: VS Code Extension
Install the [`hediet.vscode-drawio`](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio) extension.

### Viewing on GitHub
- **Draw.io → SVG** (`drawio/svg/`, `data-model/svg/`): white background, heavier lines, embedded XML (re-openable in Draw.io)
- **PlantUML → PNG** (`plantuml/png/`, `data-model/png/`): rasterised, best for Markdown embeds that need consistent rendering

Embed in Markdown:
```markdown
![Domain Model](diagrams/drawio/svg/domain-model.svg)
![Domain Model](diagrams/plantuml/png/DSC%20Domain%20Model.png)
```

---

## Regenerating Exports

### Draw.io → SVG

After editing a `.drawio` source file, regenerate its SVG export:

```bash
# Single file
/Applications/draw.io.app/Contents/MacOS/draw.io \
  --export --format svg --embed-diagram --border 10 \
  --output diagrams/drawio/svg/my-diagram.svg \
  diagrams/drawio/my-diagram.drawio

# All drawio/ sources at once
DRAW="/Applications/draw.io.app/Contents/MacOS/draw.io"
for f in diagrams/drawio/*.drawio; do
  name=$(basename "$f" .drawio)
  "$DRAW" --export --format svg --embed-diagram --border 10 \
    --output "diagrams/drawio/svg/$name.svg" "$f"
done

# data-model/ sources
for f in diagrams/data-model/*.drawio; do
  name=$(basename "$f" .drawio)
  "$DRAW" --export --format svg --embed-diagram --border 10 \
    --output "diagrams/data-model/svg/$name.svg" "$f"
done
```

### PlantUML → PNG

After editing a `.puml` source file, regenerate its PNG:

```bash
# Single file
plantuml -tpng -o diagrams/plantuml/png diagrams/plantuml/my-diagram.puml

# All plantuml/ sources at once
plantuml -tpng -o diagrams/plantuml/png diagrams/plantuml/*.puml

# data-model/ sources
plantuml -tpng -o diagrams/data-model/png diagrams/data-model/*.puml
```

> **Note:** PlantUML uses the `@startuml <title>` declaration as the output filename, not the source filename.
> The `png/` directory ships pre-generated so GitHub can render them inline.

---

## Diagram Maintenance

**When to update:**
- New entities added to `src/DSC.Api/` models
- New controllers or endpoints added
- New security policies or middleware
- New use cases / user stories
- New deployment tiers or infrastructure

**Validation:**
- Cross-reference diagram relationships with actual EF Core navigation properties in models
- Verify sequence diagrams match controller/service logic

---

**Generated:** 2026-02-20 | **Maintainer:** AI-assisted documentation for DSC-modernization project
