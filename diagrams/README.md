# DSC Modernization Diagram Documentation

This directory contains Draw.io (diagrams.net) diagrams documenting the architecture, domain model, and workflows of the DSC (Daily Status & Charges) modernization project.

## Diagram Overview

### 1. Domain Model (diagrams/drawio/domain-model.drawio.svg)
**Purpose:** Domain entity overview and key relationships.

**Key Features:**
- Core domain entities (User, Project, WorkItem, TimeEntry, ProjectAssignment)
- Legacy compatibility entities (UserAuth, ExternalIdentity)
- Catalog domain (Position, Department, ExpenseCategory, ActivityCode, NetworkNumber)
- Relationship highlights

### 2. ERD (diagrams/drawio/erd.drawio.svg)
**Purpose:** Database-focused ERD with primary keys and foreign keys.

**Key Features:**
- Core tables and join tables
- Key relationships between User, WorkItem, TimeEntry, ProjectAssignment
- Catalog tables and activity options

### 3. API Architecture (diagrams/drawio/api-architecture.drawio.svg)
**Purpose:** Component view of the API layers, middleware, controllers, and data flow.

**Key Features:**
- API middleware pipeline (CORS, Rate Limiting, Authentication, Authorization)
- Controller separation (public vs admin)
- DTO patterns and seeding services

### 4. Use Cases (diagrams/drawio/use-cases.drawio.svg)
**Purpose:** Actor-based use case diagram showing what users and administrators can do.

**Key Features:**
- End-user workflows (time tracking, project viewing)
- Admin workflows (user management, catalog administration, data seeding)
- Planned features (OIDC login)

### 5. Deployment Architecture (diagrams/drawio/deployment.drawio.svg)
**Purpose:** Deployment view showing development and production environments.

**Key Features:**
- Development setup (Vite, Kestrel, MariaDB on localhost)
- Production tier separation (web, app, database)
- Planned OIDC integration (Keycloak)

### 6. Sequence Diagrams

#### Admin Seed Test Data (diagrams/drawio/sequence-admin-seed.drawio.svg)
**Purpose:** Shows the flow for seeding legacy test data via the admin endpoint.

#### Time Entry Creation (diagrams/drawio/sequence-time-entry.drawio.svg)
**Purpose:** Shows the flow for creating a work item with legacy activity fields.

### 7. Component Diagram (diagrams/drawio/component-diagram.drawio.svg)
**Purpose:** Logical component view showing all major packages and dependencies.

**Key Features:**
- Frontend components (pages, services, UI components)
- Backend controllers, security, data services
- Data layer entities and migrations

---

## Using These Diagrams with Spec-Kitty

### 1. Feature Specification Workflow

When creating a new Spec-Kitty feature (e.g., `spec-kitty specify`):

1. **Identify actors and use cases** from `use-cases.drawio.svg`
2. **Map domain entities** from `domain-model.drawio.svg` and `erd.drawio.svg`
3. **Define API contracts** using `api-architecture.drawio.svg` and `component-diagram.drawio.svg`
4. **Specify acceptance criteria** using sequence diagrams as templates
5. **Deployment considerations** from `deployment.drawio.svg`

---

## Editing Diagrams (Draw.io)

These diagrams are stored as editable Draw.io SVGs.

### Option 1: Draw.io Desktop App
- Open the `.drawio.svg` files directly in the Draw.io app.

### Option 2: diagrams.net (Web)
- Visit https://app.diagrams.net
- Drag and drop the `.drawio.svg` files into the editor.

### Option 3: VS Code Extension
- Install a Draw.io extension (e.g., `hediet.vscode-drawio`) and open the SVGs.

---

## Diagram Maintenance

**When to update:**
- New entities added to `src/DSC.Data/Models/`
- New controllers added to `src/DSC.Api/Controllers/`
- New security policies or middleware
- New use cases or user stories
- New deployment tiers or infrastructure

**Validation:**
- Cross-reference diagram relationships with actual EF Core navigation properties
- Verify sequence diagrams match actual controller logic

---

## Questions or Additions?

If you need additional diagrams (e.g., state machine for WorkItem lifecycle, detailed ERD updates), create a request and follow the Spec-Kitty workflow to specify the new documentation artifact.

**Generated:** 2026-02-19
**Maintainer:** AI-assisted documentation for DSC-modernization project
