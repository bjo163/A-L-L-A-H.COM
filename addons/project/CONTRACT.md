---
contract: unit
id: ADDON_PROJECT
tier: addon
name: project
owner: platform-core
version: 0.3.0
status: released
last_verified: 2026-11-06
summary: Odoo-style project and task manager with a cron worker
depends: [base]
models: [project.project, project.task.stage, project.task, ir.cron]
data: [data/index.ts]
installable: true
---

# project — Unit Contract

Projects, tasks, task stages, and the `ir.cron` scheduled-action worker.
The `.plans` reconciliation services were retired with the migration to GitHub
Issues as the work queue (D-018).

## Default data

`data/index.ts` (`loadDefaultData`) seeds the platform task-stage set
(Backlog / In Progress / In Review / Done / Cancelled) at company_id 0, keyed on
`name`. Rows live in `data/default.ts`.

## Cron work queue

`services/cron_registry.ts` is a `method_name -> handler` dispatch table; an
addon registers its handlers at registration (e.g. `mw_notify` registers
`notify_dispatch`). `services/cron_runner.ts` claims due, non-running,
non-disabled rows with a single `FOR UPDATE SKIP LOCKED` transaction (marking them
`running` and incrementing `attempt_count`), dispatches the resolved handler after
the claim commits, then finalises: success resets `attempt_count` and bumps
`run_count`; failure records `last_error` and schedules an exponential backoff via
`next_retry_at`/`nextcall`. `ARSY_CRON_KINDS` (comma-separated method names)
partitions which jobs a given runner process claims; unset means "claim all".

## Legacy columns

`project.project.sync_mode`/`last_sync_at`/`sync_hash` and
`project.task.plan_slug`/`source_file` are inert leftovers of the retired
`.plans` sync. The migration is additive: the columns stay (no down-migration),
but no service reads or writes them.

## Models

`project.project`, `project.task.stage`, `project.task`, `ir.cron`; the `models`
frontmatter mirrors `__manifest__.json`.
