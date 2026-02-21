# DSC Modernization — Deployment Analysis
<!-- Author: Ryan Loiselle, Developer/Architect | GitHub Copilot | 2026 -->

## Purpose

This document captures the pre-deployment analysis for deploying the DSC Modernization
application to the **BC Gov Private Cloud PaaS — Emerald Hosting Tier**. The goal is
to understand what is needed before writing any pipeline code.

**Reference repositories studied:**

- `bcgov-c/jag-network-tools` — app repo pattern (similar .NET + React/Vite stack)
- `bcgov-c/tenant-gitops-be808f` — GitOps pattern for Emerald (ArgoCD + Helm)

---

## 1. Target Platform — Emerald Tier

**Cluster:** `console.apps.emerald.devops.gov.bc.ca`  
**Route URL pattern:** `<app>-<namespace>.apps.emerald.devops.gov.bc.ca`

| Attribute                   | Emerald Value                                              |
|-----------------------------|-------------------------------------------------------------|
| Maximum data sensitivity    | **Protected C** — storage and/or processing                |
| Availability (single-node)  | 90% (30-day rolling)                                        |
| Availability (multi-node)   | 99.5% (30-day rolling, max 4h outage per 30 days)           |
| DR / HA options             | **None** (no cross-cluster DR unlike Gold)                  |
| OpenShift upgrade model     | EUS — extended update support, even-numbered releases only  |
| Supported operators         | Tekton, ArgoCD, CrunchyDB, Kyverno, HPA/VPA, IBM MQ        |
| Scalability limit           | 175 CPU cores, 16 TB storage, 10G networking               |
| Internet egress             | Restricted — **proxy only** for public internet access      |
| API endpoint                | **SPANBC internal only** (not publicly reachable)           |
| App routing                 | Public internet access **may** be granted per-application   |
| Firewall interop            | Per-namespace egress subnet (usable in STMS-Classic rules)  |
| VM-SDN access               | Available                                                   |

### Key Emerald Differences vs Silver/Gold

1. **No public API access** — the cluster API is only reachable inside SPANBC. This
   means GitHub Actions runners cannot `oc login` or `kubectl apply` directly. The
   deployment mechanism **must be ArgoCD** (GitOps pull model), not a push-based
   pipeline.
2. **Proxy-only internet** — pods can reach the internet only via an HTTP proxy.
   This affects image pulls from public registries (Docker Hub, ghcr.io) at runtime.
   All images must be mirrored to **Artifactory** first.
3. **Protected C sensitivity** — stronger network policy requirements and mandatory
   data classification labels on pods (`DataClass: "Medium"` or higher).
4. **EUS upgrade cadence** — platform stays on stable even-point releases longer,
   reducing forced upgrades but meaning you must target a supported OCP release.

---

## 2. Namespace Structure

When a project is provisioned via the BC Gov Platform Product Registry, four namespaces
are created automatically:

| Namespace           | Purpose                                                   |
|---------------------|-----------------------------------------------------------|
| `<license>-tools`   | Build pipelines, image building/pushing, Artifactory auth |
| `<license>-dev`     | Development environment                                   |
| `<license>-test`    | Test / QA environment                                     |
| `<license>-prod`    | Production environment                                    |

The license plate is assigned by the Platform Registry (e.g., `be808f`).

**DSC license plate is not yet assigned** — provisioning step must happen first.

---

## 3. CI/CD Architecture — The GitOps Pattern

Based on `tenant-gitops-be808f`, the pattern for Emerald is:

