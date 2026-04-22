/*
 * CLAUDE.md
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * June 2025
 *
 * AI-assisted: project-level Claude Code instructions created as part of
 * rl-agents-n-skills submodule migration; reviewed and directed by Ryan Loiselle.
 */

# CLAUDE.md — DSC Modernization

This file provides project-level instructions for Claude Code.
Base instructions (shared personas, skills, subagents) are in `.github/agents/CLAUDE.md`
via the rl-agents-n-skills plugin.

## Project purpose

`DSC-modernization` is a ground-up rewrite of the legacy Java *Daily Schedule Control*
time-tracking system, built as a modern full-stack BC Gov application:
- **API**: .NET 10 (ASP.NET Core), MariaDB (EF Core)
- **Frontend**: React/Vite with B.C. Government Design System
- **Deployment**: BC Gov Emerald OpenShift, ArgoCD GitOps, Artifactory image registry
- **CI/CD**: GitHub Actions (build-and-test, build-and-push, codeql, copilot-review)

The original Java implementation is preserved in the companion `DSC` repository.

## Architecture rules (project-specific)

- All API logic follows the service-layer pattern (`IWorkItemService`, etc.)
- Domain exceptions: `NotFoundException` (404), `ForbiddenException` (403),
  `BadRequestException` (400), `UnauthorizedException` (401)
- Global exception handler maps to RFC 7807 ProblemDetails
- `db.Database.Migrate()` on startup — never `EnsureCreated()`
- Frontend API calls go in `src/api/` service files; server state via TanStack Query v5 hooks
- `.gitmodules` tracks any spec submodules — do not remove

## Submodule: rl-agents-n-skills

Agents and skills live at `.github/agents/` which is a git submodule pointing to
`https://github.com/rloisell/rl-agents-n-skills`.

To update:
```bash
cd .github/agents && git pull origin main && cd ../..
git add .github/agents
git commit -m "chore: update rl-agents-n-skills submodule"
```

Do NOT edit files inside `.github/agents/` directly — make changes in the
`rl-agents-n-skills` repo instead.
