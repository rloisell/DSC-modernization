# UML Diagram Update Guide - 2026-02-21

This document outlines which diagrams need to be updated based on the recent Project Activity Options implementation (commit `80a0841`).

## Documentation Status ✅

The following documentation files have been **updated**:
- ✅ **AI/WORKLOG.md** - Added comprehensive entry for 2026-02-20 session
- ✅ **AI/nextSteps.md** - Added completed tasks section at the top
- ✅ **README.md** - Updated Activity Page and Admin Management sections with new features

## Diagram Review Results

All diagrams are located in `diagrams/drawio/` and are in **Draw.io SVG format** (not PlantUML). They can be edited using [Draw.io](https://app.diagrams.net/) or VS Code with the Draw.io Integration extension.

### ✅ Already Current (No Updates Needed)

1. **erd.drawio.svg** (Entity Relationship Diagram)
   - ✅ **Already includes** `project_activity_options` table with composite key:
     - PK project_id
     - PK activity_code_id
     - PK network_number_id
   - ✅ Shows relationships to projects, activity_codes, and network_numbers
   - **Status**: UP TO DATE

2. **domain-model.drawio.svg** (Domain Model)
   - ✅ **Already includes** `ProjectActivityOption` in the Catalog Domain section
   - ✅ Listed alongside ActivityCode and NetworkNumber
   - **Status**: UP TO DATE

3. **deployment.drawio.svg** (Deployment Diagram)
   - Shows infrastructure and environments
   - Not affected by this feature
   - **Status**: UP TO DATE

4. **component-diagram.drawio.svg** (Component Diagram)
   - Shows major packages and dependencies
   - Not affected by this feature (no new packages added)
   - **Status**: UP TO DATE

5. **use-cases.drawio.svg** (Use Case Diagram)
   - Shows user and admin workflows
   - Feature enhances existing "Create Work Item" use case (no new use cases added)
   - **Status**: UP TO DATE

### 🟡 Needs Minor Updates (Optional)

6. **api-architecture.drawio.svg** (API Architecture)
   - **Current State**: Lists controllers but doesn't show all endpoints
   - **Changes Needed**:
     - Add `CatalogController` to Controllers list (if detailed)
     - Add `AdminProjectActivityOptionsController` to Controllers list (if detailed)
   - **Priority**: LOW - diagram is more of an overview, not an exhaustive endpoint list
   - **Recommendation**: Consider adding a note that says "See Swagger UI for complete endpoint list"

7. **sequence-time-entry.drawio.svg** (Time Entry Sequence)
   - **Current State**: Shows work item creation flow
   - **Changes Needed** (if you want detailed accuracy):
     - Update POST /api/items request to show `WorkItemCreateRequest` DTO instead of `WorkItem` entity
     - Show project existence validation step before creation
   - **Priority**: LOW - core flow is unchanged, just the request DTO type changed
   - **Recommendation**: Update only if you want precise technical accuracy

8. **sequence-admin-seed.drawio.svg** (Admin Seed Sequence)
   - **Current State**: Shows test data seeding flow
   - **Changes Needed** (if you want detailed accuracy):
     - Add "Assign All Options" button interaction to Projects admin page
     - Show call to POST /api/admin/project-activity-options/assign-all
   - **Priority**: LOW - this is a new feature, not a modification of seeding flow
   - **Recommendation**: Only update if you want to document the assignment workflow

## How to Edit Draw.io Diagrams

### Method 1: Using Draw.io Web (Recommended)

1. Go to https://app.diagrams.net/
2. Click **File → Open from → Device**
3. Select the `.svg` file from `diagrams/drawio/`
4. Make your edits
5. Click **File → Export as → SVG**
6. Enable these options:
   - ✅ Include a copy of my diagram
   - ✅ Embed Images
7. Save and replace the original file

### Method 2: Using VS Code Extension

1. Install the **Draw.io Integration** extension in VS Code
2. Right-click on any `.drawio.svg` file
3. Select **Open With → Draw.io Editor**
4. Make your edits
5. Save (Cmd+S / Ctrl+S)

## Specific Changes Recommended (If You Choose to Update)

### api-architecture.drawio.svg

**Add to Controllers section:**
```
CatalogController
  - GET /api/catalog/activity-codes
  - GET /api/catalog/network-numbers
  - GET /api/catalog/project-options/{projectId}

AdminProjectActivityOptionsController
  - POST /api/admin/project-activity-options/assign-all
  - GET /api/admin/project-activity-options
```

**OR add a simpler note:**
```
Note: See Swagger UI at http://localhost:5005/swagger for complete API documentation
```

### sequence-time-entry.drawio.svg

**Update POST request box:**
- OLD: `POST /api/items` with `WorkItem` entity
- NEW: `POST /api/items` with `WorkItemCreateRequest` DTO
  - Fields: projectId, title, description, activityCode, networkNumber, legacyActivityId

**Add validation step before database insert:**
```
ItemsController → ApplicationDbContext
  [Validate project exists]
    If not found → return 404
    If found → proceed to create
```

### sequence-admin-seed.drawio.svg

**Add new interaction sequence for Project Activity Option assignment:**
```
User → AdminProjects page: Click "Assign All Options"
AdminProjects → AdminCatalogService: assignAllActivityOptionsToProject(projectId)
AdminCatalogService → API: POST /api/admin/project-activity-options/assign-all
API → Database: Create all combinations (codes × numbers) for project
Database → API: Return count of new assignments
API → AdminCatalogService: {message: "Created X assignments", totalAssignments: Y}
AdminCatalogService → AdminProjects: Success
AdminProjects → User: Display "Created X assignments for project"
```

## Summary

**Diagrams Already Current:**
- ✅ ERD (project_activity_options table present)
- ✅ Domain Model (ProjectActivityOption in Catalog Domain)
- ✅ Deployment
- ✅ Component Diagram
- ✅ Use Cases

**Diagrams Needing Minor Updates (Optional):**
- 🟡 API Architecture (add new controllers/endpoints or reference to Swagger)
- 🟡 Time Entry Sequence (update WorkItem → WorkItemCreateRequest)
- 🟡 Admin Seed Sequence (add project options assignment flow)

**Priority Assessment:**
- **HIGH**: All critical diagrams (ERD, Domain Model) are already up to date ✅
- **LOW**: Optional technical detail updates can be made when convenient
- **RECOMMENDATION**: Since the key structural diagrams are current, the optional updates can be deferred or done as needed

## Next Steps

1. ✅ **Documentation updated** (WORKLOG, nextSteps, README)
2. **Choose one of these options:**
   - **Option A**: Consider diagrams current (ERD and Domain Model have all structural changes)
   - **Option B**: Make optional detail updates to API Architecture and sequence diagrams using Draw.io
   - **Option C**: Document these optional updates as future tasks in nextSteps.md

All essential documentation is now current with the latest implementation.
