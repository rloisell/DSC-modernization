# DSC Modernization — Coding Standards

**Author**: Ryan Loiselle — Developer / Architect  
**AI tool**: GitHub Copilot — AI pair programmer / code generation  
**Established**: February 2026

This document captures the coding conventions enforced across the DSC Modernization codebase.  
General project and platform standards are defined in [`rl-project-template/CODING_STANDARDS.md`](https://github.com/rloisell/rl-project-template/blob/main/CODING_STANDARDS.md).

---

## 1. Code Style

- **C#**: Follow Microsoft C# conventions. Use `var` where type is obvious; explicit types for non-obvious returns.
- **JavaScript / JSX**: Single-quote strings, no semicolons inconsistency (follow project `.eslintrc`), functional components only.
- **Async**: All I/O is async (`async`/`await`). No `.Result` or `.Wait()`.
- **Null handling**: Use null-conditional operators and guard clauses at method entry. Do not swallow exceptions silently.

---

## 2. Architecture Rules

- **Thin controllers**: HTTP concerns (validation, status codes, DTO mapping) live in controllers. Business logic lives in services.
- **Service interfaces**: All injected services are referenced by interface (`IWorkItemService`, etc.). Concrete types are only instantiated by DI.
- **Direct EF Core for reference data**: Simple lookup-table CRUD controllers may query EF Core directly without a service layer.
- **No circular dependencies**: Controllers → Services → Data layer only. Services do not reference controllers.

---

## 3. Source File Commentary Standard

### 3.1 Attribution Header Block (required on every source file)

Every source file must carry an attribution header at the very top (before any `using`, `import`, or `namespace` declarations).

**C# format:**

```csharp
/*
 * FileName.cs
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * [One sentence describing the file's purpose.]
 * [Optional second sentence: delegation pattern, key design decision, etc.]
 * AI-assisted: [specifically what Copilot generated]; reviewed and directed by Ryan Loiselle.
 */
```

**JavaScript / JSX format:**

```javascript
/*
 * FileName.jsx
 * Ryan Loiselle — Developer / Architect
 * GitHub Copilot — AI pair programmer / code generation
 * February 2026
 *
 * [One sentence describing the component or module's purpose.]
 * AI-assisted: [specifically what Copilot generated]; reviewed and directed by Ryan Loiselle.
 */
```

### 3.2 Inline Method / Section Comments (conditional)

Add method-level or section-level comments **only when the file contains application-specific logic or complexity**.

**Add method/section comments when the file:**
- Exceeds ~80 lines **and** contains branching logic, business rules, or non-obvious data transformations
- Contains EF Core LINQ queries with joins, grouping, or filtering across multiple entities
- Implements security-relevant logic (authentication handlers, password hashing, token validation)
- Is `Program.cs` (composition root), a seeder, or a Swagger operation filter
- Is a React page or custom hook with multi-step form state, cache invalidation, or derived state (`useMemo`)

**Header only (no inline comments needed) when the file is:**
- A DTO, interface, or exception type
- A simple pass-through CRUD controller (< ~80 lines, single entity, no branching)
- A thin API service wrapper (repetitive GET/POST/PUT/DELETE with no transformation logic)
- A short presentational React component with no business logic

### 3.3 Rationale

Attribution headers make AI-assisted contributions visible in code review, security audits, and onboarding.  
Method-level comments are reserved for files where the logic is genuinely non-obvious — annotating generic CRUD code adds noise without value.

---

## 4. Testing Standards

- **C#**: xUnit for unit and integration tests. Tests live in `tests/DSC.Tests/`.
- **Frontend**: Vitest + React Testing Library. Test files colocated in `__tests__/` or alongside components (`*.test.jsx`).
- **Coverage target**: Business logic services (auth, work items, reports) must have unit tests. Admin CRUD controllers are covered by integration tests.
- **No live network calls in unit tests**: All external dependencies (DB, HTTP) are mocked.

---

## 5. Security

- Passwords are hashed via `IPasswordHasher<User>` (ASP.NET Core Identity). Never stored in plain text.
- Tokens are validated by `UserIdAuthenticationHandler` and `AdminTokenAuthenticationHandler`. No custom JWT parsing.
- Admin endpoints are protected by `[Authorize(Policy = "AdminOnly")]` + `[EnableRateLimiting("Admin")]`.
- Security headers (CSP, X-Frame-Options, etc.) are applied globally in `Program.cs`.
- Database secrets are injected via environment variable / OpenShift Secret — never committed to source.

---

## 6. AI Collaboration

- GitHub Copilot is the approved AI tool for this project.
- Copilot-generated code is reviewed, tested, and committed by Ryan Loiselle before merging.
- Every AI-assisted file carries the attribution header defined in §3.1.
- Automated Copilot PR review is enabled via `.github/workflows/copilot-review.yml`.
- See `docs/deployment/EmeraldDeploymentAnalysis.md §8.3` for the full AI review workflow rationale.