```
┌─────────────────────────────────────────────────────────┐
│  App Repo (DSC-modernization)                           │
│                                                         │
│  .github/workflows/                                     │
│    build-and-push.yml  ──► Build images on push/tag     │
│                             Push to Artifactory         │
│                             Update image tag in GitOps  │
│                                                         │
│  containerization/                                      │
│    Containerfile.api                                    │
│    Containerfile.frontend                               │
│    nginx.conf                                           │
└───────────────────────────────┬─────────────────────────┘
                                │ triggers update or PR
                                ▼
┌─────────────────────────────────────────────────────────┐
│  GitOps Repo (dsc-gitops — new repo to create)          │
│                                                         │
│  charts/                                                │
│    dsc/  (Helm chart: API + frontend + MariaDB)         │
│      Chart.yaml                                         │
│      templates/                                         │
│        api-deployment.yaml                              │
│        frontend-deployment.yaml                         │
│        mariadb-statefulset.yaml  (or sub-chart)         │
│        services.yaml                                    │
│        routes.yaml                                      │
│        networkpolicies.yaml                             │
│        configmap.yaml                                   │
│        secret.yaml  (template only — real values: Vault)│
│      values.yaml  (defaults)                            │
│                                                         │
│  deploy/                                                │
│    dev_values.yaml                                      │
│    test_values.yaml                                     │
│    prod_values.yaml                                     │
│                                                         │
│  applications/argocd/                                   │
│    dsc-dev.yaml                                         │
│    dsc-test.yaml                                        │
│    dsc-prod.yaml                                        │
│                                                         │
│  .github/workflows/                                     │
│    ci.yml  (helm lint + helm template all envs)         │
└───────────────────────────────┬─────────────────────────┘
                                │ ArgoCD watches (SSH/token)
                                ▼
┌─────────────────────────────────────────────────────────┐
│  ArgoCD (running on Emerald cluster)                    │
│                                                         │
│  Watches gitops repo, auto-syncs to matching namespace  │
│  selfHeal: true, prune: true                            │
└─────────────────────────────────────────────────────────┘
```

### Why ArgoCD (not GitHub Actions direct push)

Because the Emerald cluster API is **SPANBC-internal only**, GitHub Actions runners
(which run on the public internet) cannot reach the API to run `oc apply` or
`kubectl rollout`. Pull-based GitOps (ArgoCD) is the correct pattern:

- ArgoCD runs **inside** the cluster
- It watches the GitOps repo (SSH accessible from inside SPANBC)
- On change, it applies the rendered Helm templates itself

---

## 4. Image Registry — Artifactory

BC Gov provides **Artifactory** (`artifacts.developer.gov.bc.ca`) as the approved
image registry. This replaces Docker Hub / GHCR for production images pulled by
OpenShift.

**Why this matters for Emerald:**
- Pods on Emerald cannot pull from Docker Hub or GHCR directly (proxy restriction)
- Artifactory is inside the network boundary
- Artifactory has an Xray scan integration (security scanning of images)

**Workflow:**
1. GitHub Actions builds the image in the `tools` namespace context (or on public
   runner using Artifactory credentials stored as GitHub Secrets)
2. Image is pushed to Artifactory: `artifacts.developer.gov.bc.ca/<project>/<image>:<tag>`
3. Helm values reference the Artifactory image URL
4. ArgoCD deploys the pod, which pulls from Artifactory (internal, no proxy needed)

**Required setup:**
- Artifactory service account (`artifacts.developer.gov.bc.ca`)
- GitHub Secret: `ARTIFACTORY_USERNAME` + `ARTIFACTORY_PASSWORD`
- Artifactory project + repository provisioned via Product Registry

---

## 5. Secrets Management — Vault

BC Gov provides **HashiCorp Vault** for secret management. For Emerald (Protected C),
using Vault is the recommended (arguably required) approach.

**Pattern:**
- Secrets stored in Vault paths (e.g., `secret/<license>/dev/mariadb-password`)
- Vault Agent Injector or External Secrets Operator fetches secrets at pod startup
- Secrets are injected as files or env vars — never committed to GitOps repo
- Helm chart contains only a template `Secret` object pointing to Vault path

**DSC secrets that will need Vault entries:**
- `MariaDB` root password + app user password
- `ConnectionStrings__DefaultConnection` for the API
- Admin token for `X-Admin-Token` header auth
- Any future Keycloak / IDIR client credentials

---

## 6. DSC Stack Analysis for Containerization

### 6.1 — API (`src/DSC.Api/`)

