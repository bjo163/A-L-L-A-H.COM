---
title: "Observability & Telemetry Platform Phase 2: Design Specification"
status: "proposed"
timestamp: "2026-11-04T04:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 28
parent_issue: 5
---

# DESIGN: Observability & Telemetry Platform Phase 2

## 1. System Architecture & Component Interactions
Phase 2 introduces automated alert correlation, policy-driven incident escalation, and reactive autoscaling across the ARSY ecosystem.

```mermaid
flowchart TD
    subgraph Sources["Telemetry Influx"]
        Watchtower["WATCHTOWER (Probes)"]
        Sentinel["SENTINEL (RADIUS & PPPoE)"]
        Chronicle["CHRONICLE (Syslog)"]
        Heliogrid["HELIOGRID (Inverters)"]
    end

    subgraph ArsyCore["ARSY Hub (Port 5150)"]
        AlertBus["Unified AlertBus (SSE / Stream)"]
        Correlator["Alert Correlation Engine (/src/services/alert-correlation.ts)"]
        PolicyEngine["Rule Evaluator (/src/policy/)"]
        AutoscaleLogic["Autoscaling Driver (/src/autoscale/)"]
    end

    subgraph Storage["Embedded PGlite"]
        IncidentsTable["incident_ticket"]
        RulesTable["correlation_policy"]
    end

    subgraph Frontends["Operator Consoles"]
        IncidentsUI["Headquarter Incident Board (/incidents)"]
        RuleEditorUI["Alert Policy Manager (/admin/alert-rules)"]
    end

    Sources --> AlertBus
    AlertBus --> Correlator
    Correlator --> PolicyEngine
    PolicyEngine --> IncidentsTable
    PolicyEngine --> RulesTable
    Correlator --> AutoscaleLogic
    IncidentsTable --> IncidentsUI
    RulesTable --> RuleEditorUI
```

## 2. API & Data Contracts
- `POST /v1/incidents/correlate`: Real-time ingestion buffer for batch evaluation.
- `GET /v1/incidents`: Paginated active incident tickets filtered by tenant and severity.
- `POST /v1/incidents/:id/ack`: Idempotent acknowledgment endpoint with operator audit recording.
- `POST /v1/policies/alert-rules`: Create or update JSON-based correlation rule expressions.

## 3. UI/UX Interaction Layout
- High-density Kanban board in `apps/headquarter/src/app/incidents/page.tsx`.
- Visual rule builder using `@moonwitness/ui` atomic elements (`Card`, `Input`, `Select`, `Badge`).
- Live SSE sync displaying incident timeline graphs with zero layout shift.
