# DSC Modernization — Deployment Next Steps
<!-- Author: Ryan Loiselle, Developer/Architect | GitHub Copilot | February 2026 -->

## ✅ DEPLOYMENT COMPLETE — 2026-02-21

**DSC is live on BC Gov Emerald (`be808f-dev`).** Confirmed via `oc` CLI on 2026-04-14.

| Resource | Value |
|---|---|
| Frontend URL | `https://dsc-be808f-dev.apps.emerald.devops.gov.bc.ca` |
| API URL | `https://dsc-api-be808f-dev.apps.emerald.devops.gov.bc.ca` |
| Artifactory registry | `artifacts.developer.gov.bc.ca/dbe8-docker-local/` |
| Current image tag | `9444112` (GitHub Actions run number) |
| First ArgoCD sync | 2026-02-21 |
| Secrets created | 2026-02-23 |
| DB PVC | `db-data-be808f-dsc-dev-dsc-app-db-0` — 1Gi `netapp-file-standard` |

> ⚠️ **Registry path correction**: All earlier docs referenced `be808f-docker-local` as the
> Artifactory repository. The actual deployed repository is **`dbe8-docker-local`**.
> Update any scripts, CI env vars, or Helm values that reference the old path.

## Purpose

This document captures the steps that were required to complete the first deployment
of DSC to the **BC Gov Private Cloud PaaS — Emerald Hosting Tier** (`be808f-dev`
namespace). All code artefacts and platform provisioning are now complete.

**State as of 2026-02-21 (first deployment):**

| Repo | Branch | HEAD |
|------|--------|------|
| `rloisell/DSC-modernization` | `main` | `3af4c97` |
| `bcgov-c/tenant-gitops-be808f` | `main` | `4272d83` |

---

## 1. What is Already Done

Everything in code is complete. No further development work is required to attempt a
first deployment to dev.

| Artefact | Location | Status |
|---|---|---|
| API Containerfile | `containerization/Containerfile.api` | ✅ committed |
| Frontend Containerfile | `containerization/Containerfile.frontend` | ✅ committed |
| Nginx config (local dev) | `containerization/nginx.conf` | ✅ committed |
| Podman Compose (local dev) | `containerization/podman-compose.yml` | ✅ committed |
| GitHub Actions build pipeline | `.github/workflows/build-and-push.yml` | ✅ committed |
| Helm chart (16 templates) | `tenant-gitops-be808f/charts/dsc-app/` | ✅ committed |
| DSC dev values | `tenant-gitops-be808f/deploy/dsc-dev_values.yaml` | ✅ committed — `DataClass: "Low"` |
| DSC test values | `tenant-gitops-be808f/deploy/dsc-test_values.yaml` | ✅ committed — `DataClass: "Low"` |
| DSC prod values | `tenant-gitops-be808f/deploy/dsc-prod_values.yaml` | ✅ committed — `DataClass: "Low"` |
| ArgoCD Application CRD — dev | `tenant-gitops-be808f/applications/argocd/be808f-dsc-dev.yaml` | ✅ committed — auto-sync |
| ArgoCD Application CRD — test | `tenant-gitops-be808f/applications/argocd/be808f-dsc-test.yaml` | ✅ committed — manual sync |
| ArgoCD Application CRD — prod | `tenant-gitops-be808f/applications/argocd/be808f-dsc-prod.yaml` | ✅ committed — manual sync |
| CI helm lint workflow | `tenant-gitops-be808f/.github/workflows/ci.yml` | ✅ committed |

### Pending Code Changes (Not Yet Committed)

The following items are identified but not yet implemented. Complete before promoting to test or prod.
Full detail for each item is in `AI/nextSteps.md` under the "Standards Compliance Gaps" section.

| # | Artefact | Location | Severity |
|---|---|---|---|
| C1 | Replace `dotnet.yml` with proper `build-and-test.yml` | `.github/workflows/` | High |
| C2 | Add Vitest frontend test framework + smoke tests | `src/DSC.WebClient/` | High |
| C3 | Add Trivy image scan (API + frontend) | `.github/workflows/build-and-push.yml` | Medium |
| C4 | Add DSC app chart to Datree policy-enforcement workflow | `tenant-gitops-be808f/.github/workflows/policy-enforcement.yaml` | High |
| C5 | Clean up stale Datree TODO comment in gitops `ci.yml` | `tenant-gitops-be808f/.github/workflows/ci.yml` | Low |