| Factor                     | Current State                        | Container Needs                   |
|----------------------------|--------------------------------------|-----------------------------------|
| Framework                  | .NET 10                              | Base: `mcr.microsoft.com/dotnet/sdk:10.0` (build), `aspnet:10.0` (runtime) |
| Port                       | `5005` (dev)                         | Must be `8080` in container (standard OpenShift convention) |
| Database                   | MariaDB (localhost:3306)             | `ConnectionStrings__DefaultConnection` from Secret |
| Auth                       | `X-User-Id` header / `X-Admin-Token` | Admin token from Secret; user ID passed from Keycloak-aware proxy or caller |
| `ASPNETCORE_URLS`          | Not set (dev uses launchSettings)    | Set to `http://+:8080` in container |
| Health check               | `GET /health` exists                 | Use as liveness/readiness probe   |
| Non-root user              | Not configured                       | Must add `appuser` (OpenShift runs as random UID — use numeric UID or `nobody`) |
| `appsettings.json`         | Has `localhost` MariaDB reference    | All connection strings → env vars from Secrets/ConfigMaps |

**OpenShift non-root note:** OpenShift assigns a random UID from the namespace's SCC.
The container user does not need to match exactly — but the **file system permissions**
must allow that random UID to read the app. Setting `USER` is optional; the directory
ownership should be set to group `0` (root group) with group-writable permissions, which
is the standard OpenShift pattern.

### 6.2 — Frontend (`src/DSC.WebClient/`)

| Factor              | Current State               | Container Needs                                     |
|---------------------|-----------------------------|-----------------------------------------------------|
| Framework           | React + Vite                | Node build stage (`node:22-alpine`), then Nginx runtime |
| `VITE_API_URL`      | `localhost:5005` hardcoded  | **Problem:** Vite bakes env vars at BUILD time       |
| Output port         | Vite dev server 5173        | Nginx serving dist on port 8080                    |
| SPA routing         | Vite handles in dev         | Nginx needs `try_files $uri /index.html`           |
| Non-root            | Not configured              | Nginx config must not bind to port 80 or 443       |
| Security headers    | None (dev only)             | Add in nginx.conf (see reference nginx.conf)       |

**The VITE_API_URL build-time problem:** Because Vite embeds the API URL at build time,
the same frontend container cannot be reused across dev/test/prod with different API URLs
without one of these solutions:

- **Option A (recommended):** Use a runtime config file served as `/config.json` from
  Nginx, fetched by the app on startup. The API URL comes from `window.__env__` or a
  config fetch — not from `import.meta.env`. This allows a single built image.
- **Option B (simpler, less ideal):** Build a separate image per environment. Works but
  wastes build time and storage.

### 6.3 — Database (MariaDB)

| Factor                | Current State                   | OpenShift Options                              |
|-----------------------|---------------------------------|------------------------------------------------|
| Engine                | MariaDB 10.x                    | Use Bitnami MariaDB Helm chart as sub-chart, or StatefulSet with PVC |
| Storage               | Local dev file                  | PVC — `storageClassName: netapp-file-standard` |
| Backup                | Not configured                  | `netapp-volume-backup` storage class or `backup-container` sidecar |
| Connection            | `localhost:3306` (dev)          | In-cluster: `dsc-mariadb.{namespace}.svc.cluster.local:3306` |
| Credentials           | appsettings.Development.json    | Vault → OpenShift Secret → injected as env vars|

**Platform note:** BC Gov platform team guidelines push toward **PostgreSQL with CrunchyDB**
as the preferred database operator (built-in HA, backup). Migrating from MariaDB to
PostgreSQL would unlock CrunchyDB support and potentially simplify operations. This is a
significant effort but worth flagging as a medium-term consideration.

For the initial deployment, MariaDB in a StatefulSet is acceptable.

---

## 7. Required DataClass Labels

On Emerald (Protected C), pods must carry data classification labels. Based on
`dev_values.yaml` from the reference repo:

```yaml
podLabels:
  DataClass: "Low"
```

And route annotations:
```yaml
route:
  annotations:
    aviinfrasetting.ako.vmware.com/name: "dataclass-low"
```

**DSC data classification is confirmed as `Low`.** The application handles internal
staff time-entry records only — no sensitive personal information, no Protected B/C data.
All DSC Helm values files (`charts/dsc-app/values.yaml`, `deploy/dsc-dev_values.yaml`,
`deploy/dsc-test_values.yaml`, `deploy/dsc-prod_values.yaml`) use `DataClass: "Low"` and
the `dataclass-low` AVI infrasetting annotation.

