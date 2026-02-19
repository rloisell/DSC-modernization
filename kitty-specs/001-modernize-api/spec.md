# Feature Specification: Modernize DSC API to ASP.NET Core

**Feature Branch**: `001-modernize-api`  
**Created**: 2026-02-19  
**Status**: Draft  
**Input**: Port the existing Java-based DSC API endpoints to a .NET 10 ASP.NET Core Web API using Entity Framework Core for persistence.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View DSC Item (Priority: P1)

As a DSC user, I want to retrieve a DSC item by id so I can view its details in the UI.

**Why this priority**: Basic read capability is required to validate parity with the existing app.

**Independent Test**: Call GET /api/items/{id} and verify response matches expected JSON contract and HTTP 200.

**Acceptance Scenarios**:
1. **Given** an existing item id, **When** the client requests GET /api/items/{id}, **Then** the service returns 200 with JSON containing id, name, description, createdAt.
2. **Given** a non-existent id, **When** the client requests the endpoint, **Then** the service returns 404.

---

### User Story 2 - Create DSC Item (Priority: P2)

As a DSC user, I want to create a new item so I can store it in the system.

**Independent Test**: POST /api/items with sample JSON payload, expect 201 Created and Location header.

**Acceptance Scenarios**:
1. **Given** valid payload, **When** POST /api/items, **Then** returns 201 with created resource id and persisted data in the DB.
2. **Given** invalid payload (missing required fields), **When** POST, **Then** return 400 with validation errors.

---

### Edge Cases

- Concurrent creates with duplicate unique key should return 409 or be idempotent depending on chosen contract.
- Large payloads should be rejected with 413 or handled by streaming.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-API-001**: Implement GET /api/items/{id} returning JSON.
- **FR-API-002**: Implement POST /api/items for creation with server-side validation.
- **FR-API-003**: Use EF Core with Pomelo MySQL provider to persist data to MariaDB/MySQL.
- **FR-API-004**: Ensure API follows OpenAPI/Swagger contract and includes example request/response.

### Key Entities

- **Item**: id (GUID), name (string), description (string), createdAt (datetime)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Parity tests pass for read and create endpoints when compared to the Java reference implementation.
- **SC-002**: Local integration tests run against MariaDB using seed data and pass in CI.

## Implementation notes

- Use controller-based API with minimal endpoints for this feature.
- Add EF Core migrations and seed data under `spec/fixtures/db/` for local testing.
- Add OpenAPI sample under `spec/fixtures/openapi/`.

## Artifacts to provide

- Example request/response JSON files (place under `spec/fixtures/openapi/`)
- DB schema and seed SQL (place under `spec/fixtures/db/`)
