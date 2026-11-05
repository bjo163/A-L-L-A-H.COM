---
plan_id: "PLAN-20261105-1000-odoo-project-manager-addon"
---

# Execution Checklist

- [x] Create `__manifest__.json` and `index.ts` for `addons/project`.
- [x] Implement `project.project` model (`project_project.ts`).
- [x] Implement `project.task.stage` model (`project_task_stage.ts`).
- [x] Implement `project.task` model (`project_task.ts`) with `legal_hold` and `retention_until`.
- [x] Implement `ir.cron` model (`ir_cron.ts`).
- [x] Implement `plan_scanner.ts` with SHA-256 fingerprinting.
- [x] Implement `sync_worker.ts` for bidirectional reconciliation.
- [x] Implement `cron_runner.ts` 10-second polling runner with optimistic locking.
- [x] Register `addons/project` in `addons/index.ts`.
- [x] Mount project and sync routes in `apps/arsy/src/app.ts`.
- [x] Connect `onReady` and `onClose` hooks for `startCronRunner()` / `stopCronRunner()`.
- [x] Add client methods in `packages/vscode-extension/src/client.ts`.
- [x] Add commands `allah.syncPlansToHub` and `allah.pullPlanFromHub` in `extension.ts` and `package.json`.
- [x] Run unit tests in `addons/project/tests/plan_scanner.test.ts`.
- [x] Run `pnpm lint:arch`, `pnpm docs:check`, `pnpm extension:check`, and `pnpm extension:test`.
