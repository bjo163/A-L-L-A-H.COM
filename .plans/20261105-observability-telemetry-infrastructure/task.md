---
contract: "DOCUMENTATION_CONTRACT.md"
id: "OBSERVABILITY_TELEMETRY_INFRASTRUCTURE"
version: "1.0.0"
owner: "platform"
status: "proposed"
---

# Task: Observability & Telemetry Infrastructure Implementation

## Implementation Phases

### Phase 1: Foundation & Core Package
**Objective**: Create the `@allah/observability` package with core interfaces and default implementations.

**Deliverables:**
- [ ] `packages/observability/package.json` with proper exports
- [ ] `packages/observability/src/index.ts` - Public API exports
- [ ] `packages/observability/src/logging/logger.ts` - Core logger implementation
- [ ] `packages/observability/src/logging/formatters.ts` - JSON format serialization
- [ ] `packages/observability/src/logging/providers/winston.provider.ts` - Winston transport
- [ ] `packages/observability/src/logging/providers/bunyan.provider.ts` - Bunyan transport
- [ ] `packages/observability/src/metrics/metrics.ts` - Metrics facade
- [ ] `packages/observability/src/metrics/types.ts` - Metric type definitions
- [ ] `packages/observability/src/metrics/exporters/prometheus.exporter.ts` - Prometheus exposition
- [ ] `packages/observability/src/tracing/correlation-id.ts` - Correlation ID management
- [ ] `packages/observability/src/tracing/context.ts` - Thread-local context
- [ ] `packages/observability/src/tracing/middleware/express.middleware.ts` - Express middleware
- [ ] `packages/observability/src/config/observability.config.ts` - Configuration interface
- [ ] `packages/observability/src/config/defaults.ts` - Default configuration values
- [ ] TypeScript types pass `pnpm typecheck` in strict mode
- [ ] Unit tests for all core modules

**Dependencies:** `@allah/types`, `@allah/sdk`

**Exit Criteria:**
- Package builds and types pass
- All unit tests pass
- Default configuration works out of the box

### Phase 2: Application Integration - Dock
**Objective**: Integrate observability into the dock application as the reference implementation.

**Deliverables:**
- [ ] Configure `@allah/observability` in dock app
- [ ] Add observability middleware to all routes
- [ ] Standardize all logging to use the package logger
- [ ] Expose `/api/observability/health` endpoint
- [ ] Expose `/metrics` Prometheus endpoint
- [ ] Verify correlation ID propagation through dock's HTTP stack
- [ ] Update dock's existing logging imports to use `@allah/observability`
- [ ] Update dock's Dockerfile for log forwarding if needed

**Dependencies:** `packages/observability` (Phase 1 complete)

**Exit Criteria:**
- All dock routes use observability middleware
- Logs contain required fields (timestamp, level, message, service, environment, trace_id)
- `/api/observability/health` returns correct observability metadata
- `/metrics` returns Prometheus-compatible exposition
- Correlation IDs propagate through dock's request pipeline

### Phase 3: Application Integration - Headquarter
**Objective**: Integrate observability into the headquarter application.

**Deliverables:**
- [ ] Configure `@allah/observability` in headquarter app
- [ ] Add observability middleware to all routes
- [ ] Standardize all logging to use the package logger
- [ ] Expose `/api/observability/health` endpoint
- [ ] Expose `/metrics` Prometheus endpoint
- [ ] Verify correlation ID propagation through headquarter's HTTP stack
- [ ] Update headquarter's existing logging imports to use `@allah/observability`

**Dependencies:** `packages/observability` (Phase 1 complete)

**Exit Criteria:**
- All headquarter routes use observability middleware
- Logs contain required fields
- `/api/observability/health` returns correct observability metadata
- `/metrics` returns Prometheus-compatible exposition
- Correlation IDs propagate through headquarter's request pipeline

### Phase 4: Application Integration - Remaining Applications
**Objective**: Integrate observability into remaining applications (id, jizz, gate, harbor, moonsky, sentinel, server).

**Deliverables:**
- [ ] Integrate `@allah/observability` into each remaining application
- [ ] Add observability middleware to each application
- [ ] Standardize logging across all apps
- [ ] Verify each app's health and metrics endpoints
- [ ] Ensure consistent behavior across all applications

