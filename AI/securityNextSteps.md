# Security Next Steps (2026-02-19)

This note captures security items observed in the current codebase and tracks mitigation progress.

---

## Status Update (P8 hardening scaffold — current session)

| Item | Status | Commit / Notes |
|------|--------|----------------|
| Rate limiting on admin endpoints | ✅ Done | `Program.cs` — fixed window 60/min per IP |
| Fail fast on missing connection string | ✅ Done | `Program.cs` throws on startup |
| Admin endpoint authorization | ✅ Done | `[Authorize(Policy="AdminOnly")]` on all `/api/admin/*` controllers |
| User deactivation blocks login | ✅ Done | `AuthController` checks `User.IsActive` |
| Security response headers | ✅ Done (P8) | `X-Frame-Options`, `X-Content-Type-Options`, CSP, Referrer-Policy, Permissions-Policy |
| CORS policy | ✅ Done (P8) | Dev = `localhost:5173/5175`, Prod = `AllowedOrigins` config key |
| SHA256 password hashing → PasswordHasher | ⏳ Pending | See item 1 below |
| HTTPS enforcement in production | ⏳ Pending | See item 5 below |
| OIDC / Keycloak migration | ⏳ Future | See migration path below |
| UserAuth cleanup on deactivation | ℹ️ N/A | `User.IsActive = false` already blocks login; `UserAuth` has no status field |

---

## High priority (remaining)

1. **Replace SHA256 password hashing**
   - Current: raw SHA256 with no salt in `UserAuth.Password`.
   - Risk: fast offline cracking if DB is compromised.
   - Next step: migrate `UserAuth.Password` to ASP.NET Core `IPasswordHasher` (PBKDF2).
   - Effort: Medium — requires one-time migration script for existing records.

2. **Enforce HTTPS in production**
   - `UseHttpsRedirection()` and `UseHsts()` should be added to `Program.cs` for non-development environments.
   - Kestrel or the NGINX/IIS ingress layer must present a valid TLS certificate.

---

## OIDC / Keycloak Migration Path

The current custom `UserIdAuthenticationHandler` is a bridge that must be replaced before production.

**Recommended target:** Keycloak (BC Government standard) with OIDC/OAuth 2.0.

**Migration steps:**
1. Register DSC API + Web Client apps in Keycloak realm.
2. Add `Microsoft.AspNetCore.Authentication.JwtBearer` NuGet package.
3. Replace `UserIdAuthenticationHandler` in `Program.cs`:
   ```csharp
   builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
       .AddJwtBearer(options => {
           options.Authority = "https://sso.pathfinder.gov.bc.ca/auth/realms/standard";
           options.Audience  = "dsc-modernization";
       });
   ```
4. Update the React app: replace manual `X-User-Id` header with OIDC PKCE flow (use `oidc-client-ts` or `@axa-fr/react-oidc`).
5. Map Keycloak roles to the existing `AdminOnly` policy.
6. Retire `UserAuth` table and `AuthController` once OIDC is live.

---

## Medium priority

3. **Audit logging for admin mutations**
   - Log all POST/PUT/DELETE operations on admin endpoints to a structured audit table.
   - Include: timestamp, action, entity type/id, user id.

4. **Input validation attributes**
   - Add `[MaxLength]`, `[Required]`, `[RegularExpression]` to all DTO Create/Update request classes.

---

## Validation checklist

- [x] Admin endpoints reject unauthenticated requests.
- [ ] Password hashes are salted (migrate to PasswordHasher).
- [x] App fails to start without a valid DB connection string.
- [x] Rate limiting active on admin endpoints.
- [ ] HTTPS enforced in production.
- [x] Security headers present on all API responses.
- [x] CORS restricted to known origins.
