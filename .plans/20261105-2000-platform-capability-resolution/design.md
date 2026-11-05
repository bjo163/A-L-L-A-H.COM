# Design — Platform Capability Resolution

## High-Level Architecture

The plan defines three interconnected systems that together resolve the unverifiable capability claims and establish concrete platform foundations:

### 1. Type Standardization System (`@moonwitness/types`)
- Exports canonical types used consistently across all packages
- `TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError` hierarchy, `SkinConfig`
- No `any` types in public API surfaces
- Full TypeScript strict mode compliance

### 2. SDK Method Contracts (`@allah/sdk`)
- Every exported method has explicit TypeScript return types
- JSDoc contracts documenting request/response shapes
- Error type hierarchy with `SdkError` base and subclasses
- Integration with `@moonwitness/types` canonical types
- SSE/event stream contracts where applicable

### 3. UI Skin Engine Hardening (`@moonwitness/ui`)
- Components accept `data-moonframe-skin` for world assignment
- No arbitrary Tailwind variants or palette hues
- All colours sourced from token-driven utilities
- Design-system `Icon` component only (`ICON_PURITY`)

## Component and Module Structure

### Package Boundaries Matrix

| Package | Imports From | Exports To | Responsibility |
|---------|-------------|------------|----------------|
| `@moonwitness/types` | None (leaf) | `@allah/sdk`, `@moonwitness/ui`, all apps | Canonical type definitions, TenantId, SkinId, ApiResponse, SdkError hierarchy |
| `@allah/sdk` | `@moonwitness/types` | `@moonwitness/ui`, all apps | SDK client contracts, method signatures, JSDoc, ApiResponse<T> shapes |
| `@moonwitness/ui` | `@moonwitness/types` | all apps | UI components with skin recipes, data-moonframe-skin, anti-duplication rules |
| `apps/*` | All three shared packages | — | Application-specific logic, route handlers, UI composition |
| `packages/lint` | All shared packages | — | Arch invariant enforcement, antislop rules |

### Dependency Direction Rules

- `@allah/sdk` → `@moonwitness/types` only (one-way, never reverse)
- `@moonwitness/ui` → `@moonwitness/types` only (one-way, never reverse)
- Apps → all three shared packages (fan-in, but no cross-app package imports)
- `packages/lint` may inspect any package but may not modify source

### Module Structure

#### `@moonwitness/types/src/`
```
index.ts                          # Public API re-exports
tenants.ts                        # TenantId, company_id derivation
skins.ts                          # SkinId type, whitelist, SkinConfig
errors.ts                         # SdkError hierarchy, error types
responses.ts                      # ApiResponse<T>, ApiError, ApiSuccess
validation.ts                     # Type validation utilities
```

#### `@allah/sdk/src/`
```
index.ts                          # Public SDK client (rewritten with typed methods)
auth.ts                           # Authentication operations (typed)
router.ts                         # Router LLM operations (typed)
works.ts                          # Works commercial operations (typed)
health.ts                         # Health checks (typed)
agent.ts                          # Agent control operations (typed)
threads.ts                        # Threads & memory operations (typed)
qorpus.ts                         # Qorpus operations (typed)
nexus.ts                          # NEXUS network inventory (typed)
mcp.ts                            # MCP operations (typed)
sdui.ts                           # Server-driven UI (typed)
swarm.ts                          # Swarm orchestration (typed)
agent-run.ts                      # Autonomous agent loop (typed)
```

#### `@moonwitness/ui/src/components/`
```
button.tsx                        # Button with data-moonframe-skin
card.tsx                          # Card with skin recipe
table.tsx                         # Table with skin recipe
badge.tsx                         # Badge with skin recipe
state-panel.tsx                   # StatePanel with skin recipe
form-field.tsx                    # FormField with skin recipe
icon.tsx                          # Icon component (ICON_PURITY)
```

## Data Models and Relationships