**Dependencies:** `packages/observability` (Phase 1 complete), individual app configs

**Exit Criteria:**
- All 10+ applications adopt standardized logging format
- All applications expose health and metrics endpoints
- Correlation ID propagation verified across at least 3 applications

### Phase 5: Configuration & Sampling
**Objective**: Implement configuration system and sampling strategies.

**Deliverables:**
- [ ] `packages/observability/src/config/observability.config.ts` - Full configuration interface
- [ ] `packages/observability/src/config/defaults.ts` - Default values
- [ ] Environment-driven configuration (NODE_ENV, serviceName, etc.)
- [ ] Sampling rate configuration per service
- [ ] Conditional sampling based on log level, context, or custom rules
- [ ] Configuration validation and migration utilities

**Dependencies:** `packages/observability` (Phase 1 complete)

**Exit Criteria:**
- Configuration works across development, staging, and production
- Sampling rates configurable per environment
- Conditional sampling rules functional

### Phase 6: Documentation & Migration
**Objective**: Generate documentation and migration guides for existing applications.

**Deliverables:**
- [ ] `packages/observability/README.md` - Package documentation
- [ ] Migration guide for each existing application
- [ ] API reference for all public exports
- [ ] Configuration reference guide
- [ ] Example implementations for common patterns
- [ ] Updated AGENTS.md and quality gate documentation

**Dependencies:** All previous phases complete

**Exit Criteria:**
- Documentation generated and published
- Migration guides complete for all applications
- Team can onboard new application with observability in < 30 minutes

### Phase 7: Quality Gates & Verification
**Objective**: Verify all quality gates pass and success metrics are met.

**Deliverables:**
- [ ] `pnpm typecheck` passes across all applications
- [ ] `pnpm lint:arch` passes (arch invariants)
- [ ] `pnpm ui:contrast` passes (skin token contracts)
- [ ] All acceptance criteria from spec.md verified
- [ ] Success metrics documented and verified
- [ ] Report.md generated with evidence

**Dependencies:** All previous phases complete

**Exit Criteria:**
- All quality gates pass with 0 warnings
- Success metrics met or exceeded
- Report.md generated with verifiable evidence

## Ordered and Independently Executable Tasks

### TASK-01: Initialize package scaffolding
```
- Create packages/observability/ directory structure
- Initialize package.json with proper exports
- Set up TypeScript configuration
- Define package boundary in monorepo workspace
```
**Estimated effort:** 0.5 day
**Blocks:** TASK-02, TASK-03, TASK-04
**Owner:** platform team

### TASK-02: Implement core logging module
```
- Implement logger.ts with info/warn/error/debug methods
- Implement JSON format serialization in formatters.ts
- Implement Winston provider with console transport
- Implement Bunyan provider
- Export Logger interface and types
```
**Estimated effort:** 1 day
**Blocks:** TASK-03, TASK-04, TASK-05
**Owner:** platform team
**Definition of Done:** Unit tests pass; TypeScript types compile strict

### TASK-03: Implement metrics facade
```
- Implement metrics.ts with increment, decrement, gauge, histogram methods
- Implement Prometheus exporter with exposition format
- Define Metric, MetricLabel types
- Implement metric buffering and flushing
- Export Metrics interface and types
```
**Estimated effort:** 1 day
**Blocks:** TASK-04, TASK-06
**Owner:** platform team
**Definition of Done:** Unit tests pass; Prometheus exposition format correct

### TASK-04: Implement tracing & correlation ID
```
- Implement correlation-id.ts with UUID v4 generation
- Implement context.ts with thread-local storage
- Implement Express middleware for correlation ID injection
- Implement getCorrelationId() and setCorrelationId() APIs
- Export CorrelationContext interface and types
```
**Estimated effort:** 0.5 day
**Blocks:** TASK-05, TASK-06, TASK-07
**Owner:** platform team
**Definition of Done:** Correlation IDs propagate through Express requests; unit tests pass

### TASK-05: Implement configuration system
```
- Implement observability.config.ts with configuration interface
- Implement defaults.ts with sensible defaults
- Implement configuration validation
- Support environment variable overrides
- Export ObservabilityConfig type
```
**Estimated effort:** 0.5 day
**Blocks:** TASK-06
**Owner:** platform team
**Definition of Done:** Configuration works across environments; types pass strict mode

