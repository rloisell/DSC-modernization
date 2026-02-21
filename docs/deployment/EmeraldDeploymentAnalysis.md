# BC Gov Emerald — Application Deployment Guide
<!-- Author: Ryan Loiselle, Developer/Architect | GitHub Copilot | February 2026 -->
<!-- Established from DSC Modernization project. Canonical copy maintained in rl-project-template. -->

## Purpose

This is the reusable deployment reference for applications targeting the
**BC Gov Private Cloud PaaS — Emerald Hosting Tier** using the standard stack:
**.NET 10 API + React/Vite frontend + MariaDB or PostgreSQL**.

It captures platform constraints, architecture principles, CI/CD pipeline patterns,
secrets management, and the ISB EA Option 2 compliance requirements — drawn from
direct study of peer ISB repositories (`bcgov-c/tenant-gitops-be808f`,
`bcgov-c/jag-network-tools`, `bcgov-c/JAG-JAM-CORNET`, `bcgov-c/JAG-LEA`) and the
ISB *OPTION 2 – Using GitHub Actions + GitOps in Emerald* EA document.

For project-specific implementation details see the project's own
`DEPLOYMENT_ANALYSIS.md` and `DEPLOYMENT_NEXT_STEPS.md`.

---

## 1. Target Platform — Emerald Tier

**Cluster:** `console.apps.emerald.devops.gov.bc.ca`
**Route URL pattern:** `<app>-<license>-<env>.apps.emerald.devops.gov.bc.ca`

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
   `kubectl apply` from the public internet. Deployment **must** be ArgoCD
   (pull-based GitOps).
2. **Proxy-only internet** — pods pulling images from Docker Hub or GHCR will fail.
   All images must be pre-mirrored to **Artifactory**.
3. **Protected C data** — stronger network-policy requirements; mandatory
   `DataClass` labels on all workloads.
4. **EUS cadence** — platform stays on stable even-point OCP releases longer.

---

## 2. Standard Application Stack

The following stack is used as the reference for this deployment guide. Future
projects that diverge from it should note the differences in their own
`DEPLOYMENT_ANALYSIS.md`.

| Component | Technology |
|---|---|
| API | ASP.NET Core 10, EF Core 9, Pomelo MariaDB or Npgsql PostgreSQL |
| Frontend | React 18 + Vite, BC Gov Design System |
| Auth | Custom header scheme (`X-User-Id`) for dev; OIDC/Keycloak for production |
| Database | MariaDB 10.11 StatefulSet (initial); PostgreSQL + CrunchyDB (recommended for production HA) |
| Testing | xUnit — Services, Auth, domain logic |
| Container runtime (local) | Podman + podman-compose |

### Data Classification

The `DataClass` label must be confirmed with Information Security before any
workload is deployed to Emerald. The value drives both pod labels and AVI
InfraSetting routing annotations:

```yaml
podLabels:
  DataClass: "Low"   # or Medium / High / Critical

route:
  annotations:
    aviinfrasetting.ako.vmware.com/name: "dataclass-low"
```

---

## 3. Namespace Structure

BC Gov Platform Registry provisions four namespaces per project:

| Namespace | Purpose |
|---|---|
| `<license>-tools` | Build pipelines, image mirroring, Artifactory auth |
| `<license>-dev` | Development environment |
| `<license>-test` | Test / QA environment |
| `<license>-prod` | Production environment |

The license plate (e.g., `be808f`) is assigned at registration via the
[Platform Product Registry](https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/).

---

## 4. Two-Repo GitOps Layout

All Emerald projects use a two-repo pattern. The canonical structure is:

### App Repo (`<project-name>`)

```
.github/workflows/
  build-and-push.yml        ← Build images; push to Artifactory; update gitops
  build-and-test.yml        ← Unit tests + frontend build (gated on PR)
containerization/
  Containerfile.api         ← .NET 10 multistage build (sdk → aspnet, port 8080)
  Containerfile.frontend    ← Node 22-alpine build → nginx:alpine runtime
  nginx.conf                ← SPA try_files + /api/ proxy template
  podman-compose.yml        ← Local dev: API + Frontend + DB
```

