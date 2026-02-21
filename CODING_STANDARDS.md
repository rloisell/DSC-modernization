# Coding Standards & AI Collaboration Guardrails

**Author**: Ryan Loiselle — Developer / Architect  
**AI tool**: GitHub Copilot — AI pair programmer / code generation  
**Established**: February 2026 (DSC-modernization project)

This document defines the coding conventions, commenting style, and AI collaboration expectations
for all projects that start from this template. It serves as both a human reference and a prompt
you can paste into any AI tool to bootstrap consistent behaviour.

---

## 1. Roles & Attribution

### Human role — Ryan Loiselle
- Architect and decision-maker for all structural, security, and business-logic choices
- Directs the AI: sets objectives, validates output, accepts or rejects suggestions
- Reviews every AI-generated block before it is committed

### AI role — GitHub Copilot
- Pair programmer and code generator
- Accelerates boilerplate, LINQ patterns, DTO mappings, and scaffolding
- Does **not** make architectural decisions autonomously

### Attribution in code
Every source file must open with a header block identifying both contributors:

**C# / Java / C / C++:**
```
/*
 * FileName.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * <Month Year>
 *
 * AI-assisted: <brief description of what Copilot generated>;
 * reviewed and directed by Ryan Loiselle.
 */
```

**JavaScript / TypeScript / React (.jsx/.tsx):**
```javascript
/*
 * FileName.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * <Month Year>
 *
 * AI-assisted: <brief description of what Copilot generated>;
 * reviewed and directed by Ryan Loiselle.
 */
```

**Perl:**
```perl
#
# filename.pl
# Ryan Loiselle — Developer / Architect
# GitHub Copilot — AI pair programmer / code generation
# <Month Year>
#
# AI-assisted: <brief description of what Copilot generated>;
# reviewed and directed by Ryan Loiselle.
#
```

**Markdown / Documentation (.md):**

Place immediately below the `# Title` of the document:

```markdown
**Author**: Ryan Loiselle — Developer / Architect
**AI tool**: GitHub Copilot — AI pair programmer / code generation
**Updated**: <Month Year>
```

---

## 2. Comment Style

Comments should explain **purpose and intent**, not re-describe syntax.

### Section labels — ALL-CAPS banners

Use short ALL-CAPS labels to divide a file into logical sections:

```csharp
// ── QUERY ──────────────────────────────────────────────────────────────────

// ── MUTATIONS ──────────────────────────────────────────────────────────────

// ── HELPERS ────────────────────────────────────────────────────────────────
```

### Per-method purpose lines

Place a single `//` comment directly above each method explaining what it does,
what it returns, and any notable side effects or thrown exceptions:

```csharp
// returns all work items for a user, sorted newest first
public async Task<WorkItemDto[]> GetAllAsync(Guid? userId) { ... }

// throws ForbiddenException (403) if requester does not own the item and is not Admin/Manager
private async Task EnforceOwnershipAsync(WorkItem item, Guid? requesterId) { ... }

// returns true if the budget description contains "opex" or "expense" (case-insensitive)
private static bool IsExpenseBudget(string? description) { ... }
```

### End-of-block markers

Close every class and significant block with an end marker comment:

```csharp
} // end WorkItemService
} // end AuthService
```

```javascript
} // end ActivityPage
```

### Inline comments — use sparingly

Reserve inline `//` comments for non-obvious logic:

```csharp
// Resolve period to concrete date range
// Privileged users see all projects; regular users see only assignments
// DEBUGGING — remove before production
```

Do **not** comment self-evident code:
```csharp
// BAD: increments the counter
count++;

// GOOD — only if non-obvious:
// Offset by 1 because the sentinel head/tail nodes are not counted
count++;
```

---

## 3. File Organisation

### Root README.md
- Describes **what the product is**, not how it was built
- Sections: What is it, Features, Architecture (with diagram links), Getting Started, Documentation index
- Development session notes do **not** belong here — they go in `docs/development-history.md`

### docs/development-history.md
- Session-by-session record of what was built and why
- Links to `AI/WORKLOG.md` or equivalent for full detail

### docs/local-development/README.md
- Ports, services, credentials (dev only), LaunchAgent / Docker setup
- Known issues and workarounds

### docs/data-model/ *(when applicable)*
Present for projects that migrate or evolve an existing data schema.
- `README.md` — entity mapping table between old and new models, key structural differences, design rationale
- Reference the ERD diagram files in `diagrams/data-model/` rather than duplicating them here

