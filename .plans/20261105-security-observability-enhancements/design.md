# Design: Security & Observability Enhancements

## High-Level Architecture

The architecture introduces three new shared layers integrated with the existing MoonWitness ecosystem:

### 1. Audit Log Service Layer
- **Location**: `packages/lint/src/audit-service.ts` (new) + `packages/arsy-orm` integration
- **Pattern**: Append-only event storage with SHA-256 content addressing
- **Storage**: `data/storage/<digest>` per the content-addressed storage contract
- **Event Schema**: `{ id, timestamp, tenant_id, actor, action, resource_type, resource_id, changed_fields, old_values_hash, new_values_hash, ip_address, user_agent }`
- **Transaction**: Every model insert/update/delete writes one append-only event in the same transaction

### 2. Tenant Isolation Middleware Layer
- **Location**: `packages/lint/src/tenant-middleware.ts` (new)
- **Pattern**: Middleware that runs before every route handler
- **Resolution**: `company_id` derived from authenticated principal, never from request body
- **Fail-Closed**: Reject operations on `legal_hold` / `retention_until` tenants
- **Allowlist**: Explicit public routes (`/health`, `/ready`, onboarding, non-prod `/docs`)

### 3. Observability Pipeline Layer
- **Location**: `packages/lint/src/observability.ts` (new)
- **Pattern**: Structured logging, request ID propagation, metrics emission
- **Logging**: JSON format with correlated fields (request_id, tenant_id, span_id, trace_id)
- **Metrics**: Prometheus-compatible counters for requests, errors, security events
- **Tracing**: OpenTelemetry-compatible request spans with baggage propagation

### Integration Points
- **DNA Skin Engine**: Security and observability UX uses `@moonwitness/ui` composition blocks
  - `route-shell.tsx` for security error pages
  - `state-panel.tsx` for audit event browsing
  - `destination-card.tsx` for summary views
  - `section-heading.tsx` for section headers
- **ARSY-ORM**: Audit events stored alongside ORM operations via PGlite
- **All apps**: Security middleware applied at the hub route level; observability configured per app

## Component & Module Structure

### New Packages/Modules
- `packages/lint/src/audit-service.ts` - Audit logging service
- `packages/lint/src/tenant-middleware.ts` - Tenant isolation middleware
- `packages/lint/src/observability.ts` - Observability pipeline

### Modified Packages
- `packages/arsy-orm` - Extended to automatically write audit events on model lifecycle
- `packages/ui/src/blocks/` - Existing composition blocks used for security UX
- `packages/types` - Updated type definitions for audit events and tenant contexts

### Package Boundaries & Responsibilities
- **`@moonwitness/lint`**: Architecture invariants, audit service, tenant middleware, observability pipeline
- **`@allah/arsy-orm`**: ORM operations + automatic audit event injection
- **`@moonwitness/ui`**: UI composition blocks for security/observability views
- **App packages**: Apply middleware and configure observability; no internal logic changes

## Data Models & Relationships

### Audit Event Model
```typescript
interface AuditEvent {
  id: string;                          // SHA-256 digest
  timestamp: string;                   // ISO 8601
  tenant_id: string;                   // Derived from principal
  actor: string;                       // User/service identity
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  resource_type: string;               // e.g., 'service', 'environment', 'key'
  resource_id: string;                 // ORM record ID
  changed_fields: string[];            // Field names that changed (not values)
  old_values_hash: string;             // SHA-256 of previous state (empty for CREATE)
  new_values_hash: string;             // SHA-256 of current state
  ip_address: string;                  // Client or request source
  user_agent: string;                  // Browser/service identifier
}
```

### Tenant Context Model
```typescript
interface TenantContext {
  company_id: string;                  // Derived from authenticated principal
  legal_hold: boolean;                  // Fail-closed rejection flag
  retention_until: string | null;      // Fail-closed rejection flag
  approved_roles: string[];            // Allowed operations for this tenant
}
```

## API Contracts & Interfaces

