---
title: "COCKPIT Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T01:16:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 21
parent_issue: 5
---

# RULES

## Architectural Invariants
- **Single Backend Authority**: All real‑time data must flow through the ARSY Fastify Hub (`apps/arsy`). No direct client connections to internal services.
- **Tenant Isolation**: SSE streams are scoped by `company_id`. Events from other tenants must be filtered out before emission.
- **Content‑Addressed Write‑Once**: Event payloads are stored using SHA‑256 hashes; immutable logs for audit.
- **Zero ORM Overlap**: Only the embedded PGlite ORM is used; no external DB drivers or ORMs for Cockpit.
- **Atomic UI**: All UI components must be imported from `@moonwitness/ui`. Custom styled HTML elements are prohibited.

## Security & Compliance
- **Authentication**: SSE endpoint requires Bearer token validated by `@allah/sdk` middleware; token must include tenant claims.
- **Authorization**: Only users with role `operator` or `admin` may subscribe to Cockpit streams.
- **Rate Limiting**: Max 100 events/sec per connection; burst protection via token bucket.
- **Audit Logging**: Every operator action (acknowledge, terminate) must be recorded in `CHRONICLE` with immutable hash.

## Operational Rules
- **Latency SLA**: End‑to‑end event latency < 200 ms under normal load (≤ 500 concurrent operators).
- **Performance Monitoring**: Export Prometheus metrics `cockpit_sse_latency_seconds` and `cockpit_ui_fps`.
- **Graceful Degradation**: If event bus overloads, fallback to batch polling mode with interval ≤ 5 s.
- **Testing**: Include load testing script `scripts/load-test-cockpit.sh` simulating 500 concurrent SSE clients.

## Documentation Requirements
- Update `DOCUMENTATION_CONTRACT.md` with new endpoint description and UI component list.
- Add ADR `ADR/2026-11-cockpit-sse.md` describing why SSE was chosen over WebSockets.
- Ensure `pnpm docs:check` passes with 100/100 after adding these files.
