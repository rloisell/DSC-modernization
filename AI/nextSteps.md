# WebClient progress (2026-02-19)

- All static assets from legacy `WebContent` (CSS, JS, images, calendar libs) are now in `src/DSC.WebClient/public`.
- React page stubs for `Activity`, `Project`, `Administrator`, and `Login` are in `src/DSC.WebClient/src/pages/`.
- Routing matches legacy JSPs; see `src/DSC.WebClient/src/App.jsx`.
- API service layer (`src/DSC.WebClient/src/api/`) uses `axios` for backend calls. Example: `ProjectService.js`.
- `Project` page fetches and displays project data from `/api/projects`.
- All required npm dependencies installed.
- Docs updated and changes pushed.

Next steps:
- Port business logic/UI from JSPs into React components.
- Expand API service layer as new endpoints are needed.
- Refine data model and connect more pages to backend data.
- Begin OIDC integration for login flow (Keycloak).
- Implement OpenID Connect config in `src/DSC.Api` (development Keycloak instance) and add an `ExternalIdentity` mapping table for provider subject IDs.

Update (2026-02-19): Implementation progress

- Added `ExternalIdentity` entity at `src/DSC.Data/Models/ExternalIdentity.cs` and registered it in `ApplicationDbContext`.
- Added `ItemsController` and wired `ApplicationDbContext` to `DSC.Api` so you have a runnable API that maps to the sample OpenAPI contract.
- Next: I can map the Java model in `https://github.com/rloisell/DSC/tree/master/src/mts/dsc` into the EF entities here and add any missing fields; shall I proceed with that mapping now?
# Update (2026-02-19): Java model mapping — IN PROGRESS / APPLIED

- I cloned the Java `DSC` repo and inspected `src/mts/dsc/orm/*` to identify canonical entities (Project, Activity, Project_Activity, User, etc.).
- I added `ProjectNo` to `src/DSC.Data/Models/Project.cs` to preserve the legacy `Project.projectNo` identifier.
- I added legacy `Activity` fields to `src/DSC.Data/Models/WorkItem.cs` (LegacyActivityId, Date, StartTime, EndTime, PlannedDuration, ActualDuration, ActivityCode, NetworkNumber) to ease mapping and support migration of UI logic.
- An EF Core migration `MapJavaModel` was generated and applied to the local `dsc_dev` MariaDB; the `Projects` table now contains `ProjectNo`.

Local GUI test URL (developer):

- Frontend (React/Vite dev server): http://localhost:5173/
- Backend API (ASP.NET Core): http://localhost:5005/

Next steps (recommended, prioritized):

1. Update API DTOs/controllers to expose legacy fields (include `ProjectNo` and WorkItem legacy fields). — DONE (2026-02-19)
2. Port additional Java entities into EF as required (User, Department, Calendar) and add migrations for each logical group.
3. Update frontend services (`src/DSC.WebClient/src/api/*`) and pages to use the new legacy fields (e.g., display `ProjectNo` alongside `Name`). — Completed: `Project.jsx` and `Activity.jsx` now render legacy DTO fields.
 3.b Add a project selector to the Activity create form (fetch projects and show `projectNo` + `name`). — Completed: `src/DSC.WebClient/src/pages/Activity.jsx` now loads projects and renders a project dropdown.
3.c Add Swagger examples for WorkItem endpoints (request/response examples). — Completed: `WorkItemExamplesOperationFilter` registered in `src/DSC.Api/Program.cs`.
4. Implement OIDC/Keycloak integration in `src/DSC.Api` and add `ExternalIdentity` mapping data in the DB for brokered logins.
5. Run end-to-end smoke tests: start MariaDB, apply migrations, run API and Vite, and verify list/create flows in the UI.
6. Admin porting: add routes and stub pages for the legacy admin sections (Users, Positions, Departments, Projects, Expense, Activity Options). — Completed: see `src/DSC.WebClient/src/pages/Admin*.jsx` and `src/DSC.WebClient/src/App.jsx`.
7. Flesh out Admin Users and admin section content to mirror legacy forms. — Completed: `AdminUsers` now includes add/edit form fields; other admin pages include planned actions and back links.

Spec-Kitty / Migration next steps (explicit)

- Prepare a feature spec for "Map Java Data Model" (example location: `kitty-specs/002-map-java-model/spec.md`): include clear acceptance criteria, example JSON payloads, and DB seed expectations.

- Commands to scaffold & validate:

```bash
# (from repo root) ensure spec-kitty CLI is installed
which spec-kitty || pipx install spec-kitty

# migrate project metadata (if not already):
spec-kitty upgrade

# create a feature skeleton interactively or from a template
spec-kitty specify --path kitty-specs/002-map-java-model

# run orchestration in a disposable worktree (agentic operations may modify the repo)
spec-kitty orchestrate --worktree-temp
```

