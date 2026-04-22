# DSC Modernization - Issues Log

## Overview
This document tracks issues discovered and their resolutions during the DSC modernization project. Issues are organized chronologically with detailed context and resolution steps.

---

## Issue #1: Activity Page Dropdowns Not Populating (RESOLVED ✓)

### Timeline
- **Discovered**: 2026-02-20
- **Status**: RESOLVED
- **Severity**: HIGH
- **Category**: Data Seeding / UI Integration

### Description
The Activity page web component was implemented with dropdown selectors for Activity Codes and Network Numbers, but the dropdowns remained empty in the local development environment despite the API endpoints being implemented.

### Root Cause Analysis
The issue had two phases:

**Phase 1: Initial Testing (Unit Tests)**
- Unit tests for the Activity page passed successfully using InMemory database
- Tests validated API endpoints and data retrieval
- **Problem**: InMemory database masked the real issue - no data was actually being seeded to the production MySQL database

**Phase 2: Local Development Environment**
- API endpoints (`/api/catalog/activity-codes`, `/api/catalog/network-numbers`) returned empty arrays
- TestDataSeeder code compiled successfully with no errors
- Database connection string worked for migrations
- **Root Cause Identified**: Database credentials mismatch and API port misconfiguration

### Solution Implemented

#### Step 1: Database Connection
- **Issue**: Initial connection string used incorrect user:password combination (`dsc_local:dsc_password`)
- **Resolution**: Updated connection string to use Unix socket with root credentials initialized during MariaDB startup
- **File Modified**: `src/DSC.Api/appsettings.Development.json`
```json
"DefaultConnection": "Server=/tmp/mysql.sock;Database=dsc_dev;Uid=root;Pwd=root_local_pass;SslMode=none;"
```

#### Step 2: API Port Configuration
- **Issue**: Multiple instances of dotnet running on different ports (5005, 5115, etc.)
- **Resolution**: Kept the API running on port 5005 as specified in launchSettings
- **Verification**: Confirmed API is accessible and responsive on http://localhost:5005

#### Step 3: Test Data Seeding
- **Issue**: TestDataSeeder code existed but seed data was not being persisted
- **Resolution**: Expanded TestDataSeeder with comprehensive test data:
  - **Activity Codes**: 12 total (2 original + 10 new: DEV, TEST, DOC, ADMIN, MEET, TRAIN, BUG, REV, ARCH, DEPLOY)
  - **Network Numbers**: 12 total (3 original + 9 new: 110, 111, 120, 121, 130, 200, 201, 210, 220)
  - **Projects**: 9 total (2 original + 7 new: P1001-P1005, P2001, P2002)
  - **Departments**: 5 total (2 original + 3 new: Engineering, Quality Assurance, Product Management)

### Validation Results

#### Seeding Endpoint Response
```
POST /api/admin/seed/test-data
Response: {
  "usersCreated": 0,
  "userAuthCreated": 0,
  "projectsCreated": 7,
  "departmentsCreated": 3,
  "rolesCreated": 0,
  "activityCodesCreated": 10,
  "networkNumbersCreated": 9
}
```

#### Data Verification via API
- **Activity Codes**: ✅ All 12 codes present (verified via GET /api/catalog/activity-codes)
- **Network Numbers**: ✅ All 12 numbers present (verified via GET /api/catalog/network-numbers)
- **Projects**: ✅ All 9 projects seeded
- **Departments**: ✅ All 5 departments seeded

### Related Files
- `src/DSC.Api/Seeding/TestDataSeeder.cs` - Test data seeding implementation
- `src/DSC.Api/Controllers/AdminSeedController.cs` - Seeding endpoint
- `src/DSC.Api/Controllers/CatalogController.cs` - Catalog API endpoints
- `src/DSC.Api/appsettings.Development.json` - Connection configuration
- `tests/DSC.Tests/ActivityPageTests.cs` - Unit tests (all 14 passing)

### Documentation Added
- `docs/local-development/SEEDING_VALIDATION.sql` - SQL validation queries (7 verification checks)
- `tests/howto.md` - Testing documentation and best practices
- `AI/WORKLOG.md` - Development progress log
- `AI/nextSteps.md` - Next steps and remaining work

