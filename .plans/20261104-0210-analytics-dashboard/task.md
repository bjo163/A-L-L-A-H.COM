---
title: "Analytics Dashboard Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T02:10:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 23
parent_issue: 5
---

# TASKS

- [ ] **Backend Development**
  - [ ] Add aggregation service `GET /v1/analytics/summary` in `apps/arsy/src/routes/analytics.ts`
  - [ ] Pull metrics from ORBIT, HELIOGRID, CHRONICLE, WATCHTOWER via internal event bus
  - [ ] Implement time‑bucketed storage (hourly, daily) using PGlite tables (`analytics_metric`)
  - [ ] Add CSV/JSON export endpoint `GET /v1/analytics/export`
  - [ ] Write unit and integration tests for aggregation logic and export format

- [ ] **Frontend UI**
  - [ ] Create `/analytics` page in `apps/headquarter/pages/analytics.tsx`
  - [ ] Build chart widgets using `@moonwitness/ui` (`LineChart`, `BarChart`, `PieChart`)
  - [ ] Connect to SSE stream `/v1/analytics/stream` for near‑real‑time updates
  - [ ] Implement filter controls (date range, metric selector)
  - [ ] Write component tests with React Testing Library

- [ ] **Documentation & Contracts**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` with new endpoints and data schemas
  - [ ] Add ADR `ADR/2026-11-analytics-dashboard.md` explaining aggregation design
  - [ ] Ensure `pnpm docs:check` passes

- [ ] **Quality Assurance**
  - [ ] Run `pnpm lint:arch` and fix any violations
  - [ ] Run `pnpm typecheck`
  - [ ] Performance testing: page load < 2 s, chart update < 5 s

- [ ] **Deployment**
  - [ ] Add CI build step for analytics UI assets
  - [ ] Deploy to staging for analyst review
  - [ ] Collect feedback and iterate

