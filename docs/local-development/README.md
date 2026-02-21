# Local Development Environment

**Author**: Ryan Loiselle — Developer / Architect
**AI tool**: GitHub Copilot — AI pair programmer / code generation
**Updated**: February 2026

This guide documents how to run the DSC modernization stack locally, including
dependencies, configuration, and persistent services that keep running when VS Code is closed.

## What runs locally

- API: ASP.NET Core (Kestrel) on http://localhost:5005
- WebClient: Vite dev server on http://localhost:5173
- Database: MariaDB 10.11 on localhost:3306

## Dependencies

### Required

- .NET 10 SDK
- Node.js (npm)
- MariaDB 10.11
- dotnet-ef (global tool)

### Optional

- Docker (if running MariaDB in a container instead of Homebrew)
- Spec-Kitty CLI (for spec workflows)

## Install (macOS with Homebrew)

```bash
brew install dotnet@10
brew install node
brew install mariadb@10.11
```

Install the EF Core CLI:

```bash
dotnet tool install --global dotnet-ef
```

Start MariaDB as a background service:

```bash
brew services start mariadb@10.11
```

## Database setup

Create the database and user (example values used in dev):

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dsc_dev;"
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'dsc_local'@'127.0.0.1' IDENTIFIED BY 'dsc_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON dsc_dev.* TO 'dsc_local'@'127.0.0.1'; FLUSH PRIVILEGES;"
```

Apply migrations:

```bash
export DSC_Connection="Server=127.0.0.1;Port=3306;Database=dsc_dev;User=dsc_local;Password=dsc_password;"
dotnet ef database update --project src/DSC.Data --startup-project src/DSC.Api --context ApplicationDbContext
```

Seed base data:

```bash
mysql -h 127.0.0.1 -P 3306 -u dsc_local -pdsc_password dsc_dev < spec/fixtures/db/seed.sql
```

Seed legacy Java test data through the admin endpoint:

```bash
curl -X POST http://localhost:5005/api/admin/seed/test-data \
  -H "X-Admin-Token: local-admin-token"
```

## Environment variables

API runtime:

```bash
export ConnectionStrings__DefaultConnection="Server=127.0.0.1;Port=3306;Database=dsc_dev;User=dsc_local;Password=dsc_password;"
export ASPNETCORE_ENVIRONMENT=Development
export Admin__Token="local-admin-token"
export Admin__RequireToken=false
```

Design-time EF (migrations):

```bash
export DSC_Connection="Server=127.0.0.1;Port=3306;Database=dsc_dev;User=dsc_local;Password=dsc_password;"
```

Notes:
- The admin token bypass works only in Development.
- When the bypass is disabled, send X-Admin-Token on /api/admin requests.

## Run manually

API:

```bash
dotnet run --project src/DSC.Api --urls http://localhost:5005
```

WebClient:

```bash
cd src/DSC.WebClient
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

## Persist services after VS Code closes

The local environment can run as background services via LaunchAgents.

LaunchAgent files (user scope):

```bash
~/Library/LaunchAgents/com.dsc.api.plist
~/Library/LaunchAgents/com.dsc.webclient.plist
```

Load and unload services:

```bash
launchctl load -w ~/Library/LaunchAgents/com.dsc.api.plist
launchctl load -w ~/Library/LaunchAgents/com.dsc.webclient.plist

launchctl unload -w ~/Library/LaunchAgents/com.dsc.api.plist
launchctl unload -w ~/Library/LaunchAgents/com.dsc.webclient.plist
```

Logs:

```bash
~/Library/Logs/dsc-api.log
~/Library/Logs/dsc-api.err
~/Library/Logs/dsc-webclient.log
~/Library/Logs/dsc-webclient.err
```

## Verify services

```bash
curl -sS http://localhost:5005/health || true
curl -sS http://localhost:5173/ | head -n 20
```

```bash
lsof -nP -iTCP:5005 -sTCP:LISTEN | head -n 5
lsof -nP -iTCP:5173 -sTCP:LISTEN | head -n 5
```

## Troubleshooting

- Port already in use: stop the process or choose a new port.
- Database connection errors: verify MariaDB is running and credentials match.
- API admin endpoints: confirm Admin__RequireToken and X-Admin-Token settings.

## References

- Seed data: [spec/fixtures/db/seed.sql](spec/fixtures/db/seed.sql)
- Diagrams: [diagrams/README.md](diagrams/README.md)
- Work log: [AI/WORKLOG.md](AI/WORKLOG.md)
- Security follow-ups: [AI/securityNextSteps.md](AI/securityNextSteps.md)
