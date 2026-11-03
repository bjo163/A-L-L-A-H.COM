---
title: "Real-time Alert System Phase 1"
status: "proposed"
timestamp: "2026-11-04T03:35:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 24
parent_issue: 5
---

# SPEC: Real-time Alert System

## Context & Goal
- Provide a unified, low‑latency alert broadcasting service for all ecosystem components (WATCHTOWER, SENTINEL, CHRONICLE, HELIOGRID).
- Expose a Server‑Sent Events (SSE) endpoint `/v1/alerts/stream` that pushes `AlertEvent` objects to subscribed operators.
- Enable fine‑grained subscription filters (severity, component, tenant).

## Requirements
1. **Backend**: Fastify route `/v1/alerts/stream` with per‑tenant isolation.
2. **Event Bus**: Central `alertBus` that normalizes events from source services.
3. **Schema**: `AlertEvent` JSON schema with fields `id`, `timestamp`, `severity`, `source`, `message`, `payloadHash`.
4. **SDK**: `@allah/sdk` client method `subscribeAlerts(filter)`.
5. **UI**: New `/alerts` page in `apps/headquarter` displaying a live feed panel.
6. **Security**: Role `operator`/`admin` required, rate limiting 200 events/sec/client.
7. **Persistence**: Immutable audit log stored in `CHRONICLE` with SHA‑256 hash.

## Acceptance Criteria
- SSE latency < 150 ms from source emission to UI receipt.
- Operators can toggle severity filters without reconnect.
- All quality gates (`pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`) pass.
- ADR `ADR/2026-11-alert-system.md` created.