---

## 8. Network Policy Requirements

Emerald enforces network policies by default — pods cannot communicate unless
explicitly allowed. The GitOps repo must include `NetworkPolicy` objects:

| Policy                        | Purpose                                          |
|-------------------------------|--------------------------------------------------|
| Frontend → API                | Allow port 8080 from frontend pods               |
| API → MariaDB                 | Allow port 3306 from API pods                    |
| OpenShift Router → Frontend   | Allow ingress from `ingress` namespace           |
| OpenShift Router → API        | Allow ingress for direct API routes              |
| API → Vault sidecar           | Allow Vault Agent Injector if used               |
| API → external (via proxy)    | Allow egress on 443 if API calls external services|
| Deny all else                 | Default deny — must be explicitly stated         |

---

## 9. What Needs to Be Built — Gap List

### In the DSC App Repo (this repo)

| Artifact                                        | Status   | Notes                                                  |
|-------------------------------------------------|----------|--------------------------------------------------------|
| `containerization/Containerfile.api`            | MISSING  | .NET 10 multistage build, port 8080, non-root          |
| `containerization/Containerfile.frontend`       | MISSING  | Node + Nginx, port 8080, non-root                      |
| `containerization/nginx.conf`                   | MISSING  | SPA routing + security headers                         |
| `containerization/podman-compose.yml`           | MISSING  | Local dev container runtime                            |
| `.github/workflows/build-and-push.yml`          | MISSING  | Build images, push to Artifactory on push/tag          |
| Runtime config injection for VITE_API_URL       | MISSING  | `/config.json` served from Nginx (Option A) or build per env |
| `GET /health` and `GET /health/ready` endpoints | Needs verification | Check if both exist in `src/DSC.Api/`         |

### New GitOps Repo (`dsc-gitops` — to be created)

| Artifact                                        | Notes                                                      |
|-------------------------------------------------|------------------------------------------------------------|
| `charts/dsc/` — Helm chart (API component)     | Deployment, Service, Route, ConfigMap, Secret template     |
| `charts/dsc/` — Helm chart (Frontend component)| Deployment, Service, Route                                 |
| `charts/dsc/` — Helm chart (MariaDB component) | StatefulSet or Bitnami sub-chart, PVC, Secret template     |
| `charts/dsc/templates/networkpolicies.yaml`     | All required pod-to-pod and ingress policies               |
| `deploy/dev_values.yaml`                        | Dev namespace values, Artifactory image tags, route hosts  |
| `deploy/test_values.yaml`                       | Test environment overrides                                 |
| `deploy/prod_values.yaml`                       | Production overrides (replica count, resource limits)      |
| `applications/argocd/dsc-dev.yaml`              | ArgoCD Application CRD pointing to dev namespace           |
| `applications/argocd/dsc-test.yaml`             | ArgoCD Application CRD for test                            |
| `applications/argocd/dsc-prod.yaml`             | ArgoCD Application CRD for prod                            |
| `.github/workflows/ci.yml`                      | `helm lint` all charts, `helm template` all envs           |

### Platform Provisioning (Human Steps — Outside Codebase)

| Step                                                    | Owner     |
|---------------------------------------------------------|-----------|
| Request namespace set via Platform Product Registry     | Product Owner / Admin |
| Set up Artifactory project + Docker repository          | Platform request form |
| Set up Artifactory service account                      | Platform request form |
| Enable ArgoCD for the project                           | Platform request — or self-serve |
| Onboard to Vault, create paths for DSC secrets          | Developer  |
| Create `NetworkAttachmentDefinition` if VM-SDN needed   | Platform team |
| Confirm `DataClass` with InfoSec                        | Product Owner |
| Add team members to OpenShift project                   | Product Owner |

---

## 10. Proposed Pipeline Stages

### Stage 1 — Build (GitHub Actions, runs on public runner)

