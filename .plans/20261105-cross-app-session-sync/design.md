# Design: Cross-Application Session & State Synchronization

## High-Level Architecture

The architecture introduces a centralized session and state management layer that sits atop the existing Better Auth and arsy-orm infrastructure. The core design consists of three main components:

### 1. `@allah/sdk` — Client-Side SDK Enhancement
Provides typed methods for session management, principal derivation, endpoint resolution, and user preference synchronization. All methods are designed to be SSR-safe and work across Node.js and browser environments.

**Package Responsibility**: `@allah/sdk` owns all client-facing session and state operations. It does not own the auth server — ARSY owns that. The SDK is purely a client utility.

**Module Structure**:
- `src/index.ts` — Main export barrel with all SDK methods
- `src/principal.ts` — `principal()` method and Principal type
- `src/endpoints.ts` — `resolveEcosystemEndpoints()` with SSRF validation
- `src/preferences.ts` — `setUserPreference()` and `getUserPreference()`
- `src/types.ts` — Shared type definitions used by SDK

**Key Interfaces**:
- `Principal` — Derived from arsy-core auth context, includes `userId`, `ormUserId`, `role`, `email`, `companyId`, `sessionId`
- `EcosystemEndpoints` — Validated URLs for all 7 apps with protocol, host, and path components
- `UserPreference` — Key-value store for user preferences (skin, language, layout)
- `SdkError` — Structured error type for all SDK operations

### 2. `@moonwitness/types` — Type Enhancements
Provides the type foundation that enables type-safe cross-app operations. All new types are designed to integrate with existing MoonWitness invariants.

**Package Responsibility**: `@moonwitness/types` owns all shared type contracts used across the monorepo. It is the single source of truth for types like `TenantId`, `SkinId`, `ApiResponse<T>`, and `SdkError`.

**Module Structure**:
- `src/index.ts` — Main export barrel with all new types
- `src/tenant.ts` — `TenantId` type and related utilities
- `src/skin.ts` — `SkinId` type and six approved skin definitions
- `src/api-response.ts` — `ApiResponse<T>` generic and `SdkError` union
- `src/index.test.ts` — Type tests verifying correct behavior

**Key Type Definitions**:
- `TenantId` — String type matching company_id pattern: negative values for personal tenants, positive for organizational, with type-level validation
- `SkinId` — Union type: `'moon' | 'sun' | 'star' | 'snow' | 'ocean' | 'lava'` corresponding to the six approved skin themes
- `ApiResponse<T>` — Generic type: `{ success: true, data: T } | { success: false, error: SdkError }`
- `SdkError` — Union: `'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'FORBIDDEN' | 'CONFLICT' | 'RATE_LIMITED'`

### 3. Cross-Application Session Propagation
Provides the mechanism for synchronizing authentication state and user preferences across all 7 applications.

**Architecture**:
- Session state is managed centrally by ARSY (Better Auth server)
- SDK subscribes to session state changes via JWT payload and session repository
- When a session is created, renewed, or revoked, SDK propagates the update to all running app instances
- User preferences are stored in a centralized location and synchronized via SDK
- Each app initializes its session state on startup by calling `sdk.principal()`

**Propagation Mechanism**:
- On app startup, each instance calls `sdk.principal()` to derive the authenticated principal
- SDK checks for existing session via JWT or session token
- If session exists, principal is populated and made available to the app
- User preferences are loaded from persistent storage (localStorage/server-side)
- Preference changes are propagated via SDK method calls
- Session revocation in one app triggers propagation to all others

**Data Flow**:
```
User authenticates in app A
    → ARSY creates session + better-auth adapter
    → SDK principal() derives authenticated principal
    → SDK propagates session state to SDK instances in apps B, C, D, E, F, G
    → User preference (skin) syncs across all apps
    → Consistent UI state across all app boundaries
```

## Component and Module Structure

### `@allah/sdk` Package

```
packages/sdk/src/
├── index.ts          # Main export barrel
├── principal.ts      # principal() method + Principal type
├── endpoints.ts      # resolveEcosystemEndpoints() + SSRF validation
├── preferences.ts    # setUserPreference() + getUserPreference()
├── types.ts          # SDK-internal types
└── index.test.ts     # SDK method tests
```

### `@moonwitness/types` Package

```
packages/types/src/
├── index.ts                  # Main export barrel
├── tenant.ts                 # TenantId type + utilities
├── skin.ts                   # SkinId type + 6 skin definitions
├── api-response.ts           # ApiResponse<T> + SdkError
├── index.test.ts             # Type tests
└── theme.ts                  # Skin token mappings (read-only)
```

### Affected Applications (7 apps)