### docs/deployment/
- `STANDARDS.md` — deployment checklist for BC Gov Emerald (GitOps pattern, Artifactory, Vault)
- `EmeraldDeploymentAnalysis.md` — canonical platform reference (ISB EA Option 2, Datree, CI/CD patterns)
- `DEPLOYMENT_ANALYSIS.md` (project-specific) — how the project aligns with platform requirements
- `DEPLOYMENT_NEXT_STEPS.md` (project-specific) — ordered list of remaining deployment actions

### AI/ directory (required)

Every project **must** contain an `AI/` directory at the repository root.
This directory is the auditable record of all AI-assisted work and must be
kept current throughout the project. It is committed alongside all other source.

| File | Purpose | Required |
|------|---------|----------|
| `WORKLOG.md` | Chronological, session-by-session narrative of every AI action, decision, and outcome — written in plain English | **Yes** |
| `CHANGES.csv` | Machine-readable per-file change log: `path,action,notes` one row per file touched by the AI | **Yes** |
| `COMMANDS.sh` | Commented record of every significant shell command the AI ran (scrubs, compiles, migrations, deployments) | **Yes** |
| `COMMIT_INFO.txt` | Commit metadata for major AI-driven operations: branch, hash, message, push outcome | **Yes** |
| `nextSteps.md` | Feature and task backlog with completion status | Recommended |
| `securityNextSteps.md` | Security hardening plan and outstanding findings | When applicable |

#### WORKLOG.md format

Each session appended as a dated section:

```markdown
## Session N — YYYY-MM-DD

**Objective**: <what was being worked on>

### Actions taken
- <AI action 1>
- <AI action 2>

### Files created or modified
- `path/to/file.ext` — <what changed and why>

### Commits
- `<hash>` — <message>

### Outcomes / Notes
- <anything notable: failures, deferrals, user decisions>
```

#### CHANGES.csv format

```
path,action,notes
src/mts/dsc/servlet/LoginServlet.java,modified,added file header and end marker
```

Valid actions: `added`, `modified`, `deleted`, `created`, `deployed`, `compiled`.

---

## 4. Architecture Conventions

### Service layer (C# / .NET projects)
- Controllers are **thin** — no business logic, no direct DbContext access
- Business logic lives in scoped service classes implementing interfaces:
  `IWorkItemService`, `IReportService`, `IProjectService`, `IAuthService`
- Domain exceptions (`NotFoundException`, `ForbiddenException`, `BadRequestException`,
  `UnauthorizedException`) are thrown from services and caught by a global exception handler
  that returns RFC 7807 `ProblemDetails` responses

### Frontend (React / Vite projects)
- API calls are centralised in `src/api/` service files — no `fetch`/`axios` calls in components
- Server state managed with TanStack Query v5 via hooks in `src/hooks/`
- Auth headers centralised in `src/api/AuthConfig.js` — one source of truth
- Design system: B.C. Government Design System (BC Sans, design tokens) for BC Gov projects

### Database
- EF Core with Pomelo MariaDB provider
- `db.Database.Migrate()` on startup — never `EnsureCreated()` in production code
- Legacy field mappings preserved during incremental migrations

---

## 5. AI Behaviour Guardrails

These are the instructions passed to GitHub Copilot via `.github/copilot-instructions.md`.
Keep this section in sync with that file.

### ALWAYS
- Add a file header with author, AI attribution, and date when creating a new file
- Add a single-line purpose comment above every method
- Place ALL-CAPS section labels (`// ── QUERY ──`, `// ── HELPERS ──`) between logical groups
- Add `} // end ClassName` at the close of every class
- Use the service-layer pattern — controllers delegate to services, services own logic
- Name bool-returning helpers with a verb: `IsExpenseBudget()`, `HasValue()`, `CanAccess()`
- Follow existing naming conventions in the file before introducing new ones
- **Update `AI/WORKLOG.md`** at the end of every session with a dated section covering all actions, files changed, and commits
- **Append to `AI/CHANGES.csv`** one row per file the AI creates, modifies, or deletes
- **Append to `AI/COMMANDS.sh`** every significant shell command run (compiles, migrations, deploys, git operations)
- **Update `AI/COMMIT_INFO.txt`** after any major commit or push with branch, hash, message, and outcome

### NEVER
- Add student IDs, course names, or academic metadata to file headers
- Make architectural decisions without direction from Ryan Loiselle
- Remove or rewrite existing comments unless specifically asked
- Add `// TODO`, `// FIXME`, or `// HACK` markers without explaining the reason
- Commit debug `console.log` or `Console.WriteLine` left from development
- Use `EnsureCreated()` in production startup code

