# Deployment Standards — BC Gov Emerald OpenShift

**Author**: Ryan Loiselle — Developer / Architect
**AI tool**: GitHub Copilot — AI pair programmer / code generation
**Established**: February 2026 (DSC-modernization project)
**EA reference**: ISB *OPTION 2 — Using GitHub Actions + GitOps in Emerald (preferred)*

This document is the deployment companion to [CODING_STANDARDS.md](../../CODING_STANDARDS.md).
It captures the standards (Section 9 of CODING_STANDARDS.md) in a focused form, and provides
checklists and reference links for setting up a new project on the BC Gov Private Cloud PaaS.

For the full technical specification, see **Section 9** of [CODING_STANDARDS.md](../../CODING_STANDARDS.md).

---

## DSC Project Status

The table below tracks the DSC-modernization progress against each setup step.

| Step | Status | Notes |
|------|--------|-------|
| Platform provisioning — license plate | ✅ | `be808f` |
| Artifactory project + Docker repo | ✅ | `be808f-docker-local` |
| Artifactory credentials as GitHub Secrets | ⬜ | `ARTIFACTORY_USERNAME`, `ARTIFACTORY_PASSWORD` needed |
| `GITOPS_TOKEN` as GitHub Secret | ⬜ | PAT with write scope on tenant-gitops-be808f |
| Containerfile.api | ✅ | `containerization/Containerfile.api` |
| Containerfile.frontend | ✅ | `containerization/Containerfile.frontend` |
| Nginx config | ✅ | `containerization/nginx.conf` |
| Runtime frontend config (`/config.json`) | ⬜ | VITE_API_URL not yet served via nginx |
| Health endpoints — `/health` + `/health/ready` | ✅ | Implemented in `Program.cs` |
| CI — build and push workflow | ✅ | `.github/workflows/build-and-push.yml` |
| GitOps repo — Helm chart | ✅ | `tenant-gitops-be808f/charts/dsc/` |
| GitOps repo — per-env values | ✅ | `deploy/dev_values.yaml` etc. |
| GitOps repo — ArgoCD Application CRDs | ✅ | `applications/argocd/*.yaml` |
| GitOps CI — Helm lint | ✅ | `.github/workflows/ci.yml` |
| GitOps CI — Datree policy enforcement | ✅ | `.github/workflows/policy-enforcement.yaml` |
| Branch protection on GitOps `main` | ⬜ | Manual step — GitHub Settings |
| Kubernetes Secrets in `be808f-dev` | ⬜ | DB credentials, pull secret |
| First deployment | ⬜ | Blocked on Secrets and Artifactory credentials |
| Production semver tag flow | ⬜ | Pending first deployment |

---

## Quick Reference

### Emerald Tier Facts

| Item | Value |
|------|-------|
| Cluster console URL | `console.apps.emerald.devops.gov.bc.ca` |
| Route URL pattern | `<app>-<license>-<env>.apps.emerald.devops.gov.bc.ca` |
| Image registry | `artifacts.developer.gov.bc.ca` (Artifactory) |
| Max data sensitivity | Protected C — storage and/or processing |
| Internet egress | Proxy only — Docker Hub / GHCR not reachable at runtime |
| Cluster API access | SPANBC-internal only — **no push-based deployment from GitHub Actions** |
| Deployment mechanism | ArgoCD (pull model / GitOps) — mandatory on Emerald |

### Project Namespace Pattern

```
be808f-tools    ← build pipelines, image tools
be808f-dev      ← development
be808f-test     ← test / QA
be808f-prod     ← production
```

### Branch → Environment → Deployment Method

| Source Branch / Tag | GitOps File | Target Namespace | Deployment Method |
|---------------------|-------------|-----------------|-------------------|
| `develop` | `deploy/dev_values.yaml` | `be808f-dev` | Direct commit (ArgoCD auto-sync) |
| `test` | `deploy/test_values.yaml` | `be808f-test` | Direct commit (ArgoCD auto-sync) |
| `main` or `v*` tag | `deploy/prod_values.yaml` | `be808f-prod` | **PR required** — reviewer approval + merge |

---

## ISB EA Option 2 — Three Mandatory Requirements

### 1. Datree Security Policy Enforcer (CI)

Every GitOps repo must run Datree in CI against Helm-rendered manifests before code can merge to `main`.

**Implementation (DSC):** `tenant-gitops-be808f/.github/workflows/policy-enforcement.yaml`
- Helm plugin offline mode: `helm datree config set offline local`
- Policy file: `.github/policies.yaml` (copied from another `tenant-gitops-*` repo)
- **No `DATREE_TOKEN` required** — offline mode

### 2. Production Deployment via PR (Not Direct Commit)

**Implementation (DSC):** `.github/workflows/build-and-push.yml`
- `update-gitops` job: runs for `develop` and `test` branches only
- `create-prod-pr` job: triggers on `main` push or `v*` semver tag

### 3. Semver Tags for Production Image Tags