### GitOps Repo (`<project-name>-gitops` or shared `tenant-gitops-<license>`)

```
charts/
  <app>/                    ← Application Helm chart (standalone per project)
    Chart.yaml
    values.yaml             ← Defaults
    templates/
      _helpers.tpl
      api-deployment.yaml
      api-service.yaml
      api-route.yaml
      frontend-configmap.yaml   ← Helm-rendered nginx.conf
      frontend-deployment.yaml
      frontend-service.yaml
      frontend-route.yaml
      db-statefulset.yaml
      db-service.yaml
      secret.yaml               ← Shape-only; real values from Vault
      networkpolicies.yaml      ← deny-all + explicit allow rules
      serviceaccount.yaml       ← automountServiceAccountToken: false
      hpa.yaml                  ← HPA; enabled in prod values only
deploy/
  <app>-dev_values.yaml
  <app>-test_values.yaml
  <app>-prod_values.yaml
applications/argocd/
  <license>-<app>-dev.yaml  ← Standalone ArgoCD Application CRD (auto-sync)
  <license>-<app>-test.yaml ← Standalone ArgoCD Application CRD (manual sync)
  <license>-<app>-prod.yaml ← Standalone ArgoCD Application CRD (manual sync)
.github/
  policies.yaml             ← ISB Datree policy set (provided by ISB/platform team)
  workflows/
    ci.yml                  ← Helm lint + template for all envs
    policy-enforcement.yaml ← Datree Helm plugin offline security check
```

---

## 5. Architecture Principles

### 5.1 — Standalone ArgoCD Application per Project (Key Rule)

Each project **must** have its own standalone ArgoCD Application CRDs — one per
environment — pointing directly at its own Helm chart. Never add a new project as a
sub-chart dependency of another team's ArgoCD-watched umbrella chart.

**Why this matters:** In a shared GitOps namespace, if project A's Helm is a
sub-chart of project B's umbrella chart, then:
- A broken Helm render in project A immediately blocks project B's ArgoCD sync
- `file://` local dependencies require committed tarballs — ArgoCD cannot resolve
  them on-the-fly
- Both projects share the same sync lifecycle and failure domain

The correct pattern: three standalone Application CRDs per project
(`<license>-<app>-dev.yaml`, `...-test.yaml`, `...-prod.yaml`), each pointing
directly at `charts/<app>/`.

### 5.2 — Nginx Reverse Proxy (No Build-Time API URL Injection)

All frontend API calls should use **relative paths** (`/api/items`, `/api/reports`,
etc.). Nginx proxies `/api/` to the API ClusterIP Service within the same namespace.

**Why:** Vite bakes `import.meta.env` values at build time. A per-environment build
is wasteful and a `/config.json` runtime injection adds complexity. Nginx proxying
eliminates both problems — one container image works across all environments, and
requests appear same-origin to the browser (no CORS configuration required).

The nginx configuration is rendered by Helm into a ConfigMap mounted at
`/etc/nginx/conf.d/default.conf` in the frontend pod. The API service hostname is
injected via a Helm helper template at deploy time.

### 5.3 — Database: MariaDB StatefulSet vs. CrunchyDB

MariaDB in a StatefulSet with a PVC (`storageClassName: netapp-file-standard`) is
acceptable for an initial deployment. However:

**Recommended path for production workloads:** Migrate to PostgreSQL + CrunchyDB
operator for automatic HA, backups, and point-in-time recovery. CrunchyDB is a
supported operator on Emerald and eliminates the need to manage backup strategies
manually.

### 5.4 — Non-Root Containers

All containers must run as non-root. OpenShift assigns a random UID from the
namespace's SCC. The recommended pattern:

- Create an `appuser`/`appgroup` in the Containerfile
- Set file system permissions using group `0` (root group) with group-writable access
- End with `USER appuser`
- API: set `ASPNETCORE_URLS=http://+:8080` — always port 8080 (never 80, 443, or
  the dev port)