```
1. Checkout code
2. Log in to Artifactory (ARTIFACTORY_USERNAME / ARTIFACTORY_PASSWORD secrets)
3. Build API image  →  artifacts.developer.gov.bc.ca/<project>/dsc-api:<git-sha>
4. Build Frontend image  →  artifacts.developer.gov.bc.ca/<project>/dsc-frontend:<git-sha>
5. Push both images to Artifactory
6. (Optional) Trigger Xray scan
7. On success: update image tags in GitOps repo (PR or direct commit to develop)
```

### Stage 2 — Deploy to Dev (ArgoCD, automatic)

```
1. ArgoCD detects change in gitops repo develop branch
2. Renders Helm chart with dev_values.yaml
3. Applies manifests to <license>-dev namespace
4. Waits for pod readiness
5. selfHeal: if pod drifts, ArgoCD corrects it
```

### Stage 3 — Promote to Test/Prod (Manual approval + GitOps PR)

```
1. Developer creates PR: update image tag in test_values.yaml or prod_values.yaml
2. PR review + approval
3. Merge → ArgoCD syncs test or prod namespace
```

---

## 11. Recommended Build Order

The recommended sequence for implementation (building nothing ahead of its dependencies):

1. **Containerfiles + nginx.conf** — get the app building and running in containers locally
2. **podman-compose.yml** — validate local multi-container setup (API + Frontend + MariaDB)
3. **Runtime config injection** — solve the VITE_API_URL problem before building pipeline
4. **Helm chart (GitOps repo)** — build the deployment manifests
5. **Artifactory setup** — provision repo + service account (parallel with Helm work)
6. **GitHub Actions build workflow** — wire up image build + push
7. **Platform provisioning** — namespace, ArgoCD, Vault (requires human steps)
8. **ArgoCD application CRDs** — register the app with ArgoCD
9. **First deployment to dev** — verify end-to-end
10. **Health checks + monitoring** — Sysdig onboarding, alert setup

---

## 12. Reference URLs

| Resource                                | URL                                                                                      |
|-----------------------------------------|------------------------------------------------------------------------------------------|
| BC Gov Platform Technical Docs          | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs               |
| Hosting Tiers Table                     | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/platform-architecture-reference/hosting-tiers-table/ |
| CI/CD Pipeline Templates                | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/cicd-pipeline-templates-for-private-cloud-teams/ |
| ArgoCD Usage Guide                      | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/argo-cd-usage/ |
| Platform Product Registry               | https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/              |
| Artifactory Setup                       | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/build-deploy-and-maintain-apps/setup-artifactory-service-account/ |
| Vault Getting Started                   | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/secrets-management/vault-getting-started-guide/ |
| Provision New OpenShift Project         | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/openshift-projects-and-access/provision-new-openshift-project/ |
| BC Gov Security Pipeline Templates     | https://github.com/bcgov/security-pipeline-templates                                     |
| Reference App Repo (network tools)      | https://github.com/bcgov-c/jag-network-tools                                             |
| Reference GitOps Repo                   | https://github.com/bcgov-c/tenant-gitops-be808f                                          |
| OpenShift Network Policies              | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/platform-architecture-reference/openshift-network-policies/ |
| Database Backup Best Practices          | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/database-and-api-management/database-backup-best-practices/ |

---

## 13. Implementation Summary — February 2026

This section records what was actually built as the first deployment preparation sprint.
The implementation decisions are documented here for traceability.

### 13.1 Decision — Standalone ArgoCD Application (Not Umbrella Sub-chart)

**Initial approach (superseded):** DSC was first integrated as a sub-chart dependency
inside the shared `charts/gitops/` umbrella chart in `tenant-gitops-be808f`. This was
reverted after identifying a critical collision risk: `be808f-app-prod` (the co-tenant's
production Application) watches the `main` branch of that repo. Any broken Helm
dependency would immediately break the co-tenant's live workloads (emerald-app + telnet).

**Confirmed architecture:** DSC is deployed via **three standalone ArgoCD Application
CRDs**, one per environment. Each Application:
- points directly at `charts/dsc-app/` (not at the shared umbrella)
- uses its own values file (`deploy/dsc-dev_values.yaml`, etc.)
- has an independent sync policy and lifecycle
- will not interfere with `be808f-app-dev/test/prod` in any way