- Migration checklist for the feature:
  1. Map entities from Java (`external/DSC-java/src/mts/dsc/orm`) into `src/DSC.Data/Models`.
  2. Add EF Core migrations per logical group (e.g., Projects+Activities, Users+Auth, Calendar) and run `dotnet ef migrations add` for each.
  3. Apply migrations to a local MariaDB instance for testing:

```bash
export DSC_Connection="Server=127.0.0.1;Port=3306;Database=dsc_dev;User=dsc_local;Password=dsc_password;"
dotnet ef database update --project src/DSC.Data --startup-project src/DSC.Api --context ApplicationDbContext
```

  4. Seed test data under `spec/fixtures/db/` and validate API responses with `curl` or automated tests.

If you want, I can: (A) update API controllers to surface the new fields now, or (B) scaffold the Spec-Kitty feature and populate `spec.md` with acceptance criteria. Which do you prefer? Reply with "API" or "Spec".
# Next Steps — Build the Spec-Kitty Project

This document outlines the high-level steps to build the Spec-Kitty spec for this repository, the data you should prepare, and quick links to relevant documentation and examples.

**Goal:** produce and validate a Spec-Kitty project workspace (features, missions, artifacts) that can be used to orchestrate implementation and integration tasks.

**High-level steps**

- 1) Verify environment
  - Ensure `spec-kitty` CLI is installed and available in your PATH (`which spec-kitty`).
  - Run `spec-kitty verify-setup` to confirm required tools and note any missing AI assistants or IDE integrations.

- 2) Add project metadata
  - Run `spec-kitty upgrade` at the repo root to create the `.kittify/metadata.yaml` and related scaffolding the CLI expects.

- 3) Specify features (create the Spec)
  - Use `spec-kitty specify` to create one or more feature specifications. Each feature should include:
    - A short title and unique id
    - A clear value statement / outcome (why it matters)
    - Acceptance criteria (concrete, testable)
    - Phase / mission selection (e.g., `software-dev`)
    - Any required design assets or API contracts

- 4) Prepare feature artifacts and data
  - For each feature provide:
    - Detailed acceptance criteria and test cases
    - Example requests/responses for any API work
    - Sample data (DB schema, seed data) and credentials for local development (do NOT commit secrets)
    - Any design mockups, diagrams or decision records

- 5) Run agent workflows (optional) or implement manually
  - For agentic work: `spec-kitty orchestrate` will run the Spec-Kitty orchestration (or use `spec-kitty agent` commands).
  - For manual work: follow the `implement` steps produced by `spec-kitty specify` and create a feature branch per feature.

- 6) Validate and merge
  - Use `spec-kitty accept` and `spec-kitty merge` to validate readiness and merge completed features.

**Data & access you must provide**

- Feature-level content: descriptive text, acceptance criteria, success metrics.
- Example API contracts (OpenAPI/Swagger), sample request/response JSON.
- Local dev credentials and seed data for MariaDB (store secrets externally; use env vars or `.env` files excluded from git).
- CI access / GitHub tokens if you plan to integrate automated agent workflows that need push/PR permissions.
- Any third-party API keys or cloud resource credentials (use ephemeral/test keys).

**Commands (quick reference)**

```bash
# Show setup status
spec-kitty verify-setup

# Add project metadata (upgrade to current spec-kitty layout)
spec-kitty upgrade

# Interactively create a feature/spec
spec-kitty specify

# Show missions and context
spec-kitty mission
spec-kitty context

# Orchestrate agent-driven implementation (careful: may modify repo/worktrees)
spec-kitty orchestrate

# Validate and merge
spec-kitty accept
spec-kitty merge
```

**Relevant links & reading**

