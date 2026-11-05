---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_IDENTITY_FEDERATION_DESIGN"
version: "1.0.0"
owner: "platform-architecture"
---
# Design: Cross-Application Identity & Authentication Federation

## High-Level Architecture

The federation layer follows a **hub-and-spoke model** with the platform hub as the central authority and applications as spokes:

```
┌─────────────────────────────────────────────────────────────────┐
│                    A-L-L-A-H.COM Platform Hub                    │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────┐ │
│  │  Token      │  │  Session            │  │  Tenant         │ │
│  │  Manager    │  │  Store              │  │  Manager        │ │
│  └──────┬──────┘  └──────┬──────────────┘  └──────┬──────────┘ │
│          │                │                      │              │
└──────────▼────────────────────▼────────────────▼───────────────┘
                    │  Federated JWT Tokens  │
                    │  (stdized claims)      │
                    ▼                        │
┌─────────────────────────────────────────────────────────────────┐
│                    Applications (Spokes)                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   dock (P0)     │  │ headquarter (P0)│  │    gate (P1)    │ │
│  └──────┬──────────┘  └──────┬──────────┘  └──────┬──────────┘ │
│          │                  │                  │              │
│ ┌────────▼────────┐  ┌───────▼───────┐  ┌────────▼────────┐│
││  @allah/federation││  @allah/federation││  @allah/federation││
│└────────┬──────────┘  └────────┬──────────┘  └────────┬──────────┘│
│         │                  │                  │              │
│  User      │                  │                  │              │
│  Session   │                  │                  │              │
└────────────┘  └────────────┘  └────────────┘            │
```

## Component and Module Structure

### `packages/federation` — Core Federation Package

**Entry point**: `packages/federation/src/index.ts`

**Exports**:
- `login(options)` — initiate authentication flow, return federated JWT
- `logout(options)` — terminate session across all connected apps
- `getSession()` — retrieve current session state from hub
- `refreshSession()` — refresh token before expiry
- `verifySession(token)` — validate token across app boundaries
- `setTenantContext(tenantId)` — set tenant for operations
- `getTenantContext()` — get current tenant context
- `onAuthStateChanged(callback)` — subscribe to auth state changes
- `FederationHealth` — health check endpoint handler

**Internal modules**:
- `tokenManager/` — JWT creation, validation, refresh
- `sessionStore/` — in-memory + persistent session storage
- `tenantManager/` — tenant context with default-deny isolation
- `correlationMiddleware/` — Express/Next.js middleware for correlation ID propagation
- `healthEndpoint/` — `/api/federation/health` handler

### Integration with Existing Packages

- **`@allah/sdk`**: Extended to include federation methods; backward compatible
- **`@moonwitness/ui`**: Authentication component templates that use federation layer
- **`@allah/arsy-orm`**: Session and tenant data stored via PGlite
- **`@moonwitness/types`**: Shared type definitions for JWT claims and token formats

### Application Integration Pattern

Each app integrates federation via:

```tsx
import {
  login,
  logout,
  getSession,
  setTenantContext,
  onAuthStateChanged
} from '@allah/federation';

// In app setup:
onAuthStateChanged((session) => {
  // Update UI, propagate session to API calls
});

// For API routes:
const session = await getSession();
const { tenantId } = session;
setTenantContext(tenantId); // Ensures default-deny isolation
```

## Data Models and Relationships

### Federated JWT Token Claims

```ts
interface FederatedTokenClaims {
  sub: string;                    // User subject ID (UUID)
  iat: number;                    // Issued-at timestamp
  exp: number;                    // Expiration timestamp
  app_id: string;                 // Target application identifier
  tenant_id: string;              // Tenant identifier (default-deny)
  scope: string[];                // authorized scopes/claims
  consent_version: string;       // Consent policy version
  iss: string;                    // Issuer (platform hub)
  aud: string;                    // Audience (target app)
}
```

### Tenant Context Model

```ts
interface TenantContext {
  tenantId: string;
  defaultDeny: boolean; // Always true — enforced at middleware level
  allowedApps: string[]; // Apps permitted for this tenant
  metadata?: Record<string, any>;
}
```

### Session Store Model

```ts
interface SessionData {
  sessionId: string;
  userId: string;
  tenantId: string;
  appId: string;
  issuedAt: number;
  expiresAt: number;
  refreshToken: string;
  scopes: string[];
  consentVersion: string;
}
```

