# DSC Modernization

A modernization of the legacy Java *Daily Status & Charges* (DSC) time-tracking system, rewritten as a .NET 10 API with a React/Vite frontend backed by MariaDB.

---

## What is DSC?

DSC (Daily Status & Charges) is an internal workforce management application used to track employee time entries against projects and expense budgets. The original implementation was a Java / Hibernate application. This repository is a ground-up rewrite targeting:

- **Modern runtime**: .NET 10 (ASP.NET Core 9) API
- **Modern frontend**: React 18 + Vite with the [B.C. Government Design System](https://design.gov.bc.ca/)
- **Modern ORM**: Entity Framework Core 9 with the Pomelo MariaDB provider
- **Incremental migration**: Legacy Java field mappings preserved (e.g. `LegacyActivityId`, `ProjectNo`, `EmpId`) so the two systems can run in parallel during transition

The project is driven by a [Spec-Kitty](https://github.com/Priivacy-ai/spec-kitty) specification workflow. Feature specs live in [`kitty-specs/`](kitty-specs/).

---

## Technology Stack

| Layer | Technology |
|---|---|
| API | .NET 10 / ASP.NET Core 9 |
| ORM | Entity Framework Core 9 + Pomelo.MySql |
| Database | MariaDB |
| Frontend | React 18 + Vite |
| UI Library | B.C. Government Design System (BC Sans, design tokens) |
| Auth (current) | Header-based (`X-User-Id` / `X-Admin-Token`) |
| Auth (target) | OpenID Connect — Keycloak |
| Data fetching | TanStack Query v5 |
| Testing | xUnit + EF Core InMemory |

---

## Features

### User-Facing
| Feature | Description |
|---|---|
| **Work Item Tracking** | Create, edit, and delete daily time entries against projects or expense accounts |
| **Project Summary** | Cumulative budget status per project; visual overbudget warning (⚠ red) when actual hours exceed estimate |
| **Project/Expense Split** | Budget type (CAPEX/OPEX) controls required fields — project entries track hours, expense entries track cost codes |
| **Activity Code + Network Filtering** | Dropdowns constrained to valid project-specific combinations; pair-selection table eliminates invalid entries |
| **Time Period Filtering** | Activity list filterable by Today / This Week / This Month / This Year / All Time |
| **Projects View** | Read-only browsable project list with estimated hours and available activity options per project |
| **Reporting Dashboard** | Date-range and project-filtered aggregation report (hours by project / activity code) |

### Admin-Facing
| Feature | Description |
|---|---|
| **Tab-Based Admin Console** | Single-page tabbed interface: Users, Roles, Positions, Departments, Projects, Expense, Activity Options |
| **User Management** | Create / edit / deactivate users with role, position, and department assignments |
| **Role Management** | Create / edit / deactivate application roles |
| **Project Assignments** | Assign users to projects with position and estimated hours; filterable by project, user, and position |
| **Catalog Management** | Manage all reference data: activity codes, network numbers, budgets, expense categories, CPC/Director/Reason codes, unions |
| **Bulk Options Assignment** | "Assign All Options" creates every valid activity code × network number combination for a project in one click |
| **Test Data Seeding** | Admin endpoint seeds realistic multi-user, multi-project data including overbudget scenarios |

### Platform
| Feature | Description |
|---|---|
| **Service Layer** | Business logic fully decoupled from controllers via `IWorkItemService`, `IReportService`, `IProjectService`, `IAuthService` |
| **Global Exception Handler** | RFC 7807 ProblemDetails responses for all domain exceptions (400/401/403/404) |
| **Rate Limiting** | Fixed-window rate limiter on admin endpoints (60 req/min per IP) |
| **Health Check** | `GET /api/health` (basic) and `GET /api/health/details` (DB connectivity) |
| **EF Core Migrations** | Auto-applied on startup; safe incremental schema evolution |
| **Swagger / OpenAPI** | Full schema with example payloads for all endpoints |

---

## Architecture

### High-Level Component View

![Component Diagram](diagrams/drawio/svg/component-diagram.svg)

The application is composed of three main layers:

```
┌─────────────────────────────────────────────────────┐
│  React + Vite Frontend  (port 5173)                 │
│  B.C. Design System · TanStack Query · Axios        │
└──────────────────┬──────────────────────────────────┘
                   │  HTTP (JSON)
┌──────────────────▼──────────────────────────────────┐
│  ASP.NET Core 9 API  (port 5005)                    │
│  Auth Handlers · Service Layer · EF Core            │
└──────────────────┬──────────────────────────────────┘
                   │  EF Core / Pomelo
┌──────────────────▼──────────────────────────────────┐
│  MariaDB                                            │
└─────────────────────────────────────────────────────┘
```

### API Architecture (Middleware Pipeline)

The middleware pipeline, authentication schemes, controller layout, and DTO mappings are documented in detail:

![API Architecture](diagrams/drawio/svg/api-architecture.svg)

### Domain Model

Core entities and their relationships:

![Domain Model](diagrams/drawio/svg/domain-model.svg)

The [data model compare/contrast document](docs/data-model/README.md) details how the .NET EF Core model maps to and differs from the original Java/Hibernate model, including entity relationship diagrams for both:

| Diagram | Source | Export |
|---|---|---|
| ERD — Current .NET Model | [erd-current.drawio](diagrams/data-model/erd-current.drawio) | [SVG](diagrams/data-model/svg/erd-current.svg) |
| ERD — Java Legacy Model | [erd-java-legacy.drawio](diagrams/data-model/erd-java-legacy.drawio) | [SVG](diagrams/data-model/svg/erd-java-legacy.svg) |

### Service Layer

![Service Layer](diagrams/drawio/svg/service-layer.svg)

### Deployment Topology

![Deployment](diagrams/drawio/svg/deployment.svg)

### Key Sequence Flows

| Flow | Diagram |
|---|---|
| User time entry (work item create) | [sequence-time-entry.svg](diagrams/drawio/svg/sequence-time-entry.svg) |
| Reporting dashboard query | [sequence-reporting-dashboard.svg](diagrams/drawio/svg/sequence-reporting-dashboard.svg) |
| Admin test data seed | [sequence-admin-seed.svg](diagrams/drawio/svg/sequence-admin-seed.svg) |
| Admin CRUD operations | [sequence-admin-crud.svg](diagrams/drawio/svg/sequence-admin-crud.svg) |
| Health check | [health-check-sequence.svg](diagrams/drawio/svg/health-check-sequence.svg) |

See [diagrams/README.md](diagrams/README.md) for the full diagram index including PlantUML and Draw.io source files.

---

## Getting Started

Full environment setup is documented in [docs/local-development/README.md](docs/local-development/README.md).

### Quick Start

**Prerequisites**: .NET 10 SDK, Node.js 20+, MariaDB (local or Docker)

```bash
# 1. Configure database connection
cp src/DSC.Api/appsettings.Development.json.example src/DSC.Api/appsettings.Development.json
# Edit DefaultConnection string for your MariaDB instance

# 2. Start the API (applies EF migrations automatically on startup)
cd src/DSC.Api && dotnet run
# API available at http://localhost:5005
# Swagger UI at http://localhost:5005/swagger

# 3. Seed test data
curl -X POST http://localhost:5005/api/admin/seed/test-data \
  -H "X-Admin-Token: local-admin-token"

# 4. Start the frontend
cd src/DSC.WebClient && npm install && npm run dev
# Frontend available at http://localhost:5173
```

### Test Accounts

| Username | Password | Role | Access |
|---|---|---|---|
| `rloisel1` | `test-password-updated` | Admin | All features + admin console |
| `dmcgregor` | `test-password-updated` | Manager | All projects |
| `kduma` | `test-password-updated` | User | 4 assigned projects |
| `mammeter` | `test-password-updated` | User | 3 assigned projects |

### Running Tests

```bash
dotnet test tests/DSC.Tests/DSC.Tests.csproj
```

16 unit and integration tests (xUnit + EF InMemory). See [tests/howto.md](tests/howto.md) for details.

---

## Authentication

The current implementation uses lightweight header-based authentication suitable for local/dev use:

- **User auth**: `X-User-Id: <userId>` header — validated against the database, sets `ClaimsPrincipal` for role-based filtering
- **Admin auth**: `X-Admin-Token: local-admin-token` header — grants access to admin seed and management endpoints

The **target architecture** replaces this with OpenID Connect via Keycloak. A migration path (ExternalIdentity table, OIDC middleware, Keycloak configuration) is documented in [AI/securityNextSteps.md](AI/securityNextSteps.md).

---

## Documentation

| Document | Contents |
|---|---|
| [docs/local-development/README.md](docs/local-development/README.md) | Environment setup, LaunchAgent config, MariaDB, ports, known issues |
| [docs/data-model/README.md](docs/data-model/README.md) | .NET vs Java data model compare/contrast |
| [diagrams/README.md](diagrams/README.md) | Full diagram index; how to edit and regenerate SVG/PNG exports |
| [AI/securityNextSteps.md](AI/securityNextSteps.md) | Security hardening plan and Keycloak migration path |
| [AI/nextSteps.md](AI/nextSteps.md) | Feature backlog, completion status, future roadmap |
| [tests/howto.md](tests/howto.md) | Test infrastructure, how to add tests |
| [kitty-specs/](kitty-specs/) | Spec-Kitty feature specifications |

---

## Development History

The step-by-step development log — what was built each session, decisions made, and commands run — is in two places:

- [docs/development-history.md](docs/development-history.md) — Summary of each development session
- [AI/WORKLOG.md](AI/WORKLOG.md) — Detailed session-by-session log (3000+ lines)