### Type System

```typescript
// TenantId: SHA-256 content-addressed, derived from principal
type TenantId = string;

// SkinId: one of six canonical skin definitions
type SkinId =
  | 'imperium-lumen'
  | 'lunar-chronicles'
  | 'rocksoil'
  | 'nexus-paradox'
  | 'riot-anarchy'
  | 'mycelium';

// ApiResponse: generic wrapper for all API responses
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  metadata: Record<string, unknown>;
}

// SdkError hierarchy
class SdkError extends Error {
  constructor(message: string, code: SdkErrorCode, status?: number);
}

enum SdkErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
}

class AuthenticationError extends SdkError { ... }
class ValidationError extends SdkError { ... }
class NotFoundError extends SdkError { ... }
class ConflictError extends SdkError { ... }
class RateLimitError extends SdkError { ... }
class ServerError extends SdkError { ... }

// SkinConfig: token for route-specific skin scoping
interface SkinConfig {
  skin: SkinId;
  scope: 'route' | 'global';
  persistence: 'session' | 'local' | 'none';
}
```

### SDK Method Contracts Example

```typescript
// Example typed method contract
getOnboardingStatus: async (): Promise<ApiResponse<{ available: boolean }>> => {
  return this.request<ApiResponse<{ available: boolean }>>('/api/auth/onboarding/status');
};

// Example with SSE
chatStream: async (
  req: ChatCompletionRequest,
  onChunk: (chunk: ChatCompletionChunk) => void,
  signal?: AbortSignal
): Promise<void> => { ... };
```

## API Contracts and Interfaces

### Public SDK API Surface

All `@allah/sdk` methods return `ApiResponse<T>` or throw `SdkError`. No method returns `any`.

| Method | Request Type | Response Type | Contract |
|--------|-------------|---------------|----------|
| `auth.getOnboardingStatus` | `()` | `ApiResponse<{ available: boolean }>` | JSDoc: "Check if onboarding is available for new users" |
| `auth.onboard` | `{ email: string; password: string; name: string }` | `ApiResponse<{ user: UserSubject }>` | JSDoc: "Create new user account" |
| `auth.signIn` | `{ email: string; password: string; deviceName?: string }` | `ApiResponse<AuthResponse>` | JSDoc: "Sign in with credentials, sets session token" |
| `router.chat` | `ChatCompletionRequest` | `ChatCompletionResponse` | JSDoc: "Send chat completion request to LLM" |
| `router.chatStream` | `ChatCompletionRequest × onChunk` | `void` (streaming) | JSDoc: "Stream chat completion with chunk callback" |
| `health.check` | `()` | `ApiResponse<Record<string, unknown>>` | JSDoc: "Check hub health status" |
| `agentControl.createPairing` | `{ deviceName: string }` | `ApiResponse<AgentPairingResult>` | JSDoc: "Create agent device pairing" |
| `works.listPlans` | `()` | `ApiResponse<PublicIspPlan[]>` | JSDoc: "List available ISP plans" |
| `publicIsp.listPlans` | `()` | `ApiResponse<PublicIspPlan[]>` | JSDoc: "Anonymous read-only ISP plans listing" |
| `sdui.render` | `{ view: string }` | `ApiResponse<SDUIRoot>` | JSDoc: "Render SDUI view by viewId" |
| `swarm.run` | `{ goal, system, max_turns }` | `ApiResponse<SwarmExecutionResult>` | JSDoc: "Execute multi-step swarm mission" |

### Error Type Hierarchy

```
SdkError (base)
├── AuthenticationError
├── ValidationError
├── NotFoundError
├── ConflictError
├── RateLimitError
└── ServerError
```

Each error subclass has:
- `code: SdkErrorCode` enum value
- `status?: number` HTTP status code (where applicable)
- `metadata?: Record<string, unknown>` additional context
- `toJSON()` for serialization

## Data Flow and System Interactions

