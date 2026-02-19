## 2026-02-19 — WebClient asset copy, API service, and data fetch

- Copied all relevant static assets from legacy `WebContent` (CSS, JS, images, calendar libs) into `src/DSC.WebClient/public`.
- Created React page stubs for `Activity`, `Project`, `Administrator`, and `Login` in `src/DSC.WebClient/src/pages/`.
- Set up routing in `src/DSC.WebClient/src/App.jsx` to match legacy JSP routes.
- Added a basic API service layer (`src/DSC.WebClient/src/api/`) using `axios` for REST calls to the .NET backend. Example: `ProjectService.js` with `getProjects()` and `createProject()`.
- The `Project` page now fetches and displays project data from `/api/projects`.
- Installed all required npm dependencies (`react-router-dom`, `axios`, etc.).
- Updated documentation: `README.md`, `src/DSC.WebClient/README.md`, `AI/nextSteps.md`.
- Committed and pushed all changes to `origin/main`.

## 2026-02-19 — Java model mapping & migration

- Cloned the original Java `DSC` repo and inspected `src/mts/dsc/orm/*` to identify canonical entities (Project, Activity, Project_Activity, User, etc.).
- Added legacy mapping fields to the EF model to support an incremental port:
	- `ProjectNo` added to `src/DSC.Data/Models/Project.cs`.
	- Legacy activity fields added to `src/DSC.Data/Models/WorkItem.cs` (LegacyActivityId, Date, StartTime, EndTime, PlannedDuration, ActualDuration, ActivityCode, NetworkNumber).
- Created EF Core migration `MapJavaModel` and applied it to the local `dsc_dev` MariaDB instance; verified the `Projects` table now contains `ProjectNo`.

## 2026-02-19 — Frontend dev: Vite config & runtime fixes

- Ensured the frontend is served at `/` by adding a root `index.html` at `src/DSC.WebClient/index.html` and serving static assets from `src/DSC.WebClient/public` via `publicDir`.
- Removed a duplicate `public/index.html` that conflicted with the dev server HMR preamble.
- Added a visible fallback and lightweight runtime error overlay to the root `index.html` to expose client runtime errors in-page.
- Adjusted `src/DSC.WebClient/vite.config.js` to disable HMR/react-refresh in the dev server (set `hmr: false` and disabled fastRefresh in the plugin) to avoid preamble detection errors during development.
- Committed and pushed all frontend fixes; verified `http://localhost:5173/` now serves the app and client modules load.

## 2026-02-19 — Frontend dev environment

- Installed Node.js via Homebrew (`node` installed).
- Installed frontend dependencies in `src/DSC.WebClient` (React, Vite, router, axios, plugin).
- Started Vite dev server (local: `http://localhost:5173`).

Notes: If you see a 404 when loading the client, try refreshing once the server finishes compiling; the API must be running at `http://localhost:5005` for the client proxy to reach backend endpoints.
## 2026-02-19 — Local DB & migrations

- Installed `dotnet-ef` global tool and added `Microsoft.EntityFrameworkCore.Design` to the startup project to enable design-time services.
- Added `DesignTimeDbContextFactory` at `src/DSC.Data/DesignTimeDbContextFactory.cs` to avoid AutoDetect requiring a live DB during migrations.
- Aligned EF Core / Pomelo package versions and generated the `InitialCreate` migration at `src/DSC.Data/Migrations`.
- Installed MariaDB via Homebrew (`mariadb@10.11`) and started the service.
- Created the `dsc_dev` database locally (observed TLS/service quirks). The DB exists at the local MariaDB instance.

Actions (2026-02-19): created local DB user and applied migrations/seed

- Restarted MariaDB cleanly and reset the `root` password using a server `--init-file` (temporary): `root_local_pass`.
- Created application user `dsc_local`@`127.0.0.1` with password `dsc_password` and granted privileges on `dsc_dev`.
- Applied EF migrations (`InitialCreate`) to `dsc_dev` using `dotnet ef database update`.
- Applied sample SQL seed: `spec/fixtures/db/seed.sql`.

Actions (2026-02-19) — API smoke test

- Started `DSC.Api` locally on `http://localhost:5005` with `ConnectionStrings:DefaultConnection` pointing to the local `dsc_dev` database.
- Inserted a `Project` and a `WorkItem` for smoke-testing (one item inserted via SQL, id `44444444-4444-4444-4444-444444444444`).
- Successfully GET /api/items/44444444-4444-4444-4444-444444444444 returned the seeded WorkItem JSON (200 OK).