### Audit Service API
```typescript
// Log a model lifecycle event
auditService.log({
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  resourceType: string,
  resourceId: string,
  changedFields: string[],
  oldValues?: Record<string, unknown>,
  newValues?: Record<string, unknown>,
  actor: string;
})

// Get audit events with filtering
auditService.getEvents({
  tenantId?: string,
  action?: string,
  resourceType?: string,
  startDate?: string,
  endDate?: string,
  limit?: number,
  offset?: number;
})
```

### Tenant Middleware API
```typescript
// Use in route handlers
const tenant = requireTenant();  // Returns TenantContext, throws if fail-closed
const isPublic = isPublicRoute();  // Checks allowlist
```

### Observability API
```typescript
// Start a traced request
observability.startRequest({ path, method, tenantId });

// Log an event within the request
observability.log({ level, message, correlationId });

// Emit a metric
observability.metric({ name, value, labels });

// End the request span
observability.endRequest({ success, error });
```

## Data Flow & System Interactions

### Model Lifecycle → Audit Event Flow
1. User/Service initiates model operation (INSERT/UPDATE/DELETE)
2. `arsy-orm` transaction begins
3. Operation executes on PGlite
4. If successful, `auditService.log()` is called with:
   - Action type
   - Resource type/id
   - Changed field names (not values)
   - Old and new value hashes
   - Tenant context (from principal)
   - Actor identity
5. Audit event stored in `data/storage/<digest>` (append-only)
6. Transaction commits (including audit event)
7. Observability pipeline records the event via `observability.log()`

### Request Flow → Security + Observability
1. Incoming request hits hub route
2. `tenant-middleware` runs first:
   - Derives `company_id` from authenticated principal
   - Checks `legal_hold` / `retention_until` - rejects if set
   - Validates route is in public allowlist if anonymous
3. `observability.startRequest()` begins span
4. Route handler executes
5. `observability.endRequest()` finishes span with success/error status
6. Response sent with security headers and observability data attached

### Error Flow
1. Any error during above flows triggers `observability.log({ level: 'error', ... })`
2. Error boundary renders DNA-appropriate error page (using `@moonwitness/ui` StatePanel)
3. Audit event with `action: 'ERROR'` is logged if operation partially completed
4. Fail-closed tenant checks ensure no data leakage on errors

## UI/UX Flows & Design Specifications

### Security Error Pages
- Built from `StatePanel` (`STATE_PARITY` invariant)
- Uses DNA-appropriate skin tokens from `packages/ui/src/theme.css`
- Consistent across all seven worlds (Imperium Lumen, Nexus Paradox, etc.)
- Shows generic error message; detailed logging internal only

### Audit View Component Tree
```
RouteShell
  └─ Kicker (optional)
  └─ SectionHeading ("Audit Log")
  └─ DestinationCard (summary statistics)
  └─ StatePanel (audit event browser with filtering)
      ├─ EmptyState (no events yet)
      ├─ LoadingState (fetching events)
      └─ ErrorState (fetch failed)
          └─ FilterControls (tenant, action, date range)
```

### Observability Dashboard
- Minimalist design using `@moonwitness/ui` tokens
- Time-series graphs for request rate, error rate, security events
- Drill-down by tenant, IP, or action type
- Responsive: wide (desktop), medium (tablet), narrow (mobile), touch modes

## Integration Architecture

### Skin Integration
Each app declares a `SkinRoot`; security and observability views use:
- `SkinScope` for route-specific experiences without duplicate root worlds
- Token-driven utilities from `packages/ui/src/theme.css`
- Consistent component composition via `@moonwitness/ui`

### Cross-Application Consistency
- Security middleware: Same implementation in all apps
- Observability pipeline: Same configuration pattern across apps
- Audit service: Centralized shared service, not duplicated per app
- Tenant isolation: Derived from principal; same logic in all apps

### Error Handling & Failure Scenarios