#### C1 Fix — `build-and-test.yml`
Delete `.github/workflows/dotnet.yml` and create `.github/workflows/build-and-test.yml`:
- Target .NET 10 (not 8.0)
- Triggers: push to `develop`, PR to `main`/`develop`
- Jobs: `dotnet test` + `npm run build` (+ `npm test` once C2 is done)

#### C2 Fix — Frontend tests
```bash
cd src/DSC.WebClient
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```
Add `"test": "vitest run"` to `package.json` scripts.
Add `test: { environment: 'jsdom', globals: true }` to `vite.config.js`.

#### C3 Fix — Trivy in `build-and-push.yml`
Add two `aquasecurity/trivy-action@master` steps after image push (one for `dsc-api`, one for
`dsc-frontend`). Informational only — does not fail the pipeline.

#### C4 Fix — Datree for `charts/dsc-app`
In `tenant-gitops-be808f/.github/workflows/policy-enforcement.yaml`, add a second
`Policy Enforcement — DSC App` step (after the existing `charts/gitops` step) that runs
`helm datree test` against `charts/dsc-app` with the appropriate env values.

#### C5 Fix — Gitops `ci.yml` comment
Replace the large stale Datree comment block with a 3-line pointer to `policy-enforcement.yaml`.

---

## 2. Blocking Steps — ✅ ALL COMPLETE

All platform provisioning steps were completed. Confirmed via `oc` CLI 2026-04-14.

### 2.1 — GitHub Secrets ✅ DONE

Three secrets confirmed set in `rloisell/DSC-modernization`:

| Secret Name | Purpose | Status |
|---|---|---|
| `ARTIFACTORY_USERNAME` | Log in to `artifacts.developer.gov.bc.ca` | ✅ set |
| `ARTIFACTORY_PASSWORD` | As above | ✅ set |
| `GITOPS_TOKEN` | PAT with write scope on `bcgov-c/tenant-gitops-be808f` | ✅ set |

> **No `DATREE_TOKEN` required.** The correct Datree implementation uses the Helm plugin in offline mode.

**Resolved:** Artifactory service account confirmed working — images deploying from `dbe8-docker-local`.

### 2.2 — Artifactory Setup ✅ DONE (2026-02-23)

| Action | Status | Actual Value |
|---|---|---|
| Docker repository exists | ✅ | **`dbe8-docker-local`** (NOT `be808f-docker-local` as originally documented) |
| Service account credentials configured | ✅ | `artifactory-pull-secret` created in namespace 2026-02-23 |
| `mariadb:10.11` available | ✅ | Confirmed — DB pod running 51+ days |

### 2.3 — First Image Build ✅ DONE (2026-02-21)

Pipeline ran successfully. Both images pushed to Artifactory.
Current deployed tag: `9444112` (GitHub Actions run number format — note this differs
from the documented SHA strategy; the run number is what the pipeline actually produced).

```
artifacts.developer.gov.bc.ca/dbe8-docker-local/dsc-api:9444112
artifacts.developer.gov.bc.ca/dbe8-docker-local/dsc-frontend:9444112
```

### 2.4 — Kubernetes Secrets in `be808f-dev` ✅ DONE (2026-02-23)

All three secrets confirmed present in namespace (via `oc get secrets -n be808f-dev`):

| Secret | Type | Created |
|---|---|---|
| `artifactory-pull-secret` | `kubernetes.io/dockerconfigjson` | 2026-02-23 |
| `dsc-db-secret` | `Opaque` (3 keys) | 2026-02-23 |
| `dsc-admin-secret` | `Opaque` (1 key) | 2026-02-23 |

### 2.5 — Register ArgoCD Application ✅ DONE (2026-02-21)

`be808f-dsc-dev.yaml` applied and ArgoCD is managing the deployment.
First sync timestamp confirmed: 2026-02-21T08:19:03Z (deployment creation timestamp from cluster).

All three pods running:
- `be808f-dsc-dev-dsc-app-api-*` — 1/1 Running (35+ days)
- `be808f-dsc-dev-dsc-app-db-0` — 1/1 Running (35+ days)
- `be808f-dsc-dev-dsc-app-frontend-*` — 1/1 Running (35+ days)

