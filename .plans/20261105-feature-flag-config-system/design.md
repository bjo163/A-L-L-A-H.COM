---
contract: "DOCUMENTATION_CONTRACT.md"
id: "FEATURE-FLAG-CONFIG-SYSTEM-DESIGN"
version: "1.0.0"
owner: "architecture"
status: "proposed"
last_verified: "2026-11-05"
---

# Technical Design: Feature Flag & Configuration Management System

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Feature Flag Platform (ARSY Hub)               │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ REST API   │  │ GraphQL    │  │ WebSocket  │  │ Admin UI   │    │
│  │ (Admin)    │  │ (Client)   │  │ (Real-time)│  │ (Headquarter)│    │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Flag Store │  │ Config     │  │ A/B Engine │  │ Audit Log  │    │
│  │ (PGlite)   │  │ Store      │  │ (Stats)    │  │ (Append-only)│ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                    │
│  │ Event Bus  │  │ Cache (Redis/ │  │ Observability│              │
│  │ (ARSY)     │  │ In-memory)  │  │ (Metrics/Traces)│             │
│  └────────────┘  └────────────┘  └────────────┘                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌────────────────┐  ┌─────────────┐  ┌─────────────┐
│   Apps      │  │   SDK Client   │  │   Cache     │  │   SDK       │
│  (10 Apps)  │  │   Evaluation   │  │   (TTL)     │  │   Server    │
└─────────────┘  └────────────────┘  └─────────────┘  └─────────────┘
```

## Component Architecture

### 1. Feature Flag Service (ARSY Hub)
- **Location**: `apps/arsy/src/api/flags/*`
- **Technology**: Fastify 5.x, TypeScript, PGlite WASM ORM
- **Endpoints**:
  - `GET /v1/flags` - List flags with filtering
  - `GET /v1/flags/:id` - Get flag details
  - `POST /v1/flags` - Create flag
  - `PATCH /v1/flags/:id` - Update flag
  - `DELETE /v1/flags/:id` - Delete flag
  - `POST /v1/flags/:id/toggle` - Toggle flag state
  - `GET /v1/flags/evaluate` - Batch evaluation endpoint (POST with context)
  - `GET /v1/config` - List configuration values
  - `POST /v1/config` - Create/update configuration
  - `GET /v1/experiments` - List A/B experiments
  - `POST /v1/experiments` - Create experiment
  - `GET /v1/audit` - Audit log query
  - `WS /v1/flags/stream` - Real-time flag updates

### 2. SDK Packages
- **`@allah/feature-flag-client`** - Client-side evaluation (React, Next.js)
- **`@allah/feature-flag-server`** - Server-side evaluation (Fastify, Node.js)
- **Shared**: `@allah/feature-flag-core` - Core logic, types, targeting

### 3. Data Models

#### Flag Entity
```typescript
interface Flag {
  id: string; // uuid
  key: string; // unique identifier (e.g., "new-ui-dashboard")
  name: string; // human-readable name
  description: string;
  enabled: boolean;
  type: 'boolean' | 'string' | 'number' | 'json' | 'array' | 'enum';
  defaultValue: any; // typed default
  rules: TargetingRule[]; // ordered array
  variants: Variant[]; // for A/B testing
  tags: string[]; // categorization
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // user ID
  updatedBy: string; // user ID
  version: number; // optimistic locking
  environment: 'development' | 'staging' | 'production';
}
```

#### Targeting Rule
```typescript
interface TargetingRule {
  id: string;
  name: string;
  enabled: boolean;
  // Targeting conditions (AND logic)
  userIds?: string[]; // specific users
  userSegments?: string[]; // segment names
  percentageRollout?: number; // 0-100
  geo?: { countries: string[]; regions: string[] };
  device?: { types: string[]; os: string[]; browsers: string[] };
  tenantId?: string; // company_id
  customAttributes?: Record<string, any>; // key-value pairs
  // Result
  value: any; // flag value when rule matches
  description: string;
}
```

#### Variant (A/B Testing)
```typescript
interface Variant {
  id: string;
  name: string;
  description: string;
  value: any; // flag value for this variant
  trafficAllocation: number; // percentage (0-100)
  isControl: boolean; // baseline variant
}
```

#### Configuration Entity
```typescript
interface Config {
  key: string; // hierarchical key (e.g., "ai.model.timeout")
  value: any; // typed value
  type: string;
  description: string;
  environment: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

### 4. SDK Client Architecture

#### Client-Side (React/Next.js)
```typescript
// useFeatureFlag hook
function useFeatureFlag<T>(key: string, defaultValue: T, options?: {
  userContext?: UserContext;
  onChange?: (value: T) => void;
}): {
  value: T;
  loading: boolean;
  error: Error | null;
  isEnabled: boolean;
}
```

#### Server-Side (Fastify/Node.js)
```typescript
// Flag evaluation context
interface FlagContext {
  userId?: string;
  tenantId?: string; // company_id
  userSegments?: string[];
  geo?: { country?: string; region?: string };
  device?: { type?: string; os?: string; browser?: string };
  customAttributes?: Record<string, any>;
  timestamp?: Date;
}

// Evaluation function
function evaluateFlag(
  flagKey: string,
  context: FlagContext,
  defaultValue: any
): {
  value: any;
  flagKey: string;
  ruleMatched: TargetingRule | null;
  variant: Variant | null;
  source: 'cache' | 'service' | 'default';
}
```

### 5. Data Flow

#### Flag Creation/Update Flow
```
Admin UI → REST API → Flag Service → PGlite → Event Bus →
WebSocket Stream → SDK Clients (real-time) + Cache Invalidation
```

#### Flag Evaluation Flow (Client)
```
Component → useFeatureFlag Hook → SDK Client →
1. Check Local Cache (TTL) → 2. Evaluate against Rules →
3. Return Value → Component renders
```

#### Flag Evaluation Flow (Server)
```
Request → Middleware → SDK Server →
1. Check Server Cache (TTL) → 2. Evaluate against Rules →
3. Return Value → Handler logic
```

#### Real-time Updates
```
Flag Change → Event Bus → WebSocket → SDK Clients →
Cache Invalidate → Next Evaluation Fresh
```

### 6. Targeting Engine

#### Rule Evaluation Order
1. **User ID Matching** - Specific users (highest priority)
2. **User Segments** - Predefined segments
3. **Percentage Rollout** - Hash-based consistent bucketing
4. **Geo Targeting** - Country/region matching
5. **Device Targeting** - Type/OS/browser detection
6. **Tenant Targeting** - company_id matching
7. **Custom Attributes** - Key-value pair matching
8. **Default Value** - Fallback if no rules match

#### Bucketing Algorithm
```typescript
function getBucket(userId: string, flagKey: string, total: number): number {
  const hash = sha256(`${flagKey}:${userId}`);
  return parseInt(hash.slice(0, 8), 16) % total;
}
```

### 7. A/B Testing Framework

#### Experiment Lifecycle
1. **Create** - Define variants, traffic allocation, hypothesis
2. **Start** - Begin traffic allocation
3. **Monitor** - Collect metrics, calculate significance
4. **Stop** - Declare winner, roll out to 100%
5. **Archive** - Historical record

#### Statistical Significance
- **Bayesian A/B Testing** - More intuitive than frequentist
- **Minimum Detectable Effect (MDE)**: 5%
- **Statistical Power**: 80%
- **Significance Level**: 95%
- **Metrics**: Conversion rate, engagement, error rates, latency

#### Variant Allocation
```typescript
function allocateVariant(
  userId: string,
  experimentId: string,
  variants: Variant[]
): Variant {
  const bucket = getBucket(userId, experimentId, 100);
  let cumulative = 0;
  for (const variant of variants) {
    cumulative += variant.trafficAllocation;
    if (bucket < cumulative) return variant;
  }
  return variants[variants.length - 1];
}
```

### 8. Observability Integration

#### Metrics
- `flag_evaluation_total{flag, result, source}`
- `flag_evaluation_duration_ms{flag, source}`
- `flag_change_total{flag, actor, environment}`
- `experiment_impression_total{experiment, variant}`
- `experiment_conversion_total{experiment, variant, metric}`

#### Traces
- Span: `flag.evaluate` with attributes `flag.key`, `rule.matched`, `variant.id`
- Context propagation across service boundaries

#### Logs
- Structured JSON logs for audit trail
- PII filtering (no user IDs in logs, only hashed IDs)

### 9. Offline Fallback Strategy

#### Client-Side Cache
- **In-memory**: 5-minute TTL
- **LocalStorage**: 1-hour TTL (persistent across reloads)
- **IndexedDB**: 24-hour TTL (service worker)

#### Server-Side Cache
- **In-memory**: 1-minute TTL
- **Redis (optional)**: 5-minute TTL for multi-instance

#### Degraded Mode
- When service unreachable: use cached values
- When cache expired: use default values
- Log warning metrics for degraded mode usage

### 10. Security Architecture

#### Authentication
- Reuses existing `@allah/sdk` and SSO
- JWT tokens for API access
- Role-based access control (RBAC)

#### Authorization
- **Admin**: Full CRUD on all flags
- **Developer**: Read + Create/Update own flags
- **Viewer**: Read only
- **Audit**: Read audit logs only

#### Secrets Protection
- Configuration values never contain secrets
- Secrets managed via existing secret management (Vault/KMS)
- Configuration references secret IDs only

#### Data Privacy
- Audit logs store hashed user IDs, not raw IDs
- No PII in metrics or traces
- GDPR-compliant data retention (configurable)

### 11. Integration Points

#### Cross-app SSO / Identity Federation
- Uses existing user context for targeting
- User segments derived from tenant/role membership
- Flag evaluation includes user context from SSO

#### Observability Telemetry Infrastructure
- Pushes metrics to observability stack
- Traces flag evaluations in distributed traces
- Dashboards for flag usage and experiment results

#### SDK Enhancement
- `@allah/sdk` imports feature flag client
- Automatic user context propagation
- Type-safe flag evaluation

#### Narrative CMS
- Content publishing flags for gradual rollout
- Feature flag for CMS activation

#### ISP Billing / Harbor
- Feature flags for payment gateway integration
- Billing plan feature flags

### 12. Error Handling & Resilience

#### Service Unavailable
- SDK falls back to cached values
- Cache miss falls back to default values
- Circuit breaker prevents cascade failures

#### Cache Corruption
- Cache validation on startup
- Automatic cache rebuild from service

#### Database Corruption
- PGlite WASM built-in integrity checks
- Backup/restore procedures

#### Network Partitions
- Eventual consistency with conflict resolution
- Last-write-wins for flags (version-based)
- Audit trail preserved

## UI/UX Design

### Admin Interface (Headquarter)
- **Flag List**: Table with status, type, environment, tags
- **Flag Detail**: Form with targeting rules editor, variant management
- **Targeting Builder**: Visual rule builder (drag-and-drop)
- **A/B Test Dashboard**: Experiment list, metrics, significance
- **Audit Log**: Filterable log with diff view
- **Environment Toggle**: Dev/Staging/Prod switching

### In-App Usage
- **Debug Mode**: Override flags locally (dev only)
- **Flag Inspector**: DevTools panel showing active flags
- **Feature Flag Component**: `<FeatureFlag flagKey="key" default={false}>`

## Performance Optimizations

### Caching Strategy
- **L1**: In-memory cache (per process)
- **L2**: Shared cache (Redis) for multi-instance
- **L3**: LocalStorage/IndexedDB (client)
- TTL: 1-5 minutes for flags, 1 hour for configuration

### Evaluation Optimization
- Pre-compiled rule functions
- Bucketing cache for user/flag pairs
- Lazy loading of variant data
- Batch evaluation endpoint for multiple flags

### Database Optimization
- Indexes on `key`, `environment`, `enabled`, `updatedAt`
- Partitioning by environment
- Read replicas for evaluation queries

## Security Considerations

### Threat Model
1. **Unauthorized Flag Changes** → RBAC + Audit
2. **Flag Value Leakage** → PII filtering, no secrets in flags
3. **Cache Poisoning** → Cache validation, versioning
4. **Denial of Service** → Rate limiting, circuit breakers
5. **Targeting Bypass** → Server-side evaluation, client validation

### Mitigations
- Input validation on all API endpoints
- Role-based access control
- Rate limiting per user/IP
- Cache TTL enforcement
- Audit logging for all changes
- HTTPS everywhere

## Failure Scenarios

### 1. Flag Service Down
- **Impact**: New flags not available, cached flags still work
- **Recovery**: Automatic retry, circuit breaker open
- **User Experience**: Degraded but functional

### 2. Database Corruption
- **Impact**: Flag data loss
- **Recovery**: Backup restore, audit log replay
- **User Experience**: Default values used

### 3. Cache Storm
- **Impact**: Cache stampede on expiry
- **Recovery**: Stale-while-revalidate, probabilistic early expiry

### 4. Targeting Engine Bug
- **Impact**: Wrong user gets wrong variant
- **Recovery**: Audit trail identifies issue, rollback flag
- **User Experience**: Metrics show anomaly, investigation triggered

## Implementation Constraints

### MoonWitness Invariants
- Tenant isolation via `company_id` on all rows
- No raw SQL queries
- Parameterized values only
- Append-only audit events
- Default-deny authentication
- `PALETTE_PURITY`, `STYLE_PURITY`, `UI_PURITY`

### Technology Constraints
- Node.js 16+ / Bun compatibility
- Fastify 5.x
- TypeScript 5.x
- PGlite WASM ORM
- No external dependencies beyond existing stack
- Docker/Coolify deployment compatible

### Compatibility
- Backward compatible with existing `@allah/sdk`
- No breaking changes to existing apps
- Migration path for existing flag implementations