## API Contracts and Interfaces

### SDK Methods

| Method | Signature | Description |
|---|---|---|
| `login` | `(options: LoginOptions) => Promise<FederatedToken>` | Initiate login, receive federated JWT |
| `logout` | `(options?: LogoutOptions) => Promise<void>` | Terminate session across apps |
| `getSession` | `() => Promise<SessionData \| null>` | Get current session from hub |
| `refreshSession` | `() => Promise<FederatedToken>` | Refresh token before expiry |
| `verifySession` | `(token: string) => Promise<SessionData \| null>` | Validate token across apps |
| `setTenantContext` | `(tenantId: string) => void` | Set tenant for subsequent ops |
| `getTenantContext` | `() => TenantContext \| null` | Get current tenant context |
| `onAuthStateChanged` | `(callback: (session: SessionData \| null) => void) => Unsubscribe` | Subscribe to auth changes |

### Health Endpoint

```
GET /api/federation/health
Response:
{
  status: "healthy" | "degraded" | "unhealthy",
  version: string,
  connectedApps: number,
  uptime: number,
  timestamp: string
}
```

## Data Flow and System Interactions

### Login Flow

1. User clicks "Login" in app A
2. App A calls `federation.login({ appId: 'dock' })`
3. Federation SDK sends request to platform hub `/api/auth/login`
4. Hub validates request, generates federated JWT with standardized claims
5. Hub stores session in session store, associates with tenant_id
6. Hub returns JWT to app A
7. App A stores JWT, sets auth state, propagates correlation ID
8. Subsequent API calls include JWT in `Authorization: Bearer <token>` header
9. Downstream services validate JWT, extract tenant_id, enforce default-deny isolation

### Session Propagation Flow

1. User authenticated in app A
2. User navigates to app B
3. App B checks for existing session via `federation.getSession()`
4. If session exists, app B retrieves user context from hub
5. App B sets tenant context via `setTenantContext(tenantId)`
6. All subsequent operations in app B respect the tenant boundary
7. Correlation ID propagated across request boundary

### Token Refresh Flow

1. SDK monitors token expiry time
2. When `exp - now < refreshThreshold` (e.g., 5 minutes remaining)
3. SDK automatically calls `federation.refreshSession()`
4. Hub issues new JWT with extended expiry
5. Old JWT invalidated; app updates auth state silently

## UI/UX Flows and Design Specifications

### Authentication States

Each app should display consistent auth UI using `@moonwitness/ui` components:

1. **Logged out**: Login button, signup link, guest option
2. **Logging in**: Spinner, progress indicator, cancel option
3. **Logged in**: User profile display, logout button, session info
4. **Session expired**: Re-authenticate prompt, automatic redirect to login

### Cross-App Navigation

- When user navigates to a new app, check for existing federated session
- If session exists, silently authenticate and show user profile
- If no session, show login button consistent with app's design
- User can always choose to re-authenticate or log out from any app

### Error States

- **Invalid token**: Show auth error, offer re-login
- **Tenant violation**: Block operation, show isolation warning
- **Session expired**: Prompt re-authentication, clear local state
- **Hub unavailable**: Degrade gracefully, use local session if available

## Integration Architecture

### Hub Integration

