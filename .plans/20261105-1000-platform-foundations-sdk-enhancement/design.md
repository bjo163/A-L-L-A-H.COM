# Design — Platform Foundations & SDK Enhancement

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MONOREPO LAYER                           │
│  apps/ (dock, headquarter, id, jizz, gate, harbor, sentinel)│
│  └─────────────────────┬─────────────────────┬─────────────┘
│                        │                     │                 │
│               @moonwitness/ui                @allah/sdk      │
│  └─────────────────────┬─────────────────────┬─────────────┘
│                        │                     │                 │
│                @moonwitness/types            │               │
│                        │                     │               │
│                packages/ (lint, arsy-orm)    │               │
└─────────────────────────────────────────────────────────────┘
```

### Package Boundaries

| Package | Imports From | Exports To |
|---|---|---|
| `@allah/sdk` | `@moonwitness/types`, `@moonwitness/ui` | Apps, Arsy ORM |
| `@moonwitness/types` | None (leaf) | All packages |
| `@moonwitness/ui` | `@moonwitness/types` | Apps |
| Apps | `@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types` | — |
| `packages/lint` | — | Arch invariants enforcement |
| `packages/arsy-orm` | — | PGlite ORM |

### Component and Module Structure

#### `@allah/sdk` — Method Contracts

New/modified SDK methods organized by domain:

**Authentication & Principal**
- `principal(): Promise<Principal>` — Returns verified principal with `company_id`, `tenant_id`, `skin_id`
- `authenticate(token: string): Promise<AuthResult>` — Token validation with error type

**Skin & World**
- `setSkin(skinId: SkinId): Promise<void>` — Sets the active skin via `SkinRoot`
- `getSkin(): Promise<SkinId>` — Returns currently active skin ID
- `resolveSkinPath(skinId: SkinId, route: string): Promise<string>` — Resolves skin asset path

**Data & API**
- `fetchObservations(filters: ObservationFilters): Promise<ApiResponse<Observation[]>>` — Read-only observation fetch
- `createObservation(data: ObservationForm): Promise<ApiResponse<Observation>>` — Create with validation
- `updateObservation(id: string, data: Partial<ObservationForm>): Promise<ApiResponse<Observation>>` — Update with provenance

**SSE & Streaming**
- `subscribeAgentEvents(tenantId: TenantId): AsyncGenerator<AgentEvent>` — SSE stream for agent reasoning
- `subscribeObservationUpdates(filters: ObservationFilters): AsyncGenerator<ObservationUpdate>` — Real-time updates

#### `@moonwitness/types` — Canonical Types

```typescript
// TenantId: SHA-256 derived from principal, never from request body
type TenantId = string; // format: "tenant_<sha256>"

// SkinId: one of the six canonical worlds
type SkinId =
  | "imperium-lumen"
  | "lunar-chronicles"
  | "rocksoil"          // ROCKSOUL
  | "nexus-paradox"
  | "riot-anarchy"
  | "mycelium";

// ApiResponse: generic wrapper for all SDK responses
interface ApiResponse<T> {
  data?: T;
  error?: SdkError;
  metadata?: {
    tenant_id: TenantId;
    skin_id: SkinId;
    timestamp: string;
    request_id: string;
  };
}

// SdkError: hierarchy with base and subclasses
interface SdkError {
  type: "SDK_ERROR";
  code: string;
  message: string;
  tenant_id: TenantId;
}

interface AuthenticationError extends SdkError {
  type: "AUTHENTICATION_ERROR";
  code: "INVALID_TOKEN" | "TOKEN_EXPIRED";
}

interface NotFoundError extends SdkError {
  type: "NOT_FOUND_ERROR";
  code: "OBSERVATION_NOT_FOUND" | "SKIN_NOT_FOUND";
}

