---
title: "Specification: Master Ecosystem Unification, UI Design System, Universal SDK & Husky Gates"
plan: "20261103-2116-master-ecosystem-unification"
date: "2026-11-03"
status: "completed"
owner: "engineering"
---

# Specification: Master Ecosystem Unification, UI Design System, Universal SDK & Husky Gates

## 1. Problem Statement
The MoonWitness / A-L-L-A-H.COM ecosystem has successfully established the canonical Fastify Hub (`apps/arsy`) and MoonWitness ID (`apps/id`). However:
1. **Frontend Disconnection**: `apps/dock` (Port 3001) and `apps/headquarter` (Port 3002) still have hardcoded mock navbars and do not yet consume active sessions from `apps/id`.
2. **UI Duplication & Slop Risk**: Each app builds its own form inputs and buttons instead of consuming a unified design system.
3. **Missing Tooling Packages**: There is no centralized `@moonwitness/lint`, `@moonwitness/types`, or typed client SDK (`@allah/sdk`), leading to duplicate API callers and inconsistent typings.
4. **No Local Enforcement**: Developers and agents could commit code without passing contract checks because Husky pre-commit hooks are absent.

## 2. Requirements & Acceptance Criteria
- **R1 (Standalone & SSO Interconnection)**:
  - `apps/dock`, `apps/headquarter`, and `apps/id` must share unified SSO session state via cookies and `@allah/sdk`.
  - `docker-compose.yml` and `pnpm dev` must orchestrate all 4 applications concurrently.
- **R2 (UI Component Architecture)**:
  - `@moonwitness/ui` must expose structured layers: `primitives/`, `components/`, `blocks/`, `raw/`, `sfx/`, `css/`, and `tokens/`.
  - All apps must strictly consume these components.
- **R3 (Monorepo Tooling Packages)**:
  - `packages/types`: Export shared schemas for Auth, SDUI, Storage, and Router.
  - `packages/lint`: Flat ESLint 9 configuration enforcing `@moonwitness/ui` usage.
  - `packages/sdk`: Isomorphic client connecting to Fastify Hub (`apps/arsy`) with zero external runtime dependencies.
- **R4 (Husky Local Pre-Commit Gate)**:
  - `.husky/pre-commit` must execute `pnpm docs:check` and lint checks before allowing commits.
  - `.husky/pre-push` must execute workspace builds.
- **R5 (Contract Synchronisation)**:
  - Update `AGENTS.md` and `DOCUMENTATION_CONTRACT.md` establishing these standards as non-negotiable invariants.

