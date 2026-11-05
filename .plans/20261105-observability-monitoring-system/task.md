---
contract: "DOCUMENTATION_CONTRACT.md"
id: "OBSERVABILITY_MONITORING_SYSTEM_TASKS"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---
# Observability and Monitoring System — Implementation Breakdown

Task map derived from `spec.md` (FR-001..FR-010, NFR-001..NFR-008) and its milestones M1–M7.
Every task traces to a requirement; nothing here expands scope beyond the spec's In-Scope list.

## Phase 1 — Core instrumentation foundation (M1)

- [ ] Create a shared telemetry bootstrap module (OpenTelemetry Node/TS SDK) exposing a single
      `initObservability(serviceName)` entry so a developer adds instrumentation with one import
      (FR-003, Developer Story 1).
- [ ] Define the structured log schema: timestamp, level, service, `traceId`, `spanId`, message
      (FR-001).
- [ ] Establish a correlation-ID policy threaded from the API gateway through ARSY to the database
      and back (Objective: end-to-end visibility).
- [ ] Confirm the bootstrap works inside the existing Docker/Coolify deployment model and does not
      require services to change their start command (NFR-008).

## Phase 2 — Metrics export from all services (M2 · FR-002, FR-004, FR-005)

- [ ] ARSY Hub: add a `/metrics` endpoint in Prometheus format on the Fastify server.
- [ ] Sentinel: emit RADIUS daemon metrics — auth rate, accounting rate, active sessions
      (Acceptance: Sentinel RADIUS metrics available).
- [ ] Headquarter, Dock, ID: expose `/metrics` for the Next.js applications without breaking App
      Router patterns (ecosystem constraint).
- [ ] Infrastructure metrics: database, Redis, network, CPU, memory, disk utilization (FR-005).
- [ ] Service-to-service call metrics: latency, error rate, volume (FR-004).

## Phase 3 — Distributed tracing (M3 · FR-003)

- [ ] Instrument cross-boundary spans so a request traces gateway → ARSY → DB → response.
- [ ] Verify span context propagates between services (Operator Story 3: trace a user request).
- [ ] Ensure tracing never captures PII, secrets, or tokens (NFR-003, regulatory constraint).

## Phase 4 — Log aggregation and correlation (M4 · FR-001, FR-009)

- [ ] Stand up the OpenTelemetry Collector and a log sink (Loki / Elasticsearch class).
- [ ] Enable searching logs by trace ID (Operator Story 4).
- [ ] Implement configurable log retention with cost optimization (FR-009, NFR-005).

## Phase 5 — SLO tracking and alerting (M5 · FR-006, FR-007)

- [ ] Model service-level objectives with error-budget calculation (FR-006).
- [ ] Wire an alerting engine with deduplication, routing, and escalation (FR-007).
- [ ] Add capacity alerts projected 24–48 hours before saturation (Expected Outcome).
- [ ] Provide 99.9% SLA visibility for critical services (Expected Outcome).

## Phase 6 — Headquarter observability dashboard (M6 · FR-008, FR-010)

- [ ] Build a real-time system-health dashboard surface in Headquarter (FR-008).
- [ ] Back long-term metric storage in a time-series database (FR-010).
- [ ] Surface per-service SLO compliance for developers (Developer Story 2).

## Phase 7 — Production hardening and cost optimization (M7)

- [ ] Measure and cap instrumentation overhead below 5% CPU on instrumented services (NFR-001).
- [ ] Prove the observability system does not affect core service availability, and survives
      service restarts (NFR-002, Acceptance).
- [ ] Make the observability stack observable itself (NFR-006).
- [ ] Verify GDPR-compliant log handling and cost stays under budget at target scale
      (NFR-007, NFR-005).
- [ ] Load test against 100K+ metrics/sec and 1M+ log events/sec (NFR-004).

## Task dependencies

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
```

Tracing (P3) and metrics (P2) both depend on the shared bootstrap and correlation IDs from P1.
Alerting (P5) depends on SLO data from P2/P4. The dashboard (P6) consumes P2/P5 outputs.

## Out-of-scope (explicit, per spec)

- APM profiling, business/user-behavior analytics, custom instrumentation libraries, ML anomaly
  detection, and monitoring of external third-party APIs beyond our control.

## Acceptance / verification gate

- [ ] `pnpm verify:release` and all quality gates pass.
- [ ] Structured logs carry trace correlation; `/metrics` in Prometheus format on every service.
- [ ] End-to-end trace works for API → ARSY → DB; SLO-violation alerts deduplicate correctly.
- [ ] No sensitive data in logs/traces/metrics; GDPR compliance verified.
- [ ] Incident simulation demonstrates MTTR improvement.
