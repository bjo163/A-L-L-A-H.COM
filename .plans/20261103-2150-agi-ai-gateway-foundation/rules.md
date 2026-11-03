# RULES: AGI Platform & AI Gateway Foundation

## 1. System Invariants & Architectural Rules

### 1.1 Single Embedded Database & Zero ORM Overlap
- All AI Gateway configurations, virtual keys, models, and usage logs must be stored in the embedded PGlite instance using `@allah/arsy-orm`.
- No secondary ORMs (such as Drizzle, Prisma, or TypeORM) are permitted in any package.
- All database mutations must use parameterized SQL queries through `BaseRepository` or `dbEngine.query()`.

### 1.2 Tenant Isolation & Multi-Tenancy
- Every AI Virtual Key and usage log entry must be scoped to a valid tenant identifier (`partner_id` or `company_id`).
- Gateway requests must never expose logs, keys, or routing configuration belonging to other tenants.

### 1.3 Strict SSRF Guard & Upstream URL Validation
- Any upstream provider URL configured dynamically or in database records must be strictly validated before issuing requests.
- Forbidden targets include `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`, and private IP CIDRs (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
- If an invalid target is detected, the gateway must immediately reject the call with `SSRF_GUARD_REJECTION`.

### 1.4 Fail-Closed Retention & Budget Safeguards
- When a virtual key reaches 100% of its monthly budget limit in USD, the gateway must immediately fail closed and return HTTP 402 / 429 (`BUDGET_LIMIT_EXCEEDED`).
- In-flight requests must not be permitted to silently overspend allocated balances.

### 1.5 UI Integrity & Anti-Slop Guard
- Every interactive element in the Headquarter AI Gateway dashboard must import components from `@moonwitness/ui`.
- Ad-hoc styled raw buttons or un-themed inputs are strictly forbidden.
- Every state must be handled explicitly: Empty state, Loading state, and Error state.
- No fabricated data or placeholder statistics in production views.

### 1.6 Documentation & Git Integrity
- All code changes must strictly adhere to `DOCUMENTATION_CONTRACT.md`.
- `pnpm docs:check` must pass with 100/100 score before committing.
- All four build targets (`dock:build`, `headquarter:build`, `id:build`, `arsy:build`) must pass with zero errors.

