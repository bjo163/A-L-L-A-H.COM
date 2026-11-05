---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_SECURITY_OBSERVABILITY_ENHANCEMENTS"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---
# Security & Observability Enhancements

## Objective
Provide comprehensive security hardening and observability infrastructure across the MoonWitness & Empire of the Light ecosystem, ensuring all applications enforce tenant isolation, auditability, and production-grade observability while maintaining compatibility with the seven-world DNA skin system.

## Problem Statement
The monorepo currently lacks unified security and observability primitives. Individual apps implement basic logging and error handling, but there is no shared framework for:
- Centralized audit logging with tamper-evident records
- Tenant isolation enforcement across all data operations
- Security metrics and alerting infrastructure
- Production readiness validation gates
- Integration with the existing DNA skin engine for consistent security UX

## Objectives & Expected Outcomes
- Deploy a shared audit logging service with append-only event storage
- Enforce tenant_id derivation from authenticated principal (never from request body)
- Provide standardized security middleware for all hub routes
- Implement observability dashboards for request tracing, error rates, and security events
- Ensure all model operations (insert/update/delete) write audit events in the same transaction
- Create production readiness gates that verify security and observability compliance

## Functional Requirements
1. **Audit Logging Service**: Shared service that records every model insert/update/delete with changed field names (not values), tenant_id, actor identity, and timestamp in append-only storage
2. **Tenant Isolation Middleware**: Automatic derivation and validation of company_id on every row; fail-closed rejection on legal_hold / retention_until
3. **Security Middleware**: Default-deny auth policy for hub routes; explicit public allowlist (`/health`, `/ready`, onboarding, non-prod `/docs`)
4. **Observability Pipeline**: Structured logging (JSON format), request ID propagation, error boundary reporting, and Prometheus-compatible metrics
5. **Production Readiness Gates**: Automated checks that verify audit logging, tenant isolation, and security middleware are properly configured before deployment

## Non-Functional Requirements
- All audit events must be SHA-256 content-addressed and stored in `data/storage/<digest>`
- Zero secret leakage in logs (redact all `NEXT_PUBLIC_*` values carrying keys/secrets/tokens)
- Performance impact < 5ms per request for security middleware
- Observability data must not block primary request flow
- Compatibility with all seven DNA skin worlds (Imperium Lumen, Nexus Paradox, Lunar Chronicles, etc.)

## Scope
- Shared libraries: `@moonwitness/lint` architecture checks, audit logging service, tenant isolation middleware
- Affected apps: dock, headquarter, id, jizz, moonsky, harbor, gate, sentinel, server
- Integration with `@allah/arsy-orm` for embedded PGlite audit event storage
- Compliance with MOONFRAME SKIN ENGINE contract (token domains, motion, responsive behavior)

## Out-of-Scope
- Application-level business logic changes
- Database schema migrations beyond audit event table
- Third-party security tool integration (self-hosted only)
- Client-side secret management (remains server-authoritative)

## User Stories & Use Cases
1. **Developer**: "When I create a new service, the system automatically logs the creation event with tenant context, and I can query audit events without exposing raw data."
2. **Operator**: "When a suspicious operation occurs, the observability dashboard shows the request ID, affected tenant, and security context for investigation."
3. **Operator**: "When a tenant is on legal_hold, all write operations are rejected with a fail-closed error, and the audit log records the rejection."
4. **Designer**: "Security error pages and audit views use the approved DNA skin tokens and composition blocks, ensuring visual consistency across all seven worlds."

## Dependencies & Constraints
- `@allah/arsy-orm` embedded PGlite for audit event storage
- `@moonwitness/ui` composition blocks (header, destination-card, section-heading, route-shell, status-message, state-panel, kicker)
- MOONFRAME SKIN ENGINE contract token domains and invariants
- Existing `data/storage/` content-addressed storage pattern
- `lint:arch` architecture invariant checks
- `pnpm verify:release` full release gate

## Acceptance Criteria
- [ ] Audit logging service is operational and records all model lifecycle events with tenant_id and actor identity
- [ ] Tenant isolation middleware enforces company_id on every row and rejects operations on legal_hold/retention_until tenants
- [ ] Security middleware implements default-deny auth policy with explicit public allowlist
- [ ] Observability pipeline provides structured JSON logging, request ID propagation, and Prometheus metrics
- [ ] Production readiness gates pass: `pnpm verify:fast` and `pnpm verify:release` succeed
- [ ] All seven DNA skin worlds render security and observability UX consistently
- [ ] No `NEXT_PUBLIC_*` values carrying secrets reach the browser
- [ ] `pnpm lint:arch` passes with zero warnings for security/observability changes

## Success Metrics
- 100% of model insert/update/delete operations write audit events in the same transaction
- Zero audit events contain unredacted secret material
- < 5ms overhead for security middleware per request
- All quality gates (`pnpm docs:check`, `pnpm contract:check`, `pnpm lint:arch`, `pnpm typecheck`) pass
- Production deployment can be blocked by readiness gate failures