---
title: "Operator UI Enhancements Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T02:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 22
parent_issue: 5
---

# TASKS

- [ ] **Backend Development**
  - [ ] Add API `GET /v1/operator/widgets` and `POST /v1/operator/widgets` in `apps/arsy/src/routes/operator.ts`
  - [ ] Persist widget layout per tenant using PGlite tables (`operator_widget`)
  - [ ] Enforce role‑based access (`operator`, `admin`) via SDK middleware
  - [ ] Write unit and integration tests for widget CRUD

- [ ] **Frontend UI**
  - [ ] Create `/operator` page in `apps/headquarter/pages/operator.tsx`
  - [ ] Build grid layout with drag‑and‑drop using `@moonwitness/ui` components
  - [ ] Implement widget SDK (`packages/ui/src/operator/widgets.ts`) exposing `registerWidget`
  - [ ] Add persistence sync with backend API
  - [ ] Write component tests with React Testing Library

- [ ] **Documentation & Contracts**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` with new endpoints and widget specs
  - [ ] Add ADR `ADR/2026-11-operator-ui.md` describing design decisions
  - [ ] Ensure `pnpm docs:check` passes

- [ ] **Quality Assurance**
  - [ ] Run `pnpm lint:arch` and resolve violations
  - [ ] Run `pnpm typecheck`
  - [ ] Verify UI performance: CLS < 0.1, no layout shift on widget moves

- [ ] **Deployment**
  - [ ] Extend CI pipeline to build operator UI assets
  - [ ] Deploy to staging for operator testing
  - [ ] Gather feedback and iterate