// SkinConfig: token for route-specific skin scoping
interface SkinConfig {
  skinId: SkinId;
  persist?: boolean; // persist in cookie/localStorage
}
```

#### `@moonwitness/ui` — Component Skin Recipes

**Skin-Aware Component Pattern**

All UI components accept an optional `data-moonframe-skin` attribute. When present, the component applies world-specific styling through CSS variable substitution in `skins.css`, never through arbitrary Tailwind variants.

**Key Components and Skin Recipes:**

| Component | Skin Recipe Pattern | Exclusion |
|---|---|---|
| `PageHero` | `data-moonframe-skin='rocksoil'` → cinematic frame, back-view silhouette, crimson accent | No face reveal, no generic cyberpunk neon |
| `Card` | `data-moonframe-skin='lunar-chronicles'` → celestial object card, observatory instrument aesthetic | No generic dashboard card |
| `Navigation` | `data-moonframe-skin='nexus-paradox'` → spatial selector with coordinate layers | No generic app categories |
| `Dialog` | `data-moonframe-skin='riot-anarchy'` → comic spread overlay, broken grid layout | No generic modal |
| `Form` | `data-moonframe-skin='mycelium'` → membrane/chamber form, branching network layout | No standard form controls without skin adaptation |
| `Kicker` | World label with skin-specific typography and colour | No arbitrary Tailwind palette hues |
| `SectionHeading` | `data-moonframe-skin='imperium-lumen'` → monumental axial architecture label | No raw HTML headers |

**Anti-Duplication Rule**: Prefer a component API with a skin recipe or composition adapter. Where the world genuinely requires a different composition, implement a world-specific layout on top of shared semantic primitives.

**World Recipes in `skins.css`**: Each of the six DNA worlds gets `[data-moonframe-skin='...']` variants that map design-system tokens to world-specific colours, textures, and geometry.

### Integration Architecture

#### Skin Scope Provider

```
<SkinRoot initialSkin="imperium-lumen">
  <SkinScope skin="rocksoil">
    <PageHero />  <!-- renders with rocksoil skin recipe -->
    <Navigation />  <!-- renders with rocksoil skin recipe -->
  </SkinScope>
</SkinRoot>
```

- `SkinRoot` provides the motion provider and initial skin state
- `SkinScope` overrides the skin for a subtree (route-specific scoping)
- Skin change propagates through context; persisted via cookie if `persist=true`
- Lint rule `SKIN_PURITY` ensures no duplicate root worlds created

#### Route States (STATE_PARITY)

Every app ships `error.tsx`, `loading.tsx`, and `not-found.tsx` built from `StatePanel`:
- Consistent error/loading/not-found UX across all apps
- Skin-aware state panels with world-appropriate messaging
- Accessible: semantic landmarks, keyboard focus, reduced-motion

#### Data Flow

```
User Action → App Component → SDK Method → @allah/sdk → @moonwitness/types types → API Route → PGlite → Response → SDK → App
```

- Parameterized SQL only, with column/sort identifier allowlist
- `company_id` derived from principal, never from request body
- Every insert/update/delete writes one append-only audit event in the same transaction

### API Contracts and Interfaces

#### SDK Method Signatures (excerpt)

```typescript
// Principal interface
interface Principal {
  company_id: string;     // derived from verified auth
  tenant_id: TenantId;    // SHA-256 derived
  skin_id: SkinId;        // current world skin
  user_id: string;        // authenticated user identifier
}

// Observation filter interface
interface ObservationFilters {
  skin_id?: SkinId;
  category?: string;
  date_range?: { from: Date; to: Date };
  search?: string;
}

// API route handler contract
type ObservationHandler = (
  request: Request,
  context: { params: Promise<{ id: string }> }
) => Promise<Response>;
```

#### Error Type Hierarchy

```
SdkError (base)
├── AuthenticationError
│   ├── InvalidTokenError
│   └── TokenExpiredError
├── NotFoundError
│   ├── ObservationNotFoundError
│   └── SkinNotFoundError
├── ValidationError
│   ├── InvalidFilterError
│   └── MissingRequiredFieldError
└── ServerError
    ├── DatabaseError
    └── NetworkError