**Implementation (DSC):**
- `tag` ref → image tag = `github.ref_name` (e.g., `v1.0.1`)
- `branch` ref → image tag = short git SHA

---

## New Project Setup Checklist

### Step 1 — Platform Provisioning (human steps)

- [ ] Register in [Platform Product Registry](https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/) — receive license plate
- [ ] Request Artifactory project + Docker repository (`<license>-docker-local`)
- [ ] Create Artifactory service account; store credentials as GitHub Secrets:
  - `ARTIFACTORY_USERNAME`
  - `ARTIFACTORY_PASSWORD`
- [ ] Create `GITOPS_TOKEN` (GitHub PAT with `repo` write scope on GitOps repo)
- [ ] Onboard to Vault; provision paths: `secret/<license>/<env>/<secret-name>`
- [ ] Enable ArgoCD for the project
- [ ] Add team members to OpenShift namespaces (edit/admin roles)
- [ ] Confirm `DataClass` label value with Information Security
- [ ] Enable branch protection on `main` in the GitOps repo (require PR review)

### Step 2 — App Repo

- [ ] `containerization/Containerfile.api` — no `<PROJECT_NAME>` placeholders
- [ ] `containerization/Containerfile.frontend` — nginx + `/config.json` runtime config
- [ ] Implement runtime config endpoint (see CODING_STANDARDS.md §9.5)
- [ ] Verify `GET /health` and `GET /health/ready` return 200
- [ ] `.github/workflows/build-and-push.yml` — no `<LICENSE>`, `<APP_NAME>`, `<GITOPS_REPO>` placeholders
- [ ] Remove hard-coded `localhost` references from `appsettings.json`
- [ ] Add `.github/workflows/copilot-review.yml` for auto Copilot Code Review

### Step 3 — GitOps Repo

- [ ] Helm chart at `charts/<app>/`
- [ ] Per-env values: `deploy/dev_values.yaml`, `deploy/test_values.yaml`, `deploy/prod_values.yaml`
- [ ] `.github/policies.yaml` copied from another `tenant-gitops-*` repo
- [ ] `.github/workflows/policy-enforcement.yaml` (Datree Helm plugin offline)
- [ ] ArgoCD Application CRDs applied: `kubectl apply -f applications/argocd/`
- [ ] Branch protection on `main` (require PR review)

### Step 4 — First Deployment Verification

- [ ] Push `develop` branch — confirm `build-and-push.yml` runs and images appear in Artifactory
- [ ] Create Kubernetes Secrets in `be808f-dev` (DB credentials, pull secret, admin token)
- [ ] Verify ArgoCD syncs and all pods go green
- [ ] Hit the Route URL and verify frontend loads
- [ ] Verify `GET /health/ready` → 200

### Step 5 — Production Readiness

- [ ] `git tag v1.0.0 && git push --tags` — triggers prod PR flow
- [ ] Review and merge auto-generated PR in GitOps repo
- [ ] Confirm ArgoCD syncs to `be808f-prod`
- [ ] Confirm Datree CI passes in GitOps repo

---

## What Goes Where

| Artifact | Repo | Path |
|----------|------|------|
| `Containerfile.api` | App repo | `containerization/Containerfile.api` |
| `Containerfile.frontend` | App repo | `containerization/Containerfile.frontend` |
| `nginx.conf` | App repo | `containerization/nginx.conf` |
| `podman-compose.yml` | App repo | `containerization/podman-compose.yml` |
| Build + push workflow | App repo | `.github/workflows/build-and-push.yml` |
| Secrets: `ARTIFACTORY_*`, `GITOPS_TOKEN` | App repo (GitHub Secrets) | Settings → Secrets → Actions |
| Helm chart | GitOps repo | `charts/dsc/` |
| Per-env values | GitOps repo | `deploy/*.yaml` |
| ArgoCD CRDs | GitOps repo | `applications/argocd/*.yaml` |
| Helm lint + Datree CI | GitOps repo | `.github/workflows/ci.yml` |
| Datree policy enforcement | GitOps repo | `.github/workflows/policy-enforcement.yaml` |
| Datree policy config | GitOps repo | `.github/policies.yaml` |

---

## Reference Links

| Resource | URL |
|----------|-----|
| BC Gov Private Cloud Technical Docs | https://developer.gov.bc.ca/docs/default/component/platform-developer-docs |
| Platform Product Registry | https://digital.gov.bc.ca/technology/cloud/private/products-tools/registry/ |
| Artifactory console | https://artifacts.developer.gov.bc.ca |
| OpenShift console (Emerald) | https://console.apps.emerald.devops.gov.bc.ca |
| ArgoCD (Emerald) | https://argocd.apps.emerald.devops.gov.bc.ca |
| ISB EA Options (GitHub) | https://github.com/bcgov-c/tenant-gitops-be808f (see README) |

See also: [`EmeraldDeploymentAnalysis.md`](EmeraldDeploymentAnalysis.md) for the full canonical platform analysis.