```
tenant-gitops-be808f/
  charts/
    gitops/             ← shared umbrella (NOT touched — be808f-app-* owns this)
      Chart.yaml        ← emerald-app + telnet only
    emerald-app/        ← co-tenant service (untouched)
    dsc-app/            ← NEW: DSC API + Frontend + MariaDB (standalone chart)
  deploy/
    dev_values.yaml     ← emerald-app + telnet (untouched by DSC)
    dsc-dev_values.yaml ← NEW: DSC dev values (DataClass: "Low")
    dsc-test_values.yaml← NEW: DSC test values
    dsc-prod_values.yaml← NEW: DSC prod values
  applications/argocd/
    be808f-dsc-dev.yaml ← NEW: standalone ArgoCD Application CRD (auto-sync)
    be808f-dsc-test.yaml← NEW: standalone ArgoCD Application CRD (manual sync)
    be808f-dsc-prod.yaml← NEW: standalone ArgoCD Application CRD (manual sync)
```

The platform team must register each `be808f-dsc-*.yaml` Application CRD with ArgoCD
(or the files must be placed in the ArgoCD bootstrap path). This replaces the earlier
assumption that being a sub-chart of an already-watched umbrella was sufficient.

### 13.2 Decision — Nginx Proxy (No config.json Injection)

All API calls in `DSC.WebClient` use **relative paths** (`/api/items`, `/api/reports`,
etc.). Nginx is configured to proxy `/api/` requests to the `dsc-api` ClusterIP Service
within the same namespace. This eliminates the need for:

- `VITE_API_URL` environment variables baked at build time
- `/config.json` runtime injection
- A separate CORS configuration (requests appear same-origin to the browser)

The nginx configuration is rendered by Helm into a ConfigMap mounted at
`/etc/nginx/conf.d/default.conf` in the frontend pod. The API service hostname is
injected at deploy time via the `{{ include "dsc-app.apiServiceName" . }}` helper.

### 13.3 Files Created

**DSC-modernization repo:**

| File | Purpose |
|------|---------|
| `containerization/Containerfile.api` | .NET 10 multistage build — mirrors jag-network-tools pattern |
| `containerization/Containerfile.frontend` | Node build → Nginx runtime with envsubst config support |
| `containerization/nginx.conf` | SPA + `/api/` reverse proxy; envsubst template for local use |
| `containerization/podman-compose.yml` | Full local dev stack (API + Frontend + MariaDB) |
| `.github/workflows/build-and-push.yml` | Builds both images, pushes to Artifactory, updates gitops tags |

**tenant-gitops-be808f repo (additions only — existing services and umbrella chart untouched):**

| File | Purpose |
|------|---------|
| `charts/dsc-app/Chart.yaml` | Helm chart descriptor |
| `charts/dsc-app/values.yaml` | Default values (all envs) — `DataClass: "Low"` |
| `charts/dsc-app/templates/_helpers.tpl` | Named templates (fullname, labels, selectors) |
| `charts/dsc-app/templates/api-deployment.yaml` | DSC.Api Deployment |
| `charts/dsc-app/templates/api-service.yaml` | ClusterIP Service for API |
| `charts/dsc-app/templates/api-route.yaml` | OpenShift Route (TLS edge) |
| `charts/dsc-app/templates/frontend-configmap.yaml` | Helm-rendered nginx.conf with API proxy target |
| `charts/dsc-app/templates/frontend-deployment.yaml` | DSC.WebClient Deployment (ConfigMap-mounted nginx.conf) |
| `charts/dsc-app/templates/frontend-service.yaml` | ClusterIP Service for Frontend |
| `charts/dsc-app/templates/frontend-route.yaml` | OpenShift Route (TLS edge) |
| `charts/dsc-app/templates/db-statefulset.yaml` | MariaDB 10.11 StatefulSet with PVC |
| `charts/dsc-app/templates/db-service.yaml` | Headless Service for MariaDB |
| `charts/dsc-app/templates/secret.yaml` | Shape-only Secrets (values from Vault) |
| `charts/dsc-app/templates/networkpolicies.yaml` | Deny-all + 5 explicit allow rules |
| `charts/dsc-app/templates/serviceaccount.yaml` | ServiceAccount (automount: false) |
| `charts/dsc-app/templates/hpa.yaml` | HPA for API (enabled in prod only) |
| `deploy/dsc-dev_values.yaml` | DSC dev values — `DataClass: "Low"`, enabled routes, 1Gi DB |
| `deploy/dsc-test_values.yaml` | DSC test values — `DataClass: "Low"`, test routes |
| `deploy/dsc-prod_values.yaml` | DSC prod values — `DataClass: "Low"`, prod routes, HPA enabled |
| `applications/argocd/be808f-dsc-dev.yaml` | Standalone ArgoCD Application CRD (auto-sync to `be808f-dev`) |
| `applications/argocd/be808f-dsc-test.yaml` | Standalone ArgoCD Application CRD (manual sync to `be808f-test`) |
| `applications/argocd/be808f-dsc-prod.yaml` | Standalone ArgoCD Application CRD (manual sync to `be808f-prod`) |
| `.github/workflows/ci.yml` | Added dsc-app standalone lint + template steps |