```

### Data Flow and System Interactions

#### Observation Creation Flow

```
User fills form → App component validates → SDK createObservation() called →
  @allah/sdk validates request shape → @moonwitness/types validates tenant_id/SkinId →
  API route /api/observations POST → Parameterized SQL INSERT with column allowlist →
  Append-only audit event in same transaction → ApiResponse<Observation> returned →
  App updates UI with success state / shows error if validation fails
```

#### Skin Switching Flow

```
User selects new skin → App dispatches setSkin(skinId) →
  @allah/sdk setSkin() called → SkinRoot context updated →
  SkinScope triggers re-render with new skin recipe →
  CSS variables from skins.css substitute → UI updates world appearance →
  Cookie/localStorage persists if configured → Route state panels update
```

### Error Handling and Failure Scenarios

| Failure Scenario | Error Type | Recovery |
|---|---|---|
| Invalid authentication token | `AuthenticationError` | Clear auth state, redirect to sign-in |
| Observation not found | `NotFoundError` | Show `not-found.tsx` with skin-appropriate message |
| Validation failure | `ValidationError` | Show form errors with inline messages |
| Database connection failure | `ServerError` | Show loading state, retry after backoff |
| SSE stream disconnect | `ServerError` | Auto-reconnect with exponential backoff |
| Skin not found for world | `SkinNotFoundError` | Fall back to default skin, log warning |
| SSRF attempt (private IP resolved) | `ServerError` | Block request, log security event |

### Security and Performance Considerations

**Security**
- Default-deny auth: every hub route needs verified principal
- `company_id` on every row, derived from principal and fail-closed
- Parameterized SQL only, with column/sort identifier allowlist
- SSRF: Validate `base_url` before request, re-check resolved IP (refuse private/loopback)
- No `'use client'` file may read `NEXT_PUBLIC_*` values carrying keys/secrets/tokens
- `resolveEcosystemEndpoints` rejects hyphenated app names in `NEXT_PUBLIC_*`

**Performance**
- SDK method calls: target <5ms overhead as measured in CI
- Skin switching: <100ms re-render with CSS variable substitution
- API responses: parameterized queries with indexed columns
- SSE streams: connection keep-alive, idle timeout 30s, auto-reconnect
- Observability trace events: minimal payload (<500 bytes per event)

### Observability Strategy

**Structured Trace Events** (emitted by every SDK method):

```json
{
  "method": "createObservation",
  "status": "success" | "error",
  "duration_ms": 42,
  "tenant_id": "tenant_a1b2c3d4e5f6...",
  "skin_id": "rocksoil",
  "request_id": "req_7d3c4f..."
}
```

**Emission Points**
- Every `@allah/sdk` method call
- Skin switch events
- API route handlers (entry/exit)
- SSE stream lifecycle (connect, disconnect, reconnect)
- Authentication events (success, failure)

**Observability Infrastructure**
- Fastify SSE endpoints for agent event streaming
- Structured JSON logs (no formatted strings in production)
- Metrics: method call count, error rate, duration percentile
- No personally identifiable information in trace events

### Technical Decisions and Alternatives

| Decision | Alternative | Rationale |
|---|---|---|
| TypeScript strict over Flow | Flow | Team standard; better tooling integration in monorepo |
| `data-moonframe-skin` attribute over CSS-in-JS | CSS-in-JS (styled-components) | Attribute-based skin scoping is more explicit, plays well with Tailwind v4, enables `ICON_PURITY`/`PALETTE_PURITY` enforcement |
| Parameterized SQL with allowlist over raw string queries | Raw string queries (unsafe) | MoonWitness SQL invariant; prevents injection, enforces column/sort allowlist |
| `SdkError` hierarchy over flat error codes | Flat error codes | Better type discrimination, enables targeted error handling in consumer code |
| SSE over WebSocket for agent events | WebSocket | SSE is simpler, works with existing Fastify setup, automatic reconnection via client |
| `data-moonframe-skin` attribute over CSS variable per-component | Global CSS variable per app | Attribute-based scoping is more targeted, avoids cascading side effects, supports per-route skin isolation |