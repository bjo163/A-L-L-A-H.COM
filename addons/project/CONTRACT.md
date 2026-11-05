---
contract: unit
id: ADDON_PROJECT
tier: addon
name: project
owner: platform-core
version: 0.2.0
status: released
last_verified: 2026-11-05
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
cron spec exists in exactly one place. It ships `state: 'disabled'`: the runner
never claims a disabled job, and the ORM forbids writing the reserved `active`
column directly (flips go through the audited `archive()` path), so "off by
default" is expressed through the model's own `state` selection.

## Cron work queue

`services/cron_registry.ts` is a `method_name -> handler` dispatch table; an
addon registers its handlers at registration (project registers `sync_local_plans`
from `services/cron_jobs.ts`). `services/cron_runner.ts` claims due, non-running,
non-disabled rows with a single `FOR UPDATE SKIP LOCKED` transaction (marking them
`running` and incrementing `attempt_count`), dispatches the resolved handler after
the claim commits, then finalises: success resets `attempt_count` and bumps
`run_count`; failure records `last_error` and schedules an exponential backoff via
`next_retry_at`/`nextcall`. `ARSY_CRON_KINDS` (comma-separated method names)
partitions which jobs a given runner process claims; unset means "claim all".

## Models

`project.project`, `project.task.stage`, `project.task`, `ir.cron`; the `models`
frontmatter mirrors `__manifest__.json`.