### 13.4 Health Check Endpoints

`DSC.Api` already has the correct liveness/readiness endpoints (from `Program.cs`):

| Probe | Path | Notes |
|-------|------|-------|
| Liveness | `GET /health/live` | Returns 200 when process is alive |
| Readiness | `GET /health/ready` | Returns 200 when DB connection is healthy |

The Helm chart uses these paths for `livenessProbe` and `readinessProbe`.

### 13.5 Remaining Platform Provisioning Steps (Human Actions Required)

The following steps require a human operator and cannot be automated in this repo:

| Step | Action | Where |
|------|--------|--------|
| 1 | Register DSC in BC Gov Platform Product Registry | https://registry.developer.gov.bc.ca |
| 2 | Receive license plate (currently `be808f` shared namespace is used) | Platform Registry |
| 3 | Create Artifactory Docker repository (`be808f-docker-local`) | Artifactory console |
| 4 | Create Artifactory service account; create pull secret in namespace | CLI / Artifactory |
| 5 | Add `ARTIFACTORY_USERNAME` + `ARTIFACTORY_PASSWORD` as GitHub Secrets | GitHub repo settings |
| 6 | Add `GITOPS_TOKEN` (PAT with write to tenant-gitops-be808f) as GitHub Secret | GitHub repo settings |
| 7 | **Obtain `DATREE_TOKEN` from ISB; add as GitHub Secret in tenant-gitops-be808f** | ISB team + GitHub repo settings |
| 8 | Onboard to Vault; create secret paths `secret/be808f/dev/dsc-db` and `secret/be808f/dev/dsc-admin` | Vault console |
| 9 | Pre-create `dsc-db-secret` and `dsc-admin-secret` in `be808f-dev` namespace | `oc create secret` |
| 10 | Mirror MariaDB 10.11 image to Artifactory (`be808f-docker-local/mariadb:10.11`) | Artifactory |
| 11 | Submit one of the following to platform team to register DSC Application CRDs with ArgoCD: push `applications/argocd/be808f-dsc-dev.yaml` to the ArgoCD bootstrap path, or request platform team to `oc apply` the file | ArgoCD admin |
| 12 | Push to `develop` branch of DSC-modernization to trigger first image build; confirm images appear in Artifactory | GitHub Actions |

---

## 14. ISB EA Document Review — Gap Analysis

**Document reviewed:** *OPTION 2 – Using GitHub Actions + GitOps in Emerald (preferred)*  
**Source:** BC Gov Emerald Enterprise Architecture guidance (ISB)  
**Review date:** February 2026

This section documents the findings from comparing the DSC deployment implementation
against the ISB-preferred EA pattern for Emerald.

### 14.1 Conformant Items

The following aspects of the DSC implementation already align with the EA pattern:

| EA Requirement | DSC Implementation | Status |
|---|---|---|
| Standalone ArgoCD Applications per environment | `applications/argocd/be808f-dsc-{dev,test,prod}.yaml` — three separate CRDs | ✅ Conforms |
| GitOps folder structure | `charts/`, `deploy/`, `applications/argocd/` in tenant-gitops-be808f | ✅ Conforms |
| Artifactory image registry | `artifacts.developer.gov.bc.ca/be808f-docker-local/<image>:<tag>` | ✅ Conforms |
| Artifactory pull secret in namespace | `imagePullSecrets: [name: artifactory-pull-secret]` in Helm chart | ✅ Conforms |
| Vault for secret injection | `secret.yaml` shape-only; real values from Vault at runtime | ✅ Conforms |
| NetworkPolicies | deny-all + 5 explicit allow rules in `networkpolicies.yaml` | ✅ Conforms |
| DataClass label | `DataClass: "Low"` on all workloads across all environments | ✅ Conforms |
| Manual sync for test/prod ArgoCD Applications | `automated: {}` omitted in test + prod Application CRDs | ✅ Conforms |
| GitHub Actions CI/CD pipeline | `build-and-push.yml` builds, pushes images, updates gitops | ✅ Conforms |

### 14.2 Gaps Identified and Remediated

Three gaps were identified between the DSC implementation and the ISB EA Option 2 pattern.
All three have been remediated in code as of February 2026.

#### Gap 1 — Datree Security Policy Enforcer (CI)

| Attribute | Detail |
|---|---|
| **EA Requirement** | All gitops repos must run Datree against Helm-rendered manifests in CI before code can merge to `main`. This enforces ISB security policies including `CUSTOM_WORKLOAD_INCORRECT_DATACLASS_LABELS`. |
| **Previous State** | `tenant-gitops-be808f/.github/workflows/ci.yml` ran only `helm lint` and `helm template`. No Datree step. |
| **Remediation** | Added `datreeio/action-datree@main` step to `ci.yml`. `.github/policies.yaml` already existed with the full ISB policy set (previously committed by ISB). `DATREE_TOKEN` must be obtained from ISB and stored as a GitHub Secret. |
| **Files changed** | `tenant-gitops-be808f/.github/workflows/ci.yml` |

#### Gap 2 — Production Deployment Must Be a PR (Not a Direct Commit)

| Attribute | Detail |
|---|---|
| **EA Requirement** | Pushes to `main` (prod) in the gitops repo must originate from a reviewed PR, not a direct commit. The `ag-pssg-emerald` team should be available for review. ArgoCD syncs automatically on merge. |
| **Previous State** | `build-and-push.yml` `update-gitops` job ran for `develop`, `test`, **and `main`**, all via direct commit. Production was being patched without a review gate. |
| **Remediation** | `update-gitops` job restricted to `develop` and `test` only. New `create-prod-pr` job added: triggers on `main` push or `v*` semver tag; creates a branch `chore/dsc-prod-<tag>` in the gitops repo; opens a PR targeting `main` via `gh pr create`. Merge of that PR is the prod deployment trigger. |
| **Files changed** | `.github/workflows/build-and-push.yml` |

#### Gap 3 — Production Image Tags Must Use Semver (Not Git SHA)

| Attribute | Detail |
|---|---|
| **EA Requirement** | Production deployments should use semver-tagged images (e.g., `v1.0.1`) for auditability and rollback clarity. Non-production environments may use short SHAs. |
| **Previous State** | All environments used `git rev-parse --short HEAD` (short SHA) as the image tag unconditionally. |
| **Remediation** | Image tag computation now branches on `github.ref_type`: `tag` → uses `github.ref_name` (e.g., `v1.0.1`); `branch` → uses short SHA. The prod PR job thus carries a meaningful version when triggered by a semver tag. |
| **Files changed** | `.github/workflows/build-and-push.yml` |

### 14.3 Recommended Follow-up

| Item | Priority |
|---|---|
| Obtain `DATREE_TOKEN` from ISB; store as GitHub Secret in `bcgov-c/tenant-gitops-be808f` | **High** — Datree step will block CI until token is present |
| Confirm `ag-pssg-emerald` GitHub team exists and has reviewer access to `bcgov-c/tenant-gitops-be808f` | **Medium** — Required to assign prod PRs to a reviewer |
| Tag and release `v1.0.0` to validate the semver prod PR flow end-to-end | **Medium** — Confirms the full EA Option 2 path before go-live |
| Enable branch protection on `main` in tenant-gitops-be808f to require PR approval | **Medium** — Enforces the prod gate at the repository level |

