# Unit Testing Guide

This document describes how to run the unit test suite for the DSC modernization project and what testing infrastructure has been built.

## Quick Start

```bash
# Run all tests in the project
dotnet test tests/DSC.Tests/DSC.Tests.csproj

# Run only Activity page tests
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "ActivityPageTests"

# Run with verbose output
dotnet test tests/DSC.Tests/DSC.Tests.csproj --verbosity detailed

# Run a specific test by name
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "TestDataSeeder_CreatesActivityCodes"
```

## What's Been Built

### Test Suite Overview

**16 Unit Tests** — All passing ✅
- **Test Project**: `tests/DSC.Tests/DSC.Tests.csproj`
- **Test Classes**: 
  - `ActivityPageTests.cs` (14 tests)
  - `SimpleActivityPageTest.cs` (2 tests)
- **Execution Time**: ~1 second
- **Framework**: xUnit 2.5.3
- **Database Strategy**: Entity Framework Core InMemory provider (isolated, no real database required)

### Test Categories

#### 1. Test Data Seeding Validation (9 tests)

Validates that `TestDataSeeder` creates and configures test data correctly.

| Test | Purpose |
|------|---------|
| `TestDataSeeder_CreatesActivityCodes` | Validates exactly 6 activity codes are created |
| `TestDataSeeder_ActivityCodes_HaveCorrectValues` | Verifies codes are: DEV, TEST, DOC, ADMIN, MEET, TRAIN |
| `TestDataSeeder_ActivityCodes_AreActive` | Confirms all codes have IsActive = true |
| `TestDataSeeder_ActivityCodes_HaveDescriptions` | Validates all codes have descriptions populated |
| `TestDataSeeder_CreatesNetworkNumbers` | Validates exactly 6 network numbers are created |
| `TestDataSeeder_NetworkNumbers_HaveCorrectValues` | Verifies numbers are: 101, 102, 103, 201, 202, 203 |
| `TestDataSeeder_NetworkNumbers_AreActive` | Confirms all numbers have IsActive = true |
| `TestDataSeeder_NetworkNumbers_HaveDescriptions` | Validates all numbers have descriptions populated |
| `TestDataSeeder_IsIdempotent` | Confirms seeding twice creates no duplicates |

**Coverage**: Ensures test data seeding is reliable, complete, and safe to run multiple times.

#### 2. API Endpoint Tests (4 tests)

Validates that API controllers return expected data in correct format.

| Test | Purpose |
|------|---------|
| `CatalogController_GetActivityCodes_ReturnsSeededData` | Validates `GET /api/catalog/activity-codes` returns 6 codes |
| `CatalogController_GetNetworkNumbers_ReturnsSeededData` | Validates `GET /api/catalog/network-numbers` returns 6 numbers |
| `ItemsController_GetAll_ReturnsWorkItems` | Validates `GET /api/items` returns work items |
| `ItemsController_GetAll_ReturnsEmptyArrayWhenNoItems` | Validates `GET /api/items` returns empty array when no items exist |

**Coverage**: Ensures API endpoints return correct HTTP responses with properly formatted data.

#### 3. Integration Test (1 test)

Validates the complete data pipeline works end-to-end.

| Test | Purpose |
|------|---------|
| `ActivityPage_Integration_AllDataSourcesAvailable` | Seeds database and validates all three data sources (projects, activity codes, network numbers) are available and properly structured |

**Coverage**: Ensures seeding + API responses + frontend data binding can work together seamlessly.

#### 4. Baseline Tests (2 tests)

Simple tests to validate test infrastructure is working.

| Test | Purpose |
|------|---------|
| `SimpleActivityPageTest.TestDataSeeder_CreatesActivityCodes_Simple` | Baseline validation that seeder creates codes |

**Coverage**: Ensures test framework and dependencies are correctly configured.

## Test Infrastructure

### Database Strategy

All tests use **Entity Framework Core InMemory Database**:

```csharp
var options = new DbContextOptionsBuilder<ApplicationDbContext>()
    .UseInMemoryDatabase(Guid.NewGuid().ToString())
    .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
    .Options;
```

**Benefits**:
- ✅ No external database required (tests are self-contained)
- ✅ Each test gets fresh, isolated database (Guid-based name)
- ✅ Tests run in parallel without interference
- ✅ Test execution is fast (~1 second for all 16 tests)
- ✅ Deterministic (same seed produces same results)
- ✅ Easy to debug (no connection issues)

**Limitations**:
- InMemory database doesn't support transactions; we suppress the warning via `ConfigureWarnings`
- InMemory behavior differs slightly from real MySQL/MariaDB (but acceptable for these tests)

### Dependencies

The test project references and depends on:

```xml
<!-- Package Dependencies -->
<PackageReference Include="Microsoft.EntityFrameworkCore.InMemory" Version="9.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Identity" Version="2.2.0" />
<PackageReference Include="Moq" Version="4.20.70" />

<!-- Project References -->
<ProjectReference Include="../../src/DSC.Api/DSC.Api.csproj" />
<ProjectReference Include="../../src/DSC.Web/DSC.Web.csproj" />
```

This allows tests to:
- Create `ApplicationDbContext` instances
- Use `TestDataSeeder` to seed test data
- Instantiate controllers (`CatalogController`, `ItemsController`)
- Access entities (`ActivityCode`, `NetworkNumber`, `WorkItem`, etc.)
- Hash passwords with `PasswordHasher<User>`