> **Production deployment note (ISB EA Option 2 requirement):** Do not push directly to
> `main` or force-push prod values to the gitops repo. The `create-prod-pr` job in
> `build-and-push.yml` will automatically open a PR in `tenant-gitops-be808f` when
> the `main` branch is pushed or a `v*` semver tag is created. A reviewer (ideally via
> the `ag-pssg-emerald` GitHub team) must approve and merge that PR before ArgoCD
> syncs to `be808f-prod`.

---

## 3. Fast Path — Ordered Checklist ✅ ALL COMPLETE

- [x] **1.** GitHub Secrets set ✅
- [x] **2.** `develop` push → `build-and-push.yml` green → images in Artifactory ✅ (tag `9444112`)
- [x] **3.** `dsc-dev_values.yaml` updated with real image tag ✅
- [x] **4.** `artifactory-pull-secret` created in `be808f-dev` ✅ 2026-02-23
- [x] **5.** `dsc-db-secret` created ✅ 2026-02-23
- [x] **6.** `dsc-admin-secret` created ✅ 2026-02-23
- [x] **7.** `be808f-dsc-dev.yaml` registered with ArgoCD ✅
- [x] **8.** ArgoCD synced — all pods green ✅
- [x] **9.** Frontend live: `https://dsc-be808f-dev.apps.emerald.devops.gov.bc.ca` ✅
- [x] **10.** API health check: `https://dsc-api-be808f-dev.apps.emerald.devops.gov.bc.ca/health/ready` ✅

---

## 4. Expected Post-Sync Resources in `be808f-dev`

After a successful ArgoCD sync, these resources will exist in the namespace:

| Kind | Name | Notes |
|---|---|---|
| `ServiceAccount` | `dsc-app` | `automountServiceAccountToken: false` |
| `Deployment` | `dsc-api` | 1 replica; liveness + readiness on `/health/live` / `/health/ready` |
| `Deployment` | `dsc-frontend` | 1 replica; nginx ConfigMap mounted |
| `StatefulSet` | `dsc-db` | MariaDB 10.11; 1Gi PVC |
| `Service` | `dsc-api` | ClusterIP, port 8080 |
| `Service` | `dsc-frontend` | ClusterIP, port 8080 |
| `Service` | `dsc-db` | Headless ClusterIP |
| `Route` | `dsc-api` | `dsc-api-be808f-dev.apps.emerald.devops.gov.bc.ca` |
| `Route` | `dsc-frontend` | `dsc-frontend-be808f-dev.apps.emerald.devops.gov.bc.ca` |
| `ConfigMap` | `dsc-frontend-nginx-config` | Rendered nginx.conf with API proxy |
| `NetworkPolicy` × 6 | deny-all, router→frontend, router→api, frontend→api, api→db, egress-dns | |

---

## 5. Subsequent Environments (Test / Prod)

The test and prod ArgoCD Application CRDs are committed but set to **manual sync only**.
To promote to test or prod after a successful dev deployment:

1. Update `deploy/dsc-test_values.yaml` image tags (or let the pipeline update them
   automatically when a `test` branch is pushed)
2. Open a PR to `tenant-gitops-be808f` updating the tags
3. Merge PR → trigger a manual ArgoCD sync for `be808f-dsc-test`
4. Repeat for prod with appropriate approvals

Do **not** enable `automated` sync on test or prod Applications without an additional
approval gate in the pipeline.

---

## 6. If Something Goes Wrong

| Symptom | Most Likely Cause | Fix |
|---|---|---|
| Pods stuck in `ImagePullBackOff` | `artifactory-pull-secret` missing or wrong credentials | Re-create the secret (Step 2.4) |
| `dsc-api` pod in `CrashLoopBackOff` | `dsc-db-secret` missing or DB not yet running | Check `oc logs <api-pod>` — likely a connection string error |
| ArgoCD shows `ComparisonError` | Image tag is still `TAG` placeholder | Re-run or manually trigger `build-and-push.yml` |
| ArgoCD Application not visible | CRD was not applied | Apply `be808f-dsc-dev.yaml` (Step 2.5) |
| Route returns 503 | Pod readiness probe failing | `oc logs <pod>` — likely DB not healthy yet; check `dsc-db` StatefulSet |
| `dsc-db` PVC pending | `netapp-file-standard` storage class unavailable | Check `oc get sc` — confirm storage class name matches `dsc-prod_values.yaml` |
