# Design: Authentication & Authorization System Enhancement

## Architecture

### Better Auth Configuration & Validation
```
app/src/config/better-auth.ts
  ├── validates BETTER_AUTH_URL (must be public HTTPS URL)
  ├── validates BETTER_AUTH_SECRET (min 32 characters)
  ├── validates CORS_ORIGINS (array of trusted origins)
  ├── fails startup if any required env var missing (NFR-6)
  └── exports configured Better Auth instance for all apps
```

### Onboarding Flow
```
first-run-onboarding/
  ├── creates initial superuser via Better Auth /auth/signup
  ├── stores credentials as HttpOnly cookies (never seeded password)
  ├── records create_uid/write_uid to res.users via @allah/arsy-orm
  ├── redirects to dashboard on completion
  └── subsequent runs skip onboarding (user authenticated)
```

### Global Admin Routes
```
api/v1/admin/*
  ├── requires verified principal (superuser)
  ├── requires non-zero company_id (target tenant)
  ├── requires explicit reason parameter
  ├── records audit event in same transaction:
  │   • reason_hash (sha256 of reason)
  │   • actor (superuser ID)
  │   • target (company_id)
  │   • request_id (UUID v4)
  │   • operation (e.g., "tenant_suspend", "user_promote")
  │   • changed_field_names (array, no before/after values)
  └── fail-closed if principal not superuser or company_id zero
```

### company_id Enforcement Middleware
```
storage/middleware/company-id.ts
  ├── extracts principal from auth context
  ├── derives company_id from principal (fail-closed: defaults to personal tenant or denies)
  ├── validates company_id on every storage operation
  ├── integrates with @allah/arsy-orm query builder
  └── rejected requests logged with audit event
```

### Credential Backfill Migration
```
scripts/migrate-credentials.ts
  ├── reads existing user database with password hashes
  ├── creates Better Auth credential accounts per user
  ├── stores new accounts with HttpOnly cookie sessions
  ├── preserves existing user IDs and data
  ├── rehearsal mode against restorable data copy (REQUIRED before production)
  └── idempotent: re-running skips already-migrated users
```

### Data Models Enhancement
```
res.users (augmented)
  ├── id: string (PK)
  ├── email: string (unique)
  ├── password_hash: string (salted hash)
  ├── company_id: string | null (derived from principal, fail-closed)
  ├── create_uid: string (FK to res.users - creator)
  ├── write_uid: string (FK to res.users - last writer)
  ├── audit_events: append-only events (changed field names only)
  ├── role: "superuser" | "user" | "tenant_admin"
  ├── verified: boolean (email verification status)
  └── retention_until: string | null (fail-closed on legal_hold)
```

## Component & Module Structure

### Packages Modified
- **`packages/arsy-plugin-auth/`** - Better Auth plugin enhancements
  - New config validation module
  - Onboarding flow endpoints
  - Global admin route handlers
  - company_id middleware

- **`packages/sdk/`** - SDK auth methods
  - `mwClient.auth.onboard()` - onboarding flow
  - `mwClient.admin.gate()` - global admin access
  - `mwClient.tenant.isolate()` - company_id derivation

- **`apps/id/`** - Next.js auth center
  - Enhanced onboarding page and API routes
  - Global admin dashboard
  - Tenant isolation settings

- **`apps/headquarter/`** - Command center
  - Superuser admin panel
  - Audit event viewer
  - Tenant management

### New Files & Directories
```
packages/arsy-plugin-auth/src/
  ├── config.ts          # Better Auth validation
  ├── onboarding.ts      # Onboarding flow
  ├── admin/
  │   └── routes.ts      # Global admin routes
  └── middleware/
      └── company-id.ts  # company_id enforcement

scripts/
  └── migrate-credentials.ts  # Credential backfill migration

apps/id/src/app/api/auth/
  ├── onboarding/route.ts       # Onboarding API
  └── admin/route.ts            # Global admin API

apps/headquarter/src/app/api/admin/
  └── tenants/route.ts          # Tenant management API
```

## Data Flow & System Interactions

### Onboarding Flow
```
User → /api/auth/better/onboarding → Better Auth signup →
create_uid/write_uid recorded in @allah/arsy-orm →
HttpOnly session cookie set →
Redirect to /dashboard → Session verified on each request
```

### Global Admin Access
```
Superuser → POST /api/v1/admin/tenants/:companyId {reason} →
Verify principal is superuser →
Validate company_id non-zero →
Record audit event (reason_hash, actor, target, request_id, operation, changed_fields) →
Execute operation →
Return success/failure
```

### Credential Backfill
```
Operations → run scripts/migrate-credentials.ts →
Read existing users → For each user:
  → Create Better Auth credential account →
  → Store with HttpOnly cookie →
  → Update res.users with new account link →
  → Audit event recorded →
  → Return migration report
```

### company_id Enforcement
```
Authenticated Request →
Extract principal from session →
Derive company_id →
Validate against storage query →
Fail-closed: if invalid, deny with 403 →
Proceed with company-scoped data
```

## Integration Architecture

### @allah/arsy Integration
- Onboarding creates initial superuser via ARSY Hub at `/api/auth/better/onboarding`
- Global admin routes go through ARSY at `/api/v1/admin/*`
- All user writes record `create_uid`/`write_uid` to `res.users`
- Audit events appended atomically in same transaction

### @moonwitness/ui Integration
- Onboarding uses design-system components (SkinRoot, Icon, Button, Form)
- Global admin dashboard uses composition blocks (Section Heading, Status Message, Destination Card)
- All new JSX follows STYLE_PURITY and PALETTE_PURITY invariants
- Skin tokens from `packages/ui/src/theme.css` provide coloring