Each app integrates the SDK on initialization:

```
apps/dock/src/         # Port 3001 - Next.js 16 + React 19 + Tailwind v4
apps/headquarter/src/  # Port 3002 - Next.js 16 + React 19 + Tailwind v4
apps/id/src/           # Port 3003 - Next.js 16 + React 19 + TypeScript + SSO
apps/jizz/src/         # Port 3004 - Next.js 16 + React 19 + Tailwind v4
apps/gate/src/         # Port 3000 - Sentinel RADIUS + UDP auth/accounting + HTTP health
apps/harbor/src/       # Port 3006 - Next.js 16 + React 19 + Tailwind v4 + E-ISP portal
apps/sentinel/src/     # Port 1812/1813/9181 - RADIUS daemon + HTTP health
```

**Integration Pattern (per app)**:
```typescript
// On module load / startup
import { sdk } from '@allah/sdk';
import { TenantId, SkinId } from '@moonwitness/types';

// Derive authenticated principal
const principal = sdk.principal();

// Resolve ecosystem endpoints with SSRF validation
const endpoints = sdk.resolveEcosystemEndpoints('https://example.com');

// Set user preference (e.g., skin selection)
await sdk.setUserPreference('skin', 'sun');

// Get user preference
const skin = await sdk.getUserPreference('skin');
```

## Data Models and Relationships

### Principal Interface
```typescript
interface Principal {
  userId: number;           // ARSY user identifier
  ormUserId: number;        // PGlite res.users identifier
  role: 'system' | 'superuser' | 'user';  // Auth role
  email: string;            // User email address
  companyId: number;        // Tenant identifier (negative = personal, positive = organizational)
  sessionId: string;        // Current session identifier
  via: 'jwt' | 'session';   // Authentication mechanism
}
```

### EcosystemEndpoints Interface
```typescript
interface EcosystemEndpoints {
  dock: string;       // https://dock.apps.local:3001
  headquarter: string;  // https://headquarter.apps.local:3002
  id: string;         // https://id.apps.local:3003
  jizz: string;       // https://jizz.apps.local:3004
  gate: string;       // https://gate.apps.local:3000
  harbor: string;     // https://harbor.apps.local:3006
  sentinel: string;   // wss://sentinel.apps.local:1812 (or appropriate protocol)
}
```

### UserPreference Interface
```typescript
type UserPreference = {
  skin: SkinId;              // Current skin theme preference
  language: string;          // Locale preference (e.g., 'en-US', 'ar-SA')
  layout: 'compact' | 'comfortable' | 'expanded';  // Layout preference
  [key: string]: any;        // Additional key-value preferences
};
```

### SdkError Union
```typescript
type SdkError =
  | 'NETWORK_ERROR'          // Network connectivity failure
  | 'VALIDATION_ERROR'       // Input validation failure
  | 'AUTH_ERROR'            // Authentication failure
  | 'NOT_FOUND'             // requested resource not found
  | 'UNAUTHORIZED'          // Missing or invalid auth credentials
  | 'FORBIDDEN'             // Insufficient permissions
  | 'CONFLICT'              // Operation conflicts with current state
  | 'RATE_LIMITED'          // Rate limit exceeded
;
```

## API Contracts and Interfaces

### `@allah/sdk` Public API

```typescript
export interface SdkOptions {
  baseUrl?: string;
  virtualKey?: string;
  sessionStore?: SessionTokenStore;
}

export interface SessionTokenStore {
  get(): Promise<string | null>;
  set(token: string): Promise<void>;
  clear(): Promise<void>;
}

export interface SwarmAgentMessage {
  id: string;
  from: SwarmRole;
  to: SwarmRole | 'supervisor' | 'all';
  role: SwarmRole;
  payload: Record<string, unknown>;
  timestamp: string;
  latency_ms?: number;
}

export interface SwarmStep {
  step: number;
  agent: SwarmRole;
  action: string;
  thought?: string;
  input?: Record<string, unknown>;
  output?: unknown;
  success: boolean;
  latency_ms?: number;
  timestamp: string;
}

export interface SwarmExecutionResult {
  success: boolean;
  mission_id: string;
  goal: string;
  summary: string;
  steps: SwarmStep[];
  messages: SwarmAgentMessage[];
  finish_reason: 'completed' | 'verifier_rejected' | 'max_turns' | 'human_intervention' | 'error';
  error?: string;
}

// NEW: Principal derivation from auth context
export function principal(): Principal;

// NEW: SSRF-safe ecosystem endpoint resolution
export function resolveEcosystemEndpoints(baseUrl: string): EcosystemEndpoints;

// NEW: User preference synchronization
export function setUserPreference(key: string, value: any): Promise<void>;
export function getUserPreference(key: string): Promise<any>;

// Existing methods (already defined)
export interface SdkOptions { ... }
export interface SessionTokenStore { ... }
export interface AgentPairingResult { ... }
export interface ClaimedAgentDevice { ... }
export type SwarmRole = 'planner' | 'researcher' | 'builder' | 'verifier';
export interface SwarmAgentMessage { ... }
export interface SwarmStep { ... }
export interface SwarmExecutionResult { ... }
export function isMcpTool(value: unknown): value is McpTool;
export interface SwarmAgentMessage { ... }
export interface SwarmStep { ... }
export interface SwarmExecutionResult { ... }
```