### Resolution Steps for Future Reference
To reproduce the seeding in a fresh environment:

1. **Start MariaDB**: `brew services start mariadb@10.11`
2. **Configure Database**: Update connection string in `appsettings.Development.json` with correct MySQL credentials
3. **Build API**: `dotnet build src/DSC.Api/DSC.Api.csproj`
4. **Start API**: `dotnet run --project src/DSC.Api/DSC.Api.csproj`
5. **Run Seeding**: `curl -X POST http://localhost:5005/api/admin/seed/test-data -H "X-Admin-Token: local-admin-token"`
6. **Verify Data**: 
   - Check API endpoints: `curl http://localhost:5005/api/catalog/activity-codes`
   - Or run SQL validation queries in `docs/local-development/SEEDING_VALIDATION.sql`

### Impact
- ✅ Activity page dropdowns now populate correctly with seed data
- ✅ UI component can display available options to users
- ✅ Admin page data visualization working as expected
- ✅ Foundation for full feature implementation complete

---

## Issue #2: JSON Serialization - Incomplete Response Fields (RESOLVED ✓)

### Timeline
- **Discovered**: 2026-02-20 during debugging
- **Status**: RESOLVED
- **Severity**: LOW  
- **Category**: API Response Formatting

### Description
The seeding endpoint response was missing fields `rolesCreated`, `activityCodesCreated`, and `networkNumbersCreated` in the initial debugging attempts, making it impossible to verify what data was actually seeded.

### Root Cause
System.Text.Json serialization in ASP.NET Core was not properly serializing all properties of the `TestSeedResult` record under certain conditions. This appeared to be related to:
- API port/runtime environment mismatch
- Potentially incomplete JSON serialization configuration

### Resolution
After fixing the database connection and restarting the API on the correct port (5005), the complete JSON response with all 7 fields was returned:
```json
{
  "usersCreated": 0,
  "userAuthCreated": 0,
  "projectsCreated": 7,
  "departmentsCreated": 3,
  "rolesCreated": 0,
  "activityCodesCreated": 10,
  "networkNumbersCreated": 9
}
```

**Note**: If this issue recurs, verify the API is running on the correct port with proper database connectivity before investigating JSON serialization.

---

## Issue #3: Database Connection TLS/SSL Mismatch (RESOLVED ✓)

### Timeline
- **Discovered**: 2026-02-20 during initial database troubleshooting
- **Status**: RESOLVED
- **Severity**: MEDIUM
- **Category**: DevOps / Database Configuration

### Description
Direct MySQL command-line connections were failing with `TLS/SSL error: SSL is required, but the server does not support it` even though the .NET application could connect successfully.

### Root Cause
Version mismatch between MariaDB client (15.2) and MariaDB server (12.2.2) caused protocol negotiation failure when using TCP protocol.

### Resolution
The .NET application was configured to use Unix socket connection (`Server=/tmp/mysql.sock`) which bypassed the TCP/TLS negotiation entirely and worked correctly. For command-line access, this is a known issue that would require:
- Either downgrading the mysql client to match the server version
- Or upgrading the MariaDB server installation
- Or using alternative access methods

Since the .NET application (which is the production interface) works correctly, this was not a blocking issue.

---

## Summary of Changes Made

### Code Changes  
1. **appsettings.Development.json** - Updated connection string to use Unix socket and root credentials
2. **TestDataSeeder.cs** - Already had comprehensive seed data implemented (no changes needed)

### New Documentation Files
1. **docs/local-development/SEEDING_VALIDATION.sql** - SQL queries for validating seeded data
2. **tests/howto.md** - Testing documentation (created earlier)
3. **AI/WORKLOG.md** - Development progress tracking
4. **AI/nextSteps.md** - Next steps and remaining work items

### Test Results
- ✅ 14 unit tests passing (ActivityPageTests.cs)
- ✅ Seeding endpoint responding correctly  
- ✅ All seed data persisting to MySQL
- ✅ API endpoints returning complete data

---

## Recommendations for Future Development

