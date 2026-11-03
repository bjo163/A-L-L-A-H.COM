---
title: "IR Translation Phase 1: Design Specification"
status: "proposed"
timestamp: "2026-11-04T04:20:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 29
parent_issue: 5
---

# DESIGN: IR Translation Phase 1 — Canonical Semantic AST & Multi-Target IR Schema

## 1. Architectural Representation & Pipeline Flow
The Intermediate Representation (IR) is the single canonical truth bridge connecting cognitive agent synthesis, ORM structures, and client runtime execution targets.

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Cognitive Agent / Caller
    participant Hub as ARSY Fastify Hub (/v1/ir/compile)
    participant Parser as IR Parser & Tokenizer
    participant Validator as IR Semantic Validator
    participant Optimizer as IR Tree Optimizer
    participant Output as Lowered Target / AST

    Agent->>Hub: POST /v1/ir/compile (raw JSON / DSL)
    Hub->>Parser: Parse Tokens into MoonIR AST
    Parser->>Validator: Validate Schema, Cyclic Guards, Security Rules
    alt Validation Failed
        Validator-->>Hub: Return Diagnostic Errors (400 Bad Request)
        Hub-->>Agent: { success: false, errors: [...] }
    else Validation Passed
        Validator->>Optimizer: Eliminate Dead Nodes & Flatten Containers
        Optimizer-->>Hub: Optimized MoonIR AST + SHA-256 Hash
        Hub-->>Agent: { success: true, ast: MoonIRTree, hash: "..." }
    end
```

## 2. Canonical AST Node Anatomy (`MoonIRNode`)
```json
{
  "$schema": "https://moonwitness.io/schemas/moon-ir-v1.json",
  "version": "1.0.0",
  "id": "node_98f12a",
  "kind": "container",
  "name": "dashboard_overview",
  "attributes": {
    "layout": "grid",
    "columns": 3,
    "gap": 16
  },
  "bindings": {
    "tenantId": "context.company_id"
  },
  "children": [
    {
      "id": "node_98f12b",
      "kind": "data_binding",
      "name": "active_sessions_metric",
      "attributes": {
        "source": "sentinel.sessions.count",
        "refreshIntervalMs": 5000
      }
    }
  ],
  "metadata": {
    "author": "ArsyPlannerAgent",
    "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
}
```

## 3. UI/UX & Diagnostic Contract
- When validation fails, the IR compiler returns structured diagnostic arrays containing:
  - `code`: Machine-readable code (e.g. `ERR_IR_CYCLIC_DEPENDENCY`, `ERR_INVALID_PROPERTY_TYPE`).
  - `path`: JSON pointer to the offending node (e.g. `/children/2/attributes/source`).
  - `message`: Clear, actionable explanation without slop.

