# Cross-App Identity Federation & Session Synchronization

## Feature Overview
Enable seamless single sign-on and identity federation across all applications in the A-L-L-A.H.COM monorepo. Users authenticated in one app should be automatically authenticated in all other apps without re-entering credentials.

## Problem Statement
Currently, each application in the monorepo maintains independent authentication state. Users must sign in separately to each app (dock, gate, headquarter, id, jizz, moonsky, harbor, sentinel), creating friction and inconsistent user experiences. There is no shared session or token mechanism across apps.

## Objectives
- Implement a centralized identity provider pattern
- Enable cross-app session validation and token sharing
- Provide automatic sign-in across all apps after initial authentication
- Maintain tenant isolation and security boundaries
- Support both browser and CLI workflows

## Functional Requirements
1. **Centralized Auth Middleware**: A shared middleware that checks authentication status across all apps
2. **Token Syndication**: SDK method to broadcast session tokens to connected apps
3. **Cross-App Session Verification**: API endpoint to verify if a user is authenticated in another app
4. **Tenant-Aware Session Storage**: Store sessions with tenant context for proper isolation
5. **Re-authentication Flow**: Graceful re-auth when session expires across apps

## Non-Functional Requirements
- **Security**: All tokens must be HTTP-only; no secrets exposed to clients
- **Performance**: Auth checks must not add more than 50ms latency
- **Reliability**: Fail-closed: reject requests when auth state is ambiguous
- **Observability**: All auth events must be logged for audit purposes

## Scope
### In-Scope
- Central authentication service integration
- SDK methods for cross-app session management
- Shared auth middleware for Next.js apps
- Token validation and refresh mechanisms
- Audit logging of all auth events

### Out-of-Scope
- Password reset or account creation flows
- Third-party OAuth provider integration (beyond existing scope)
- Password storage or credential management
- Individual app UI redesigns

## User Stories
1. **Developer Story**: "As a developer, I want to add auth middleware to my app so that users signed in to any other app are automatically authenticated."
2. **User Story**: "As a user, I want to sign in once and have access to all apps in the suite without re-entering my credentials."
3. **User Story**: "As an admin, I want to see audit logs of all authentication events across all apps."

## Dependencies and Constraints
- **Dependencies**: `@allah/sdk`, `@moonwitness/ui`, `@moonwitness/types`, Better Auth (existing)
- **Constraints**:
  - Must preserve existing auth flows (no breaking changes)
  - Must maintain tenant isolation (`company_id` on every row)
  - Must not expose client secrets (`NO_PUBLIC_CLIENT_SECRETS`)
  - Must work with existing PGlite/Arsy-ORM setup

## Ecosystem and Roadmap Alignment
- Aligns with Roadmap Stage 3: "Platform foundations: auth · data · observability · auditability · CI"
- Supports Roadmap Stage 4: "Product integration: prioritized apps/journeys"
- Supports Roadmap Stage 5: "Experience transformation: Moon UI · identities · responsive · a11y · motion"
- Consistent with MoonWitness ecosystem invariants (tenant, auth, audit)

## Acceptance Criteria
1. ✅ User signs in to one app and is automatically authenticated in all other apps
2. ✅ Cross-app session verification API returns correct status
3. ✅ Auth middleware works across all Next.js apps in the monorepo
4. ✅ Audit logs capture all auth events with tenant context
5. ✅ No breaking changes to existing authentication flows
6. ✅ TypeScript typecheck passes across all packages

## Success Metrics
- **Adoption Rate**: 80%+ of apps integrate the cross-app auth middleware
- **Session Consistency**: 100% of authenticated sessions sync across apps within 2 seconds
- **Error Rate**: Zero unhandled auth errors in production
- **Developer Experience**: Time to integrate reduced by 60% compared to individual auth setup