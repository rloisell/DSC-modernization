## WebClient (React) Progress — 2026-02-19

- All static assets from legacy `WebContent` (CSS, JS, images, calendar libs) are now in `src/DSC.WebClient/public`.
- React page stubs for `Activity`, `Project`, `Administrator`, and `Login` are in `src/DSC.WebClient/src/pages/`.
- Routing matches legacy JSPs; see `src/DSC.WebClient/src/App.jsx`.
- API service layer (`src/DSC.WebClient/src/api/`) uses `axios` for backend calls. Example: `ProjectService.js`.
- `Project` page fetches and displays project data from `/api/projects`.
- All required npm dependencies installed.
- Docs updated and changes pushed.
# DSC-modernization

Spec-driven modernization of the DSC Java application to .NET 10, using a Spec-Kitty-driven workflow.

This repository contains the Spec artifacts, the .NET solution, and incremental work to port the original Java DSC application to .NET 10 (ASP.NET Core + EF Core).

Key points
- We use the Spec-Kitty toolkit (fork: https://github.com/Priivacy-ai/spec-kitty) to drive feature specification, implementation, and validation.
- Projects have been updated to target `.NET 10` and a local development environment using MariaDB is recommended.
- See `AI/nextSteps.md` for a concise guide on how to create features, run agent workflows, and build the Spec.

Data model & porting notes
- The repository includes an EF Core data model scaffold under `src/DSC.Data` to serve as the starting point for porting the Java `DSC` application (the Java model lives at https://github.com/rloisell/DSC/tree/master/src/mts/dsc/orm).
- We intentionally kept legacy mapping fields (e.g., `User.EmpId` and a `UserAuth` entity) and added an `ExternalIdentity` entity to support an incremental migration from local accounts to brokered OIDC (Keycloak).

ORM compatibility
- Yes — continued use of an ORM is supported. The project uses Entity Framework Core (EF Core) and the `Pomelo.EntityFrameworkCore.MySql` provider to interact with MariaDB/MySQL. This allows a direct mapping from the existing Java ORM-generated model into EF Core entities and migrations.

Authentication migration plan
- Current: local accounts (legacy username/password stored in `user_auth` mapping). The EF scaffold preserves these fields for migration.
- Target: brokered identity using OpenID Connect (Keycloak). We recommend adding an `ExternalIdentity` table to map provider `sub` values to `User` records, and integrating Keycloak with `DSC.Api` using OIDC middleware. Local password fields are removed only after migration is complete.

Current status (high level)
- Project target frameworks updated to `net10.0` (all `src/*` and `tests/*` projects).
- Local prerequisites documented and partially installed in `AI/WORKLOG.md` and `AI/COMMANDS.sh` (dotnet 10 SDK, `dotnet-ef`, MariaDB).
- A successful local build and unit test run was completed (see `AI/WORKLOG.md` for results).

Quickstart (macOS)

1. Verify .NET SDK and tools:

```bash
dotnet --version
dotnet --info
dotnet tool list -g
```

2. Build the solution:

```bash
dotnet build DSC.Modernization.sln
```

3. Run tests:

```bash
dotnet test tests/DSC.Tests/DSC.Tests.csproj
```

4. Spec-Kitty (verify & prepare):

```bash
spec-kitty verify-setup
spec-kitty upgrade    # adds metadata scaffolding
spec-kitty specify    # create feature specs interactively

Run locally (webserver + DB)

- Webserver: the API runs on ASP.NET Core (Kestrel) and can be started with:

```bash
# Run the API (development)
dotnet run --project src/DSC.Api
# or with hot reload
dotnet watch run --project src/DSC.Api
```

- Database (two common options on macOS):
	- Homebrew MariaDB: `brew install mariadb@10.11` and `brew services start mariadb@10.11` (then create `dsc_dev` DB)
	- Docker MariaDB (recommended for isolated environment):
		```bash
		docker run --name dsc-mariadb -e MYSQL_ROOT_PASSWORD=localpass -e MYSQL_DATABASE=dsc_dev -p 3306:3306 -d mariadb:10.11
		```

After the DB is available, set a connection string (env var used by the design-time factory):

```bash
export DSC_Connection="Server=127.0.0.1;Port=3306;Database=dsc_dev;User=dsc_local;Password=dsc_password;"
```

Then apply migrations and seed data (examples):

```bash
dotnet ef database update --project src/DSC.Data --startup-project src/DSC.Api --context ApplicationDbContext
mysql -h 127.0.0.1 -P 3306 -u dsc_local -pdsc_password dsc_dev < spec/fixtures/db/seed.sql
```

Frontend (React/Vite scaffold)

A minimal React client has been added at `src/DSC.WebClient`. To run it locally you will need Node.js and npm installed. Example:

```bash
cd src/DSC.WebClient
npm install
npm run dev
```

If `npm` is not installed on your machine, install Node.js (Homebrew: `brew install node`) and re-run the commands above.

Note: On this machine I installed Node.js via Homebrew and started the Vite dev server for the client. The client is available at `http://localhost:5173` (run `npm run dev` in `src/DSC.WebClient` if you need to restart it).
```

Notes
- Use MariaDB for local development (compatible with the `Pomelo.EntityFrameworkCore.MySql` provider referenced in the project). Do not commit secrets — use environment variables or a local `.env` excluded from source control.
- All AI-driven steps, logs, and commands are tracked under the `AI/` folder; review `AI/WORKLOG.md` and `AI/nextSteps.md` before running agent workflows.

If you'd like, I can scaffold example features with `spec-kitty specify` and run an initial `spec-kitty orchestrate` in a disposable worktree. Stop me if you prefer to author the first feature text yourself.

## Recent mapping update & Local GUI test

- An EF Core migration `MapJavaModel` was created and applied locally to add legacy mapping fields (for example, `ProjectNo`) to support the Java → EF incremental port.

### Local GUI test (quick)

Start the frontend (from repo root):

```bash
cd src/DSC.WebClient
npm install    # first time only
npm run dev -- --host 0.0.0.0 --port 5173
```

Start the API (from repo root):

```bash
export ConnectionStrings__DefaultConnection="Server=127.0.0.1;Port=3306;Database=dsc_dev;User=dsc_local;Password=dsc_password;"
dotnet run --project src/DSC.Api --urls http://localhost:5005
```

Open the GUI at: http://localhost:5173/ (the API is available at http://localhost:5005/)

API update: The API now exposes legacy Java model fields via DTOs so the frontend can consume them (e.g. `ProjectDto.ProjectNo`, and legacy activity fields on `WorkItemDto`). See `src/DSC.Api/DTOs` and `src/DSC.Api/Controllers` for details.

- Swagger/OpenAPI: controller actions are now annotated with response types so `ProjectDto` and `WorkItemDto` response schemas appear in Swagger UI (see `src/DSC.Api/Controllers/ProjectsController.cs` and `ItemsController.cs`).

- Frontend: `src/DSC.WebClient/src/pages/Project.jsx` and `src/DSC.WebClient/src/pages/Activity.jsx` were updated to render the legacy `projectNo` and work-item legacy fields respectively.