## 2026-02-19 — API: expose legacy fields

- Added API DTOs to surface legacy Java model fields to the frontend:
	- `src/DSC.Api/DTOs/ProjectDto.cs` (includes `ProjectNo`)
	- `src/DSC.Api/DTOs/WorkItemDto.cs` (includes `LegacyActivityId`, `Date`, `StartTime`, `EndTime`, `PlannedDuration`, `ActualDuration`, `ActivityCode`, `NetworkNumber`)
- Updated controllers to return DTOs so the client can consume legacy identifiers and activity fields: `src/DSC.Api/Controllers/ProjectsController.cs` and `src/DSC.Api/Controllers/ItemsController.cs`.
- Built the solution and verified endpoints: `GET /api/projects` and `GET /api/items/{id}` return DTOs (fields may be null if not set in the DB).

Next: run integration tests or create controllers for other resources (Projects, Users) as needed.

Notes: The `root` password reset was performed non-interactively to allow scripting the setup; if you want a different root password or to re-run the secure setup, run `mysql_secure_installation` and change credentials.

# AI Worklog — DSC-modernization

Date: 2026-02-18

Repository bootstrap created by assistant.

Actions:
- Created repository scaffold: `README.md`, `.gitignore`, `.github/workflows/dotnet.yml`.
- Added this `AI` folder to track progress and decisions for the modernization effort.

Repository creation:

- 2026-02-18: Repository `rloisell/DSC-modernization` created on GitHub and initial scaffold pushed by assistant.

Remote: https://github.com/rloisell/DSC-modernization

Spec Kit integration:

- 2026-02-18: Successfully imported the Spec Kit as a git subtree under `spec/spec-kit` from `https://github.com/github/spec-kit.git`.
- Imported upstream commit (short SHA): `9f3adc7` (from `spec-upstream/main`).
- See `spec/SUBTREE_POLICY.md` for subtree management instructions.

License:

- 2026-02-18: Added `LICENSE` (Apache-2.0, Copyright 2026 rloisell).

Notes:
- The Spec Kit is vendored as a subtree to simplify contributor workflow while keeping an upstream reference for occasional pulls.
- To update the Spec Kit from upstream, run:

```bash
git fetch spec-upstream
git subtree pull --prefix=spec/spec-kit spec-upstream main --squash
```

AI tracking:
- This file, `AI/CHANGES.csv`, and `AI/COMMIT_INFO.txt` record actions and upstream commit references.

Environment setup:

- 2026-02-18: .NET SDK installed locally into `$HOME/.dotnet` using the Microsoft `dotnet-install` script. Installed SDK version: `8.0.418` (commit 5854a779c1). `DOTNET_ROOT` is set to `$HOME/.dotnet`; the install script appended PATH exports to `~/.zshrc`.

