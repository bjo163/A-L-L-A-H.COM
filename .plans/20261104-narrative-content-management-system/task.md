---
contract: "DOCUMENTATION_CONTRACT.md"
id: "narrative-content-management-system-task"
version: "1.0.0"
owner: "product"
status: "proposed"
last_verified: "2026-11-04"
---
# Task — Narrative Content Management System

Execution tracker for [spec.md](spec.md). Status: not started.

## Phase 1 — Data & Contracts
- [ ] Define `cms_world`, `cms_transmission`, `cms_destination` models via `@allah/arsy-orm` (company_id column on every row).
- [ ] Write idempotent migration + rollback; import existing `manifest.json` preserving IDs.
- [ ] Shared types published in `@moonwitness/types`; no local type redefinition.

## Phase 2 — API
- [ ] `GET/POST/PATCH/DELETE /v1/cms/worlds[/:id]` behind verified principal + `admin` role, default-deny.
- [ ] Analogous transmission and destination routes.
- [ ] Every mutation writes one append-only `arsy.audit.event` in the same transaction.
- [ ] `FEATURE_CMS` flag gates all routes; disabled by default.

## Phase 3 — Admin UI (Headquarter `/content`)
- [ ] List view with status/category/author filters (`Table` from `@moonwitness/ui`).
- [ ] Edit form with live validation, `SAFE_ID` pattern for `id`.
- [ ] Image upload via `mw_storage`, `imageKey` stored, preview rendered.
- [ ] Publication workflow toggle draft → proposed → published; provenance `verified` enforced before publish.
- [ ] `loading.tsx` · `error.tsx` · `not-found.tsx` from `StatePanel` (STATE_PARITY).

## Phase 4 — Static Compatibility & Verification
- [ ] Build step emits `public/content-snapshot.json` from DB; Gate/Dock render unchanged.
- [ ] Regression test: snapshot pages identical to pre-CMS build.
- [ ] Gates green: `pnpm lint:arch` · `pnpm lint` · `pnpm typecheck` · `pnpm ui:test` · `pnpm ui:contrast` · affected app builds.
- [ ] Docs updated (API contract, architecture, UI guide); `report.md` written on completion.
