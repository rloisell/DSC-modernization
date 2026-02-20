# DSC Modernization UML Documentation

This directory contains PlantUML diagrams documenting the architecture, domain model, and workflows of the DSC (Daily Status & Charges) modernization project.

## Diagram Overview

### 1. Domain Model (`uml/domain-model.puml`)
**Purpose:** Entity relationship diagram showing all domain entities, their properties, and relationships.

**Key Features:**
- Core domain entities (User, Project, WorkItem, TimeEntry, ProjectAssignment)
- Legacy compatibility entities (UserAuth for incremental auth migration)
- Catalog domain (Position, Department, ExpenseCategory, ActivityCode, NetworkNumber)
- Relationship cardinalities and foreign keys

**Use in Spec-Kitty:**
- Reference when defining acceptance criteria for entity CRUD operations
- Map API contracts to domain entities
- Identify missing relationships or fields during feature specification

---

### 2. API Architecture (`uml/api-architecture.puml`)
**Purpose:** Component view of the API layers, middleware, controllers, and data flow.

**Key Features:**
- API middleware pipeline (CORS, Rate Limiting, Authentication, Authorization)
- Controller segregation (public vs admin)
- DTO patterns
- Security components (AdminTokenAuthenticationHandler)

**Use in Spec-Kitty:**
- Understand API surface area when specifying new endpoints
- Identify security requirements (auth/rate limiting) for new features
- Map DTOs to controller actions

---

### 3. Use Cases (`uml/use-cases.puml`)
**Purpose:** Actor-based use case diagram showing what users and administrators can do.

**Key Features:**
- End-user workflows (time tracking, project viewing)
- Admin workflows (user management, catalog administration, data seeding)
- Planned features (OIDC login)

**Use in Spec-Kitty:**
- Define feature scope and user stories
- Identify actors and permissions for new features
- Map use cases to acceptance criteria

---

### 4. Deployment Architecture (`uml/deployment.puml`)
**Purpose:** Deployment view showing development and production environments.

**Key Features:**
- Development setup (Vite, Kestrel, MariaDB on localhost)
- Production tier separation (web, app, database)
- Planned OIDC integration (Keycloak)

**Use in Spec-Kitty:**
- Understand deployment constraints when specifying infrastructure requirements
- Identify environment-specific configuration (Dev vs Prod)

---

### 5. Sequence Diagrams

#### Admin Seed Test Data (`uml/sequence-admin-seed.puml`)
**Purpose:** Shows the flow for seeding legacy test data via the admin endpoint.

**Key Steps:**
1. Admin requests seed with X-Admin-Token (or dev bypass)
2. Authentication handler validates or bypasses in Development
3. TestDataSeeder inserts users, UserAuth, project, department
4. Transaction committed and result returned

**Use in Spec-Kitty:**
- Template for specifying new admin data operations
- Understand transactional seeding patterns

#### Time Entry Creation (`uml/sequence-time-entry.puml`)
**Purpose:** Shows the flow for creating a work item with legacy activity fields.

**Key Steps:**
1. User loads Activity page and project selector
2. User fills work item form
3. React SPA posts to /api/items
4. Controller validates project and inserts WorkItem
5. Success response and UI refresh

**Use in Spec-Kitty:**
- Template for user-facing CRUD workflows
- Map UI interactions to API contracts

---

### 6. Component Diagram (`uml/component-diagram.puml`)
**Purpose:** Logical component view showing all major packages and dependencies.

**Key Features:**
- Frontend components (pages, services, UI components)
- Backend controllers, security, data services
- Data layer entities and migrations
- Component dependencies

**Use in Spec-Kitty:**
- Identify affected components when specifying new features
- Understand cross-cutting concerns (security, DTOs, services)

---

## Using These Diagrams with Spec-Kitty

### 1. Feature Specification Workflow

When creating a new Spec-Kitty feature (e.g., `spec-kitty specify`):

1. **Identify actors and use cases** from `use-cases.puml`
   - Example: "As an Administrator, I want to export time entries to CSV"