Next step: scaffold the .NET solution and projects (I'll generate templates and csproj files next).
 
Scaffold results:

- 2026-02-18: Scaffolded solution `DSC.Modernization.sln` with projects:
	- `src/DSC.Api` (ASP.NET Core Web API)
	- `src/DSC.Web` (ASP.NET Core Web App)
	- `src/DSC.Data` (Class Library, EF Core data access)
	- `tests/DSC.Tests` (xUnit tests)
- Added EF Core packages and MySQL provider:
	- `Microsoft.EntityFrameworkCore` 8.0.13
	- `Pomelo.EntityFrameworkCore.MySql` 8.0.3
	- `Microsoft.EntityFrameworkCore.Design` 8.0.0
- Local `dotnet build` succeeded.

2026-02-19 - Agent actions (dotnet 10 + MariaDB)

- Actions taken today:
	- Updated project TargetFrameworks from `net8.0` to `net10.0` and pushed the commit `chore: update TargetFramework to net10.0 for modernization (prepare Spec-Kitty)` to `origin/main`.
	- Installed .NET 10 SDK (per-user) using `dotnet-install.sh` into `$HOME/.dotnet` (installed `10.0.103` during this run).
	- Installed `dotnet-ef` as a global tool (attempted; please ensure `~/.dotnet/tools` is in your `PATH`).
	- Installed MariaDB via Homebrew and started the service. Attempted to create `dsc_modernization_dev` DB and `dsc_dev` user; if root access is locked by a password, run `mysql_secure_installation` and then create the DB/user manually.

- Current status:
	- Projects updated: DONE and pushed
	- .NET 10 SDK: Installed to `$HOME/.dotnet` (per-user)
	- `dotnet-ef`: Installed or attempted; verify with `dotnet tool list -g`
	- MariaDB: Installed and service started; DB/user creation may require manual intervention

- Outstanding items / next steps:
	- If root requires a password, run `mysql_secure_installation` and create DB/user manually. See `AI/COMMANDS.sh` for the exact commands to run.
	- Optionally add `global.json` to pin the 10.x SDK patch version.
	- Run `dotnet build` and `dotnet test` to validate compatibility and ensure everything compiles.
	-  Run `dotnet build` and `dotnet test` to validate compatibility and ensure everything compiles. (Completed: 2026-02-19)

2026-02-19 - Spec-Kitty scaffold

	- Ran `spec-kitty upgrade` to migrate project metadata and templates to the current Spec-Kitty layout.
	- Created a sample feature scaffold at `kitty-specs/001-modernize-api/` with `spec.md` and `tasks.md` to use as a template while researching.

	- `.kittify/` metadata updated: DONE
	- `kitty-specs/001-modernize-api` scaffold created: DONE

	- Added fixtures: `spec/fixtures/openapi/items-api.yaml`, `spec/fixtures/db/seed.sql`, `spec/fixtures/README.md` to support the sample feature.

2026-02-19 - API scaffold

- Actions taken:
  - Added `ItemsController` in `src/DSC.Api/Controllers/ItemsController.cs` implementing GET/POST endpoints matching `spec/fixtures/openapi/items-api.yaml`.
  - Registered `ApplicationDbContext` in `src/DSC.Api/Program.cs` and added a `ProjectReference` from `DSC.Api` to `DSC.Data`.

- Status:
  - API compiles and is ready to run locally (build succeeded).


Next steps:
	- Populate `kitty-specs/001-modernize-api/spec.md` with detailed acceptance criteria and example payloads as you research.
	- Add seed data under `spec/fixtures/db/` and OpenAPI examples under `spec/fixtures/openapi/` when available.

2026-02-19 - Data model scaffold

- Actions taken:
	- Added a baseline EF Core data model in `src/DSC.Data` to support porting the Java application and provide a validated schema to work backwards from. Files added:
		- `src/DSC.Data/ApplicationDbContext.cs`
		- `src/DSC.Data/Models/User.cs`
		- `src/DSC.Data/Models/Project.cs`
		- `src/DSC.Data/Models/WorkItem.cs`
		- `src/DSC.Data/Models/TimeEntry.cs`
		- `src/DSC.Data/Models/ProjectAssignment.cs`

- Status:
	- EF Core model compiled successfully against `net10.0`: DONE

- Notes:
	- The `User` entity retains local auth fields (`PasswordHash`) to support an incremental migration path from local accounts to brokered OIDC authentication.
	- Next steps: map the validated business model from the Java repo into these entities, add any missing fields, and create EF Core migrations.

Build & Test Results (2026-02-19):

- `dotnet --version`: `10.0.103`
- `dotnet build DSC.Modernization.sln`: Build succeeded (all projects targeted `net10.0`).
- `dotnet test tests/DSC.Tests/DSC.Tests.csproj`: 1 test discovered and passed.

All changes remain committed and pushed to `origin/main`.

## 2026-02-19 — Frontend scaffold

- Added a minimal React/Vite frontend scaffold at `src/DSC.WebClient` to start porting the legacy Java `WebContent` JSP pages into React components.

- Files added:
	- `src/DSC.WebClient/package.json`
	- `src/DSC.WebClient/README.md`
	- `src/DSC.WebClient/public/index.html`
	- `src/DSC.WebClient/public/assets/css/main.css` (trimmed)
	- `src/DSC.WebClient/public/assets/js/calendar.js` (placeholder)
	- `src/DSC.WebClient/src/*` (React entry, App, pages)

- Attempted to run `npm install` in the automation environment but `npm` was not available (zsh: command not found). To finish locally, run:

```
cd src/DSC.WebClient
npm install
npm run dev
```

This will start the Vite dev server for the client. After installing dependencies, copy static assets from the legacy `WebContent` (css, js, images) into `src/DSC.WebClient/public` and begin porting JSPs to React components.

	- When ready, use Spec-Kitty CLI to build the Spec; I will pause after this step per your instructions.
