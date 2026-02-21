# DSC Modernization — Deployment Next Steps
<!-- Author: Ryan Loiselle, Developer/Architect | GitHub Copilot | February 2026 -->

## Purpose

This document captures the remaining steps required to complete the first deployment
of DSC to the **BC Gov Private Cloud PaaS — Emerald Hosting Tier** (`be808f-dev`
namespace). All code artefacts are committed and pushed. What remains is platform
provisioning and secret creation.

**Current state as of 2026-02-21:**

| Repo | Branch | HEAD |
|------|--------|------|
| `rloisell/DSC-modernization` | `main` | `92deede` |
| `bcgov-c/tenant-gitops-be808f` | `main` | `bd4229d` |

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

---

## 2. Blocking Steps — Must Complete Before First Sync

These steps must all be done before ArgoCD can successfully sync DSC to `be808f-dev`.
They are grouped by who performs them.

### 2.1 — GitHub Secrets (Developer Action)

Three secrets must be added to `rloisell/DSC-modernization` → Settings → Secrets →
Actions before the build pipeline can run.

| Secret Name | Value | Purpose | Repo |
|---|---|---|---|
| `ARTIFACTORY_USERNAME` | Artifactory service account username | Log in to `artifacts.developer.gov.bc.ca` to push images | `DSC-modernization` |
| `ARTIFACTORY_PASSWORD` | Artifactory service account password / API key | As above | `DSC-modernization` |
| `GITOPS_TOKEN` | GitHub PAT with `repo` write scope on `bcgov-c/tenant-gitops-be808f` | `update-gitops` job patches image tags; `create-prod-pr` job opens prod PR | `DSC-modernization` |
| `DATREE_TOKEN` | Token obtained from ISB (Emerald platform team) | Authenticates the Datree security policy check in `ci.yml` | **`tenant-gitops-be808f`** |

> **`DATREE_TOKEN` note:** This token is managed by ISB — contact the Emerald platform team to obtain it. It must be set as a GitHub Actions Secret in `bcgov-c/tenant-gitops-be808f` (**not** in DSC-modernization). Without this token the Datree step in `ci.yml` will fail and PRs to the gitops repo will be blocked.

**Confirm:** Does an Artifactory service account already exist for `be808f`? The
co-tenant (`jag-network-tools`) already uses one — check if it can be shared or if
a new one is needed.

### 2.2 — Artifactory Setup (Platform Team / Developer)

| Action | Notes |
|---|---|
| Confirm `be808f-docker-local` Docker repository exists | Images push to `artifacts.developer.gov.bc.ca/be808f-docker-local/dsc-api:<tag>` and `dsc-frontend:<tag>` |
| Confirm push rights for the service account | The service account credentials in Step 2.1 must have push permission on this repo |
| Confirm `mariadb:10.11` is available in Artifactory | The `db-statefulset.yaml` template pulls the MariaDB base image. Emerald pods cannot pull from Docker Hub directly — the image must be in Artifactory or a remote-cached Artifactory virtual repo |

### 2.3 — First Image Build (Developer Action)

Once the GitHub Secrets are set, trigger the build pipeline:

```bash
# Push any commit to the develop branch to trigger build-and-push.yml
git checkout -b develop
git push -u origin develop
```

The pipeline will:
1. Build `dsc-api` and `dsc-frontend` images
2. Push them to Artifactory with the Git SHA as the tag
3. Commit back to `tenant-gitops-be808f` to update the `api.image.tag` and
   `frontend.image.tag` fields in `deploy/dsc-dev_values.yaml`

**Verify:** After the workflow completes, check that `dsc-dev_values.yaml` in the
gitops repo has a real image tag (not the placeholder `TAG`).

### 2.4 — Kubernetes Secrets in `be808f-dev` (Developer Action — requires `oc` access)

Two application secrets and one pull secret must exist in the namespace before pods
will start. These are **not** in the GitOps repo (by design — secrets are never
committed). Create them manually:

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
  --from-literal=MARIADB_ROOT_PASSWORD=<choose-a-dev-root-password> \
  --from-literal=MARIADB_USER=dscapp \
  --from-literal=MARIADB_PASSWORD=<choose-a-dev-app-password> \
  --from-literal=MARIADB_DATABASE=dscdb
```

The connection string injected into the API pod will be:
```
Server=dsc-db;Port=3306;Database=dscdb;Uid=dscapp;Pwd=<MARIADB_PASSWORD>;
```

#### Admin token secret
```bash
oc -n be808f-dev create secret generic dsc-admin-secret \
  --from-literal=ADMIN_TOKEN=<choose-a-dev-admin-token>
```

This value is passed as `X-Admin-Token` header to seed/admin endpoints. A UUID is fine
for dev.

### 2.5 — Register ArgoCD Application (Platform Team or Developer)

The ArgoCD Application CRD for dev is at:
```
tenant-gitops-be808f/applications/argocd/be808f-dsc-dev.yaml
```

ArgoCD must be told to watch this. Two possible paths:

**Option A — Developer applies directly (if you have cluster access):**
```bash
oc apply -f tenant-gitops-be808f/applications/argocd/be808f-dsc-dev.yaml \
  -n <argocd-namespace>
```

**Option B — Platform team bootstraps it:**
Ask the platform team to apply `be808f-dsc-dev.yaml` into the ArgoCD namespace. Provide
them the file from the gitops repo.

Once applied, ArgoCD will immediately attempt to sync `charts/dsc-app` against
`be808f-dev` using `deploy/dsc-dev_values.yaml`.

> **Production deployment note (ISB EA Option 2 requirement):** Do not push directly to
> `main` or force-push prod values to the gitops repo. The `create-prod-pr` job in
> `build-and-push.yml` will automatically open a PR in `tenant-gitops-be808f` when
> the `main` branch is pushed or a `v*` semver tag is created. A reviewer (ideally via
> the `ag-pssg-emerald` GitHub team) must approve and merge that PR before ArgoCD
> syncs to `be808f-prod`.

---

## 3. Fast Path — Ordered Checklist

If the namespace and Artifactory are already provisioned by the co-tenant, this is the
minimal sequence:

- [ ] **1a.** Add `ARTIFACTORY_USERNAME`, `ARTIFACTORY_PASSWORD`, `GITOPS_TOKEN` to GitHub Secrets in `DSC-modernization`
- [ ] **1b.** Obtain `DATREE_TOKEN` from ISB; add to GitHub Secrets in `tenant-gitops-be808f`
- [ ] **2.** Push `develop` branch → confirm `build-and-push.yml` green → confirm images appear in Artifactory
- [ ] **3.** Confirm `dsc-dev_values.yaml` in gitops repo has been updated with a real image tag
- [ ] **4.** `oc create secret docker-registry artifactory-pull-secret` in `be808f-dev`
- [ ] **5.** `oc create secret generic dsc-db-secret` in `be808f-dev`
- [ ] **6.** `oc create secret generic dsc-admin-secret` in `be808f-dev`
- [ ] **7.** Apply or register `be808f-dsc-dev.yaml` with ArgoCD
- [ ] **8.** Watch ArgoCD sync — all resources in `be808f-dev` should go green
- [ ] **9.** Visit the frontend route: `https://dsc-frontend-be808f-dev.apps.emerald.devops.gov.bc.ca`
- [ ] **10.** Hit `https://dsc-api-be808f-dev.apps.emerald.devops.gov.bc.ca/health/ready` — expect `{"status":"Healthy"}`

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
