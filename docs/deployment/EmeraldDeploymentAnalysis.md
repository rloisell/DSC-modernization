# DSC Modernization — Emerald Deployment Analysis
<!-- Author: Ryan Loiselle, Developer/Architect | GitHub Copilot | February 2026 -->

## Purpose

This document is the authoritative, consolidated record of every deployment-related
decision, implementation, and outstanding action for the DSC Modernization project on
the **BC Gov Private Cloud PaaS — Emerald Hosting Tier**. It synthesises information
from `DEPLOYMENT_ANALYSIS.md`, `DEPLOYMENT_NEXT_STEPS.md`, `AI/WORKLOG.md`, and
direct study of peer ISB repositories (`bcgov-c/tenant-gitops-be808f`,
`bcgov-c/jag-network-tools`, `bcgov-c/JAG-JAM-CORNET`, `bcgov-c/JAG-LEA`).

---

## 1. Target Platform — Emerald Tier

**Cluster:** `console.apps.emerald.devops.gov.bc.ca`
**Route URL pattern:** `<app>-<namespace>.apps.emerald.devops.gov.bc.ca`

| Attribute | Value |
|---|---|
| Maximum data sensitivity | **Protected C** — storage and/or processing |
| Availability (single-node) | 90% (30-day rolling) |
| Availability (multi-node) | 99.5% (30-day rolling, max 4 h outage per 30 days) |
| DR / HA | **None** — no cross-cluster DR unlike Gold |
| OpenShift upgrade model | EUS — even-numbered releases, extended update support |
| Supported operators | Tekton, ArgoCD, CrunchyDB, Kyverno, HPA/VPA, IBM MQ |
| Scalability limit | 175 CPU cores, 16 TB storage, 10 G networking |
| Internet egress | **Proxy only** — pods cannot reach the public internet directly |
| Cluster API | **SPANBC internal only** — not reachable from public GitHub runners |
| App routing | Public internet access may be granted per-application |

### Key Differences vs. Silver/Gold

1. **No public cluster API** — GitHub Actions runners cannot `oc login` or
   `kubectl apply`. Deployment **must** be ArgoCD (pull-based GitOps).
2. **Proxy-only internet** — pods pulling images from Docker Hub or GHCR will fail.
   All images must be pre-mirrored to **Artifactory**.
3. **Protected C data** — stronger network-policy requirements; mandatory
   `DataClass` labels on all workloads.
4. **EUS cadence** — platform stays on stable even-point OCP releases longer.

---

## 2. DSC Application — What Was Built

DSC (Department Staff Codes) is a time-entry and reporting application for BC
Government staff. It was rewritten from a Java/Hibernate monolith to a modern
.NET 10 + React/Vite stack.

### Stack Summary

| Component | Technology |
|---|---|
| API | ASP.NET Core 10, EF Core 9, MariaDB 10.11 |
| Frontend | React 18 + Vite, BC Gov Design System |
| Auth | Custom `X-User-Id` header scheme (Keycloak migration planned) |
| Database | MariaDB 10.11 — StatefulSet with PVC on Emerald |
| Testing | xUnit (36 tests) — Services, Auth, Reports, Catalog CRUD |

### Data Classification

**DSC is confirmed `Low` (DataClass: "Low").**  
The application handles internal staff time-entry records only. No sensitive personal
information; no Protected B/C data. This is reflected across all Helm values files
and Route AVI annotations.

---

## 3. Namespace Structure

The DSC project shares the existing `be808f` license plate with co-tenant services
(`emerald-app`, `telnet`) operated by another team. Four namespaces exist:

| Namespace | Purpose |
|---|---|
| `be808f-tools` | Build pipelines, image mirroring, Artifactory auth |
| `be808f-dev` | DSC development environment |
| `be808f-test` | DSC test / QA environment |
| `be808f-prod` | DSC production environment |

---

## 4. Repository Layout

Two repositories carry all DSC deployment artefacts:

### 4.1 — `rloisell/DSC-modernization` (App Repo)