### @moonwitness/types Integration
- Auth types extended in `@moonwitness/types`:
  - `AuthContext` with `company_id`, `role`, `tenant`
  - `BetterAuthConfig` validation schema
  - `AuditEvent` type with reason_hash, actor, target, etc.
- All packages import from single source of truth

### @allah/sdk Integration
- SDK methods for onboarding and admin access
- Cross-app session handling via existing SDK patterns
- Device pairing and mission persistence unchanged

## Error Handling & Failure Scenarios

### Startup Failures
| Scenario | Error | Behavior |
|----------|-------|----------|
| Missing BETTER_AUTH_SECRET | `AuthConfigError` | Startup aborted, clear error message |
| Missing BETTER_AUTH_URL | `AuthConfigError` | Startup aborted, clear error message |
| Missing CORS_ORIGINS | `AuthConfigError` | Startup aborted, clear error message |
| Non-superuser access to /admin | `AuthzError` | 403 Forbidden, audit event recorded |
| Missing company_id in storage | `IsolationError` | 403 Forbidden, request denied |
| Migration rehearsal fails | `MigrationError` | Block production deployment |

### Runtime Errors
- Invalid JWT → 401, re-authenticate
- Session expired → 401, refresh or re-authenticate
- DB connection lost → graceful degradation, health check
- Audit event write failure → retry with exponential backoff, alert ops

## Security & Performance Considerations

### Security
- **Default-deny**: Every hub route needs verified principal
- **Explicit public allowlist**: `/health`, `/ready`, onboarding, non-prod `/docs`
- **Superuser access**: Server-authorized per admin route, requires reason, records target tenant
- **company_id fail-closed**: Derived from principal, never from request body
- **No raw SQL**: Parameterized queries only via @allah/arsy-orm
- **No hardcoded secrets**: BETTER_AUTH_SECRET from env, never in source
- **Audit trail**: Every insert/update/delete writes append-only event with field names (no values)

### Performance
- Configuration validation at startup (O(1), fails fast)
- company_id derivation from principal (O(1) lookup)
- Audit events: minimal overhead (field names only, no before/after values)
- Onboarding: single user creation, no persistent performance impact
- Global admin: single audit event per operation, bounded frequency

## Observability Strategy

### Logs
- Auth startup configuration validation (success/failure)
- Onboarding flow events (start, complete, skip)
- Global admin actions (who, what, when, reason hash)
- Authentication events (login, logout, session refresh)
- Migration events (start, complete, skip, rollback)

### Metrics
- `auth_startup_success` - boolean, startup passed validation
- `auth_onboarding_completed` - count of successful onboardings
- `auth_global_admin_actions` - count of admin operations by type
- `auth_failed_authentications` - count by failure reason
- `auth_migration_runs` - count of migration script runs

### Traces
- Full request trace for global admin operations
- Onboarding flow trace with timing
- Migration script execution trace

### Error Reporting
- Sentry/DSN integration for auth-related errors
- Custom error boundaries in Next.js apps
- Audit event failure alerts to ops channel

## Technical Decisions & Alternatives

### Decision: Better Auth v1.7.16 over v2.0
**Why**: Current monorepo depends on `@better-auth/core@1.7.16`; upgrading requires reviewing all adapter integrations and could introduce breaking changes.

**Alternative considered**: Upgrade to Better Auth v2.x for improved features; rejected due to migration cost and risk to existing integrations.

### Decision: company_id derived from principal, not request body
**Why**: Preserves fail-closed tenant isolation per AGENTS.md invariants. Request-body-derived company_id would allow spoofing.

**Alternative considered**: Allow request-body company_id with validation; rejected because violates fail-closed principle and creates spoofing risk.

### Decision: Audit events store changed field names, not before/after values
**Why**: Per AGENTS.md audit invariant; prevents data leakage and keeps events lightweight.

**Alternative considered**: Store before/after values; rejected because violates documented invariant and creates privacy concerns.

### Decision: Fail-closed on missing company_id
**Why**: Per AGENTS.md tenant invariant; ensures no data leaks across tenant boundaries.

**Alternative considered**: Default company_id to null or "global"; rejected because violates multi-tenant isolation requirement.

### Decision: Onboarding creates superuser without seeded password
**Why**: Per AGENTS.md auth invariant; no default credentials in production.

**Alternative considered**: Seed default superuser password; rejected because violates security-by-design principle.

## API Contracts & Interfaces

### Better Auth Config Validation
```typescript
interface BetterAuthConfig {
  baseUrl: string;          // Must be public HTTPS URL
  secret: string;           // Min 32 characters
  corsOrigins: string[];    // Trusted browser origins
}
```

### Onboarding API
```
POST /api/auth/better/onboarding
Body: { email: string, password: string }
Returns: { success: true, userId: string, sessionToken: string }
Errors: 400 validation, 409 conflict, 500 server error
```

### Global Admin API
```
POST /api/v1/admin/tenants/:companyId
Headers: Authorization: Bearer <token>
Body: { reason: string }
Returns: { success: true, auditEventId: string }
Errors: 401 unauthenticated, 403 not superuser, 400 missing company_id/reason, 500 server error
```

### Credential Migration Script
```
CLI: pnpm run migrate:credentials --rehearsal
Options: --rehearsal (required, runs against copy, blocks production without)
Returns: MigrationReport { total: number, migrated: number, failed: number, errors: string[] }
```

### SDK Methods
```typescript
// Onboarding
mwClient.auth.onboard({ email, password }): Promise<OnboardingResult>

// Global Admin
mwClient.admin.gate({ companyId, reason }): Promise<AdminResult>

// Tenant Isolation
mwClient.tenant.getCompanyId(): Promise<string | null>
```