### TASK-06: Integrate into dock application (reference implementation)
```
- Add @allah/observability import to dock
- Configure observability with serviceName and environment
- Add middleware to all API routes
- Standardize existing logs to use package logger
- Expose /api/observability/health endpoint
- Expose /metrics Prometheus endpoint
- Verify all observability features work end-to-end
```
**Estimated effort:** 2 days
**Blocks:** TASK-07, TASK-08, TASK-09, TASK-10
**Owner:** dock team
**Definition of Done:**
- All dock logs contain: timestamp, level, message, service, environment, trace_id
- /api/observability/health returns service status, version, dependencies
- /metrics returns Prometheus-compatible exposition
- Correlation IDs propagate through dock's request pipeline
- No performance regression > 1ms per operation

### TASK-07: Integrate into headquarter application
```
- Add @allah/observability import to headquarter
- Configure observability with serviceName and environment
- Add middleware to all API routes
- Standardize existing logs to use package logger
- Expose /api/observability/health endpoint
- Expose /metrics Prometheus endpoint
- Verify all observability features work end-to-end
```
**Estimated effort:** 2 days
**Blocks:** TASK-08, TASK-09, TASK-10
**Owner:** headquarter team
**Definition of Done:** Same criteria as dock integration

### TASK-08: Integrate into remaining applications (id, jizz, gate, harbor)
```
- Integrate @allah/observability into each application
- Add observability middleware
- Standardize logging
- Verify health and metrics endpoints
```
**Estimated effort:** 3 days (across 4 applications)
**Blocks:** TASK-09, TASK-10
**Owner:** respective app teams
**Definition of Done:** Each application meets integration criteria from TASK-06/07

### TASK-09: Integrate into remaining applications (moonsky, sentinel, server)
```
- Integrate @allah/observability into each application
- Add observability middleware
- Standardize logging
- Verify health and metrics endpoints
```
**Estimated effort:** 2 days (across 3 applications)
**Blocks:** TASK-10
**Owner:** respective app teams
**Definition of Done:** Same integration criteria as TASK-08

### TASK-10: Configuration, sampling, and quality gate verification
```
- Implement full configuration system with environment overrides
- Implement sampling strategies (rate limiting, conditional sampling)
- Run pnpm typecheck across all applications
- Run pnpm lint:arch (arch invariants)
- Run pnpm ui:contrast (skin token contracts)
- Verify all acceptance criteria from spec.md
- Generate report.md with evidence
```
**Estimated effort:** 2 days
**Blocks:** (completion)
**Owner:** platform team
**Definition of Done:**
- All quality gates pass with 0 warnings
- Success metrics met or exceeded
- report.md generated with verifiable evidence
- All four plan documents (spec.md, design.md, task.md, rule.md) complete and synchronized

## Required Files and Affected Modules

### New Files to Create

| File Path | Purpose |
|---|---|
| `packages/observability/package.json` | Package definition and exports |
| `packages/observability/src/index.ts` | Public API exports |
| `packages/observability/src/logging/logger.ts` | Core logger implementation |
| `packages/observability/src/logging/formatters.ts` | JSON format serialization |
| `packages/observability/src/logging/providers/winston.provider.ts` | Winston transport |
| `packages/observability/src/logging/providers/bunyan.provider.ts` | Bunyan transport |
| `packages/observability/src/metrics/metrics.ts` | Metrics facade |
| `packages/observability/src/metrics/types.ts` | Metric type definitions |
| `packages/observability/src/metrics/exporters/prometheus.exporter.ts` | Prometheus exposition |
| `packages/observability/src/tracing/correlation-id.ts` | Correlation ID management |
| `packages/observability/src/tracing/context.ts` | Thread-local context |
| `packages/observability/src/tracing/middleware/express.middleware.ts` | Express middleware |
| `packages/observability/src/config/observability.config.ts` | Configuration interface |
| `packages/observability/src/config/defaults.ts` | Default configuration values |
| `packages/observability/tests/unit/logger.unit.test.ts` | Logger unit tests |
| `packages/observability/tests/unit/metrics.unit.test.ts` | Metrics unit tests |
| `packages/observability/tests/unit/tracing.unit.test.ts` | Tracing unit tests |
| `packages/observability/tests/integration/end-to-end.test.ts` | End-to-end tests |

