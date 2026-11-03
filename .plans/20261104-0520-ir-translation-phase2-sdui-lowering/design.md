---
title: "IR Translation Phase 2: Design Specification"
status: "proposed"
timestamp: "2026-11-04T04:30:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 30
parent_issue: 29
---

# DESIGN: IR Translation Phase 2 — SDUI Lowering Compiler & Hydration Runtime

## 1. Lowering Pipeline & Component Mapping Flow
```mermaid
flowchart LR
    subgraph InputAST["Canonical MoonIR AST"]
        ContainerNode["Node: container (grid)"]
        BindingNode["Node: data_binding (telemetry)"]
        ActionNode["Node: action (button)"]
    end

    subgraph Lowerer["SDUILowerer Engine"]
        LayoutTransform["Layout Transformer"]
        SchemaGenerator["SDUI ViewSchema Builder"]
    end

    subgraph OutputView["Target SDUI Tree"]
        ViewRoot["view_type: 'grid'"]
        ComponentCard["component: 'StatCard'"]
        ComponentBtn["component: 'ActionButton'"]
    end

    subgraph ClientDOM["React 19 Hydrated DOM (@moonwitness/ui)"]
        DOMGrid["div.grid.grid-cols-3"]
        DOMCard["Card.StatCard"]
        DOMBtn["Button (Atomic)"]
    end

    InputAST --> Lowerer
    ContainerNode --> LayoutTransform
    BindingNode --> SchemaGenerator
    ActionNode --> SchemaGenerator

    LayoutTransform --> ViewRoot
    SchemaGenerator --> ComponentCard
    SchemaGenerator --> ComponentBtn

    ViewRoot --> DOMGrid
    ComponentCard --> DOMCard
    ComponentBtn --> DOMBtn
```

## 2. SDUI Component Registry Mapping Table
| MoonIR Node Kind | Target SDUI Primitive | Concrete `@moonwitness/ui` Atomic Component |
|---|---|---|
| `container (layout: grid)` | `grid` | `<div className="grid ...">` (via design token grid) |
| `container (layout: card)` | `card` | `packages/ui/src/components/card.tsx` (`Card`) |
| `data_binding (metric)` | `stat_card` | `packages/ui/src/blocks/stat_card.tsx` |
| `data_binding (table)` | `data_table` | `packages/ui/src/blocks/table.tsx` |
| `action (mutation)` | `action_button` | `packages/ui/src/raw/button.tsx` / `Button` |
| `visualization (graph)` | `chart_view` | `packages/ui/src/components/chart.tsx` |

## 3. Hydration & State Binding Mechanics
- Hydration connects dynamic placeholder values (e.g. `{{ context.activeUsers }}`) with live state stores.
- Actions execute through an isomorphic dispatcher:
  ```ts
  dispatchAction({
    actionId: 'reboot_nas_device',
    endpoint: '/v1/nexus/nas/reboot',
    payload: { nasId: 42 }
  });
  ```
- Optimistic UI updates update component state immediately with automatic rollback on network error.
