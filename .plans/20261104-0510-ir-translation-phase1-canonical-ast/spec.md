---
title: "IR Translation Phase 1: Canonical Semantic AST & Multi-Target IR Schema"
status: "completed"
timestamp: "2026-11-04T04:20:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 29
parent_issue: 5
---

# SPEC: IR Translation Phase 1 — Canonical Semantic AST & Multi-Target IR Schema

## 1. Context & Architecture Goal
- **IR Translation Problem**: Cognitive agent systems, ORM schemas, and dynamic business domain engines in A-L-L-A-H.COM output heterogeneous representations (JSON schemas, raw SQL, ReAct steps, DSL queries, visual blueprints).
- **Core Mission**: Establish an **Intermediate Representation (IR)** compilation pipeline that transforms high-level cognitive intentions and domain models into an immutable, type-safe Abstract Syntax Tree (AST), which can then be deterministically lowered into multiple target execution formats.
- **Backend Hub Integration**: IR Translation engine resides as a core modular package `@allah/arsy-plugin-ir` and integrates natively into the Fastify Hub (`apps/arsy:5150`).
- **Target Lowering Channels**:
  1. `Target: SDUI-Tree` (Generative UI for React 19).
  2. `Target: PGlite-SQL` (Parameterized safe SQL execution).
  3. `Target: Agent-Action` (Autonomous tool calling and state updates).
  4. `Target: Flow-Graph` (Interactive visual workflow graphs for IDE & Consoles).

```mermaid
flowchart TD
    subgraph Inputs["High-Level Influx Sources"]
        AgentPrompt["Cognitive Agent Planner"]
        OrmSchema["PGlite Model Registry"]
        OperatorDSL["Workflow Script / DSL"]
    end

    subgraph IRCore["IR Translation Engine (@allah/arsy-plugin-ir)"]
        Parser["IR Parser & Tokenizer"]
        CanonicalAST["Canonical Semantic AST (MoonIR)"]
        TypeChecker["Semantic Type Checker & Validator"]
        Optimizer["AST Simplifier & Dead-Node Elimination"]
    end

    subgraph Targets["Target Lowering Compilers"]
        SDUILower["SDUI Layout Compiler"]
        SQLLower["PGlite Query Lowerer"]
        ActionLower["Agent Tool Lowerer"]
        FlowLower["Visual Graph Lowerer"]
    end

    subgraph RuntimeClients["Consumption Runtimes"]
        FrontendUI["@moonwitness/ui Viewport"]
        Database["Embedded PGlite Engine"]
        AgentCore["Arsy ReAct Execution Loop"]
        VSCodeExt["allah-vscode-extension Canvas"]
    end

    Inputs --> Parser
    Parser --> CanonicalAST
    CanonicalAST --> TypeChecker
    TypeChecker --> Optimizer
    Optimizer --> SDUILower
    Optimizer --> SQLLower
    Optimizer --> ActionLower
    Optimizer --> FlowLower

    SDUILower --> FrontendUI
    SQLLower --> Database
    ActionLower --> AgentCore
    FlowLower --> VSCodeExt
```

---

## 2. Requirements & Deliverables

### 2.1 Canonical Semantic AST Definition (`@moonwitness/types/ir`)
1. Strict schema definition for `MoonIRNode`:
   - `IRNode`: `type`, `id`, `kind`, `attributes`, `bindings`, `children`, `metadata`.
   - Node Kinds: `ContainerNode`, `DataBindingNode`, `ActionNode`, `ConditionNode`, `VisualizationNode`.
2. AST Serialization and Deserialization helpers with SHA-256 integrity hash verification.

### 2.2 IR Compilation & Validation Engine (`packages/arsy-plugin-ir`)
1. **Parser**: Translates input JSON / DSL / Agent intent payloads into `MoonIRAST`.
2. **Validator**: Schema validation, tenant isolation check, circular reference guard, and property type assertions.
3. **AST Optimizer**: Eliminates unreachable nodes, flattens trivial nested containers, and pre-resolves static binding values.

### 2.3 Fastify Hub Endpoints (`apps/arsy`)
- `POST /v1/ir/compile`: Compiles input JSON/DSL to canonical IR AST and returns diagnostics.
- `POST /v1/ir/validate`: Validates an IR AST against security policies and schema invariants.

---

## 3. Acceptance Criteria
1. Compilation of 1,000 IR nodes completes in $< 15\text{ms}$ with zero memory leaks.
2. Validates and rejects malformed AST payloads with actionable diagnostic error codes.
3. Strict TypeScript compilation passes across `@moonwitness/types` and `@allah/arsy-plugin-ir`.
4. Monorepo quality gates (`pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`) pass 100%.

