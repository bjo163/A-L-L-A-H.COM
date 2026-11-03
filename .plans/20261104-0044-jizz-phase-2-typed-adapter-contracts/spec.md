---
title: "JIZZ App Phase 2: Typed Read-Only JIZZ Adapter & Data Contracts"
status: "proposed"
timestamp: "2026-11-04T00:44:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
target_app: "apps/jizz"
---

# SPEC: JIZZ Phase 2 — Typed Read-Only JIZZ Adapter & Data Contracts

## 1. Context & Architecture Goal
- **Domain Focus**: ROCKSOUL JIZZ owns **PERSPECTIVE** and **OBSERVATIONS** of global public phenomena.
- **Integration Scope**: Strictly read-only adapter connecting to JIZZ API / server-side proxy.
- **Contract Boundary**: Define shared types in `@moonwitness/types` and client adapter in `@allah/sdk` or `apps/jizz/src/lib/jizz/`.

```mermaid
flowchart LR
    JIZZ_API["ROCKSOUL JIZZ API (bjo163/rocksoul-jizz)"]
    Adapter["JIZZ Typed Adapter (apps/jizz/src/lib/jizz)"]
    ObservatoryUI["apps/jizz UI Views"]

    JIZZ_API -->|Read-Only HTTPS (SSRF Guarded)| Adapter
    Adapter -->|Typed Perspective Schemas| ObservatoryUI
```

## 2. Requirements & Deliverables
1. Shared data contracts for:
   - `PhenomenonRecord`: id, slug, title, summary, observed_at, tags, geographic_scope.
   - `PerspectiveRecord`: id, phenomenon_id, actor_name, actor_type, framing, stance, key_quotes, confidence.
   - `SignalRecord`: id, phenomenon_id, signal_type, magnitude, detected_at.
2. Server-side typed adapter with SSRF guard and fail-closed timeout.
3. Provenance and uncertainty metadata preserving original evidence without verdict or truth ranking.

## 3. Acceptance Criteria
1. Typed adapter passes unit tests with verified mock and live payload schemas.
2. Strict SSRF validation on upstream endpoint configuration.