---

## 6. CI/CD Pipeline — App Repo (`build-and-push.yml`)

### Triggers

| Source | GitOps update method | Target namespace |
|---|---|---|
| Push to `develop` | Direct commit to `<app>-dev_values.yaml` | `<license>-dev` (ArgoCD auto-sync) |
| Push to `test` | Direct commit to `<app>-test_values.yaml` | `<license>-test` (ArgoCD auto-sync) |
| Push to `main` or `v*` tag | **Open PR** to `<app>-prod_values.yaml` | `<license>-prod` (manual ArgoCD sync after merge) |
| Pull request | Build images only — no push | — |

### Image Tag Strategy (ISB EA Option 2)

| Event | Tag |
|---|---|
| `v*` semver tag (e.g. `v1.0.1`) | Tag name — e.g. `v1.0.1` |
| Branch push | Short Git SHA — e.g. `a3f9c2d` |

### Image Registry

All images push to:
```
artifacts.developer.gov.bc.ca/<license>-docker-local/<image-name>:<tag>
```

### Production Deployment Gate (ISB EA Requirement)

Production deployments **must not** be direct commits. The `create-prod-pr` job:
1. Creates branch `chore/<app>-prod-<tag>` in the gitops repo
2. Patches `deploy/<app>-prod_values.yaml` with the new image tag
3. Opens a PR via `gh pr create` targeting `main`
4. A reviewer must approve and merge; ArgoCD syncs `<license>-prod` on merge

### Required GitHub Secrets (App Repo)

| Secret | Purpose |
|---|---|
| `ARTIFACTORY_USERNAME` | Artifactory login (push images) |
| `ARTIFACTORY_PASSWORD` | Artifactory login (push images) |
| `GITOPS_TOKEN` | GitHub PAT with `repo` write access to the gitops repo |

---

## 7. CI/CD Pipeline — GitOps Repo

### 7.1 — Helm Lint and Template (`ci.yml`)

Runs on push/PR to `main`, `develop`, `test` when `charts/` or `deploy/` changes.
Must lint and fully `helm template` the chart for every environment. Example steps:

```yaml
- name: Lint chart (dev values)
  run: helm lint charts/<app> --values deploy/<app>-dev_values.yaml

- name: Template chart (dev)
  run: helm template <app>-dev charts/<app> --namespace <license>-dev \
       --values deploy/<app>-dev_values.yaml > /dev/null
```

Repeat for test and prod value files.

### 7.2 — Datree Security Policy Enforcer (`policy-enforcement.yaml`)

**Required for ISB EA compliance.** Datree enforces security policies defined in
`.github/policies.yaml` (provided by ISB/platform team), including
`CUSTOM_WORKLOAD_INCORRECT_DATACLASS_LABELS` and
`CONTAINERS_INCORRECT_PRIVILEGED_VALUE_TRUE`.

**Correct implementation pattern** (confirmed from study of all active ISB
`tenant-gitops-*` repos — `e648d1`, `a56f0d`, `cc9b4e`, `ca61f6`, `dead5e`,
`a239c6`):

- **Standalone file:** `.github/workflows/policy-enforcement.yaml` — not a step
  in `ci.yml`
