# Fixtures for Spec-Kitty sample features

Place sample OpenAPI contracts, DB schemas, and seed data here. These fixtures are referenced by feature specs under `kitty-specs/`.

- `openapi/` — OpenAPI/Swagger example files for API contracts.
- `db/` — SQL schema and seed scripts for local MariaDB/MySQL testing.

Usage examples:

```bash
# Load seed data into local MariaDB
mysql -udsc_dev -pdsc_local_password dsc_modernization_dev < spec/fixtures/db/seed.sql

# Use OpenAPI file for contract-driven test tooling
openapi-generator-cli validate -i spec/fixtures/openapi/items-api.yaml
```