### `@moonwitness/types` Public API

```typescript
export type TenantId = string;  // company_id pattern with type validation

export type SkinId =
  | 'moon'
  | 'sun'
  | 'star'
  | 'snow'
  | 'ocean'
  | 'lava';

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: SdkError };

export type SdkError =
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMITED';

// Existing types (already defined)
export interface UserSubject { ... }
export interface ActiveSession { ... }
export interface AuthResponse { ... }
export type AgentMode = 'ask' | 'plan' | 'code' | 'debug' | 'ideate' | 'autopilot';
export type AgentSessionState = ...;
export type AgentToolName = ...;
export interface AgentToolPolicy { ... }
export interface PairedAgentDevice { ... }
export interface RemoteAgentMission { ... }
export interface AgentSessionEvent { ... }
export interface ChatMessage { ... }
export interface ChatCompletionRequest { ... }
export interface ChatCompletionResponse { ... }
export interface ChatCompletionChunk { ... }
export interface GatewayModelInfo { ... }
export interface GatewayTelemetry { ... }
export interface GatewayProviderInfo { ... }
export interface GatewayUsageLog { ... }
export interface SDUINode { ... }
export interface SDUIRoot { ... }
export interface StorageItem { ... }
```

## Data Flow and System Interactions

### Session Initialization Flow

```
1. App starts → imports @allah/sdk
2. sdk.principal() called on module load
3. principal() reads JWT payload or session token
4. JWT decoded using fastify-jwt secret
5. Session repository queried to validate session state
6. Principal object constructed if session valid
7. Principal stored in module-scoped variable for reuse
8. All app components access principal via sdk.principal()
9. User preferences loaded from persistent store
10. SDK ready for cross-app communication
```

### Preference Synchronization Flow

```
1. User selects skin in app A UI
2. UI calls sdk.setUserPreference('skin', 'sun')
3. SDK persists preference to server-side storage
4. SDK broadcasts preference update via internal mechanism
5. SDK instances in apps B-G call sdk.getUserPreference('skin')
6. Each app updates its local skin state
7. UI re-renders with new skin across all apps
8. Preference changes are idempotent and async
```

### Endpoint Resolution Flow

```
1. sdk.resolveEcosystemEndpoints('https://dock.example.com') called
2. Base URL parsed and validated
3. Host checked against private/loopback ranges:
   - 10.0.0.0/10
   - 192.168.0.0/16
   - 172.16.0.0/12
   - ::1 (loopback)
   - fe80::/10 (link-local)
   - localhost
4. If invalid → throws SdkError.NETWORK_ERROR with detail
5. If valid → returns EcosystemEndpoints with all 7 app URLs
6. URLs constructed using validated host + app-specific ports
7. Result cached for subsequent calls
```

## Integration Architecture

### SDK Initialization in Each App

Each app integrates the SDK at the module level:

```typescript
// apps/dock/src/lib/sdk-init.ts
import { sdk } from '@allah/sdk';
import { TenantId, SkinId } from '@moonwitness/types';

// Initialize on module load (no await needed for principal)
const principal = sdk.principal();

// Set up preference listeners
sdk.setUserPreference('skin', 'moon').catch(console.error);

// Expose SDK for use in components
export { sdk, TenantId, SkinId };
```

### Cross-App Session Propagation

The SDK uses a publish-subscribe mechanism for session propagation:

1. **Session Creation**: When a user authenticates, ARSY creates a session. The SDK's `principal()` method detects the new session and makes the principal available.

2. **Session Revocation**: When a session is revoked in one app, the SDK detects the change and updates the principal state across all apps.

3. **Preference Updates**: When `setUserPreference()` is called, the SDK persists the preference and broadcasts the change. Other apps call `getUserPreference()` to retrieve the updated value.

4. **Initialization Race Condition**: On first load, multiple apps may call `principal()` simultaneously. The SDK handles this with a module-scoped cache that ensures only one initialization request is made, and subsequent calls wait for the same result.

