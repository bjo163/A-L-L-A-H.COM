---
contract: "DOCUMENTATION_CONTRACT.md"
id: "OBSERVABILITY_MONITORING_SYSTEM_RULES"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---

# Observability and Monitoring System — Implementation Rules & Agent Guardrails

## Mandatory Architectural Invariants

### 1. Service Boundary Integrity
- **NO direct database access** from observability components to service databases
- **NO bypassing** ARSY authorization for observability APIs
- **NO shared state** between observability services and business services
- **NO client-side secrets** in observability dashboards

### 2. Data Privacy and Security
- **PII MUST be redacted** before reaching storage (emails, phones, IPs, names)
- **Secrets MUST never be logged** (API keys, tokens, passwords, encryption keys)
- **Trace context MUST NOT contain** sensitive data
- **Metric labels MUST NOT contain** high-cardinality PII
- **GDPR compliance** required for all data handling

### 3. Tenant Isolation
- **ALL metrics MUST include** `company_id` label where applicable
- **ALL traces MUST include** `company_id` attribute
- **ALL logs MUST include** `company_id` field
- **Dashboard queries MUST filter** by user's tenant context
- **NO cross-tenant data leakage** in observability

### 4. Performance and Overhead
- **Instrumentation overhead <5%** on instrumented services
- **OTel Collector CPU <50%** under peak load
- **Memory usage bounded** for all observability components
- **Network traffic optimized** with compression
- **Sampling strategy** to control volume (10-20% traces in prod)

### 5. Observability of Observability
- **ALL observability components MUST expose** `/metrics` endpoint
- **ALL observability components MUST emit** structured logs
- **ALL observability components MUST be** traceable
- **Health checks MUST be** comprehensive
- **Alerting MUST cover** observability stack health

## Coding Conventions and Repository Standards

### 1. Package Structure
```
packages/observability/
├── src/
│   ├── logger.ts          # Winston/Pino wrapper with redaction
│   ├── metrics.ts         # Prometheus client registry
│   ├── tracing.ts         # OpenTelemetry tracer provider
│   ├── middleware.ts      # Framework-specific middleware
│   ├── context.ts         # W3C trace context propagation
│   ├── sanitize.ts        # PII/secrets redaction utilities
│   ├── types.ts           # Shared TypeScript types
│   └── index.ts           # Public exports
```

### 2. Naming Conventions
- **Metric names**: `service_metric_name_total`, `service_metric_name_seconds`
- **Log fields**: `trace_id`, `span_id`, `service`, `level`, `company_id`
- **Trace attributes**: `service.name`, `service.version`, `http.method`, `db.statement`
- **Environment variables**: `OBSERVABILITY_*`
- **File names**: kebab-case for configs, camel-case for TypeScript

### 3. Dependency Rules
- **packages/observability** depends only on:
  - `@opentelemetry/api`
  - `@opentelemetry/sdk-node`
  - `@opentelemetry/auto-instrumentations-node`
  - `@opentelemetry/instrumentation-http`
  - `@opentelemetry/instrumentation-express`
  - `@opentelemetry/instrumentation-fastify`
  - `@opentelemetry/instrumentation-pg`
  - `prom-client`
  - `winston` or `pino`
- **Services** depend only on `packages/observability`
- **NO direct dependencies** on OpenTelemetry packages in services
- **NO circular dependencies** between observability and business logic

### 4. TypeScript Standards
- **Strict mode** enabled (`strict`, `noImplicitAny`, `strictNullChecks`)
- **Explicit return types** for all public functions
- **Typed context** for trace propagation
- **Generic constraints** for metrics
- **Branded types** for trace/span IDs

### 5. Configuration Standards
- **Environment variables** with sensible defaults
- **Configuration objects** validated at startup
- **Separate configs** for dev/staging/prod
- **Secrets in Vault/Coolify**, never in code
- **Feature flags** for experimental instrumentation

