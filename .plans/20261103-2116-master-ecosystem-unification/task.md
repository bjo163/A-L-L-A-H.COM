---
title: "Task Checklist: Master Ecosystem Unification, UI Design System, Universal SDK & Husky Gates"
plan: "20261103-2116-master-ecosystem-unification"
date: "2026-11-03"
estimated_duration: "2.5 hours"
estimated_cost_tokens: "~35k"
---

# Tasks

### Phase 1: Shared Core Packages (`packages/types`, `packages/sdk`, `packages/lint`) (Est: 40 mins)
- [x] 1.1. Scaffold `packages/types` (`@moonwitness/types`) with auth, session, SDUI, and storage contracts
- [x] 1.2. Scaffold `packages/sdk` (`@allah/sdk`) with typed isomorphic Fastify Hub client and auth state manager
- [x] 1.3. Scaffold `packages/lint` (`@moonwitness/lint`) with unified ESLint configs enforcing `@moonwitness/ui` imports
- [x] 1.4. Build and test all new packages within the pnpm workspace

### Phase 2: Design System Layer Expansion (`packages/ui`) (Est: 45 mins)
- [x] 2.1. Structure directory into `primitives/`, `components/`, `blocks/`, `raw/`, `sfx/`, `tokens/`, `css/`
- [x] 2.2. Implement atomic components: `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Dialog`
- [x] 2.3. Implement ecosystem blocks: `Navbar`, `SessionCard`, `AppLauncher`
- [x] 2.4. Implement Web Audio procedural SFX synthesizer (`sfx/audio.ts`) for tactile UI feedback
- [x] 2.5. Update `packages/ui/package.json` export map and verify build

### Phase 3: Client Apps Refactoring & SSO Wiring (Est: 35 mins)
- [x] 3.1. Update `apps/dock`: Replace inline nav with `@moonwitness/ui/blocks/navbar` and wire `@allah/sdk`
- [x] 3.2. Update `apps/headquarter`: Connect to `@allah/sdk` and `@moonwitness/ui`
- [x] 3.3. Update `apps/id`: Refactor login, register, and account pages to use `@moonwitness/ui/components`
- [x] 3.4. Update `docker-compose.yml` to orchestrate `dock`, `headquarter`, `id`, and `arsy`
- [x] 3.5. Update root `package.json` `"dev"` script for unified concurrent execution

### Phase 4: Local Husky Commit Gate & Contract Sync (Est: 30 mins)
- [x] 4.1. Initialize Husky (`.husky/pre-commit` and `.husky/pre-push`)
- [x] 4.2. Configure pre-commit to run `pnpm docs:check` and type checks
- [x] 4.3. Update `AGENTS.md`, `DOCUMENTATION_CONTRACT.md`, and `DESIGN.md`
- [x] 4.4. Verify `pnpm docs:check` (100/100 threshold)
- [x] 4.5. Generate `report.md` upon completion