### Type Standardization Flow

1. **Type Definition**: `@moonwitness/types` defines canonical types (`TenantId`, `SkinId`, `ApiResponse<T>`, `SdkError` hierarchy)
2. **SDK Import**: `@allah/sdk` imports and uses these types exclusively
3. **UI Consumption**: `@moonwitness/ui` imports `SkinId`, `SkinConfig` for skin recipe enforcement
4. **App Integration**: Apps import from all three packages, never directly define these types

### SDK Method Flow

1. **Client Call**: Developer calls typed SDK method (e.g., `client.auth.signIn()`)
2. **Request Construction**: Method builds HTTP request with proper headers (`x-session-token`, `x-virtual-key`)
3. **Server Request**: Request sent to hub endpoint (`/api/auth/sign-in`)
4. **Response Processing**: Response parsed, `data` extracted, `error` handled
5. **Type-Safe Result**: Developer receives `ApiResponse<{ user: UserSubject }>` with full TypeScript types
6. **Error Handling**: Developer catches `SdkError` subclasses with specific `code` and `status`

### UI Skin Flow

1. **Skin Assignment**: Component receives `data-moonframe-skin={SkinId}` prop/properties
2. **Token Lookup**: Skin tokens resolved from `packages/ui/src/theme.css` or `packages/ui/src/tokens/`
3. **Palette Guard**: Lint rule (`antislop-ui`) flags any Tailwind palette hue usage
4. **Token Source**: All colours derived from design tokens, never arbitrary `#[color]` values
5. **Icon Usage**: Only `packages/ui/src/components/Icon` component used for icons (`ICON_PURITY`)

### Integration Architecture

```
[App Layer] → imports from @moonwitness/types, @allah/sdk, @moonwitness/ui
          ↓
[Shared Packages] → @moonwitness/types (leaf, no deps)
                  → @allah/sdk (imports types only)
                  → @moonwitness/ui (imports types only)
          ↓
[Hub Layer] → all routes scoped by tenantOf(request), company_id stamped from principal
          ↓
[ORM Layer] → @allah/arsy-embed only, parameterized values, no raw SQL
```

## Error Handling and Failure Scenarios

### Error Handling Strategy

All `@allah/sdk` methods follow the same error handling pattern:

```typescript
try {
  const result = await client.auth.signIn({ email, password });
  if (result.error) {
    // result.error is a SdkError subclass with specific code
    handleSdkError(result.error);
    return;
  }
  // result.data has full TypeScript type
  useUser(result.data.user);
} catch (e) {
  // Unexpected error - wrap as ServerError if not already SdkError
  if (e instanceof SdkError) {
    handleSdkError(e);
  } else {
    throw new SdkError(
      'Unexpected error',
      SdkErrorCode.SERVER_ERROR,
      500
    );
  }
}
```

### Failure Scenarios Table

| Failure Scenario | Error Type | HTTP Status | Recovery |
|-----------------|-----------|-------------|----------|
| Network timeout / no internet | `RateLimitError` or `SdkError` | N/A (client) | Retry with exponential backoff |
| Invalid credentials | `AuthenticationError` | 401 | Prompt user to re-enter credentials |
| Email already registered | `ConflictError` | 409 | Show alternative email or password reset |
| Resource not found (e.g., plan ID) | `NotFoundError` | 404 | Display "not found" UI, offer navigation |
| Rate limit exceeded | `RateLimitError` | 429 | Back off and retry after retry-after header |
| Server internal error | `ServerError` | 500 | Show generic error, log with trace ID, retry later |
| Validation failure (bad payload) | `ValidationError` | 400 | Show field-specific error messages |
| SSE stream disconnect | `SdkError` | N/A | Reconnect with backoff, preserve state |
| Invalid SkinId passed to UI | `ValidationError` (from lint) | N/A | Fall back to default skin, show warning |

## Security and Performance Considerations

### Security Requirements