## API and Database Rules

### 1. API Contracts
- **W3C TraceContext headers** required for all HTTP requests
- **Structured logging** with consistent schema
- **Prometheus metrics** at `/metrics` endpoint
- **Health checks** at `/healthz` endpoint
- **Rate limiting** on observability APIs
- **Authentication** for Headquarter observability APIs
- **CORS** restricted to internal domains

### 2. Database Rules (PGlite via ORM)
- **NO direct SQL queries** in observability components
- **NO schema modifications** for observability
- **NO new tables** for observability data
- **Observability data stored** in dedicated time-series databases
- **Metric aggregation** happens at collection time, not query time

### 3. Plugin Boundaries
- **Observability hooks** in plugin entry points
- **Plugin metrics** include plugin name label
- **Plugin traces** include plugin span attributes
- **Plugin logs** include plugin source
- **NO plugin modifications** to observability library

## UI/UX and Design-System Consistency

### 1. Component Library
- **ONLY** use `@moonwitness/ui` components
- **ONLY** use NEXUS PARADOX skin tokens
- **NO** custom CSS for layout/spacing
- **NO** hardcoded colors, fonts, shadows
- **NO** arbitrary Tailwind values

### 2. Dashboard Patterns
- **Progressive disclosure**: Summary → Details → Raw data
- **Real-time updates**: SSE/WebSocket for live metrics
- **Error boundaries**: Graceful degradation when services down
- **Loading states**: Skeleton loaders for all data
- **Empty states**: Helpful guidance when no data
- **Mobile responsive**: Ops-friendly mobile views

### 3. Accessibility
- **WCAG AA** minimum contrast
- **Keyboard navigation** support
- **Screen reader** labels
- **Focus management** for modals
- **Colorblind-friendly** charts
- **Reduced motion** support

### 4. Data Visualization
- **Time-series charts** for metrics
- **Waterfall charts** for traces
- **Heatmaps** for latency distributions
- **Gauge charts** for SLO compliance
- **Table views** for log exploration
- **Export capabilities** for all views

## Security and Privacy Requirements

### 1. Data Classification
| Data Type | Classification | Handling |
|-----------|---------------|----------|
| Trace IDs | Internal | Logged, stored, transmitted |
| Span IDs | Internal | Logged, stored, transmitted |
| Service Names | Public | Exposed in dashboards |
| Company IDs | Internal | Used for isolation |
| User IDs | PII | Hashed/masked in logs |
| Emails | PII | NEVER logged |
| Phone Numbers | PII | NEVER logged |
| IP Addresses | PII | Masked (last octet) |
| API Keys | Secret | NEVER logged/traced |
| Tokens | Secret | NEVER logged/traced |
| Request Bodies | Sensitive | Sanitized before logging |

### 2. Redaction Rules
- **Automatic redaction** of known PII fields
- **Pattern-based redaction** for emails, phones, IPs, SSNs
- **Configurable redaction** for custom fields
- **Log-level redaction** (error logs may have less redaction)
- **Trace attribute redaction** before export

### 3. Access Control
- **RBAC** for dashboard access
- **Role-based filtering** of metrics/logs/traces
- **Audit logging** of observability access
- **No anonymous access** to observability APIs
- **Tenant isolation** enforced at query layer

### 4. Network Security
- **TLS everywhere** (mutual TLS where applicable)
- **Network policies** restricting inter-service communication
- **Firewall rules** blocking external access to observability ports
- **Rate limiting** on all observability endpoints
- **DoS protection** for metrics endpoints

## Testing and Quality Requirements

### 1. Unit Testing
- **90%+ coverage** for observability library
- **Mock external dependencies** (OTel, Prometheus, Loki)
- **Test PII redaction** with edge cases
- **Test context propagation** across async boundaries
- **Test error handling** in instrumentation

### 2. Integration Testing
- **End-to-end trace validation**
- **Metric accuracy validation**
- **Log correlation validation**
- **Alert triggering validation**
- **Dashboard data accuracy validation**