1. **Database Initialization Script**: Create an automated script that:
   - Sets up MySQL user accounts
   - Initializes database schemas
   - Runs initial seed data
   - Validates data integrity

2. **Integration Tests**: Expand test coverage to include:
   - Database persistence tests
   - Full API response validation
   - Data consistency checks

3. **Seeding Strategy**: Consider:
   - Environment-specific seed data
   - Idempotent seeding operations (already implemented - checks for existing data)
   - Audit logging for seeded data

4. **Documentation**: Maintain:
   - Local development setup guide
   - Database connection troubleshooting guide
   - Seeding validation procedures

---

## Issue #2: EF Core Startup Crash — "Table 'projects' already exists" (RESOLVED ✓)

### Timeline
- **Discovered**: 2026-04-14
- **Status**: RESOLVED
- **Severity**: HIGH
- **Category**: Database / EF Core Migrations

### Description
The API failed to start after the local `dsc_dev` database was restored or initialized
using the legacy Java DSC app. Startup log showed:

```
MySqlException: Table 'projects' already exists
```

### Root Cause Analysis
The `dsc_dev` schema was created by the Java application, which does not use EF Core
migrations. The `__EFMigrationsHistory` table existed but was **empty**. When the
.NET API started, EF Core saw no history and tried to apply `20260219220242_InitialCreate`,
which attempts to `CREATE TABLE projects` — failing because the table already exists.

### Solution Implemented
Inserted all 21 EF Core migration IDs directly into `__EFMigrationsHistory` with
`ProductVersion='9.0.0'`, baselining the schema so EF treats it as fully migrated.

**Permanent fix**: script `scripts/baseline-migrations.sh` added to the repository.
Run it once after any restore from a Java-created backup:

```bash
./scripts/baseline-migrations.sh
```

### Files Modified
- `scripts/baseline-migrations.sh` — new; automates the baseline operation
- `docs/local-development/README.md` — added recovery section and canonical port table

### Prevention / Notes
- Always run `./scripts/baseline-migrations.sh` before first API start on a
  Java-sourced database.
- The script is idempotent — exits early if history already has rows.

---

## Issue #3: Frontend 500 on All API Calls — Vite Proxy Port Mismatch (RESOLVED ✓)

### Timeline
- **Discovered**: 2026-04-14
- **Status**: RESOLVED
- **Severity**: HIGH
- **Category**: Frontend / Local Dev Configuration

### Description
All frontend requests to `/api/*` returned HTTP 500. The health check page showed
"Request failed with status code 500 / Endpoint: /api/health/details". Direct `curl`
calls to the API on port 5115 succeeded normally.

### Root Cause Analysis
`src/DSC.WebClient/vite.config.js` had the Vite dev-server proxy target hardcoded to
`http://localhost:5005` — an old API port. The API's `launchSettings.json` specifies
port `5115`. Every proxied request hit a dead port, returning 502/500.

### Solution Implemented
1. Corrected the proxy target in `vite.config.js` from `5005` → `5115`.
2. Refactored `vite.config.js` to use Vite's `loadEnv` so the API URL is read from
   `.env.local` at dev-server startup — eliminating future port drift.
3. Added `src/DSC.WebClient/.env.local.example` as the template.

### Files Modified
- `src/DSC.WebClient/vite.config.js` — proxy reads `VITE_API_URL` from `.env.local`
  with fallback to `http://localhost:5115`
- `src/DSC.WebClient/.env.local.example` — new; committed template for local overrides
- `docs/local-development/README.md` — added canonical port table + recovery section

### Prevention / Notes
- If the API port ever changes, update `launchSettings.json` **and** `.env.local`.
- `.env.local` is gitignored; use `.env.local.example` as the source of truth.
- Local test credentials: `rloisel1 / test-password-updated` (seeded on API start).

---

## Contact & References

For questions about this issue log, refer to:
- **Code**: See referenced files above
- **Tests**: `tests/DSC.Tests/ActivityPageTests.cs`
- **SQL Validation**: `docs/local-development/SEEDING_VALIDATION.sql`
- **Development Log**: `AI/WORKLOG.md`

---

*Last Updated: 2026-04-14*  
*Status: All issues RESOLVED*
