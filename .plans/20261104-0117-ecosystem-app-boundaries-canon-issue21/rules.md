---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ECOSYSTEM-PHASE1-BOUNDARIES"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-04"
---
# Rules: Ecosystem Architecture Phase 1 — Product Application Boundaries & Naming Canon (Issue #21)

## 1. Architectural & Naming Invariants
1. **Single Backend Authority**: ARSY Fastify Hub remains the sole HTTP backend and PGlite database authority. No new standalone backends or microservice databases may be created.
2. **Unified SSO**: MoonWitness ID (`apps/id`) is the sole identity authority. No app may implement a duplicate login/register database.
3. **UI Purity**: All frontend apps must use `@moonwitness/ui`. Ad-hoc un-themed buttons or inputs are blocked by `pnpm lint:arch`.
4. **No Speculative Scaffolding**: No speculative empty app directories may be created until formal requirements and canonical docs approve them.