### 3. Performance Testing
- **Load testing** with realistic traffic patterns
- **Overhead measurement** (<5% CPU, <50MB memory)
- **Scalability testing** (100K+ metrics/sec)
- **Network bandwidth testing**
- **Storage growth monitoring**

### 4. Security Testing
- **PII leakage testing**
- **Secret detection testing**
- **Access control testing**
- **TLS validation**
- **Input sanitization testing**

### 5. Acceptance Criteria
- **All quality gates pass** (`pnpm verify:release`)
- **All lint:arch passes**
- **All docs:check passes**
- **All typecheck passes**
- **All ui:test passes**
- **All ui:contrast passes**
- **All app builds pass**
- **All service builds pass**

## Performance Constraints

### 1. Latency Requirements
- **Instrumentation overhead**: <1ms per request
- **OTel export latency**: <100ms p95
- **Metric query latency**: <1s for dashboard
- **Trace query latency**: <2s for waterfall
- **Log query latency**: <3s for search

### 2. Throughput Requirements
- **Metrics**: 100K+ metrics/sec
- **Logs**: 1M+ log events/sec
- **Traces**: 10K+ traces/sec
- **Alerts**: 1K+ alerts/min
- **Dashboard queries**: 100+ QPS

### 3. Resource Limits
- **OTel Collector**: <2GB RAM, <2 CPU cores
- **Prometheus**: <4GB RAM, <2 CPU cores
- **Loki**: <4GB RAM, <2 CPU cores
- **Tempo**: <2GB RAM, <1 CPU core
- **Grafana**: <1GB RAM, <1 CPU core
- **Alertmanager**: <512MB RAM

### 4. Retention Policies
- **Metrics**: 30 days high-resolution, 365 days downsampled
- **Logs**: 30 days hot, 90 days cold
- **Traces**: 14 days
- **Alerts**: 90 days
- **Audit logs**: 365 days

## Backward Compatibility Requirements

### 1. Existing Services
- **NO breaking changes** to existing service APIs
- **NO breaking changes** to existing database schemas
- **NO breaking changes** to existing configuration
- **Graceful degradation** if observability unavailable
- **Fallback logging** to existing loggers

### 2. Configuration
- **Existing env vars** remain functional
- **Existing Docker configs** remain functional
- **Existing CI/CD pipelines** remain functional
- **Existing monitoring** remains functional

### 3. Data Formats
- **Existing log formats** preserved (additive only)
- **Existing metric names** preserved (additive only)
- **Existing trace formats** preserved (additive only)

## Forbidden Patterns and Anti-Patterns

### 1. Anti-Patterns to Avoid
- **NO** direct database connections from observability components
- **NO** hardcoded service URLs in observability code
- **NO** synchronous blocking operations in instrumentation
- **NO** high-cardinality metric labels (user IDs, request IDs)
- **NO** logging full request/response bodies
- **NO** storing PII in metrics or traces
- **NO** using observability for business analytics
- **NO** complex logic in middleware (keep it fast)

### 2. Forbidden Dependencies
- **NO** vendor-specific APM SDKs (Datadog, New Relic, etc.)
- **NO** proprietary data formats
- **NO** custom instrumentation frameworks
- **NO** heavy dependencies in instrumented services
- **NO** runtime code modification (monkey patching)

### 3. Forbidden Configurations
- **NO** 100% trace sampling in production
- **NO** infinite retention without cost controls
- **NO** public exposure of observability endpoints
- **NO** unencrypted communication between components
- **NO** hardcoded credentials in configs

### 4. Forbidden Code Patterns
- **NO** `console.log` in production code
- **NO** synchronous file I/O in request path
- **NO** blocking database calls in middleware
- **NO** magic strings for metric names
- **NO** untyped context propagation
- **NO** ignoring error returns from instrumentation

