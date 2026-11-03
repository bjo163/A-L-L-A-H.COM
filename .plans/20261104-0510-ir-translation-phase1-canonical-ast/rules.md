---
title: "IR Translation Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T04:20:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 29
parent_issue: 5
---

# RULES: IR Translation Phase 1 — Canonical Semantic AST & Multi-Target IR Schema

## 1. Architectural Invariants
- **Deterministic Lowering**: Given an identical `MoonIRTree` and lowering context, the lowering engine MUST produce byte-for-byte identical output.
- **Fail-Closed Validation**: If an AST violates any typing or tenancy constraint, compilation MUST immediately abort with diagnostic errors without partial execution.
- **Content-Addressed Immutability**: All compiled IR trees MUST carry a SHA-256 integrity hash computed over normalized attributes and children.
- **Tenant Boundary Protection**: IR nodes cannot bind or resolve variables outside the authenticated session's `company_id`.

## 2. Resource & Complexity Bounds
- Maximum tree depth: 16 levels.
- Maximum nodes per tree: 2,500 nodes.
- Circular references in node hierarchies are strictly forbidden and detected in $O(V + E)$ time during validation.

## 3. Code Purity & Antislop
- Zero `any` or ambiguous typing in `@moonwitness/types/ir`.
- No raw console statements; all compilation logs must flow through structured pino loggers.