#### Audit Service Failures
- **Database unavailable**: Cache miss; retry with exponential backoff; event lost but not leaked
- **Append-only violation**: Alert operator; halt non-critical operations until resolved
- **Performance degradation**: Batch events; reduce flush frequency; alert on latency threshold

#### Tenant Middleware Failures
- **Principal resolution failure**: Default-deny; route to `/ready` with authentication required
- **legal_hold edge case**: Log the edge case; require explicit admin override (recorded in audit)
- **Tenant context stale**: Refresh from principal; if still invalid, fail-closed

#### Observability Pipeline Failures
- **Logger unavailable**: Buffer events in memory; flush on recovery; do not block request
- **Metric emission failure**: Best-effort only; do not throw; internal alerting
- **Tracing propagation failure**: Continue without trace context; mark spans as incomplete

## Security & Performance Considerations

### Security
- **Secret redaction**: All `NEXT_PUBLIC_*` values carrying keys/secrets/tokens are stripped from logs
- **Tenant fail-closed**: `legal_hold` / `retention_until` always reject; never implicit allow
- **Default-deny auth**: Every hub route needs verified principal; explicit allowlist only
- **Content-addressed storage**: SHA-256 digests prevent tampering; events are immutable
- **No cross-skin state leakage**: Each skin's security UX is independent; no shared state

### Performance
- **Security middleware**: < 5ms overhead per request (middleware only, no DB calls)
- **Audit event writing**: Within same transaction as ORM operation; no additional round-trips
- **Observability logging**: JSON format; batched flush every 1s or 100 events; async
- **Metric emission**: Non-blocking; in-process counters with periodic export
- **Content-addressed storage**: SHA-256 computation only; no external service dependencies

## Observability Strategy

### Logging
- Structured JSON logs with correlation IDs
- Fields: `timestamp, level, message, request_id, tenant_id, span_id, trace_id, action, result`
- Output: Centralized log aggregator (ELK, Loki, or similar)
- Redaction: Automated stripping of secret-carrying environment variables

### Metrics (Prometheus-Compatible)
- `moonwitness_requests_total`: Total requests by method, path, status code
- `moonwitness_request_duration_seconds`: Request latency histogram
- `moonwitness_audit_events_total`: Audit events by action, resource_type, result
- `moonwitness_tenant_violations_total`: Tenant isolation violations (legal_hold, etc.)
- `moonwitness_security_errors_total`: Security middleware errors

### Tracing
- OpenTelemetry-compatible request spans
- Baggage: `tenant_id`, `actor_id`, `correlation_id`
- Propagation: W3C Trace Context (traceparent header)
- Sampling: Probabilistic 10% for high-volume routes, 100% for security-sensitive routes

## Technical Decisions & Alternatives Considered

### Decision: Shared audit service vs. per-app logging
**Chosen**: Shared service in `@moonwitness/lint` with arsy-orm integration
**Rejected**: Per-app logging (violates audit invariants, duplication risk)
**Rationale**: Single source of truth ensures consistency; arsy-orm integration makes audit automatic

### Decision: Tenant ID from principal vs. from request
**Chosen**: Derived from authenticated principal (fail-closed)
**Rejected**: From request body/query parameters (insecure, violates invariants)
**Rationale**: Invariants explicitly state `company_id` derived from principal, fail-closed

### Decision: Append-only event storage vs. mutable audit log
**Chosen**: Append-only in `data/storage/<digest>`
**Rejected**: Database table with UPDATE/DELETE operations
**Rationale**: Tamper-evident; aligns with content-addressed storage contract; simplifies recovery

### Decision: JSON logging vs. text-based logging
**Chosen**: JSON format with structured fields
**Rejected**: Free-form text logs
**Rationale**: Machine-parseable; enables metrics and tracing; standardized across ecosystem

### Decision: SHA-256 digest vs. UUID for audit event IDs
**Chosen**: SHA-256 content-addressed digest
**Rejected**: UUID v4
**Rationale**: Tamper-evident; content-addressed storage pattern; verifiable integrity