- **Helm plugin, offline mode** — **no `DATREE_TOKEN` required**
- **Working directory:** set to `./.github/workflows`; all paths are relative from
  there (`../policies.yaml` → `.github/policies.yaml`, `../../charts/<app>`)

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
        with:
          version: 'latest '
          token: ${{ secrets.GITHUB_TOKEN }}
        id: install
      - name: Policy Enforcement
        run: |
          helm plugin install https://github.com/datreeio/helm-datree
          helm plugin update datree
          helm datree config set offline local
          if [[ "$GITHUB_REF" == "refs/heads/main" ]] || [[ "$GITHUB_REF" == refs/tags/* ]]; then
            helm datree test --ignore-missing-schemas --policy-config ../policies.yaml \
              --include-tests ../../charts/<app> -- \
              --namespace <license>-prod --values ../../deploy/<app>-prod_values.yaml <app>-prod
          elif [[ "$GITHUB_REF" == "refs/heads/test" ]]; then
            helm datree test --ignore-missing-schemas --policy-config ../policies.yaml \
              --include-tests ../../charts/<app> -- \
              --namespace <license>-test --values ../../deploy/<app>-test_values.yaml <app>-test
          else
            helm datree test --ignore-missing-schemas --policy-config ../policies.yaml \
              --include-tests ../../charts/<app> -- \
              --namespace <license>-dev --values ../../deploy/<app>-dev_values.yaml <app>-dev
          fi
        working-directory: ${{env.policy-directory}}
```

> **Important:** An earlier incorrect pattern used `datreeio/action-datree@main`
> as a step inside `ci.yml` with a `DATREE_TOKEN` secret. This does not match any
> active ISB repo. The Helm plugin offline approach above requires **no token** and
> is the confirmed correct pattern.

---

## 8. Recommended Additional CI Practices

These patterns are present in `bcgov-c/JAG-JAM-CORNET` and `bcgov-c/JAG-LEA` and
are recommended for all projects:

### 8.1 — Trivy Image Vulnerability Scan

Add after image push in `build-and-push.yml`. Informational — does not fail the
pipeline, but surfaces HIGH/CRITICAL CVEs for awareness:

```yaml
- name: Run Trivy vulnerability scanner
  uses: aquasecurity/trivy-action@master
  with:
    scan-type: image
    image-ref: artifacts.developer.gov.bc.ca/<license>-docker-local/<image>:<tag>
    format: 'table'
    ignore-unfixed: true
    limit-severities-for-sarif: true
    severity: HIGH,CRITICAL
```

Run for every image pushed (API image and frontend image separately).

### 8.2 — Automated Unit / Integration Test Workflow (`build-and-test.yml`)

```yaml
# Triggers on PR/push to develop
on:
  push:
    branches: [develop]
  pull_request:
    branches: [main, develop]

jobs:
  test-api:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with: { dotnet-version: '10.x' }
      - run: dotnet restore
      - run: dotnet build --no-restore
      - run: dotnet test --no-build --verbosity normal

  test-frontend:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run build
      - run: npm test
```

---

## 9. Secrets Management

### 9.1 — GitHub Actions Secrets (App Repo)

| Secret | Required by |
|---|---|
| `ARTIFACTORY_USERNAME` | `build-and-push.yml` — image push |
| `ARTIFACTORY_PASSWORD` | `build-and-push.yml` — image push |
| `GITOPS_TOKEN` | `build-and-push.yml` — gitops update + prod PR |

> **No `DATREE_TOKEN` required.** The correct Helm plugin offline Datree
> implementation does not need a token.

### 9.2 — Kubernetes Secrets (per namespace, never committed)

#### Artifactory pull secret
```bash
oc -n <license>-dev create secret docker-registry artifactory-pull-secret \
  --docker-server=artifacts.developer.gov.bc.ca \
  --docker-username=<ARTIFACTORY_USERNAME> \
  --docker-password=<ARTIFACTORY_PASSWORD>
```

#### Database credentials
```bash
oc -n <license>-dev create secret generic <app>-db-secret \
  --from-literal=MARIADB_ROOT_PASSWORD=<root-password> \
  --from-literal=MARIADB_USER=<app-db-user> \
  --from-literal=MARIADB_PASSWORD=<app-db-password> \
  --from-literal=MARIADB_DATABASE=<app-db-name>
```

#### Application token / admin secret
```bash
oc -n <license>-dev create secret generic <app>-admin-secret \
  --from-literal=ADMIN_TOKEN=<token>
```

### 9.3 — Vault (Production Hardening)

For production, secrets should be migrated to HashiCorp Vault:
- Vault paths: `secret/<license>/<env>/<key>`
  (e.g., `secret/be808f/prod/db-password`)
- Injection: External Secrets Operator or Vault Agent Injector
- Helm chart `secret.yaml` should be shape-only so Vault can populate values

---

## 10. Network Policies

Emerald enforces default-deny. The following policies are required for every project:

| Policy name | Rule |
|---|---|
| `deny-all` | Default deny all ingress and egress |
| `allow-router-to-frontend` | Ingress from `ingress` namespace to Frontend port 8080 |
| `allow-router-to-api` | Ingress from `ingress` namespace to API port 8080 |
| `allow-frontend-to-api` | Ingress to API from pods matching frontend selector |
| `allow-api-to-db` | Ingress to DB from pods matching API selector (port 3306/5432) |
| `allow-egress-dns` | Egress UDP/TCP port 53 for DNS resolution |

Add `allow-egress-https` if the API needs to reach Vault or an external service.

---

## 11. Health Check Endpoints

All APIs must expose two health check paths for OpenShift probes:

| Probe | Path | Minimum behaviour |
|---|---|---|
| Liveness | `GET /health/live` | Returns 200 when the process is alive |
| Readiness | `GET /health/ready` | Returns 200 when the database connection is healthy |

Helm chart `api-deployment.yaml` configures these as:
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

| Environment | Sync policy | Rationale |
|---|---|---|
| dev | **Auto-sync** — `prune: true`, `selfHeal: true` | Fast iteration; drift is automatically corrected |
| test | **Manual sync** | Intentional gate — humans decide when to promote |
| prod | **Manual sync** — `CreateNamespace: false` | Always requires human action + namespace must pre-exist |

---

## 13. ISB EA Option 2 — Required Compliance Checklist

The following items are required by the ISB *OPTION 2* EA guidance. Use this as a
pre-launch checklist for any new Emerald project:

| Requirement | How to implement | Notes |
|---|---|---|
| Standalone ArgoCD Application per environment | Three Application CRDs: dev, test, prod | Never a sub-chart of another team's umbrella |
| GitOps folder structure | `charts/`, `deploy/`, `applications/argocd/` | As per §4 layout |
| Artifactory image registry | All images at `artifacts.developer.gov.bc.ca/<license>-docker-local/` | No Docker Hub or GHCR at runtime |
| Artifactory pull secret | `imagePullSecrets: [{name: artifactory-pull-secret}]` in all Deployments/StatefulSets | Must be created in each namespace |
| Vault for secrets | Helm `secret.yaml` shape-only; values injected at runtime | Never commit real secret values |
| NetworkPolicies | deny-all + explicit allow rules (see §10) | Required for all workloads |
| DataClass label | `DataClass: "<classification>"` on all pods; matching AVI route annotation | Confirm classification with InfoSec |
| Manual sync for test/prod | No `automated: {}` block in test/prod Application CRDs | Required |
| Production deployment via PR | `create-prod-pr` job in app repo CI; no direct commit to prod gitops | Branch protection on `main` in gitops repo recommended |
| Semver image tags for production | `v*` tag → tag name as image tag; branch → short SHA | Enables clear rollback targets |
| Helm lint + template in CI | `ci.yml` runs lint + template for all three environments | Must include all value files |
| Datree policy enforcement | Standalone `policy-enforcement.yaml` workflow (Helm plugin offline) | See §7.2 — no DATREE_TOKEN needed |

---

## 14. New Project Setup Checklist

### Platform Provisioning (human steps)

- [ ] Register in [Platform Product Registry](https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/) — receive license plate
- [ ] Request Artifactory project + Docker repository (`<license>-docker-local`)
- [ ] Create Artifactory service account; store as GitHub Secrets (`ARTIFACTORY_USERNAME`, `ARTIFACTORY_PASSWORD`) in app repo
- [ ] Create `GITOPS_TOKEN` (GitHub PAT with `repo` write scope on gitops repo); store as GitHub Secret in app repo
- [ ] Onboard to Vault; provision paths: `secret/<license>/<env>/<key>`
- [ ] Enable ArgoCD for the project (self-serve or platform team request)
- [ ] Add team members to OpenShift namespaces (edit/admin roles)
- [ ] Confirm `DataClass` label value with Information Security
- [ ] Enable branch protection on `main` in the gitops repo (require PR review)

### GitOps Repo Setup

- [ ] Create gitops repo (standalone, not a fork of another team's repo)
- [ ] Copy Helm chart skeleton from `rl-project-template/gitops/charts/`
- [ ] Replace all `<APP_NAME>` and `<LICENSE>` placeholders
- [ ] Populate `deploy/<app>-dev_values.yaml`, `...-test_values.yaml`, `...-prod_values.yaml`
- [ ] Copy `.github/policies.yaml` from ISB or another `tenant-gitops-*` repo
- [ ] Create `.github/workflows/ci.yml` (Helm lint + template)
- [ ] Create `.github/workflows/policy-enforcement.yaml` (Datree Helm plugin — see §7.2)
- [ ] Grant ArgoCD SSH deploy key read access to the gitops repo
- [ ] Apply ArgoCD Application CRDs: `oc apply -f applications/argocd/<app>-dev.yaml -n <argocd-namespace>`

### App Repo Setup

- [ ] Update Containerfiles — replace `<PROJECT_NAME>` placeholders
- [ ] Verify `GET /health/live` and `GET /health/ready` endpoints exist and return 200
- [ ] Update `build-and-push.yml` — set `<LICENSE>`, `<APP_NAME>`, `<GITOPS_REPO>`
- [ ] Create `build-and-test.yml` (unit tests + frontend build)
- [ ] Remove `localhost` references from `appsettings.json` (all connection strings → env vars)

### First Deployment Verification

- [ ] Push `develop` branch → confirm `build-and-push.yml` green → confirm images in Artifactory
- [ ] Confirm gitops `<app>-dev_values.yaml` has been updated with a real image tag (not placeholder)
- [ ] Create Kubernetes secrets in `<license>-dev` (pull secret + app secrets)
- [ ] Verify ArgoCD syncs and all pods go green
- [ ] Visit the frontend Route URL and verify the app loads
- [ ] Hit `GET /health/ready` → expect `{"status":"Healthy"}`

### Path to Production

- [ ] Confirm `ag-pssg-emerald` (or equivalent) GitHub team has reviewer access to the gitops repo
- [ ] Run `git tag v1.0.0 && git push --tags` to trigger the first prod PR flow
- [ ] Review and merge the auto-generated PR in the gitops repo
- [ ] Confirm ArgoCD syncs `<license>-prod`

---

## 15. Troubleshooting Reference

| Symptom | Most Likely Cause | Fix |
|---|---|---|
| Pods stuck in `ImagePullBackOff` | `artifactory-pull-secret` missing or wrong credentials | Re-create the pull secret in the namespace |
| API pod in `CrashLoopBackOff` | DB secret missing, or DB not yet running | `oc logs <pod>` — check connection string error |
| ArgoCD `ComparisonError` | Image tag is still a placeholder value | Re-run `build-and-push.yml` |
| ArgoCD Application not visible | CRD was not applied to ArgoCD namespace | Apply `applications/argocd/<app>-dev.yaml` |
| Route returns 503 | Pod readiness probe failing | `oc logs <pod>` — DB likely not healthy yet |
| DB PVC in `Pending` | Storage class name wrong or unavailable | `oc get sc` — confirm `netapp-file-standard` exists |
| Datree CI step failing | Helm chart fails policy check | Read Datree output — most common: missing `DataClass` label |

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
| Reference App Repo (.NET + React/Vite) | https://github.com/bcgov-c/jag-network-tools |
| Reference GitOps Repo | https://github.com/bcgov-c/tenant-gitops-be808f |
| Peer CI/CD Pattern (CORNET) | https://github.com/bcgov-c/JAG-JAM-CORNET |
| Peer CI/CD Pattern (LEA) | https://github.com/bcgov-c/JAG-LEA |