2. **Map domain entities** from `domain-model.puml`
   - Identify entities involved (TimeEntry, User, WorkItem, Project)

3. **Define API contracts** using `api-architecture.puml` and `component-diagram.puml`
   - Which controller? (e.g., new `AdminReportsController`)
   - Which DTOs? (e.g., new `TimeEntryExportDto`)
   - Security requirements? (admin auth + rate limiting)

4. **Specify acceptance criteria** using sequence diagrams as templates
   - Flow: Admin requests export → Controller queries TimeEntries → CSV generated → Download

5. **Deployment considerations** from `deployment.puml`
   - Dev vs Prod configuration
   - Environment-specific behavior

---

### 2. Rendering Diagrams

These diagrams use **PlantUML** syntax. To render them:

#### Option 1: VS Code Extension
Install the PlantUML extension and preview `.puml` files in the editor.

#### Option 2: Command-Line (Java + Graphviz)
```bash
brew install plantuml graphviz
plantuml diagrams/uml/*.puml -o ../output
```

#### Option 3: Online Renderer
Paste diagram content into [PlantUML Online](http://www.plantuml.com/plantuml/uml/)

---

### 3. Updating Diagrams

When implementing new features:

1. **Update domain model** if new entities or relationships are added
2. **Update API architecture** for new controllers or security policies
3. **Add sequence diagrams** for complex workflows
4. **Update use cases** when new user stories are implemented
5. **Update component diagram** if new services or packages are introduced

---

### 4. Example: Adding a "Timesheet Export" Feature

#### Step 1: Spec-Kitty Feature Scaffold
```bash
spec-kitty specify --path kitty-specs/005-timesheet-export
```

#### Step 2: Reference Diagrams in Spec
In `kitty-specs/005-timesheet-export/spec.md`:

```markdown
## Feature: Timesheet Export

### Actors
- Administrator (from use-cases.puml)

### Domain Entities
- TimeEntry, User, WorkItem, Project (from domain-model.puml)

### API Contract
- Endpoint: GET /api/admin/reports/timesheet
- Controller: AdminReportsController (new, add to api-architecture.puml)
- DTO: TimesheetExportDto (new, add to component-diagram.puml)
- Security: [Authorize(Policy="AdminOnly")], [EnableRateLimiting("Admin")]

### Acceptance Criteria
1. Admin can request a timesheet export for a date range
2. Export includes: User, Project, WorkItem, Hours, EntryDate
3. Response is CSV format
4. Rate limited to 60 exports/min

### Sequence (based on sequence-admin-seed.puml pattern)
1. Admin → GET /api/admin/reports/timesheet?start=2026-01-01&end=2026-01-31
2. AdminTokenAuthHandler → validate X-Admin-Token
3. AdminReportsController → query TimeEntries with joins
4. EF Core → SELECT with includes
5. Controller → serialize to CSV
6. Response → 200 OK with CSV attachment
```

#### Step 3: Update UML After Implementation
- Add `AdminReportsController` to `api-architecture.puml`
- Add `TimesheetExportDto` to `component-diagram.puml`
- Add "Export Timesheet" use case to `use-cases.puml`
- Create `sequence-timesheet-export.puml` for the detailed flow

---

## Diagram Maintenance

**When to update:**
- New entities added to `src/DSC.Data/Models/`
- New controllers added to `src/DSC.Api/Controllers/`
- New security policies or middleware
- New use cases or user stories
- New deployment tiers or infrastructure

**Validation:**
- Run `dotnet build` and ensure no compile errors before updating diagrams
- Cross-reference diagram relationships with actual EF Core navigation properties
- Verify sequence diagrams match actual controller logic

---

## Questions or Additions?

If you need additional diagrams (e.g., state machine for WorkItem lifecycle, ERD with database-level details), create a request and follow the Spec-Kitty workflow to specify the new documentation artifact.

**Generated:** 2026-02-19  
**Maintainer:** AI-assisted documentation for DSC-modernization project