- Spec-Kitty repository (fork we're using): https://github.com/Priivacy-ai/spec-kitty
- Spec-Kitty README & CLI reference: (see the repo README and `spec-kitty --help` locally)
- Original GitHub Spec Kit (concepts, examples): https://github.com/github/spec-kit
- Spec-driven design resources and examples:
  - Spec-driven development primer: https://github.com/github/spec-kit (examples in `spec-kit` templates)

**Notes & recommendations**

- Start small: create a single simple feature with tight acceptance criteria to validate the workflow.
- Avoid committing secrets; use env variables and document required vars in feature artifacts.
- If you plan to run autonomous agents (`orchestrate`), ensure you understand the permissions they will require — run in a throwaway branch/worktree first.

If you want, I can proceed to run `spec-kitty upgrade` and then `spec-kitty specify` interactively to scaffold a sample feature — tell me whether you prefer to author the initial feature text or have me draft it.
# Frontend port next steps (2026-02-19)

- Copy the legacy static assets into the client public folder:

  - `WebContent/css/*` -> `src/DSC.WebClient/public/assets/css/`
  - `WebContent/js/*` -> `src/DSC.WebClient/public/assets/js/`
  - `WebContent/html/*` and `WebContent/includes/*` -> `src/DSC.WebClient/public/` (or converted into React components)
  - `WebContent/html/images/*` -> `src/DSC.WebClient/public/assets/images/`

- Implement React routes and components that mirror the JSP pages. Start with:
  - `activity.jsp` -> `src/DSC.WebClient/src/pages/Activity.jsx`
  - `project.jsp` -> `src/DSC.WebClient/src/pages/Project.jsx`
  - `administrator.jsp` -> `src/DSC.WebClient/src/pages/Administrator.jsx`
  - `login.jsp` -> `src/DSC.WebClient/src/pages/Login.jsx`

- Implement client API services to call the `DSC.Api` endpoints (use `fetch` or `axios`) and move server-side logic into API endpoints where necessary.

- After assets are copied & pages scaffolded, run the client locally:

```
cd src/DSC.WebClient
npm install
npm run dev
```

If `npm` is not present locally, install Node.js / npm (recommended via Homebrew on macOS: `brew install node`).

***
Generated: 2026-02-19 — tracked in `AI/WORKLOG.md`.

Update (2026-02-19): Scaffolding

- I ran `spec-kitty upgrade` to migrate project metadata to the current Spec-Kitty layout.
- I added a sample feature scaffold at `kitty-specs/001-modernize-api/` containing `spec.md` and `tasks.md`. Use this directory as a template to populate acceptance criteria, sample requests, and seed data as you research.

Paths to review:
- Feature scaffold: `kitty-specs/001-modernize-api/spec.md`
- Tasks: `kitty-specs/001-modernize-api/tasks.md`
- Project metadata: `.kittify/`

Next recommended actions:
- Fill `spec.md` with example JSON and DB seed files under `spec/fixtures/`.
- When ready, run `spec-kitty orchestrate` in a disposable worktree to validate agent workflows.

Update (2026-02-19): Data model & auth plan

- I scaffolded a baseline EF Core data model under `src/DSC.Data/Models/` and `ApplicationDbContext` to provide a full schema to work backwards from. This should make porting the Java `DSC` model straightforward.

- Authentication plan:
  - Current approach: local accounts are represented in the `User` entity (with `PasswordHash`).
  - Migration target: brokered identity using OIDC (Keycloak). Planned changes:
    1. Introduce an `ExternalIdentity` table mapping provider subject ids to `User` records, or migrate to use `sub`/email as primary identifiers.
    2. Remove local password storage once all users have been migrated and external auth enforced.
    3. Integrate Keycloak via OpenID Connect in `DSC.Api` using `Microsoft.AspNetCore.Authentication.OpenIdConnect` or `IdentityModel` for token validation.

- Files added as part of the scaffold:
  - `src/DSC.Data/ApplicationDbContext.cs`
  - `src/DSC.Data/Models/*` (User, Project, WorkItem, TimeEntry, ProjectAssignment)
  - `spec/fixtures/openapi/items-api.yaml`, `spec/fixtures/db/seed.sql`

Recommended next steps to port Java model:
1. Review the Java `DSC` repo model (https://github.com/rloisell/DSC) and map entities/columns to the EF Core classes. Update or add any missing fields.
2. Add EF Core migrations: `dotnet ef migrations add InitialSchema` and inspect generated SQL.
3. Seed production-like test data under `spec/fixtures/db/` and run integration tests against local MariaDB.
4. Implement OpenID Connect config in `src/DSC.Api` (development Keycloak instance) and add an `ExternalIdentity` mapping table for provider subject IDs.

---

Local DB & Run Instructions (macOS)

- Homebrew MariaDB (installed in this session):
  - Install: `brew install mariadb@10.11`
  - Start: `brew services start mariadb@10.11`
  - Create DB (example):
    `/opt/homebrew/opt/mariadb@10.11/bin/mysql -h 127.0.0.1 -P 3306 -u root -e "CREATE DATABASE dsc_dev;"`
  - Note: root access and SSL behavior can vary by install; if you encounter permission/SSL issues use the Docker option below.

- Docker (recommended for isolated local DB):
  - Start container (example):
    `docker run --name dsc-mariadb -e MYSQL_ROOT_PASSWORD=localpass -e MYSQL_DATABASE=dsc_dev -p 3306:3306 -d mariadb:10.11`
  - Connect: `mysql -h 127.0.0.1 -P 3306 -u root -plocalpass`
  - Create a local user for the app (optional):
    `CREATE USER 'dsc_local'@'127.0.0.1' IDENTIFIED BY 'dsc_password'; GRANT ALL ON dsc_dev.* TO 'dsc_local'@'127.0.0.1';`

Apply migrations & seed data (example):

```bash
# Set connection string env var used by the design-time factory
export DSC_Connection="Server=127.0.0.1;Port=3306;Database=dsc_dev;User=dsc_local;Password=dsc_password;"

# Apply EF migrations to the running DB
dotnet ef database update --project src/DSC.Data --startup-project src/DSC.Api --context ApplicationDbContext

# Apply SQL seed (items fixture)
mysql -h 127.0.0.1 -P 3306 -u dsc_local -pdsc_password dsc_dev < spec/fixtures/db/seed.sql
```

If you'd like, I can try the Docker path now (will pull an image and start a container), create the `dsc_local` user, apply migrations, and seed the DB.


