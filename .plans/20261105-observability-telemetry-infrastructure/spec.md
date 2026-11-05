---
contract: "DOCUMENTATION_CONTRACT.md"
id: "OBSERVABILITY_TELEMETRY_INFRASTRUCTURE"
version: "1.0.0"
owner: "platform"
status: "proposed"
---

# Specification: Observability & Telemetry Infrastructure

## Motivation

The A-L-L-A-H.COM monorepo contains 10+ applications and 15+ packages with distributed deployments. Current observability is fragmented: each application implements its own logging, error tracking, and metrics collection with inconsistent patterns. This creates blind spots in production debugging, makes cross-application root cause analysis difficult, and prevents unified dashboards. A shared observability infrastructure is needed to provide consistent logging, metrics, and tracing across the entire ecosystem.

## Problem Statement

- **Fragmented logging**: Applications use different log formats, levels, and output destinations
- **Missing metrics**: No standardized way to collect and expose business or system metrics
- **No tracing**: Distributed requests across microservices lack correlation IDs and trace spans
- **Inconsistent error tracking**: Error reporting varies across applications, losing context
- **No unified dashboards**: Inability to create cross-application health views
- **Observability debt**: Adding new observability features requires duplicate effort in each app

## Objectives and Expected Outcomes

- **Unified logging**: Structured JSON logging with consistent format across all applications
- **Metric collection**: Standardized metric types (counters, gauges, histograms) with consistent labeling
- **Distributed tracing**: Automatic trace context propagation via correlation IDs across HTTP requests
- **Error aggregation**: Centralized error collection with stack traces, contexts, and user impact data
- **Health endpoints**: Standardized `/health` and `/ready` endpoints with observability metadata
- **Observability configuration**: Single source of truth for endpoint URLs, authentication, and sampling rates

## Functional Requirements

| ID | Requirement |
|---|---|
| FR-001 | All applications must emit structured JSON logs with `timestamp`, `level`, `message`, `service`, `environment`, and `trace_id` fields |
| FR-002 | Implement a `metrics` facade providing `increment`, `decrement`, `gauge`, and `histogram` operations with configurable labels |
| FR-003 | Automatically inject correlation IDs into all HTTP requests and propagate them to downstream calls |
| FR-004 | Provide a `captureError` function that captures errors with stack traces, metadata, and automatic correlation ID attachment |
| FR-005 | Expose `/api/observability/health` endpoint returning service status, version, and dependency health |
| FR-006 | Configure centralized log aggregation with consistent index structure across all deployments |
| FR-007 | Implement metric reporting with Prometheus-compatible exposition format |
| FR-008 | Support sampling strategies (rate limiting, conditional sampling) configurable per service |

## Non-Functional Requirements

- **Performance**: Logging and metric collection must have < 1ms overhead per operation in production
- **Reliability**: Failed observability transmission must not block request processing (async, best-effort delivery)
- **Security**: No sensitive data (passwords, tokens, PII) in logs or metrics; automatic redaction
- **Observability**: The observability system itself must be observable via health endpoints
- **Compatibility**: Must work with existing Node.js 16+/Bun runtimes used across applications
- **Type Safety**: Full TypeScript typings with strict mode compatibility

## Scope

### In Scope

- Core observability package (`packages/observability`) with logging, metrics, and tracing utilities
- Standardized log format and structure for all applications
- Metrics facade with Prometheus exposition format
- Correlation ID middleware for Express/Next.js routes
- Error capture and aggregation utilities
- Health check endpoints with observability metadata
- Configuration system for log destinations, metric endpoints, and sampling rates
- TypeScript typings and documentation
- Migration guides for existing applications

### Out of Scope

- Building dashboards or visualization interfaces (consumer responsibility)
- Implementing specific APM vendors (Datadog, New Relic, etc.) — provide abstraction layer instead
- Collecting user behavior analytics or personal data
- Real-time alerting configuration (separate concern)
- Custom business metric definitions (provide framework, define specific metrics per domain)

## User Stories and Use Cases

### US-001: Developer debugging production issues

As a developer debugging a production issue, I want structured logs with consistent format and correlation IDs so that I can trace requests across services and quickly identify the root cause.

**Scenario**: A user reports that the checkout flow fails intermittently. I can search logs by correlation ID, see the full request trace across dock, headquarter, and gateway services, and identify where the failure occurs.

### US-002: Operator monitoring system health

As an operator monitoring system health, I want standardized metrics exposed in Prometheus format so that I can create unified dashboards for across all applications without learning each app's monitoring setup.

**Scenario**: I create a Grafana dashboard showing request rates, error rates, and latency percentiles for all applications using a single query pattern.

### US-003: Onboarding new application

As a new application developer, I want to import a single observability package and have all logging, metrics, and tracing work out of the box so that I don't need to implement observability from scratch.

**Scenario**: I create a new microservice and import `@allah/observability`. All requests automatically get correlation IDs, error logging works with proper context, and metrics are exposed without additional configuration.

## Dependencies and Constraints

### Dependencies

- `@allah/types` — shared type definitions used across the monorepo
- `@allah/sdk` — client↔hub communication patterns for correlation context
- PGlite (for any database-related observability data)
- Existing husky hooks (pre-commit, pre-push) for code quality gate

### Constraints

- Must not introduce breaking changes to existing logging patterns without migration path
- Must work within the existing husky/pre-commit/pre-push gate infrastructure
- Must respect the frozen-lockfile dependency management system
- Must not weaken existing auth, tenant, SQL, retention, or SSRF invariants
- Must comply with the MoonWitness style purity rules (PALETTE_PURITY, STYLE_PURITY, ICON_PURITY)
- Must be compatible with Next.js 16 App Router and Server Components

## Ecosystem and Roadmap Alignment

- **Roadmap Stage 3**: Directly supports "Platform foundations: auth · data · observability · auditability · CI"
- **Roadmap Stage 4**: Enables "Product integration: prioritized apps/journeys · content migration with provenance" by providing cross-application visibility
- **LEGACY_RECONCILIATION**: Must not conflict with canon asset tracking or world observatory integration
- **Design System**: Must respect existing UI design tokens and not introduce arbitrary colors or styles
- **Package Ownership**: `@allah/observability` package to be created under the packages namespace

## Acceptance Criteria

- [ ] `packages/observability` package created with logging, metrics, and tracing exports
- [ ] All 10+ applications adopt the standardized logging format (JSON with required fields)
- [ ] Correlation ID propagation works end-to-end across at least 3 applications
- [ ] Metrics facade provides Prometheus-compatible exposition format
- [ ] Health endpoints include observability metadata (version, dependencies, status)
- [ ] Error capture includes stack traces and automatic correlation ID attachment
- [ ] Configuration is environment-driven with sensible defaults
- [ ] TypeScript types pass `pnpm typecheck` across all applications
- [ ] No performance regression > 1ms per logging/metrics operation
- [ ] Documentation generated and published to package registry

## Success Metrics

| Metric | Target |
|---|---|
| % of applications using standardized logging | 100% |
| Average time to trace a request across services | < 5 minutes (vs. currently > 30 minutes) |
| Log format consistency score | 100% (no custom formats in production) |
| Metrics coverage (apps emitting metrics) | 80% |
| Correlation ID propagation success rate | 99% across HTTP boundary |
| Observability package TypeScript errors | 0 in strict mode |