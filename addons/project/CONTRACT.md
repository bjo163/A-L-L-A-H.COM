---
contract: unit
id: ADDON_PROJECT
tier: addon
name: project
owner: platform-core
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Odoo-style project and task manager with plans sync and cron worker
depends: [base]
models: [project.project, project.task.stage, project.task, ir.cron]
data: [data/index.ts]
installable: true
---

# project — Unit Contract

Projects, tasks, task stages, and the `ir.cron` scheduled-action worker, plus the
`.plans` reconciliation services.

## Default data

`data/index.ts` (`loadDefaultData`) seeds the platform task-stage set
(Backlog / In Progress / In Review / Done / Cancelled) at company_id 0, keyed on
`name`. Rows live in `data/default.ts`.

`DEFAULT_PROJECT_CRON` in `data/default.ts` is the single definition of the
`.plans` sync schedule. The admin route `POST /v1/admin/cron/seed/:companyId`
builds its tenant row from this constant rather than a second inline copy, so the
cron spec exists in exactly one place.

## Models

`project.project`, `project.task.stage`, `project.task`, `ir.cron`; the `models`
frontmatter mirrors `__manifest__.json`.
