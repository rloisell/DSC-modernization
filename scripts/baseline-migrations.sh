#!/usr/bin/env bash
#
# scripts/baseline-migrations.sh
# Ryan Loiselle — Developer / Architect
# GitHub Copilot — AI pair programmer / code generation
# April 2026
#
# AI-assisted: script to baseline EF Core migration history when the dsc_dev
# database was created by the legacy Java DSC app (not EF Core migrations);
# reviewed and directed by Ryan Loiselle.
#
# WHEN TO USE:
#   Run this ONCE if the API fails on startup with:
#     "Table 'projects' already exists"
#   This means the MariaDB schema was created outside EF Core and
#   __EFMigrationsHistory is empty, causing EF to try re-running migrations.
#
# WHAT IT DOES:
#   Inserts all 21 known migration IDs into __EFMigrationsHistory so EF Core
#   treats the schema as already up-to-date.
#
# USAGE:
#   ./scripts/baseline-migrations.sh
#
#   Override defaults with environment variables:
#   DB_SOCKET=/tmp/mysql.sock DB_USER=root DB_PASS=mypass ./scripts/baseline-migrations.sh
#
# SAFE TO RE-RUN: exits early if history already has rows.
#

set -euo pipefail

DB_SOCKET="${DB_SOCKET:-/tmp/mysql.sock}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-root_local_pass}"
DB_NAME="${DB_NAME:-dsc_dev}"

echo "==> Connecting to MariaDB (socket: $DB_SOCKET, db: $DB_NAME) ..."

check_count=$(mysql \
  --socket="$DB_SOCKET" \
  -u "$DB_USER" \
  -p"$DB_PASS" \
  --skip-ssl \
  --skip-column-names \
  --silent \
  -e "SELECT COUNT(*) FROM ${DB_NAME}.__EFMigrationsHistory;" 2>/dev/null || echo "error")

if [ "$check_count" = "error" ]; then
  echo "ERROR: Could not query __EFMigrationsHistory."
  echo "       Check DB_SOCKET, DB_USER, and DB_PASS."
  echo "       Default: DB_SOCKET=/tmp/mysql.sock  DB_USER=root  DB_PASS=root_local_pass"
  exit 1
fi

if [ "$check_count" -gt 0 ]; then
  echo "==> Migration history already has ${check_count} row(s). Nothing to do."
  exit 0
fi

echo "==> History is empty — inserting all 21 migration IDs ..."

mysql \
  --socket="$DB_SOCKET" \
  -u "$DB_USER" \
  -p"$DB_PASS" \
  --skip-ssl \
  "$DB_NAME" << 'SQL'
INSERT INTO __EFMigrationsHistory (MigrationId, ProductVersion) VALUES
  ('20260219220242_InitialCreate',                        '9.0.0'),
  ('20260219224953_MapJavaModel',                         '9.0.0'),
  ('20260219235415_AdminEntities',                        '9.0.0'),
  ('20260219235900_ProjectIsActive',                      '9.0.0'),
  ('20260220071710_AddRoleEntity',                        '9.0.0'),
  ('20260220073552_AddPositionDepartmentToUser',          '9.0.0'),
  ('20260220104233_AddBudgetModel',                       '9.0.0'),
  ('20260220105914_AddActivityCalendarModels',            '9.0.0'),
  ('20260220110559_AddDirectorCodeModel',                 '9.0.0'),
  ('20260220111112_AddReasonCodeModel',                   '9.0.0'),
  ('20260220111513_AddCpcCodeModel',                      '9.0.0'),
  ('20260220113112_AddExpenseActivityFields',             '9.0.0'),
  ('20260220114900_AddUnionModel',                        '9.0.0'),
  ('20260220115442_AddUserIdToWorkItem',                  '9.0.0'),
  ('20260220115933_AddDepartmentUserModel',               '9.0.0'),
  ('20260220120314_AddUserPositionModel',                 '9.0.0'),
  ('20260220120416_AddUserUserModel',                     '9.0.0'),
  ('20260220120552_AddProjectActivityModel',              '9.0.0'),
  ('20260220120601_AddExpenseActivityModel',              '9.0.0'),
  ('20260220213648_AddEstimatedHoursToProjectAssignment', '9.0.0'),
  ('20260221011541_AddUserIsActive',                      '9.0.0');
SQL

echo "==> Done. Inserted 21 migration IDs."
echo "==> You can now start the API: dotnet run --project src/DSC.Api"
