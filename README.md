# DSC-modernization

Spec-driven modernization of the DSC Java application to .NET 10, using a Spec-Kitty-driven workflow.

This repository contains the Spec artifacts, the .NET solution, and incremental work to port the original Java DSC application to .NET 10 (ASP.NET Core + EF Core).

Key points
- We use the Spec-Kitty toolkit (fork: https://github.com/Priivacy-ai/spec-kitty) to drive feature specification, implementation, and validation.
- Projects have been updated to target `.NET 10` and a local development environment using MariaDB is recommended.
- See `AI/nextSteps.md` for a concise guide on how to create features, run agent workflows, and build the Spec.

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
```

Notes
- Use MariaDB for local development (compatible with the `Pomelo.EntityFrameworkCore.MySql` provider referenced in the project). Do not commit secrets — use environment variables or a local `.env` excluded from source control.
- All AI-driven steps, logs, and commands are tracked under the `AI/` folder; review `AI/WORKLOG.md` and `AI/nextSteps.md` before running agent workflows.

If you'd like, I can scaffold example features with `spec-kitty specify` and run an initial `spec-kitty orchestrate` in a disposable worktree. Stop me if you prefer to author the first feature text yourself.
