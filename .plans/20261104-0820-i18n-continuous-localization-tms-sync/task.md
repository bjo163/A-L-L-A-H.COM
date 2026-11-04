---
status: "proposed"
---
# Actionable Tasks: i18n Continuous Localization CI/CD & TMS Sync Engine

## 1. Catalog Serialization & Converters
- [ ] Implement Gettext `.po` parser and generator supporting pluralization rules.
- [ ] Implement JSON key-value exporter/importer matching `ir.translation` structure.
- [ ] Add unit tests verifying lossless round-trip serialization between DB and `.po` files.

## 2. CLI Synchronization Engine
- [ ] Build `packages/sdk/scripts/sync-tms.ts` executable via `pnpm i18n:sync`.
- [ ] Implement command options: `--push` (upload source strings), `--pull` (download translations), `--dry-run`.
- [ ] Add diff calculator reporting new, updated, and obsolete translation terms.

## 3. Fastify Hub Webhook Receiver
- [ ] Create route `POST /v1/i18n/webhooks/tms` in `apps/arsy`.
- [ ] Implement HMAC-SHA256 signature verification middleware to ensure payload authenticity.
- [ ] Dispatch translation update events to PGlite and notify Redis cache invalidation channel.

## 4. CI/CD GitHub Action Automation
- [ ] Create `.github/workflows/i18n-sync.yml` with scheduled trigger and manual dispatch.
- [ ] Configure automated PR creation with labeled branch `chore/i18n-sync-updates`.
- [ ] Run and verify `pnpm docs:check`, `pnpm lint:arch`, and `pnpm typecheck`.