### WHEN GENERATING NEW FILES
- Open with the standard header block (see Section 1)
- Match the indentation style of the surrounding codebase
- Prefer `var` inference for locals; use explicit types for public API signatures
- Prefer expression-body (`=>`) methods for single-line returns
- For C#: use primary constructors (`public MyClass(Dep dep) : ...`) where applicable

### FOR AI-GENERATED SECTIONS
- Mark complex generated blocks with a brief note: `// AI-assisted: <what was generated>`
- If a section was generated and then significantly modified by a human, remove the AI note

---

## 6. Git Conventions

### Commit message format
```
<type>: <short imperative description>

- bullet detail line 1
- bullet detail line 2
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Branch strategy
- `main` — always deployable
- Feature branches: `feat/<short-description>`
- Bug fix branches: `fix/<short-description>`

### What not to commit
- Build output (`bin/`, `obj/`, `dist/`, `node_modules/`)
- Local secrets (`appsettings.Development.json` with real credentials)
- Vite build artifacts (`src/*/dist/`)

---

## 7. Diagrams

All architecture and flow diagrams are maintained in the following formats:

| Format | Use |
|--------|-----|
| Mermaid (inline `.md`) | Quick in-repo diagrams rendered natively by GitHub; stored in `docs/diagrams/` |
| Draw.io (`.drawio`) | Primary editable source for complex diagrams, exported to SVG |
| PlantUML (`.puml`) | Text-based UML alternative, exported to PNG |

**Export conventions:**
- Draw.io → SVG: `draw.io --export --format svg --embed-diagram --border 10`
- PlantUML → PNG: `plantuml -o ../png *.puml`
- SVG files use white background (`background="#ffffff"`) and strokeWidth=2 on edges

**Required diagram set (full UML suite + data model):**

Every project must produce the complete set below before a feature is considered
production-ready. Diagrams marked _scales with features_ should have one instance
per major use case or lifecycle, not one globally.

| # | Diagram | UML Type | Perspective | Requirement |
|---|---------|----------|-------------|-------------|
| 1 | System architecture | Component | Structural | Required |
| 2 | Domain class model | Class | Structural | Required |
| 3 | Package / module organisation | Package | Structural | Required |
| 4 | Use case overview | Use Case | Behavioural | Required |
| 5 | Key sequence flows | Sequence | Behavioural | One per major user-facing feature |
| 6 | Key workflows | Activity | Behavioural | One per complex multi-step workflow |
| 7 | Entity lifecycle | State | Behavioural | For entities with non-trivial state transitions |
| 8 | Entity-Relationship Diagram (ERD) | ERD | Data | Required |
| 9 | Physical schema | Schema | Data | Required |
| 10 | Deployment topology | Deployment | Infrastructure | Required |

All diagrams live in `docs/diagrams/README.md` (Mermaid) or `diagrams/` (Draw.io/PlantUML).
Each diagram file should carry the attribution header from Section 1.

---

## 8. Security Defaults

- Auth headers: `X-User-Id` (user) and `X-Admin-Token` (admin) for dev; OIDC/Keycloak for production
- Rate limiting on all admin endpoints: 60 req/min per IP (fixed window)
- Health checks: `/api/health` (basic) and `/api/health/details` (DB probe)
- Passwords: ASP.NET Core `PasswordHasher` — never plain text or home-grown hashing
- CORS: named policies — wildcard `DevCors` for local; explicit origin list `ProdCors` for production
- `AI/securityNextSteps.md` documents the full hardening roadmap for every project

---

## 9. Deployment Standards (BC Gov Emerald OpenShift)

All projects targeting the **BC Gov Private Cloud PaaS** follow the two-repo GitOps pattern
described below. This pattern is mandated on the Emerald tier because the cluster API is
SPANBC-internal only — GitHub Actions runners on the public internet cannot push to the cluster.

### 9.1 Two-Repo Pattern

| Repo | Contains | Who modifies it |
|---|---|---|
| **App repo** (e.g., `dsc-modernization`) | Source code, Containerfiles, build workflow | Developers |
| **GitOps repo** (e.g., `dsc-gitops`) | Helm charts, ArgoCD Application CRDs, per-env values | CI (image tags) + Developers (everything else) |

ArgoCD runs **inside** the cluster and watches the GitOps repo (pull model). It renders
Helm templates and applies them to the target namespace automatically.

### 9.2 Namespace Structure

BC Gov Platform Registry provisions four namespaces per application:

| Namespace | Purpose |
|---|---|
| `<license>-tools` | Build pipelines, Tekton, image building |
| `<license>-dev` | Development environment |
| `<license>-test` | Test / QA environment |
| `<license>-prod` | Production environment |

The license plate (e.g., `be808f`) is assigned at registration time via the
[Platform Product Registry](https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/).

### 9.3 Image Registry — Artifactory

All images must be pushed to and pulled from **BC Gov Artifactory**
(`artifacts.developer.gov.bc.ca`). On Emerald, pods can only reach the public internet
through a proxy — Docker Hub and GHCR are not reliably reachable at runtime.

Artifactory image path convention:
```
artifacts.developer.gov.bc.ca/<project>/<image-name>:<git-sha>
```

GitHub secrets needed in the app repo:
- `ARTIFACTORY_USERNAME`
- `ARTIFACTORY_PASSWORD`

### 9.4 Containerfile Conventions

| Rule | Detail |
|---|---|
| Port | Always `8080` — never 80, 443, 5000, or 5005 inside containers |
| .NET base images | `mcr.microsoft.com/dotnet/sdk:10.0` (build) → `aspnet:10.0` (runtime) |
| Frontend base images | `node:22-alpine` (build) → `nginx:alpine` (runtime) |
| Non-root user | Create `appuser`/`appgroup`; end with `USER appuser` |
| Drop capabilities | `cap_drop: [ALL]`; `security_opt: [no-new-privileges:true]` |
| Health checks | `HEALTHCHECK` targeting `/health` (API) or `/` (frontend) |
| Read-only OS | `read_only: true` in compose; mount `/tmp` as `tmpfs` |

`ASPNETCORE_URLS` must be set to `http://+:8080` in all .NET runtime containers.

### 9.5 Frontend — Runtime Configuration

Vite bakes environment variables at **build time**. The API URL cannot be injected
at container startup without rebuilding. The standard pattern:

1. Nginx serves a `/config.json` file containing runtime values:
   ```json
   { "apiUrl": "https://<app>-api-<license>-dev.apps.emerald.devops.gov.bc.ca" }
   ```
2. The React app fetches `/config.json` on startup and stores in `window.__env__`
3. A single image ships for all environments — the config file differs per namespace
4. The config file is generated from a Helm `ConfigMap` using env-specific values

### 9.6 Secrets Management — Vault

Secrets live in **HashiCorp Vault** — never in the GitOps repo.

Pattern:
- Vault paths: `secret/<license>/<env>/<key>` (e.g., `secret/be808f/dev/db-password`)
- Helm chart includes a `Secret` manifest as a **shape template only** — values are empty
- At deploy time, Vault Agent Injector or External Secrets Operator populates the secret
- GitHub Actions can read Vault for build-time secrets using the Vault GitHub Action

Common secrets per project:
- Database user + password
- `ConnectionStrings__DefaultConnection`
- Admin/API tokens
- OIDC client credentials (if Keycloak integrated)

### 9.7 Helm Chart Structure (GitOps repo)

```
gitops-repo/
├── charts/
│   └── <app>/
│       ├── Chart.yaml
│       ├── values.yaml             # defaults
│       └── templates/
│           ├── _helpers.tpl
│           ├── deployment.yaml     # one per component (api, frontend, db)
│           ├── service.yaml
│           ├── route.yaml          # OpenShift Route with TLS edge termination
│           ├── configmap.yaml      # includes frontend /config.json
│           ├── secret.yaml         # shape only — Vault populates values
│           ├── networkpolicies.yaml
│           ├── hpa.yaml
│           └── serviceaccount.yaml
├── deploy/
│   ├── dev_values.yaml
│   ├── test_values.yaml
│   └── prod_values.yaml
└── applications/
    └── argocd/
        ├── app-dev.yaml
        ├── app-test.yaml
        └── app-prod.yaml
```

### 9.8 Required Pod Labels (Emerald)

All pods on Emerald must carry data classification labels:

```yaml
podLabels:
  DataClass: "Medium"           # or High / Critical — confirm with InfoSec

route:
  annotations:
    aviinfrasetting.ako.vmware.com/name: "dataclass-medium"
```

### 9.9 Network Policies (required)

Emerald enforces default-deny. Every inter-pod connection must be explicitly allowed:

| Connection | Policy |
|---|---|
| OpenShift Router → Frontend | Allow ingress from `network.openshift.io/policy-group: ingress` |
| OpenShift Router → API | Allow ingress from router namespace |
| Frontend → API | Allow from frontend pod selector |
| API → Database | Allow from API pod selector on port 3306/5432 |
| All → DNS | Allow egress UDP/53 to DNS pods |
| API → external (Vault, etc.) | Allow egress TCP/443 |

### 9.10 ArgoCD Application CRD

Each environment has its own `Application` CRD registered with ArgoCD:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: <app>-dev
spec:
  destination:
    namespace: <license>-dev
    server: https://kubernetes.default.svc
  source:
    repoURL: git@github.com:<org>/<app>-gitops.git
    targetRevision: develop
    path: charts/<app>
    helm:
      valueFiles:
        - $values/deploy/dev_values.yaml
  project: <license>
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 9.11 Platform Provisioning Checklist

These steps require human action via BC Gov processes — they cannot be automated:

- [ ] Register application in [Platform Product Registry](https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/) → get license plate
- [ ] Request Artifactory project + Docker repository
- [ ] Set up Artifactory service account; add credentials as GitHub Secrets
- [ ] Onboard team to Vault; create secret paths for all environments
- [ ] Enable ArgoCD for the project (self-serve or Platform request)
- [ ] Register team members in OpenShift project (edit/admin roles)
- [ ] Confirm `DataClass` classification with Information Security
- [ ] Create GitOps repo; grant ArgoCD SSH deploy key read access
- [ ] Register ArgoCD Application CRDs (apply `applications/argocd/*.yaml`)

### 9.12 Reference Repos

| Repo | What it demonstrates |
|---|---|
| [`bcgov-c/jag-network-tools`](https://github.com/bcgov-c/jag-network-tools) | .NET 10 + React/Vite app repo with Containerfiles and OpenShift manifests |
| [`bcgov-c/tenant-gitops-be808f`](https://github.com/bcgov-c/tenant-gitops-be808f) | GitOps repo with Helm charts, ArgoCD CRDs, and per-env values (Emerald) |
| [`bcgov-c/JAG-JAM-CORNET`](https://github.com/bcgov-c/JAG-JAM-CORNET) | Peer ISB project — Trivy scans + build-and-test.yml pattern |
| [`bcgov-c/JAG-LEA`](https://github.com/bcgov-c/JAG-LEA) | Peer ISB project — CI/CD pipeline reference |
| [`bcgov/security-pipeline-templates`](https://github.com/bcgov/security-pipeline-templates) | BC Gov GitHub Actions and Tekton pipeline templates |

### 9.13 AI Code Review

GitHub Copilot Code Review is enabled on this project. It auto-reviews every non-draft PR using the workflow at `.github/workflows/copilot-review.yml`.

**What it flags:** Code correctness, potential bugs, security anti-patterns, naming inconsistency, and dead code. Inline suggestions appear on the PR diff and can be applied directly.

**Setup requirements:**
- GitHub Copilot for Business or Enterprise enabled on the organization
- `copilot-review.yml` workflow committed to the app repo (see `EmeraldDeploymentAnalysis.md` §8.3 for the full template)
- Optionally enable the auto-reviewer toggle: Settings → Code review → GitHub Copilot

---

### 9.14 Source File Commentary Standard

Every source file in the project must carry an **attribution header block** at the very top of the file (before any imports or namespace declarations). In addition, files containing non-trivial application logic must include **inline method or section comments**.

#### Header Block (required on every source file)

C# format:
```csharp
/*
 * FileName.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * [One sentence describing the file's purpose.]
 * [Optional second sentence: delegation pattern, key design decision, etc.]
 * AI-assisted: [specifically what Copilot generated]; reviewed and directed by Ryan Loiselle.
 */