## Error Handling and Failure Scenarios

### Error Scenarios and Responses

| Scenario | Error Code | Response |
|----------|-----------|----------|
| Invalid JWT/session token | `UNAUTHORIZED` | `principal()` returns `null`; app shows unauthenticated UI |
| Private/loopback URL in `resolveEcosystemEndpoints()` | `NETWORK_ERROR` | Throws `SdkError.NETWORK_ERROR` with detail message |
| Preference key not found | Returns `undefined` | `getUserPreference()` returns `undefined`; app uses default |
| Preference storage failure | `VALIDATION_ERROR` | Operation fails silently; app uses local default |
| SDK called without initialization | `VALIDATION_ERROR` | Throws error indicating SDK must be initialized first |
| Network failure during preference sync | `NETWORK_ERROR` | Best-effort failure; app uses local cached preference |
| Invalid `SkinId` value | `VALIDATION_ERROR` | Type system prevents at compile time; runtime guard exists |

### Failure Recovery

- **Principal derivation failure**: App falls back to unauthenticated state; user re-authenticated via normal Better Auth flow
- **Endpoint resolution failure**: App uses hardcoded development defaults; production requires valid config
- **Preference sync failure**: App uses locally stored preference or default; sync retries on next SDK call
- **SDK not initialized**: All SDK methods throw clear error; developer experience improved with clear messages

## Security and Performance Considerations

### Security
- **SSRF validation**: `resolveEcosystemEndpoints()` rejects all private/loopback addresses to prevent server-side request forgery
- **No secrets in SDK**: The SDK does not handle or transmit any secrets; all credentials managed by Better Auth/ARMY
- **Preference isolation**: User preferences are per-user, isolated by company_id/tenant
- **Audit logging**: All preference changes and session operations should be audited per AGENTS.md audit invariant
- **Type safety**: Complete TypeScript typings prevent misuse at compile time

### Performance
- **< 1ms overhead**: SDK methods designed for < 1ms overhead per operation in production
- **Async but non-blocking**: Preference synchronization is async but does not block request processing
- **Cached results**: `principal()` and `resolveEcosystemEndpoints()` results cached after first call
- **Minimal bundle impact**: Type additions only, < 2KB gzip increase
- **No runtime dependencies**: SDK uses only Node.js built-ins and existing monorepo packages

## Observability Strategy

### Logging
- SDK method calls logged with method name, success/failure, and timing
- SSRF validation failures logged with blocked URL and source
- Principal derivation failures logged without exposing PII
- Preference changes logged: key, value, userId (no sensitive data)

### Metrics
- SDK method invocation count and success rate
- Principal derivation success/failure rate
- Endpoint resolution cache hit rate
- Preference read/write latency

### Health Endpoints
- `/api/observability/health` — returns service status, version, and dependency health (per existing observability spec)
- SDK readiness status available via app-specific health checks

## Technical Decisions and Alternatives

### Why This Architecture Over Alternatives

1. **Centralized SDK vs. Per-App Implementation**:
   - **Chosen**: Single SDK package provides consistent API across all apps
   - **Rejected**: Duplicate implementation in each app (current state, causes fragmentation)
   - **Justification**: 7 apps × duplicate auth/preference logic = high maintenance cost, inconsistent UX

2. **Type-First Approach vs. Runtime Checks**:
   - **Chosen**: Complete TypeScript typings with `SdkError` union, `SkinId` union, `TenantId` type
   - **Rejected**: Runtime validation only (no compile-time safety)
   - **Justification**: Type safety prevents entire classes of bugs; MoonWitness enforces strict typecheck

3. **SSRF Validation in SDK vs. No Validation**:
   - **Chosen**: `resolveEcosystemEndpoints()` validates all URLs against private/loopback ranges
   - **Rejected**: No validation; let callers decide
   - **Justification**: MoonWitness security invariant requires SSRF protection; arbitrary URL resolution is a known attack vector

4. **Async Preference Sync vs. Sync Local Storage**:
   - **Chosen**: Async SDK methods with best-effort delivery; local fallback
   - **Rejected**: Synchronous localStorage operations blocking main thread
   - **Justification**: Performance constraint: < 1ms overhead; sync operations violate this on slow devices

### Decision Records
- **D-001**: SDK-first approach over per-app implementation (chosen for consistency and maintenance)
- **D-002**: Type-first design with complete JSDoc contracts (chosen for MoonWitness typecheck gate)
- **D-003**: SSRF validation in endpoint resolution (chosen for security per MoonWitness invariants)
- **D-004**: Async preference synchronization with local fallback (chosen for performance < 1ms overhead)