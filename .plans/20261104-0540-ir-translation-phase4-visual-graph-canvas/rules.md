---
title: "IR Translation Phase 4: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T04:50:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 32
parent_issue: 29
---

# RULES: IR Translation Phase 4 — Frontend Visual Graph & IDE Workbench Canvas

## 1. Architectural Invariants
- **Atomic UI Purity**: The graph canvas and all node/inspector elements MUST be built using `@moonwitness/ui`. No external non-compliant visualization libraries (e.g. standard reactflow or d3 injecting raw unstyled tags) are allowed.
- **Tenant Isolation**: Graphs only expose nodes and execution telemetry belonging to the authenticated user's `company_id`.
- **Zero Heavy Bundle Bloat**: Layout calculations must be pure TypeScript algorithms without heavy binary dependencies or uncompressed bundles.

## 2. Interaction & Performance Boundaries
- Graph rendering MUST not exceed 16.6ms per frame ($60\text{fps}$) during continuous pan and zoom.
- Node rendering must be virtualized or culled when viewing beyond 300 visible nodes.
- Canvas state must support undo/redo stacks up to 50 operations.

## 3. Security & Anti-Tampering
- Node attribute modifications on the client side must be validated against the Fastify Hub schema compiler (`/v1/ir/validate`) before emitting execution triggers.