```

JavaScript / JSX format:
```javascript
/*
 * FileName.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * [One sentence describing the component or module's purpose.]
 * AI-assisted: [specifically what Copilot generated]; reviewed and directed by Ryan Loiselle.
 */
```

#### Inline Method / Section Comments (conditional)

Add method-level or section-level comments **only when the file contains application-specific logic or complexity**. Generic boilerplate does not need this level of detail.

**Add method/section comments when the file:**
- Is longer than ~80 lines **and** contains branching logic, business rules, or non-obvious data transformations
- Contains LINQ / SQL queries with joins, grouping, or filtering
- Has security-relevant logic (auth, hashing, token validation)
- Is a composition root (`Program.cs`), a complex seeder, or a Swagger filter
- Is a React page/hook with multi-step form state, cache invalidation, or derived state (`useMemo`)

**Header only (no method comments) when the file is:**
- A DTO, interface, or exception type
- A simple pass-through CRUD controller (< ~80 lines, single entity, no branching)
- A thin API service wrapper (repetitive GET/POST/PUT/DELETE with no transformation)
- A presentational component with no business logic

#### Rationale

Attribution headers ensure that AI-assisted contributions are visible in code review, audits, and onboarding. Method-level comments are reserved for files where the logic is genuinely non-obvious — adding them to generic CRUD code adds noise without value.
