# Tasks: Security & Observability Enhancements

## Phase 1 — Audit Logging Service Foundation
- [ ] Implement `packages/lint/src/audit-service.ts` with append-only event storage
- [ ] Define AuditEvent interface and SHA-256 digest schema
- [ ] Integrate with `@allah/arsy-orm` for automatic audit event injection on model lifecycle
- [ ] Implement `data/storage/` content-addressed storage pattern
- [ ] Add unit tests for audit service (create, retrieve, filter events)
- [ ] Verify no secret leakage in audit event hashes/values

## Phase 2 — Tenant Isolation Middleware
- [ ] Implement `packages/lint/src/tenant-middleware.ts` with principal-derived company_id
- [ ] Enforce fail-closed rejection on `legal_hold` / `retention_until` tenants
- [ ] Define explicit public allowlist (`/health`, `/ready`, onboarding, non-prod `/docs`)
- [ ] Integrate with all app hub routes via middleware composition
- [ ] Add integration tests across dock, headquarter, id, jizz, moonsky, harbor, gate, sentinel, server
- [ ] Verify tenant isolation blocks writes during legal_hold scenarios

## Phase 3 — Observability Pipeline
- [ ] Implement `packages/lint/src/observability.ts` with structured JSON logging
- [ ] Add request ID propagation and correlation across middleware boundaries
- [ ] Implement Prometheus-compatible metric emission (requests, errors, audit events, tenant violations)
- [ ] Add OpenTelemetry-compatible tracing with W3C traceparent propagation
- [ ] Configure batched log flush (1s or 100 events) for performance
- [ ] Add observability tests verifying log structure and metric output

## Phase 4 — Production Readiness Gates & Integration
- [ ] Update `pnpm verify:fast` to include security/observability checks
- [ ] Update `pnpm verify:release` to gate on audit logging, tenant isolation, and observability compliance
- [ ] Add `pnpm contract:check` extensions for audit event contracts
- [ ] Update `pnpm lint:arch` rules for security/observability invariants
- [ ] Verify all seven DNA skin worlds render security/observability UX consistently
- [ ] Run full release gate: `pnpm verify:release` passes end-to-end

## Phase 5 — Documentation & Type Safety
- [ ] Update type definitions in `@moonwitness/types` for audit events and tenant contexts
- [ ] Add JSDoc documentation for audit-service, tenant-middleware, observability APIs
- [ ] Update `DECISIONS.md` with architecture decisions for security/observability
- [ ] Update `AGENTS.md` with new invariants and middleware patterns
- [ ] Verify `pnpm typecheck` passes across all affected packages

## Parallelizable Workstreams
- Phase 1 and Phase 2 can run in parallel (no shared dependencies)
- Phase 3 can start once Phase 1 audit service is partially functional
- Phase 4 depends on completion of Phases 1-3
- Phase 5 can run concurrently with Phase 4 documentation reviews

## Required Files & Affected Modules

### New Files
- `packages/lint/src/audit-service.ts` - Audit logging service
- `packages/lint/src/tenant-middleware.ts` - Tenant isolation middleware
- `packages/lint/src/observability.ts` - Observability pipeline
- `packages/lint/test/audit-service.test.ts` - Audit service tests
- `packages/lint/test/tenant-middleware.test.ts` - Tenant middleware tests
- `packages/lint/test/observability.test.ts` - Observability tests

### Modified Files
- `packages/arsy-orm/src/` - Audit event injection on model lifecycle (insert/update/delete)
- `packages/ui/src/blocks/*.tsx` - Used for security/observability UX views (no changes needed, use existing)
- `packages/types/src/` - Updated type definitions for AuditEvent, TenantContext
- `apps/dock/src/` - Security middleware application and observability config
- `apps/headquarter/src/` - Security middleware application and observability config
- `apps/id/src/` - Security middleware application and observability config
- `apps/jizz/src/` - Security middleware application and observability config
- `apps/moonsky/src/` - Security middleware application and observability config
- `apps/harbor/src/` - Security middleware application and observability config
- `apps/gate/src/` - Security middleware application and observability config
- `apps/sentinel/src/` - Security middleware application and observability config
- `apps/server/src/` - Security middleware application and observability config

## Testing & Validation Procedures

### Unit Tests
- `pnpm --filter @moonwitness/lint test` - Audit service, tenant middleware, observability

### Integration Tests
- `pnpm --filter @allah/arsy test` - Audit event persistence with ORM operations
- Cross-app integration: verify security middleware and observability in all 9 apps

### Quality Gates
- `pnpm docs:check` (100/100 required)
- `pnpm contract:check` (unit contract presence + code cross-check)
- `pnpm contract:index:check` (contract index consistency)
- `pnpm lint:arch` (architecture invariant checks, zero warnings)
- `pnpm lint` (eslint, --max-warnings 0)
- `pnpm typecheck` (TS strict in all affected packages)
- `pnpm ui:test` (design system component and skin contracts)
- `pnpm ui:contrast` (WCAG ratios for skin token pairs)
- `pnpm verify:fast` (local docs + architecture + changed-file lint + incremental typecheck)
- `pnpm verify:release` (all required checks, tests, scaffold validation, and workspace builds)

## Completion Checklist
- [ ] Audit logging service implemented and tested in `@moonwitness/lint`
- [ ] Tenant isolation middleware implemented and tested across all apps
- [ ] Observability pipeline implemented with structured logging, metrics, and tracing
- [ ] All model lifecycle events automatically produce audit events via arsy-orm integration
- [ ] Fail-closed tenant rejection on legal_hold/retention_until verified
- [ ] Security middleware (default-deny, public allowlist) implemented in all apps
- [ ] Production readiness gates (`verify:fast`, `verify:release`) pass successfully
- [ ] All seven DNA skin worlds render security/observability UX consistently
- [ ] No `NEXT_PUBLIC_*` values carrying secrets reach the browser
- [ ] `pnpm lint:arch` passes with zero warnings for security/observability changes
- [ ] Type definitions updated and `pnpm typecheck` passes
- [ ] Documentation updated (`DECISIONS.md`, `AGENTS.md`, user guides)
- [ ] All quality gates (`pnpm docs:check`, `pnpm contract:check`, `pnpm lint:arch`, `pnpm typecheck`) pass