1. **Default-deny auth**: Every hub route needs a verified principal. Only `/health`, `/ready`, onboarding, and non-prod `/docs` are anonymous.
2. **Tenant isolation**: `company_id` on every row, derived from the principal and fail-closed — never taken from the request body.
3. **Skin data is public**: `data-moonframe-skin` attribute values are SkinId whitelist values only, no secrets in skin data.
4. **No client secrets**: No `use client` file may read a `NEXT_PUBLIC_*` value carrying a key/secret/token (`NO_PUBLIC_CLIENT_SECRETS`).
5. **SSRF guard**: Validate `base_url` before the request and re-check the resolved IP, so a domain that resolves to a private or loopback address is refused.
6. **Audit logging**: Every SDK method call emits a structured trace event with `method`, `status`, `duration_ms`, and `tenant_id`.

### Performance Considerations

1. **Skin resolution overhead**: Must not exceed 2ms per component render (measured in CI)
2. **SDK method overhead**: Must not introduce measurable overhead (>5ms per call) as measured in CI
3. **CSS custom properties**: Use CSS custom properties (`var(--token-name)`) for skin tokens, not inline styles
4. **No performance degradation**: New capabilities must not degrade existing performance as measured by quality gates
5. **CSS custom property usage**: All skin token references go through `var(--token-name)` pattern, avoiding runtime computation overhead

### Observability Strategy

Every SDK method must emit a structured trace event:

```typescript
// Example trace event emission
traceEvent({
  method: 'auth.signIn',
  status: 'success' | 'error',
  duration_ms: Date.now() - startTime,
  tenant_id: derivedFromPrincipal,
  error_code: result.error?.code || undefined,
  error_message: result.error?.message || undefined,
});
```

Trace events are collected by the hub and available via the MCP `getAuditLog` endpoint.

## Technical Decisions and Alternatives

### Decision: Type-First SDK Rewrite

**Selected**: Full rewrite of `@allah/sdk/src/index.ts` with typed method contracts and JSDoc documentation, ensuring every method has explicit TypeScript return types and returns `ApiResponse<T>` or throws `SdkError`.

**Rejected alternatives**:
- **Partial typing**: Would leave some methods untyped, creating inconsistency and developer confusion. Not acceptable for 100% typecheck pass.
- **Keep existing untyped methods**: Would perpetuate the current problem of developers guessing parameter shapes and return types. Counter to the plan's objective.
- **Use `any` types**: Violates the strong typing non-functional requirement and would fail `pnpm typecheck`.

### Decision: Skin Recipe Enforcement via `data-moonframe-skin`

**Selected**: Components accept `data-moonframe-skin` attribute for world assignment, with antislop-ui lint rules enforcing `ICON_PURITY`/`PALETTE_PURITY`.

**Rejected alternatives**:
- **CSS-in-JS approach**: Would add runtime overhead and break the design-system token contract. Existing `theme.css` utility-first approach preferred.
- **Arbitrary Tailwind variants**: Would violate `PALETTE_PURITY` and make skin assignment non-deterministic. Explicitly forbidden.
- **Third-party icon libraries**: Would violate `ICON_PURITY` which requires using only the design-system `Icon` component.

### Decision: `resolveEcosystemEndpoints` with `NEXT_PUBLIC_*` guard

**Selected**: Proper guard that prevents hyphenated names from entering the resolution function, maintaining the invariant that hyphenated app names (e.g., `e-isp`) cannot enter `resolveEcosystemEndpoints`.

**Rejected alternatives**:
- **No guard**: Would allow hyphenated names, violating the type-safety invariant and potentially causing runtime errors.
- **Relaxed guard allowing hyphens**: Would break the existing invariant and create inconsistency with other platform foundations.

## Cross-Document Consistency Guidelines