## Running Tests Locally

### Prerequisites

```bash
# Ensure you have .NET 10 SDK installed
dotnet --version

# Verify test project builds
dotnet build tests/DSC.Tests/DSC.Tests.csproj
```

### Run All Tests

```bash
cd /Users/rloisell/Documents/developer/DSC-modernization

# Run all tests (default verbosity)
dotnet test tests/DSC.Tests/DSC.Tests.csproj

# Output should show:
# Passed!  - Failed: 0, Passed: 16, Skipped: 0, Total: 16, Duration: ~1 s
```

### Run Specific Tests

```bash
# Filter by test class
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "ActivityPageTests"

# Filter by test name pattern
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "Seeder"

# Filter by exact test name
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "TestDataSeeder_CreatesActivityCodes"

# Multiple filters (OR)
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "Catalog|Items"
```

### Detailed Output

```bash
# Verbose output shows each test as it runs
dotnet test tests/DSC.Tests/DSC.Tests.csproj --verbosity detailed

# Very detailed (includes diagnostics)
dotnet test tests/DSC.Tests/DSC.Tests.csproj --verbosity diagnostic

# Custom logger
dotnet test tests/DSC.Tests/DSC.Tests.csproj --logger "console;verbosity=normal"
```

### Code Coverage

If you have coverage tools installed:

```bash
# Generate code coverage report
dotnet test tests/DSC.Tests/DSC.Tests.csproj /p:CollectCoverage=true
```

## CI/CD Integration

Tests are designed to run in continuous integration pipelines:

```yaml
# Example GitHub Actions workflow (yaml)
- name: Run unit tests
  run: dotnet test tests/DSC.Tests/DSC.Tests.csproj --no-build --verbosity minimal

# Example GitLab CI (.gitlab-ci.yml)
test:
  script:
    - dotnet test tests/DSC.Tests/DSC.Tests.csproj --no-build
```

## Adding New Tests

To add new tests:

1. **Create test method** in `tests/DSC.Tests/ActivityPageTests.cs`:

```csharp
[Fact]
public async Task MyNewTest_ValidatesFeature()
{
    // Arrange
    var context = CreateDbContext();
    var seeder = new TestDataSeeder(context, new PasswordHasher<User>());
    await seeder.SeedAsync(CancellationToken.None);

    // Act
    var result = await /* test code */;

    // Assert
    Assert.NotNull(result);
    // ... more assertions
}
```

2. **Run test to verify**:
```bash
dotnet test tests/DSC.Tests/DSC.Tests.csproj --filter "MyNewTest"
```

3. **Commit changes**:
```bash
git add tests/DSC.Tests/ActivityPageTests.cs
git commit -m "test: add MyNewTest for feature validation"
```

## Test Maintenance

### Common Issues

**Issue**: Tests fail with "System.InvalidOperationException: Transactions are not supported"
- **Solution**: Ensure `ConfigureWarnings` includes `InMemoryEventId.TransactionIgnoredWarning`

**Issue**: Tests fail with "The type or namespace name 'ApplicationDbContext' could not be found"
- **Solution**: Verify `DSC.Tests.csproj` has ProjectReferences to `DSC.Api` and `DSC.Web`

**Issue**: Tests timeout or hang
- **Solution**: InMemory database should be fast; check if test is doing expensive I/O. Use `--verbosity diagnostic` to see what's running.

### Keeping Tests Current

When you add new seeded data or API endpoints:
1. Update `TestDataSeeder.cs` with new data
2. Add corresponding test to validate the new data
3. Run full test suite: `dotnet test tests/DSC.Tests/DSC.Tests.csproj`
4. All tests should pass before committing

## What's Tested

### ✅ Currently Validated

- **Seeding**: ActivityCodes, NetworkNumbers created with correct values
- **Activeation**: All seeded records properly marked as active
- **Descriptions**: All records have descriptions (required field)
- **APIs**: CatalogController endpoints return correct data
- **Items**: ItemsController GetAll returns work items or empty array
- **Integration**: Full pipeline from seeding → API → frontend data binding

### 🔲 Future Testing Opportunities

- Authentication & authorization (Admin token validation)
- Error handling (invalid input, missing data)
- Performance (query optimization, pagination)
- Concurrency (simultaneous requests)
- Frontend JavaScript tests (Activity.jsx component behavior)
- E2E tests (full browser testing with real API)

## Recent Changes (2026-02-21)

| Commit | Changes |
|--------|---------|
| d3d9d4b | test: add comprehensive unit tests for Activity page functionality |
| 862d71f | docs: update with unit test implementation details and results |

## References

- **Test Files**: [tests/DSC.Tests/ActivityPageTests.cs](../tests/DSC.Tests/ActivityPageTests.cs), [tests/DSC.Tests/SimpleActivityPageTest.cs](../tests/DSC.Tests/SimpleActivityPageTest.cs)
- **Main Docs**: [AI/WORKLOG.md](../AI/WORKLOG.md), [AI/nextSteps.md](../AI/nextSteps.md)
- **Local Dev Setup**: [docs/local-development/README.md](../docs/local-development/README.md)
- **xUnit Documentation**: https://xunit.net/docs/getting-started/netcore
- **EF Core Testing**: https://learn.microsoft.com/en-us/ef/core/testing/
