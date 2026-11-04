---
status: "proposed"
---
# Plan Specification: i18n Continuous Localization CI/CD & TMS Sync Engine

## 1. Overview & Vision
This plan establishes automated synchronization and continuous localization workflows connecting the repository with Translation Management Systems (TMS) such as Crowdin, Phrase, or Git-based PO catalogs. As developers merge code containing newly extracted translation keys or UI text changes, the TMS synchronization engine automatically pushes untranslated strings to translators, monitors translation progress, and synchronizes approved translations back into the repository through automated PRs or webhooks without manual file handling.

## 2. Goals & Objectives
- **Bidirectional TMS Integration**: Automated pull and push workflows for Gettext `.po` files, XLIFF, or JSON translation catalogs.
- **GitOps-Driven Localization PRs**: Background synchronization bot opens clean, atomic Pull Requests containing validated translation updates with changelogs.
- **Branch & Feature Parity**: Support localization across feature branches and long-term staging environments before merging into `dev` and `main`.
- **Webhook Ingestion**: Fastify Hub webhook receiver (`POST /v1/i18n/webhooks/tms`) triggers incremental updates and cache invalidation as soon as a translation is approved in TMS.

## 3. Scope & Acceptance Criteria
- [ ] Implement sync CLI script `pnpm i18n:sync` supporting TMS upload/download.
- [ ] Fastify webhook endpoint for TMS notification ingestion with HMAC signature verification.
- [ ] GitHub Actions workflow `i18n-sync.yml` running on a scheduled cron and on-demand trigger.
- [ ] Automatic format conversion between `ir.translation` database records and Gettext `.po` / JSON catalogs.
- [ ] Full quality gate clearance (`pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`).

