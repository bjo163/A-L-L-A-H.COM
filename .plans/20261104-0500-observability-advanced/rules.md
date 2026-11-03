---
title: "Observability & Telemetry Platform Phase 2: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T04:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 28
parent_issue: 5
---

# RULES: Observability & Telemetry Platform Phase 2

## 1. Architectural Invariants
- **Single Backend Authority**: All alert correlation, incident creation, and autoscaling triggers MUST route through ARSY Hub (`apps/arsy`) on port 5150.
- **Strict Tenant Scoping**: Every incident, correlation rule, and telemetry stream MUST be strictly scoped by `company_id`. No cross-tenant rule leak is permitted.
- **Zero ORM Overlap**: Persistence of incident tickets and correlation policies MUST rely solely on the embedded PGlite ORM (`@allah/arsy-orm`).
- **Audit Immutability**: All acknowledged incidents and created policies MUST emit SHA-256 content-addressed audit logs to `CHRONICLE`.

## 2. Security & Rate Limiting
- Incident acknowledge mutations require authenticated operator or admin role tokens validated by `@allah/sdk`.
- Policy authoring is restricted strictly to administrators (`role: 'admin'`).
- Correlator buffers MUST implement backpressure (dropping or batching when event rate > 10,000/sec per tenant) to prevent memory exhaustion.

## 3. UI Purity Standards
- All frontend incident views in `apps/headquarter` MUST consume atomic components directly from `@moonwitness/ui`.
- Direct un-encapsulated HTML elements like raw `<button>` or `<input>` are strictly forbidden and blocked by `@moonwitness/lint`.
