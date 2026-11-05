---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_IDENTITY_FEDERATION_SPEC"
version: "1.0.0"
owner: "platform-architecture"
status: "proposed"
---
# Specification: Cross-Application Identity & Authentication Federation

## Motivation

The A-L-L-A-H.COM monorepo contains 10+ applications (dock, headquarter, e-isp, gate, harbor, jizz, moonsky, sentinel, id) and 15+ packages sharing a common foundation. Each application implements authentication independently with inconsistent patterns, resulting in:
- Duplicate authentication code across apps
- Inconsistent user identity representation
- Fragmented session management
- No shared trust domain across applications
- Poor developer experience when adding new apps

A unified federation layer is needed to provide single sign-on, shared session state, and consistent identity across the entire ecosystem.

## Problem Statement

- **Authentication fragmentation**: Each app implements its own auth flow, leading to 10+ duplicated codebases
- **No cross-app SSO**: Logging into one app does not authenticate the user in other apps
- **Inconsistent user profiles**: User data stored and represented differently across applications
- **Session silos**: Sessions are app-specific with no propagation capability
- **Tenant isolation conflicts**: Difficulty maintaining default-deny tenant boundaries across apps
- **Developer onboarding**: New app developers must reimplement auth from scratch despite shared packages (@allah/sdk, @allah/arsy-orm, @moonwitness/types, @moonwitness/ui)

## Objectives and Expected Outcomes

- **Unified identity token format**: JWT-based tokens with standardized claims across all applications
- **Cross-app single sign-on**: User authenticated in one app is automatically authenticated in all connected apps
- **Shared session state**: Session information propagated across app boundaries via the platform hub
- **Consent & privacy propagation**: User consent choices respected and propagated across app boundaries
- **Standardized SDK contracts**: @allah/sdk provides typed methods for federation operations
- **Tenant isolation preserved**: Default-deny tenant boundaries maintained even with federation
- **Developer experience**: New apps can opt-in to federation with minimal configuration

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | Implement a federation layer in `@allah/sdk` providing `login`, `logout`, `getSession`, `refreshSession`, and `verifySession` methods |
| FR-002 | Standardize JWT token format with claims: `sub`, `iat`, `exp`, `app_id`, `tenant_id`, `scope`, `consent_version` |
| FR-003 | Implement correlation ID propagation across app boundaries for authenticated requests |
| FR-004 | Provide `setTenantContext(tenantId)` and `getTenantContext()` methods for tenant-aware operations |
| FR-005 | Implement cross-app session persistence via platform hub with automatic renewal |
| FR-006 | Expose `/api/federation/health` endpoint returning federation service status and connected app count |
| FR-007 | Provide `onAuthStateChanged` callback mechanism for apps to react to auth changes |
| FR-008 | Implement token refresh strategy with automatic renewal before expiry |

## Non-Functional Requirements

- **Performance**: Authentication operations must have < 2ms overhead per call in production
- **Reliability**: Failed federation requests must not block request processing (async, best-effort delivery)
- **Security**: No sensitive data (passwords, raw tokens) in logs or metrics; automatic token redaction
- **Observability**: The federation system itself must be observable via health endpoints
- **Compatibility**: Must work with Next.js 16 App Router and Server Components across all applications
- **Type Safety**: Full TypeScript typings with strict mode compatibility
- **Reliability**: 99.9% uptime for federation health checks

## Scope

### In Scope

- Federation package (`packages/federation`) with SDK methods for login, logout, session management
- Standardized JWT token format with required claims for cross-app authentication
- Correlation ID middleware for Express/Next.js routes that propagates across app boundaries
- Tenant context management with default-deny isolation
- Health endpoints with federation metadata (version, connected apps, status)
- Configuration system for trusted app domains, token TTL, and consent defaults
- TypeScript typings and documentation
- Migration guide for existing applications to adopt federation

### Out of Scope

- Building user management interfaces (consume federation layer instead)
- Implementing specific identity providers (OAuth, SAML, etc.) — provide abstraction layer instead
- Collecting user behavior analytics or personal data beyond authentication context
- Real-time alerting configuration (separate concern)
- Custom business logic for session validation (provide framework, define policies per domain)
- Creating new user databases or credential stores