### Modified Files

| File Path | Modification |
|---|---|
| `apps/dock/src/` | Add observability middleware, update logs to package logger |
| `apps/headquarter/src/` | Add observability middleware, update logs to package logger |
| `apps/id/src/` | Add observability middleware, update logs to package logger |
| `apps/jizz/src/` | Add observability middleware, update logs to package logger |
| `apps/gate/src/` | Add observability middleware, update logs to package logger |
| `apps/harbor/src/` | Add observability middleware, update logs to package logger |
| `apps/moonsky/src/` | Add observability middleware, update logs to package logger |
| `apps/sentinel/src/` | Add observability middleware, update logs to package logger |
| `apps/server/src/` | Add observability middleware, update logs to package logger |

### New Dependencies

| Package | Version | Purpose |
|---|---|---|
| `winston` | ^3.0.0 | Logger transport for Node.js |
| `bunyan` | ^1.8.0 | Alternative logger format |
| `prom-client` | ^14.0.0 | Prometheus metrics client |

### Testing and Validation Procedures

#### Unit Tests

| Module | Test Coverage |
|---|---|
| logger | info, warn, error, debug methods; child logger; format serialization |
| metrics | increment, decrement, gauge, histogram; Prometheus exposition; buffering |
| tracing | correlation ID generation; context management; middleware functionality |

#### Integration Tests

| Test | Scope |
|---|---|
| End-to-end | Full observability stack: log → correlation ID → metric → health endpoint |
| Application integration | Each app's health and metrics endpoints functional |
| Correlation propagation | Trace ID through multiple HTTP requests across apps |

#### Quality Gates

- [ ] `pnpm typecheck` - TypeScript strict mode across all applications (0 errors)
- [ ] `pnpm lint:arch` - Architectural invariants (0 warnings)
- [ ] `pnpm ui:contrast` - Skin token contracts (100% WCAG compliance)
- [ ] `pnpm docs:check` - Documentation contract (100/100 required)
- [ ] `pnpm ui:test` - Design system component and skin contracts

#### Validation Commands

```bash
# Type check
pnpm typecheck

# Architecture lint
pnpm lint:arch

# UI contrast
pnpm ui:contrast

# Build dock (reference app)
pnpm dock:build

# Build headquarter
pnpm headquarter:build
```

## Completion Checklist

### Phase 1: Foundation & Core Package ✅
- [ ] packages/observability package.json created
- [ ] All source files implemented
- [ ] TypeScript types pass strict mode
- [ ] Unit tests pass (logger, metrics, tracing)

### Phase 2: Application Integration - Dock ✅
- [ ] Observability middleware added to all routes
- [ ] All logs use package logger with required fields
- [ /api/observability/health endpoint functional
- [ /metrics Prometheus endpoint functional
- [ ] Correlation ID propagation verified

### Phase 3: Application Integration - Headquarter ✅
- [ ] Observability middleware added to all routes
- [ ] All logs use package logger with required fields
- [ /api/observability/health endpoint functional
- [ /metrics Prometheus endpoint functional
- [ ] Correlation ID propagation verified

### Phase 4: Application Integration - Remaining Apps ✅
- [ ] All 10+ apps integrated
- [ ] Standardized logging format across all apps
- [ ] All health and metrics endpoints functional

### Phase 5: Configuration & Sampling ✅
- [ ] Configuration system works across environments
- [ ] Sampling rates configurable

### Phase 6: Documentation & Migration ✅
- [ ] Package README generated
- [ ] Migration guides for all apps
- [ ] API reference documented

### Phase 7: Quality Gates & Verification ✅
- [ ] pnpm typecheck passes (0 errors)
- [ ] pnpm lint:arch passes (0 warnings)
- [ ] pnpm ui:contrast passes (100% WCAG)
- [ ] All acceptance criteria verified
- [ ] report.md generated with evidence
- [ ] All four plan documents complete and synchronized

### Overall Completion ✅
- [ ] spec.md - Feature specification complete
- [ ] design.md - Technical & UX design complete
- [ ] task.md - Implementation breakdown complete
- [ ] rule.md - Rules & guardrails complete (to be created)
- [ ] All quality gates pass
- [ ] Success metrics met or exceeded
- [ ] Plan ready for implementation execution