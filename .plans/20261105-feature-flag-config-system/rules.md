# Rules: Feature Flag & Configuration Management System

## R1 — Security Rules
- All flag evaluation endpoints MUST be default-deny; only explicit public allowlist (`/health`, `/ready`) is anonymous
- Flag mutation endpoints (create, update, delete, promote) MUST require a verified authenticated principal
- Flag mutation endpoints MUST require elevated role: `superuser`, `admin`, or explicit per-flag RBAC grant
- No flag evaluation or audit log MAY include PII (user email, phone, IP, raw session data)
- Flag values that reference secrets MUST be stored as references, never inline plaintext values
- RBAC MUST be enforced server-side; client-side checks are display-only and never trusted

## R2 — Tenant Isolation Rules
- Every flag, experiment, targeting rule, and audit event row MUST include `company_id`
- `company_id` MUST be derived from the authenticated principal, never from the request body
- Fail-closed: if `company_id` cannot be derived from the principal, the operation MUST be rejected
- Cross-tenant flag reads MUST be denied unless the caller has an explicit global admin grant with a recorded reason
- Global admin flag operations MUST require a non-zero `company_id` target and a recorded reason
- Generic CRUD endpoints MUST NOT expose flag, targeting, or audit models cross-tenant

## R3 — Audit Trail Rules
- Every flag/configuration/experiment change MUST write one append-only audit event in the same transaction
- Audit events MUST store changed field names, not changed values (preserves MoonWitness Audit invariant)
- Audit events MUST record: actor id, target company_id, request id, operation, changed field names, timestamp
- Audit events MUST NOT be mutable or deletable by any application role
- Audit log retention MUST comply with GDPR: configurable retention window, purge on request

## R4 — SSRF and Network Rules
- Flag evaluation client MUST NOT accept arbitrary base URLs from request input without validation
- Any base URL used for flag service discovery MUST be validated to reject private/loopback/link-local addresses
- Reject: 10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12, 127.0.0.1, ::1, fe80::/10, localhost
- Validate `base_url` before the request and re-check the resolved IP after DNS resolution

## R5 — Offline and Consistency Rules
- Flag evaluation MUST use a local cache with TTL; if flag service is unreachable, cached values are served
- Cache MUST fail-closed: unknown flags with no cached value evaluate to the configured default
- Flag evaluation MUST be eventually consistent across all app instances
- Cache TTL MUST be configurable per flag; default TTL MUST be bounded (<= 5 minutes)
- Flag evaluation MUST NOT throw when the flag service is unreachable; it MUST return the cached/default value

## R6 — Quality and Verification Rules
- All feature-flag TypeScript MUST pass strict typecheck with zero errors
- All feature-flag code MUST pass `pnpm lint:arch` with zero violations
- All feature-flag code MUST pass `pnpm lint` with zero ESLint errors
- All feature-flag code MUST pass `pnpm docs:check` at 100/100
- No new raw HTML elements (`<button>`, `<input>`, `<a>`, `<select>`, `<textarea>`, `<form>`) in app JSX
- All new code MUST use `@moonwitness/ui` component patterns and skin token usage
- Flag evaluation MUST complete in under 10ms for cached evaluations
- No database schema change MAY introduce downtime; all changes MUST be idempotent and backward-compatible