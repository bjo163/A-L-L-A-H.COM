---
title: "COCKPIT Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T01:16:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 21
parent_issue: 5
---

# TASKS

- [ ] **Backend Development**
  - [ ] Implement SSE endpoint `/v1/cockpit/stream` in `apps/arsy/src/routes/cockpit.ts`
  - [ ] Aggregate events from SENTINEL, CHRONICLE, WATCHTOWER, HELIOGRID via internal event bus
  - [ ] Ensure tenant isolation (`company_id` scoped streams)
  - [ ] Add SDK wrappers in `packages/sdk/src/cockpit.ts` for client consumption
  - [ ] Write unit & integration tests covering event aggregation and auth

- [ ] **Frontend UI**
  - [ ] Create Cockpit page route `/cockpit` in `apps/headquarter/pages/cockpit.tsx`
  - [ ] Build high‑density HUD using atomic components from `@moonwitness/ui`
  - [ ] Implement panels A‑D as per design spec
  - [ ] Connect to SSE stream via `@allah/sdk` client
  - [ ] Add action handlers (acknowledge incident, terminate session)
  - [ ] Write component tests with React Testing Library

- [ ] **Documentation & Contracts**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` with new endpoint definitions
  - [ ] Add ADR entry in `ADR/2026-11-cockpit-sse.md`
  - [ ] Ensure `pnpm docs:check` passes with new markdown files

- [ ] **Quality Assurance**
  - [ ] Run `pnpm lint:arch` and address any architectural violations
  - [ ] Run `pnpm typecheck` for full TypeScript compliance
  - [ ] Verify performance: SSE latency < 200ms, UI > 60fps under load

- [ ] **Deployment**
  - [ ] Update CI pipeline to include Cockpit build steps
  - [ ] Deploy to staging environment for operator testing
  - [ ] Gather feedback and iterate
