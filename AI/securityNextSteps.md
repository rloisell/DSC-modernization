# Security Next Steps (2026-02-19)

This note captures security items observed in the current codebase (excluding the not-yet-implemented authentication feature) and suggests concrete next steps.

## High priority

1. Replace SHA256 password hashing
   - Current: raw SHA256 with no salt in Admin user creation and updates.
   - Risk: fast offline cracking if the DB is compromised.
   - Next step: use a slow salted hash (ASP.NET Core PasswordHasher, PBKDF2, bcrypt, or Argon2).

2. Protect admin endpoints with authorization
   - Current: admin controllers are reachable without any authorization gates.
   - Risk: anyone with network access can manage users, projects, and catalog items.
   - Next step: add authentication/authorization middleware and apply [Authorize] + policy checks to /api/admin/* controllers.

3. Remove insecure default connection string fallback
   - Current: API uses a fallback connection string with root user and empty password if config is missing.
   - Risk: accidental use of privileged or empty-password DB credentials.
   - Next step: fail fast if configuration is missing and require explicit configuration via environment or secrets.

## Medium priority

4. Add rate limiting for admin endpoints
   - Risk: brute-force or abuse of create/update/delete operations.
   - Next step: enable ASP.NET Core rate limiting middleware with stricter limits on /api/admin/*.

5. Enforce HTTPS in production
   - Current: API pipeline does not enforce HTTPS redirection.
   - Risk: sensitive traffic over HTTP in production misconfigurations.
   - Next step: enable UseHttpsRedirection and configure Kestrel/ingress to enforce TLS.

## Validation checklist

- Verify admin endpoints reject unauthenticated requests.
- Ensure password hashes are salted and slow (verify stored format).
- Confirm app fails to start without a valid DB connection string.
- Run a basic security smoke test (rate limiting and HTTPS behavior).
