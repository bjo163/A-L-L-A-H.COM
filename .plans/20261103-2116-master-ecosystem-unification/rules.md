---
title: "Rules: Invariants, Boundary Constraints & Quality Gates"
plan: "20261103-2116-master-ecosystem-unification"
date: "2026-11-03"
---

# Invariants & Boundary Rules

### 1. Mandatory UI Consumption (Anti-Slop Guard)
- **Invariant**: No application inside `apps/` (`dock`, `headquarter`, `id`, `web`) is permitted to create custom unstyled `<button>` or `<input>` elements with raw ad-hoc CSS.
- All interactive controls MUST be imported directly from `@moonwitness/ui/components` or composed from `@moonwitness/ui/blocks`.
- Enforced by `@moonwitness/lint` rules.

### 2. Universal Client SDK Authority
- **Invariant**: No client application may construct manual `fetch()` endpoints or replicate JWT/session cookie handling logic.
- All Fastify Hub communication MUST route through `@allah/sdk`.

### 3. Local Husky Gate Invariant
- **Invariant**: No commit may bypass contract checks. `.husky/pre-commit` executes `pnpm docs:check` and lint suites locally. If the compliance score is less than 95/100, the commit is aborted.

### 4. Zero ORM Overlap
- **Invariant**: All backend state operations remain strictly within `@allah/arsy-orm` (PGlite embedded WASM). Never install or introduce Drizzle ORM.