The platform hub provides these endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/api/federation/login` | POST | Initiate federated login |
| `/api/federation/logout` | POST | Terminate session across apps |
| `/api/federation/session` | GET | Retrieve current session |
| `/api/federation/refresh` | POST | Refresh session token |
| `/api/federation/health` | GET | Health check |
| `/api/federation/tokens/validate` | POST | Validate JWT token |

### App Integration

Each app integrates via the `@allah/federation` SDK:

```
App → @allah/federation SDK → Platform Hub → Session Store → Other Apps
```

Apps never communicate directly; all federation goes through the hub.

### Tenant Isolation Enforcement

Tenant isolation is enforced at three levels:

1. **Middleware**: Correlation middleware extracts tenant_id from JWT and sets context
2. **ORM Layer**: @allah/arsy-orm queries always include `where: { tenant_id: currentTenant }`
3. **API Routes**: Route handlers validate tenant context before processing requests

## Error Handling and Failure Scenarios

### Error Classes

| Error | Code | HTTP Status | Handling |
|---|---|---|---|
| `AuthError` | `AUTH_001` | 401 | Invalid/expired token, re-authenticate |
| `TenantError` | `TENANT_001` | 403 | Tenant isolation violation, block operation |
| `SessionError` | `SESSION_001` | 408 | Session timeout, refresh or re-authenticate |
| `HubError` | `HUB_001` | 503 | Hub unavailable, degrade gracefully |
| `TokenError` | `TOKEN_001` | 401 | Invalid token format, reject request |

### Failure Scenarios and Recovery

1. **Hub downtime**: SDK falls back to local session if available; operations degrade gracefully
2. **Token expiry**: Automatic refresh; if refresh fails, prompt user to re-authenticate
3. **Tenant violation**: Operation blocked, error shown to user, audit event logged
4. **Correlation ID failure**: Request proceeds without correlation ID, error logged for investigation
5. **Session desynchronization**: SDK refreshes session from hub on each app launch

## Security and Performance Considerations

### Security

- **JWT signing**: All tokens signed with platform hub's private key using HS256
- **Token validation**: Downstream services validate token signature, expiry, and required claims
- **No PII in tokens**: Tokens contain only: sub, iat, exp, app_id, tenant_id, scope, consent_version
- **Token rotation**: Refresh tokens rotated on each refresh; old tokens invalidated
- **Default-deny**: All tenant boundaries default to deny; explicit approval required for cross-tenant operations
- **Consent enforcement**: consent_version in tokens ensures user consent is always checked

### Performance

- **Token overhead**: JWT ~500 bytes; < 1ms to validate per request
- **Cache strategy**: Session data cached in memory at hub with TTL-based expiry
- **Batch operations**: Multiple session checks optimized via single hub query
- **Cold start**: SDK pre-validates session on app load; no blocking UI wait
- **Rate limiting**: Hub enforces per-app token refresh rate limits (max 5/min)

### Observability Strategy

- **Health endpoints**: `/api/federation/health` reports status, connected apps, uptime
- **Metrics**:
  - `federation.login.success` — counter of successful logins
  - `federation.login.failure` — counter of failed logins
  - `federation.session.active` — gauge of active sessions
  - `federation.token.refresh` — counter of token refreshes
  - `federation.tenant.violation` — counter of tenant isolation violations
- **Logging**: Structured JSON logs with correlation_id, tenant_id, event_type
- **Tracing**: Automatic trace context propagation via correlation IDs across app boundaries

## Technical Decisions and Alternatives

### Decided Alternatives Considered

1. **Hub vs. Direct Federated Tokens**: Chose hub-and-spoke over pure direct JWT exchange because:
   - Centralized control for tenant isolation
   - Single point for session revocation
   - Better observability and metrics
   - Easier audit and compliance

2. **JWT vs. Opaque Sessions**: Chose JWT because:
   - Stateless by default (no session store needed for validation)
   - Cross-app compatible (any app can validate)
   - Standardized claims format
   - Smaller payload than session cookies

3. **Hub-and-Spoke vs. Peer-to-Peer**: Chose hub-and-spoke because:
   - Simpler security model (single authority)
   - Easier tenant enforcement
   - Better for audit/compliance
   - Lower complexity for initial implementation

4. **Redis vs. PGlite for session store**: Chose PGlite (embedded PostgreSQL) because:
   - Already used by @allah/arsy-orm across the monorepo
   - Transactional consistency for session operations
   - No separate infrastructure required
   - Better consistency for default-deny tenant checks

### Future Considerations

- Support for OAuth 2.0 and SAML as identity providers behind the federation layer
- Distributed session store for hub redundancy
- Client-side session management with IndexedDB for offline support
- Progressive deployment of federation across incremental app groups

## Compliance with MoonWitness Ecosystem Invariants

- **PALETTE_PURITY**: No arbitrary colors in federation-related UI; all tokens come from design system
- **STYLE_PURITY**: No hand-written mw-* class names; federation UI uses @moonwitness/ui components
- **ICON_PURITY**: Icons imported only via @moonwitness/ui/Icon component
- **LANDMARK_PURITY**: Skip-link landmarks handled by RouteShell, not federation layer
- **NO_PUBLIC_CLIENT_SECRETS**: No NEXT_PUBLIC_* values carrying keys/secrets read from client code
- **Tenancy**: default-deny tenant isolation maintained; company_id derived from principal, not request body
- **SQL**: Parameterized values only; federation layer uses ORM for all database operations
- **Audit**: Every session write writes append-only event with changed field names, not values