## User Stories and Use Cases

### US-001: Cross-application single sign-on

As a user, I want to log in once and be automatically authenticated across all A-L-L-A-H.COM applications so that I don't need to authenticate separately in each app.

**Scenario**: I log in through the ID app. When I navigate to dock, headquarter, or any other connected app, I am already authenticated and my user profile is available without re-entering credentials.

### US-002: Developer onboarding new application

As a developer creating a new application, I want to import the federation package and have basic authentication work out of the box so that I don't need to implement auth flows from scratch.

**Scenario**: I create a new app and import `@allah/federation`. The app automatically receives login/logout methods, session management, and can participate in cross-app SSO with minimal configuration.

### US-003: Tenant-aware operations across apps

As an operator, I want tenant isolation to be preserved when users move between applications so that data from one tenant cannot access another tenant's resources.

**Scenario**: A user in tenant "acme" logs into headquarter and then navigates to dock. All operations respect the acme tenant boundary, and dock cannot access headquarter's data for the same user without explicit cross-tenant authorization.

### US-004: Consent propagation across apps

As a user, I want my consent choices (privacy, data sharing, etc.) to be respected across all applications in the ecosystem so that I don't need to reconfigure preferences in each app.

**Scenario**: I opt-out of analytics in the ID app. When I navigate to dock, the analytics consent is already respected and no analytics are tracked.

## Dependencies and Constraints

### Dependencies

- `@allah/types` — shared type definitions used across the monorepo
- `@allah/sdk` — client↔hub communication patterns (will be extended for federation)
- `@moonwitness/ui` — UI components for authentication screens
- `@moonwitness/types` — shared type contracts
- PGlite (for any federation state persistence)
- Existing husky hooks (pre-commit, pre-push) for code quality gate

### Constraints

- Must not introduce breaking changes to existing auth patterns without migration path
- Must work within the existing husky/pre-commit/pre-push gate infrastructure
- Must respect the frozen-lockfile dependency management system
- Must not weaken existing auth, tenant, SQL, retention, or SSRF invariants
- Must comply with the MoonWitness style purity rules (PALETTE_PURITY, STYLE_PURITY, ICON_PURITY)
- Must be compatible with Next.js 16 App Router and Server Components
- Must maintain default-deny tenant isolation while enabling federation
- ARSY remains the sole identity/auth/session/tenant/role authority

## Ecosystem and Roadmap Alignment

- **Roadmap Stage 3**: Directly supports "Platform foundations: auth · data · observability · auditability · CI"
- **Roadmap Stage 4**: Enables "Product integration: prioritized apps/journeys · content migration with provenance" by providing cross-application identity continuity
- **Roadmap Stage 5**: Supports "Experience transformation: Moon UI · identities · responsive · a11y · motion" by providing consistent identity across all UI experiences
- **LEGACY_RECONCILIATION**: Must not conflict with canon asset tracking or world observatory integration
- **Design System**: Must respect existing UI design tokens and not introduce arbitrary colors or styles
- **Package Ownership**: `@allah/federation` package to be created under the packages namespace

## Acceptance Criteria

- [ ] `packages/federation` package created with SDK methods for login, logout, session management
- [ ] All 10+ applications adopt the standardized JWT token format with required claims
- [ ] Cross-app SSO works end-to-end between at least 3 applications (dock, headquarter, id)
- [ ] Correlation ID propagation works across app boundaries for authenticated requests
- [ ] Tenant context is preserved and default-deny isolation maintained across federation
- [ ] Health endpoints include federation metadata (version, connected apps, status)
- [ ] Token refresh strategy works with automatic renewal before expiry
- [ ] TypeScript types pass `pnpm typecheck` across all applications
- [ ] No performance regression > 2ms per authentication operation
- [ ] Documentation generated and published to package registry

## Success Metrics

| Metric | Target |
|---|---|
| % of applications using standardized federation | 100% |
| Average time to authenticate across apps | < 2 seconds (vs. currently > 30 seconds per app) |
| Token format consistency score | 100% (no custom formats in production) |
| Cross-app SSO success rate | 99% across app boundaries |
| Federation package TypeScript errors | 0 in strict mode |
| Tenant isolation violations | 0 in production |