| Document | Corresponding Sections | Consistency Rules |
|----------|----------------------|-------------------|
| `spec.md` | Objectives, Functional Requirements, Scope, Acceptance Criteria | All acceptance criteria in spec.md must be verified by design.md and task.md |
| `design.md` | High-level Architecture, Data Models, API Contracts, Error Handling | All API contracts in design.md must match implementations in task.md |
| `task.md` | Task breakdown, Dependencies, Quality Gates, Completion Checklist | All tasks in task.md must support at least one acceptance criterion from spec.md |
| `rule.md` | Architectural Invariants, Coding Conventions, Package Boundaries, Forbidden Patterns | All rules in rule.md must be enforceable and referenced by task.md validation requirements |

Cross-references use stable identifiers (e.g., `AC-001`, `ARCH-001`, `PKG-001`, `API-001`, `DATA-001`, `TEST-001`, `RC-001`) that remain constant across document updates.

## Integration Architecture Summary

The platform capability resolution integrates with existing MoonWitness ecosystem components:

- **`@allah/arsy-orm`**: All database operations use parameterized values only, no raw SQL
- **`@allah/sdk`**: New typed methods integrate with existing hub routes (`/v1/works/*`, `/v1/auth/*`, etc.)
- **`@moonwitness/ui`**: Skin recipe enforcement integrates with existing block components (`StatePanel`, `Card`, `Table`, `Badge`)
- **`@moonwitness/types`**: Canonical types replace ad-hoc interfaces scattered across packages
- **Apps (dock, headquarter, id, jizz, gate)**: Each declares a valid `SkinRoot`; duplicate root worlds require explicit lint-baseline exception
- **`evolve-loop-guard`**: Updated to prevent future empty VERIFIED claims in `.plans/`
- **BACKLOG.md**: Capability statuses updated to reflect actual implementation status
## Data and Skin Contracts

| Contract | Shape | Owner | Validation |
|---|---|---|---|
| `TenantId` | Branded identifier derived from the verified principal | `@moonwitness/types` | Compile-time assignability and server auth tests |
| `SkinId` | Six-value union: `imperium-lumen`, `lunar-chronicles`, `rocksoil`, `nexus-paradox`, `riot-anarchy`, `mycelium` | `@moonwitness/types` and UI skin registry | Type guard and skin contract tests |
| `ApiResponse<T>` | Success data or structured error with metadata | `@moonwitness/types` and SDK | Typecheck plus SDK response tests |
| `SdkError` | Base error with stable code and status; named subclasses retain causes | SDK and shared types | Error mapping tests |
| `SkinScope` | Route-level visual assignment nested under a valid `SkinRoot` | `@moonwitness/ui` | SSR, hydration and scope isolation tests |

## Runtime Flow

1. App route obtains identity and tenant scope through its server-authorized path.
2. SDK methods validate endpoint configuration, serialize typed inputs, and return typed success/error envelopes.
3. UI receives typed data and callbacks from the app; it does not fetch business data or select tenants.
4. `SkinRoot` assigns the app world; `SkinScope` may scope a route without adding a second root or motion provider.
5. CI validates package boundaries, TypeScript, app builds, UI contracts, contrast and documentation.

## Error Handling and Security Boundaries

- Identity and `company_id` come from the verified server principal; request bodies cannot set tenant authority.
- Endpoint configuration rejects malformed names and unsafe destinations before network access.
- SDK failures preserve a stable machine-readable code and safe message; credentials and secret values are never returned to client code.
- UI displays errors through shared state components and never logs credentials or private response payloads.
- Database access remains in server-owned routes through `@allah/arsy-orm`, with parameterized values and identifier allowlists.

## Rollout and Compatibility

- Preserve existing stable exports while adding types and methods in additive changes.
- Update consumers only alongside the canonical package contract and affected app build evidence.
- Do not change approved skin mappings or add backend/service `SkinRoot` wrappers.
- Capability status changes require implementation evidence and all applicable quality gates; documentation-only cleanup must be labeled accordingly.