```
.github/workflows/
  build-and-push.yml        ← Build images; push to Artifactory; update gitops
containerization/
  Containerfile.api         ← .NET 10 multistage build (sdk → aspnet, port 8080)
  Containerfile.frontend    ← Node 22-alpine build → nginx:alpine runtime
  nginx.conf                ← SPA try_files + /api/ proxy; envsubst template
  podman-compose.yml        ← Local dev: API + Frontend + MariaDB (ports 5005/5173/3307)
```

### 4.2 — `bcgov-c/tenant-gitops-be808f` (GitOps Repo)

```
charts/
  gitops/                   ← Shared umbrella chart — co-tenant services ONLY (untouched)
  emerald-app/              ← Co-tenant service (untouched)
  dsc-app/                  ← DSC Helm chart (16 templates) — standalone
    Chart.yaml
    values.yaml             ← Defaults + DataClass: "Low"
    templates/
      _helpers.tpl
      api-deployment.yaml
      api-service.yaml
      api-route.yaml
      frontend-configmap.yaml   ← Helm-rendered nginx.conf with API proxy target
      frontend-deployment.yaml
      frontend-service.yaml
      frontend-route.yaml
      db-statefulset.yaml       ← MariaDB 10.11, PVC via volumeClaimTemplates
      db-service.yaml           ← Headless ClusterIP
      secret.yaml               ← Shape-only; real values from Vault
      networkpolicies.yaml      ← deny-all + 5 explicit allow rules
      serviceaccount.yaml       ← automountServiceAccountToken: false
      hpa.yaml                  ← HPA on API; enabled in prod values only
deploy/
  dev_values.yaml           ← Shared co-tenant dev values (untouched by DSC)
  dsc-dev_values.yaml       ← DSC dev — DataClass: "Low", 1Gi DB, auto-sync
  dsc-test_values.yaml      ← DSC test — DataClass: "Low"
  dsc-prod_values.yaml      ← DSC prod — DataClass: "Low", HPA enabled
applications/argocd/
  be808f-dsc-dev.yaml       ← Standalone ArgoCD Application CRD (auto-sync)
  be808f-dsc-test.yaml      ← Standalone ArgoCD Application CRD (manual sync)
  be808f-dsc-prod.yaml      ← Standalone ArgoCD Application CRD (manual sync)
.github/
  policies.yaml             ← Full ISB Datree policy set (committed by ISB)
  workflows/
    ci.yml                  ← Helm lint + template for all envs (both charts)
    policy-enforcement.yaml ← Datree Helm plugin offline (TO BE CREATED — see §7.2)
```

---

## 5. Architecture Decisions

### 5.1 — Standalone ArgoCD Applications (Not Umbrella Sub-chart)

**Decision:** DSC is deployed via three **standalone ArgoCD Application CRDs**, one
per environment, pointing directly at `charts/dsc-app/`.

**Why:** During the initial implementation sprint, DSC was first added as a sub-chart
dependency of the shared `charts/gitops/` umbrella chart. This was immediately
reverted after identifying a critical collision risk:

- `be808f-app-prod` (the co-tenant's ArgoCD Application) watches the `main` branch of
  the gitops repo. A broken DSC Helm dependency would be immediately live in co-tenant
  production.
- `file://` local dependencies require committed `charts/` tarballs — ArgoCD cannot
  resolve them on-the-fly.
- If DSC Helm rendering fails, co-tenant services (`emerald-app`, `telnet`) also fail
  to sync.

**Rule established:** In a shared GitOps namespace, each application must have its own
standalone ArgoCD Application CRD with an independent sync lifecycle. Never add a
new team's application as a sub-chart dependency of another team's ArgoCD-watched
umbrella chart.

### 5.2 — Nginx Reverse Proxy (No VITE_API_URL Injection)

**Decision:** All DSC WebClient API calls use **relative paths** (`/api/items`,
`/api/reports`, etc.). Nginx proxies `/api/` to the `dsc-api` ClusterIP Service.

**Why:** Vite bakes `import.meta.env` values at build time. A single-image-per-env
approach would require either a per-environment build (wasteful) or a runtime
`config.json` injection (additional complexity). Nginx proxying eliminates the
problem entirely — requests appear same-origin to the browser, no CORS configuration
required, one container image works across all environments.

The nginx configuration is rendered by Helm into a ConfigMap:
```
frontend-configmap.yaml → dsc-frontend-nginx-config (ConfigMap)
                        → mounted at /etc/nginx/conf.d/default.conf
```
The API service hostname is injected at deploy time via `{{ include "dsc-app.apiServiceName" . }}`.

### 5.3 — MariaDB StatefulSet (Not CrunchyDB)

**Decision:** MariaDB 10.11, deployed as an OpenShift StatefulSet with a 1Gi PVC
(`storageClassName: netapp-file-standard`).

**Why for now:** Migrating from MariaDB to PostgreSQL (to unlock CrunchyDB HA
operator support) is a significant schema migration effort. For the initial Emerald
deployment, MariaDB-in-StatefulSet is acceptable.

**Recommended medium-term path:** Migrate to PostgreSQL + CrunchyDB for automatic
HA, backups, and point-in-time recovery — especially before a production workload
is established.

### 5.4 — DataClass: "Low" (Confirmed)

Confirmed by product owner. Applied consistently across:
- `charts/dsc-app/values.yaml` — default `podLabels.DataClass: "Low"`
- `deploy/dsc-dev_values.yaml`, `dsc-test_values.yaml`, `dsc-prod_values.yaml`
  — `podLabels.DataClass: "Low"` + route annotation `dataclass-low`

---

## 6. CI/CD Pipeline — App Repo (`build-and-push.yml`)

### Triggers

| Trigger | Action |
|---|---|
| Push to `develop` | Build images → push to Artifactory → direct commit to `dsc-dev_values.yaml` |
| Push to `test` | Build images → push to Artifactory → direct commit to `dsc-test_values.yaml` |
| Push to `main` or `v*` tag | Build images → push to Artifactory → **open PR** to `dsc-prod_values.yaml` |
| Pull request to `main`/`develop` | Build images only (no push) |

### Image Tag Strategy (ISB EA Option 2)

| Event | Tag |
|---|---|
| `v*` semver tag (e.g. `v1.0.1`) | Tag name — e.g. `v1.0.1` |
| Branch push | Short Git SHA — e.g. `a3f9c2d` |

### Image Registry

All images push to:
```
artifacts.developer.gov.bc.ca/be808f-docker-local/dsc-api:<tag>
artifacts.developer.gov.bc.ca/be808f-docker-local/dsc-frontend:<tag>
```

### Production Deployment Gate (ISB EA Requirement)

Production deployments **must not** be direct commits. The `create-prod-pr` job:
1. Creates branch `chore/dsc-prod-<tag>` in `tenant-gitops-be808f`
2. Patches `deploy/dsc-prod_values.yaml` with the new image tag
3. Opens a PR via `gh pr create` targeting `main`
4. A reviewer must approve and merge; ArgoCD syncs `be808f-prod` on merge

### Required GitHub Secrets

| Secret | Repo | Purpose |
|---|---|---|
| `ARTIFACTORY_USERNAME` | `DSC-modernization` | Artifactory login (push images) |
| `ARTIFACTORY_PASSWORD` | `DSC-modernization` | Artifactory login (push images) |
| `GITOPS_TOKEN` | `DSC-modernization` | PAT with `repo` write to `tenant-gitops-be808f` |

---

## 7. CI/CD Pipeline — GitOps Repo (`ci.yml` + `policy-enforcement.yaml`)

### 7.1 — Helm Lint and Template (`ci.yml`)

Runs on push/PR to `main`, `develop`, `test` when `charts/` or `deploy/` changes.

| Step | What it validates |
|---|---|
| `helm lint charts/emerald-app` | Co-tenant chart still intact |
| `helm lint charts/dsc-app --values deploy/dsc-dev_values.yaml` | DSC chart + dev values |
| `helm lint charts/dsc-app --values deploy/dsc-test_values.yaml` | DSC chart + test values |
| `helm lint charts/dsc-app --values deploy/dsc-prod_values.yaml` | DSC chart + prod values |
| `helm template dsc-dev/test/prod ...` | Full manifest render for all environments |
| `helm dependency build charts/gitops` + lint + template × 3 | Co-tenant umbrella chart |

### 7.2 — Datree Security Policy Enforcer (`policy-enforcement.yaml`)

**Status: TO BE IMPLEMENTED** (see also §10 — Pending Work)

Datree is part of the ISB EA requirement for Emerald. It enforces security policies
including `CUSTOM_WORKLOAD_INCORRECT_DATACLASS_LABELS`, `CONTAINERS_INCORRECT_PRIVILEGED_VALUE_TRUE`,
and others defined in `.github/policies.yaml`.

**Correct implementation pattern** (confirmed from `bcgov-c/tenant-gitops-e648d1`,
`tenant-gitops-a56f0d`, and all other ISB repos studied):

- **Separate file:** `policy-enforcement.yaml` — a standalone workflow, **not** a
  step in `ci.yml`
- **Helm plugin, offline mode** — no `DATREE_TOKEN` required
- **Working directory trick:** set `working-directory: ./.github/workflows`; all
  paths are relative from there (`../policies.yaml`, `../../charts/dsc-app`)

```yaml
# .github/workflows/policy-enforcement.yaml
name: "K8s Security Policy Check"
on:
  push:
    branches: [main, test, develop]
    tags: ['*']
  pull_request:
    branches: [main, test, develop]
jobs:
  policy-check:
    runs-on: ubuntu-latest
    env:
      policy-directory: ./.github/workflows
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    steps:
      - uses: actions/checkout@v2
      - uses: azure/setup-helm@v3
        with: { version: 'latest ', token: "${{ secrets.GITHUB_TOKEN }}" }
        id: install
      - name: Policy Enforcement
        run: |
          helm plugin install https://github.com/datreeio/helm-datree
          helm plugin update datree
          helm datree config set offline local
          if [[ "$GITHUB_REF" == "refs/heads/main" ]] || [[ "$GITHUB_REF" == refs/tags/* ]]; then
            helm datree test --ignore-missing-schemas --policy-config ../policies.yaml \
              --include-tests ../../charts/dsc-app -- \
              --namespace be808f-prod --values ../../deploy/dsc-prod_values.yaml dsc-prod
          elif [[ "$GITHUB_REF" == "refs/heads/test" ]]; then
            helm datree test --ignore-missing-schemas --policy-config ../policies.yaml \
              --include-tests ../../charts/dsc-app -- \
              --namespace be808f-test --values ../../deploy/dsc-test_values.yaml dsc-test
          else
            helm datree test --ignore-missing-schemas --policy-config ../policies.yaml \
              --include-tests ../../charts/dsc-app -- \
              --namespace be808f-dev --values ../../deploy/dsc-dev_values.yaml dsc-dev
          fi
        working-directory: ${{env.policy-directory}}
```

> **Note on earlier implementation:** A previous attempt added `datreeio/action-datree@main`
> as a step inside `ci.yml`. This was incorrect — the GitHub Action approach requires a
> `DATREE_TOKEN` secret and does not match the offline Helm plugin pattern used across
> all ISB `tenant-gitops-*` repos. That step has been commented out in `ci.yml` pending
> creation of the proper `policy-enforcement.yaml` workflow.

---

## 8. CI/CD Gap Analysis — Peer Repo Comparison

A survey of peer ISB repositories (`JAG-JAM-CORNET`, `JAG-LEA`) identified two
additional CI/CD practices present in those stacks that are currently absent from DSC.

### 8.1 — Trivy Image Vulnerability Scan

**Present in:** `bcgov-c/JAG-JAM-CORNET` (`build-push-backend.yaml`),
`bcgov-c/JAG-LEA` (`build-push-backend.yaml`)

**Pattern:**
```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: image
    image-ref: artifacts.developer.gov.bc.ca/<project>/<image>:<tag>
    format: 'table'
    ignore-unfixed: true
    limit-severities-for-sarif: true
    severity: HIGH,CRITICAL
```

Runs after image push, as an informational step (does not fail the pipeline). Scans
for HIGH and CRITICAL CVEs in the pushed image.

**DSC status:** **Not yet implemented.** Recommended addition to `build-and-push.yml`
after image push, covering both `dsc-api` and `dsc-frontend`.

### 8.2 — Automated Unit / Integration Test Run

**Present in:** `bcgov-c/JAG-JAM-CORNET` (`build-test-apps.yaml`),
`bcgov-c/JAG-LEA` (`build-test-apps.yaml`)

**Pattern:** A separate `build-test-apps.yaml` workflow, triggered on PR/push to
`develop`, runs:
- `.NET`: `dotnet restore` → `dotnet build` → `dotnet test`
- `React/Node`: `npm install` → `npm run build` → `npm test`

**DSC status:** **Not yet implemented as a CI workflow.** DSC has 36 xUnit tests
covering Services, Auth, Reports, and Catalog CRUD. These run locally (`dotnet test`)
but are not yet gated in CI. A `build-and-test.yml` workflow should be created.

---

## 9. Secrets — Full Inventory

### 9.1 — GitHub Actions Secrets

| Secret | Repo | Required by | Status |
|---|---|---|---|
| `ARTIFACTORY_USERNAME` | `DSC-modernization` | `build-and-push.yml` — image push | ❌ Not yet set |
| `ARTIFACTORY_PASSWORD` | `DSC-modernization` | `build-and-push.yml` — image push | ❌ Not yet set |
| `GITOPS_TOKEN` | `DSC-modernization` | `build-and-push.yml` — gitops update + prod PR | ❌ Not yet set |

> **Datree note:** No `DATREE_TOKEN` is required. The correct Helm plugin offline
> implementation does not need a token. Earlier documentation stating a `DATREE_TOKEN`
> is needed for `tenant-gitops-be808f` is superseded by this finding.

### 9.2 — Kubernetes Secrets in `be808f-dev`

These must be created manually before ArgoCD can successfully start pods. They are
**never committed** to the GitOps repo.

#### Artifactory pull secret
```bash
oc -n be808f-dev create secret docker-registry artifactory-pull-secret \
  --docker-server=artifacts.developer.gov.bc.ca \
  --docker-username=<ARTIFACTORY_USERNAME> \
  --docker-password=<ARTIFACTORY_PASSWORD>
```

#### Database secret
```bash
oc -n be808f-dev create secret generic dsc-db-secret \
  --from-literal=MARIADB_ROOT_PASSWORD=<root-password> \
  --from-literal=MARIADB_USER=dscapp \
  --from-literal=MARIADB_PASSWORD=<app-password> \
  --from-literal=MARIADB_DATABASE=dscdb
```

The connection string injected into the API pod:
```
Server=dsc-db;Port=3306;Database=dscdb;Uid=dscapp;Pwd=<MARIADB_PASSWORD>;
```

#### Admin token secret
```bash
oc -n be808f-dev create secret generic dsc-admin-secret \
  --from-literal=ADMIN_TOKEN=<admin-token>
```

Passed as `X-Admin-Token` header to seed/admin API endpoints. A UUID is sufficient for dev.

### 9.3 — Vault (Medium-Term)

For production hardening, secrets should be migrated to HashiCorp Vault:
- Vault paths: `secret/be808f/dev/dsc-db`, `secret/be808f/dev/dsc-admin`
- Injection: External Secrets Operator or Vault Agent Injector
- DSC Helm chart `secret.yaml` is shape-only; it is already structured to receive
  values externally

---

## 10. Network Policy Summary

`charts/dsc-app/templates/networkpolicies.yaml` defines six policies:

| Policy | Rule |
|---|---|
| `deny-all` | Default deny all ingress and egress |
| `allow-router-to-frontend` | Ingress from `ingress` namespace to Frontend port 8080 |
| `allow-router-to-api` | Ingress from `ingress` namespace to API port 8080 |
| `allow-frontend-to-api` | Ingress to API from pods with `app: dsc-frontend` label |
| `allow-api-to-db` | Ingress to DB from pods with `app: dsc-api` label (port 3306) |
| `allow-egress-dns` | Egress UDP/TCP port 53 for DNS resolution |

---

## 11. Health Check Endpoints

`DSC.Api` exposes two endpoints used by OpenShift liveness and readiness probes:

| Probe | Path | Behaviour |
|---|---|---|
| Liveness | `GET /health/live` | Returns 200 when the process is alive |
| Readiness | `GET /health/ready` | Returns 200 when EF Core DB `CanConnectAsync()` succeeds |

These are configured in `api-deployment.yaml`:
```yaml
livenessProbe:
  httpGet: { path: /health/live, port: 8080 }
  initialDelaySeconds: 10
readinessProbe:
  httpGet: { path: /health/ready, port: 8080 }
  initialDelaySeconds: 5
```

---

## 12. ArgoCD Sync Policies

| Application | Sync Policy | Branch Watched |
|---|---|---|
| `be808f-dsc-dev` | **Auto-sync** — `prune: true`, `selfHeal: true` | `main` of gitops repo |
| `be808f-dsc-test` | **Manual sync** | `main` of gitops repo |
| `be808f-dsc-prod` | **Manual sync** — `CreateNamespace: false` | `main` of gitops repo |

> Dev uses auto-sync to allow developers to iterate quickly. Test and Prod require
> a human to initiate the sync in the ArgoCD UI after values files are updated.

---

## 13. Resources Created After First ArgoCD Sync (`be808f-dev`)

| Kind | Name |
|---|---|
| `ServiceAccount` | `dsc-app` |
| `Deployment` | `dsc-api` (1 replica) |
| `Deployment` | `dsc-frontend` (1 replica) |
| `StatefulSet` | `dsc-db` (MariaDB 10.11, 1Gi PVC) |
| `Service` | `dsc-api` (ClusterIP, 8080) |
| `Service` | `dsc-frontend` (ClusterIP, 8080) |
| `Service` | `dsc-db` (Headless ClusterIP) |
| `Route` | `dsc-api` → `dsc-api-be808f-dev.apps.emerald.devops.gov.bc.ca` |
| `Route` | `dsc-frontend` → `dsc-frontend-be808f-dev.apps.emerald.devops.gov.bc.ca` |
| `ConfigMap` | `dsc-frontend-nginx-config` (rendered nginx.conf) |
| `NetworkPolicy` × 6 | deny-all + 5 allow rules |

---

## 14. ISB EA Option 2 Compliance — Gap Analysis

**Reference document:** *OPTION 2 – Using GitHub Actions + GitOps in Emerald (ISB
preferred)*. Reviewed February 2026.

### 14.1 — Conformant Items

| EA Requirement | Implementation | Status |
|---|---|---|
| Standalone ArgoCD Applications per environment | `be808f-dsc-{dev,test,prod}.yaml` — three separate CRDs | ✅ |
| GitOps folder structure | `charts/`, `deploy/`, `applications/argocd/` | ✅ |
| Artifactory image registry | `artifacts.developer.gov.bc.ca/be808f-docker-local/` | ✅ |
| Artifactory pull secret | `imagePullSecrets: [name: artifactory-pull-secret]` in Helm | ✅ |
| Vault for secrets | `secret.yaml` shape-only; real values from Vault at runtime | ✅ |
| NetworkPolicies | deny-all + 5 explicit allow rules | ✅ |
| DataClass label | `DataClass: "Low"` on all workloads, all environments | ✅ |
| Manual sync for test/prod | `automated: {}` omitted in test + prod CRDs | ✅ |
| Production deployment via PR | `create-prod-pr` job; no direct commit to prod | ✅ |
| Semver image tags for production | `v*` tag → uses tag name; branch → short SHA | ✅ |
| Helm lint + template in CI | `ci.yml` runs all three value sets | ✅ |

### 14.2 — Gaps Previously Identified (2 Resolved, 1 In Progress)

| Gap | Status | Notes |
|---|---|---|
| Production must be a PR — not a direct commit | ✅ **Resolved** | `create-prod-pr` job added to `build-and-push.yml` |
| Semver image tags for production | ✅ **Resolved** | Image tag strategy branches on `github.ref_type` |
| Datree K8s policy enforcement | 🔄 **In Progress** | `datreeio/action-datree@main` (wrong approach) removed from `ci.yml`; `policy-enforcement.yaml` with Helm plugin offline to be created |

### 14.3 — CA/CD Gaps vs. Peer Repos (Not in EA Document)

| Gap | Source | Status |
|---|---|---|
| Trivy image vulnerability scan | JAG-CORNET, JAG-LEA | ❌ Not yet implemented |
| Automated unit test workflow in CI | JAG-CORNET, JAG-LEA | ❌ Not yet implemented |

---

## 15. Pending Work — Ordered Checklist

### Code Changes (Developer)

- [ ] **Create `policy-enforcement.yaml`** in `tenant-gitops-be808f/.github/workflows/`
  (see §7.2 for exact content)
- [ ] **Add Trivy scan** to `.github/workflows/build-and-push.yml` after image push
  for both `dsc-api` and `dsc-frontend` (see §8.1 for pattern)
- [ ] **Create `build-and-test.yml`** in `.github/workflows/` — `dotnet test` + Vite
  build on PR/push to `develop` (see §8.2 for pattern)

### Platform Provisioning (Human Steps)

- [ ] **Set GitHub Secrets** in `rloisell/DSC-modernization`:
  - `ARTIFACTORY_USERNAME`
  - `ARTIFACTORY_PASSWORD`
  - `GITOPS_TOKEN` (PAT with `repo` write to `bcgov-c/tenant-gitops-be808f`)
- [ ] **Confirm** `be808f-docker-local` Docker repo exists in Artifactory and the
  service account has push rights
- [ ] **Confirm** `mariadb:10.11` is available in Artifactory (or remote-cached
  virtual repo) — Emerald pods cannot pull from Docker Hub directly
- [ ] **Push `develop` branch** to trigger `build-and-push.yml`; confirm images
  appear in Artifactory and `dsc-dev_values.yaml` is updated with a real tag
- [ ] **Create Kubernetes secrets** in `be808f-dev` (see §9.2):
  - `artifactory-pull-secret`
  - `dsc-db-secret`
  - `dsc-admin-secret`
- [ ] **Register ArgoCD Application** — apply `be808f-dsc-dev.yaml` to the ArgoCD
  namespace (developer if cluster access exists; otherwise request from platform team)
- [ ] **Verify first sync** — visit `dsc-frontend-be808f-dev.apps.emerald.devops.gov.bc.ca`

### Path to Production

- [ ] Confirm `ag-pssg-emerald` GitHub team has reviewer access to `tenant-gitops-be808f`
  (required to assign prod PRs to a reviewer)
- [ ] Enable branch protection on `main` in `tenant-gitops-be808f` requiring PR approval
- [ ] Tag and release `v1.0.0` to validate the semver prod PR flow end-to-end

---

## 16. Reference URLs

| Resource | URL |
|---|---|
| BC Gov Platform Technical Docs | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs |
| Hosting Tiers Table | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/platform-architecture-reference/hosting-tiers-table/ |
| ArgoCD Usage Guide | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/argo-cd-usage/ |
| Platform Product Registry | https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/ |
| Artifactory Setup Guide | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/build-deploy-and-maintain-apps/setup-artifactory-service-account/ |
| Vault Getting Started | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/secrets-management/vault-getting-started-guide/ |
| Provision New OpenShift Project | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/openshift-projects-and-access/provision-new-openshift-project/ |
| OpenShift Network Policies | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/platform-architecture-reference/openshift-network-policies/ |
| Database Backup Best Practices | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/database-and-api-management/database-backup-best-practices/ |
| Reference App Repo (same stack) | https://github.com/bcgov-c/jag-network-tools |
| Reference GitOps Repo | https://github.com/bcgov-c/tenant-gitops-be808f |
| Peer CI/CD Pattern (CORNET) | https://github.com/bcgov-c/JAG-JAM-CORNET |
| Peer CI/CD Pattern (LEA) | https://github.com/bcgov-c/JAG-LEA |
