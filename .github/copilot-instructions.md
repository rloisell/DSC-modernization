# GitHub Copilot Instructions

These instructions are automatically read by GitHub Copilot in this repository.
They define coding style, comment conventions, and collaboration guardrails established
by Ryan Loiselle across his development projects.

For the full human-readable version of these standards, see `CODING_STANDARDS.md`.

---

## Identity & Attribution

- **Developer / Architect**: Ryan Loiselle — makes all structural and business-logic decisions
- **AI role**: GitHub Copilot — pair programmer and code generator; does not make
  architectural decisions autonomously

When creating a **new file**, always open with this header block:

```
/*
 * FileName.ext
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * <Month Year>
 *
 * AI-assisted: <one sentence describing what Copilot contributed>;
 * reviewed and directed by Ryan Loiselle.
 */
```

Use `#` block comments for Perl; `//` block or `/* */` for C-family languages.
Omit student IDs, course names, and academic metadata — this is professional work.

---

## Comment Conventions

### Section labels
Divide classes into logical sections with ALL-CAPS banners:
```
// ── QUERY ──────────────────────────────────────────────────────────────────
// ── MUTATIONS ──────────────────────────────────────────────────────────────
// ── HELPERS ────────────────────────────────────────────────────────────────
```

### Per-method purpose comments
Place a single `//` line above every method. Describe what it does, what it returns,
and any exceptions thrown. Keep it to one line:
```csharp
// returns all work items for a user, sorted newest first
public async Task<WorkItemDto[]> GetAllAsync(Guid? userId) { ... }

// throws ForbiddenException (403) if requester does not own the item and is not Admin/Manager
private async Task EnforceOwnershipAsync(WorkItem item, Guid? requesterId) { ... }
```

### End-of-class markers
```csharp
} // end WorkItemService
} // end AuthController
```

### Inline comments
Only on non-obvious logic. Never on self-evident code.
Mark any large AI-generated block: `// AI-assisted: <what was generated>`

---

## Architecture Rules (C# / .NET projects)

- Controllers are **thin** — HTTP wiring only, no business logic, no direct DbContext
- All logic in scoped service classes implementing interfaces (`IWorkItemService`, etc.)
- Domain exceptions: `NotFoundException` (404), `ForbiddenException` (403),
  `BadRequestException` (400), `UnauthorizedException` (401)
- Global exception handler maps all domain exceptions to RFC 7807 ProblemDetails
- `db.Database.Migrate()` on startup — never `EnsureCreated()`
- EF Core with primary constructors: `public MyService(ApplicationDbContext db) { ... }`

## Architecture Rules (React / Vite frontend)

- All API calls in `src/api/` service files — never inline fetch/axios in components
- Server state via TanStack Query v5 hooks in `src/hooks/`
- Auth headers via a single `src/api/AuthConfig.js` — one source of truth
- B.C. Government Design System components for BC Gov projects

---

## Code Style

- C#: prefer expression-body (`=>`) for single-return members
- C#: use primary constructors where applicable
- C#: `var` for locals; explicit types for public signatures
- JS/JSX: `const`/arrow functions; named exports
- Match indentation and naming conventions already present in the file

---

## ALWAYS
- Add file header when creating a new file
- Add per-method purpose comment above every method
- Add ALL-CAPS section labels between logical groups
- Add `} // end ClassName` at end of every class
- Follow the service-layer pattern
- **Update `AI/WORKLOG.md`** at the end of every session with a dated section summarising all actions taken, files changed, and commits made
- **Append to `AI/CHANGES.csv`** for every file the AI creates, modifies, or deletes
- **Append to `AI/COMMANDS.sh`** for every significant shell command run (compiles, migrations, deploys, git operations)
- **Update `AI/COMMIT_INFO.txt`** after any major commit or push with hash, branch, and outcome

## NEVER
- Add academic metadata (student IDs, course names)
- Make architectural decisions without direction
- Remove or rewrite existing comments unless asked
- Leave debug `console.log` / `Console.WriteLine` in committed code
- Use `EnsureCreated()` in startup
- Commit secrets or build output

---

## Deployment & Containerization (BC Gov Emerald OpenShift)

When generating Containerfiles, Helm charts, GitHub Actions workflows, or OpenShift
manifests for BC Gov projects, apply these standards:

### Containerfiles (app)
- Base images: `mcr.microsoft.com/dotnet/sdk:10.0` (build) → `aspnet:10.0` (runtime) for .NET API
- Base images: `node:22-alpine` (build) → `nginx:alpine` (runtime) for React/Vite frontend
- Expose **port 8080** — never 80, 443, or 5000/5005 in containers
- Set `ENV ASPNETCORE_URLS=http://+:8080` on .NET containers
- Always install curl (API) / wget (frontend) for health checks
- Create a non-root user (`appuser`/`appgroup`); end with `USER appuser`
- Drop all capabilities: `cap_drop: [ALL]`; add `security_opt: [no-new-privileges:true]`
- Include `HEALTHCHECK` instructions pointing at `/health`

### Frontend — VITE_API_URL
- **Never** bake `VITE_API_URL` at build time from an environment variable
- Serve a `/config.json` from Nginx that the app fetches on startup (`window.__env__`)
- This allows one image to run in dev, test, and prod with different API URLs

### Image registry
- Push images to Artifactory: `artifacts.developer.gov.bc.ca/<project>/<image>:<git-sha>`
- Never reference Docker Hub or GHCR for images that will run on Emerald

### Helm charts (GitOps repo)
- Always include `podLabels.DataClass: "Medium"` (or higher) for Emerald pods
- Always include `route.annotations.aviinfrasetting.ako.vmware.com/name: "dataclass-medium"`
- Use `storageClassName: netapp-file-standard` for PersistentVolumeClaims
- Include `NetworkPolicy` objects — default-deny; explicitly allow ingress/egress per pod
- Use `ClusterIP` services; expose via OpenShift `Route` with TLS edge termination
- Resource requests and limits are required on every container

### Secrets
- Secrets are never committed — Helm templates provide the Secret object shape only
- Real values live in Vault (`secret/<license>/<env>/<key>`)
- Reference via `secretKeyRef` in pod env or Vault Agent sidecar injection

### ArgoCD (deployment)
- One ArgoCD `Application` CRD per environment (dev, test, prod)
- `syncPolicy.automated.selfHeal: true` and `prune: true` on all environments
- `targetRevision` maps to the env branch or tag (`develop`, `test`, `main`)

---

## Git Commit Format
```
<type>: <short imperative description>

- detail line 1
- detail line 2
```
Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
