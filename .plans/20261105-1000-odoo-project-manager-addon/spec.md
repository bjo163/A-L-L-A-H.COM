---
contract: "SPEC_DRIVEN_PLAN"
id: "PLAN-20261105-1000-odoo-project-manager-addon"
title: "Odoo-Style Project Manager Addon with .plans Sync & ir.cron Worker"
status: "completed"
author: "engineering"
created_at: "2026-11-05T09:17:00Z"
last_verified: "2026-11-05T09:17:00Z"
---

# Feature Specification: Odoo-Style Project Manager Addon with .plans Sync & ir.cron Worker

## Problem and context
Developers and AI agents using A-L-L-A-H.COM create and maintain specification plans inside `.plans/<timestamp>-<slug>/` with Markdown task checklists. Currently, these plans were only parsed locally by the VS Code extension without persistence into the Arsy PGlite database or multi-tenant visibility across the Hub platform.

## Scope and constraints
- Add `addons/project` with Odoo-style ORM models (`project.project`, `project.task.stage`, `project.task`, `ir.cron`).
- Maintain multi-tenant data isolation by enforcing `company_id` on all tables.
- Keep the Hub decoupled from direct developer filesystem access in containerized environments by using the VS Code extension as a local agent edge worker.
- Provide bidirectional synchronization between markdown checklist markers (`[ ]`, `[/]`, `[x]`) and DB task states.
- Run an `ir.cron` background runner in Fastify `onReady` hook to execute scheduled platform jobs.

## Acceptance criteria
- [x] All 4 ORM models registered via manifest loader in `addons/project`.
- [x] Fastify routes exposed at `/v1/projects` and `/v1/projects/:id/tasks` under strict `principalGuard`.
- [x] VS Code extension client methods and commands (`allah.syncPlansToHub`, `allah.pullPlanFromHub`) contributed and built.
- [x] Unit test for plan scanner passes with 100% assertions.
- [x] Architecture invariants gate `pnpm lint:arch` passes.
- [x] Documentation contract gate `pnpm docs:check` passes at 100/100 points.
