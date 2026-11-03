---
title: "Real-time Alert System Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T03:35:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 24
parent_issue: 5
---

# TASKS

- [ ] **Backend Development**
  - [ ] Create `alertBus.ts` in `apps/arsy/src/bus/` implementing an EventEmitter with typed `AlertEvent` payloads.
  - [ ] Add Fastify SSE route `GET /v1/alerts/stream` in `apps/arsy/src/routes/alerts.ts`.
  - [ ] Implement per‑tenant subscription isolation using `company_id` extracted from JWT.
  - [ ] Normalize incoming events from WATCHTOWER, SENTINEL, CHRONICLE, HELIOGRID via adapters (`watchtowerAdapter.ts`, etc.).
  - [ ] Persist each received alert to `CHRONICLE` table `alert_audit` with SHA‑256 hash of payload.
  - [ ] Write comprehensive unit tests for each adapter and the SSE endpoint (jest + supertest).
  - [ ] Write integration test simulating 100 concurrent SSE clients verifying ordering and latency.

- [ ] **SDK Extension**
  - [ ] Add `subscribeAlerts(filter?: AlertFilter)` method in `packages/sdk/src/alerts.ts` returning an `EventSource` wrapper.
  - [ ] Export TypeScript types `AlertEvent`, `AlertFilter`.
  - [ ] Add JSDoc comments and generate SDK docs.

- [ ] **Frontend UI**
  - [ ] Create `/alerts` page under `apps/headquarter/pages/alerts.tsx`.
  - [ ] Build `AlertFeed` component using `@moonwitness/ui` `List` and `Badge` primitives.
  - [ ] Implement filter toolbar (severity, source) with debounced client‑side filters.
  - [ ] Connect to SDK `subscribeAlerts` with dynamic query parameters.
  - [ ] Add ARIA live region for high‑severity alerts.
  - [ ] Write component tests (React Testing Library) covering filter changes and reconnection logic.

- [ ] **Security & Rate Limiting**
  - [ ] Enforce role check middleware (`operator`, `admin`).
  - [ ] Apply token‑bucket rate limiter (200 events/sec/client).
  - [ ] Add audit log entry for each subscription start/stop.

- [ ] **Observability**
  - [ ] Export Prometheus metrics `alert_sse_latency_seconds`, `alert_bus_queue_size`.
  - [ ] Add Grafana dashboard JSON (artifact) for real‑time alert latency.

- [ ] **Documentation & Contracts**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` with new endpoint, SDK method, and event schema.
  - [ ] Create ADR `ADR/2026-11-alert-system.md` explaining SSE vs WebSocket choice.
  - [ ] Verify `pnpm docs:check` passes.

- [ ] **Quality Assurance**
  - [ ] Run `pnpm lint:arch` and address any violations.
  - [ ] Run `pnpm typecheck` for full TS compliance.
  - [ ] Perform load test using `scripts/load-test-alerts.sh` (simulate 500 concurrent clients).

- [ ] **Deployment**
  - [ ] Extend CI pipeline to include alert system unit/integration tests.
  - [ ] Deploy to staging environment; run end‑to‑end smoke test.
  - [ ] Collect operator feedback and iterate.