## Agent Execution Boundaries

### 1. Scope of Authority
- **MUST** create `packages/observability` package
- **MUST** instrument all existing services
- **MUST** deploy observability stack
- **MUST** create Headquarter dashboard
- **MUST** implement alerting and SLOs
- **MUST** ensure all quality gates pass

### 2. Prohibited Actions
- **NO** modification of business logic
- **NO** changes to authentication/authorization
- **NO** changes to database schemas
- **NO** changes to existing API contracts
- **NO** changes to UI design system
- **NO** changes to existing service contracts

### 3. Verification Requirements
- **MUST** run `pnpm verify:release` before marking complete
- **MUST** run all app builds
- **MUST** run all package builds
- **MUST** run all tests
- **MUST** verify no regressions in existing functionality

### 4. Safety Interlocks
- **MUST** test in staging before production
- **MUST** validate PII redaction with test data
- **MUST** validate trace correlation with test traces
- **MUST** validate alerting with test alerts
- **MUST** validate dashboard with test data

## Git and Branch Workflow Requirements

### 1. Branch Naming
- **Feature branches**: `feat/observability-*`
- **Bug fix branches**: `fix/observability-*`
- **Refactor branches**: `chore/observability-*`
- **Documentation branches**: `docs/observability-*`

### 2. Commit Messages
- **Conventional Commits** format
- **Scope**: `observability`
- **Type**: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`
- **Breaking changes**: `BREAKING CHANGE:` footer

### 3. Pull Request Requirements
- **Title**: Conventional commit format
- **Description**: Summary of changes
- **Checklist**: Testing, documentation, security review
- **Reviewers**: At least one platform engineer
- **Checks**: All CI checks must pass

### 4. Merge Strategy
- **Squash merge** for feature branches
- **Rebase merge** for bug fixes
- **Fast-forward** only for documentation
- **NO force push** to main/dev
- **NO direct commits** to main/dev

### 5. Release Process
- **Version bump** per semantic versioning
- **Changelog entry** for all changes
- **Tag creation** for releases
- **GitHub release** with notes

## Validation Requirements Before Marking Tasks Complete

### 1. Technical Validation
- [ ] All services start without errors
- [ ] All services expose `/metrics` endpoint
- [ ] All services emit structured logs
- [ ] All services export traces
- [ ] OTel Collector receives data
- [ ] Prometheus scrapes metrics
- [ ] Loki ingests logs
- [ ] Tempo ingests traces
- [ ] Grafana queries work
- [ ] Alertmanager sends alerts

### 2. Functional Validation
- [ ] End-to-end traces work (HQ → ARSY → Sentinel → DB)
- [ ] Trace correlation in logs works
- [ ] SLO calculations work
- [ ] Alerting triggers correctly
- [ ] Dashboard renders real-time data
- [ ] Search/filter works in log viewer
- [ ] Trace waterfall renders correctly

### 3. Quality Validation
- [ ] `pnpm verify:release` passes
- [ ] `pnpm lint:arch` passes
- [ ] `pnpm docs:check` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm ui:test` passes
- [ ] `pnpm ui:contrast` passes
- [ ] All app builds pass
- [ ] All package builds pass

### 4. Security Validation
- [ ] No PII in logs/traces/metrics
- [ ] No secrets in logs/traces/metrics
- [ ] No sensitive data in high-cardinality labels
- [ ] Access control enforced
- [ ] Tenant isolation enforced
- [ ] TLS enabled everywhere

### 5. Operational Validation
- [ ] Runbooks documented
- [ ] Backup/restore tested
- [ ] Disaster recovery verified
- [ ] Cost monitoring active
- [ ] Alerting for observability stack
- [ ] Self-observability working

### 6. Performance Validation
- [ ] Instrumentation overhead <5%
- [ ] Resource usage within limits
- [ ] Query latency within requirements
- [ ] Throughput meets requirements
- [ ] Scaling tested