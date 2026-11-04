---
id: "PLAN_I18N_TMS_SYNC"
title: "i18n Continuous Localization TMS Sync"
status: "proposed"
version: "1.0.0"
owner: "engineering"
created: "2026-11-04T08:20:00Z"
updated: "2026-11-04T08:20:00Z"
contracts:
  - "DOCUMENTATION_CONTRACT.md"
  - "AUTONOMOUS.md"
  - "GOAL.md"
---

# Rules

- Follow tenant isolation (company_id) for all sync operations.
- Only sync approved translation keys; never auto-publish machine translations without review flags.
- Rate-limit TMS webhooks and API calls.
- Cache sync metadata; invalidate on webhook events.
- All secrets in env vars only.
- Preserve existing translation fallbacks.
- Changes must satisfy lint:arch, docs:check, typecheck.
