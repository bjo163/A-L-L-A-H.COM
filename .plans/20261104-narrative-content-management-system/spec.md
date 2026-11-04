---
contract: "DOCUMENTATION_CONTRACT.md"
id: "narrative-content-management-system"
version: "1.0.0"
owner: "product"
status: "proposed"
last_verified: "2026-11-04"
---

# Narrative Content Management System (CMS) – Gate & Dock

## Overview & Vision
The **Gate** (public entrance) and **Dock** (community hub) showcase narrative worlds, transmissions, and destinations defined in a static `manifest.json`.  The manifest contains rich editorial metadata—publication state, provenance, image approvals, routing hints—yet there is **no runtime authoring capability**.  This feature introduces a **Content Management System** that enables trusted editors to create, edit, publish, and retire narrative items via a secure UI and API, while preserving the existing static‑generation pipeline.

## Problem Statement & Motivation
- Editorial workflow is manual: any content change requires a code change and redeploy.
- Provenance, publicationState, and image workflow fields exist but are unused, creating a gap between data model and operational reality.
- Lack of a CMS impedes rapid storytelling, community contributions, and scalability of the narrative platform.
- Introducing a CMS aligns with **Roadmap Stage 1‑2** (legacy discovery, product‑architecture reconciliation) and prepares for **Stage 4‑5** (product integration & experience transformation).

## Objectives & Expected Outcomes
| Goal | Success Metric |
|------|----------------|
| Provide a secure UI for creating/updating/deleting Worlds, Transmissions, Destinations | 100 % of editorial actions performed via UI, zero direct JSON edits in `manifest.json` |
| Persist content in a database (PGlite via `@allah/arsy-orm`) | Content visible after redeploy without rebuilding static JSON |
| Maintain backward‑compatible static generation for existing routes | No regressions in Gate/Dock build after CMS activation |
| Enforce provenance, publicationState, and image‑approval workflow | All items must have non‑null `provenance` (or `null` for system items) before publishing |
| Audit every content change (actor, timestamp, before/after) | Audit logs record every CRUD operation |
| Image assets stored via `addons/mw_storage` and referenced by `imageKey` | New images uploaded through UI appear in storage and are served correctly |

## Scope
- **In‑Scope**: API endpoints for CRUD of `StoryWorld`, `Transmission`, `Destination`; admin UI integrated into **Headquarter** under `/content` route; database schema extensions; migration script to import existing `manifest.json` data.
- **Out‑of‑Scope**: Public‑facing content edits by non‑admin users; multilingual content beyond existing `id`/`en` catalogs (handled by existing i18n system); full‑blown publishing pipeline for external contributors.

## Functional Requirements
1. **Data Model Extensions** (`addons/works` or new `cms` addon) – tables `cms_world`, `cms_transmission`, `cms_destination` mirroring manifest fields.
2. **API** (`/v1/cms/*`):
   - `GET /v1/cms/worlds`, `GET /v1/cms/worlds/:id`
   - `POST /v1/cms/worlds` (create)
   - `PATCH /v1/cms/worlds/:id` (update)
   - `DELETE /v1/cms/worlds/:id`
   - analogous endpoints for transmissions and destinations.
3. **Admin UI** (in **Headquarter**):
   - List view with filters (status, category, author).
   - Edit form with live validation (required fields, `SAFE_ID` pattern for `id`).
   - Image upload component using `mw_storage` addon; generated `imageKey` stored.
   - Publication workflow toggle (draft → proposed → published).\n4. **Migration Tool** – one‑off script that reads existing `manifest.json` and populates the new tables, preserving IDs.
5. **Security & Tenancy** – only users with `admin` role (via ARSY auth) can access `/v1/cms/*` and UI; all actions audited; tenant‑scoped (single tenant for now, but schema supports `company_id`).
6. **Static Generation Compatibility** – a build step reads from DB to generate a JSON snapshot (`public/content-snapshot.json`) used by existing static pages.

## Non‑Functional Requirements
- **Performance**: API latency < 200 ms for CRUD ops.
- **Observability**: Endpoint metrics exported via `/v1/metrics` (request count, latency, error rate).
- **Reliability**: Database migrations must be idempotent; rollback script prepared.
- **Accessibility**: UI built with `@moonwitness/ui` components, WCAG AA compliance.
- **Consistency**: All UI components must pass `pnpm ui:test` and `pnpm ui:contrast`.

## User Stories & Use Cases
- **US‑001**: *Editor creates a new World* – fills form, uploads visual, sets `publicationState` to `draft`, saves → appears in admin list.
- **US‑002**: *Editor publishes a Transmission* – changes state to `published`; system validates provenance `status: verified` before allowing.
- **US‑003**: *Admin uploads an image* – image stored via `mw_storage`, `imageKey` auto‑generated, preview shown.
- **US‑004**: *System builds static site* – build step pulls latest snapshot from DB; `Gate` pages render without code changes.
- **US‑005**: *Auditor reviews changes* – audit log view shows edit diffs, actor, timestamp.

## Dependencies & Constraints
- Depends on `@allah/arsy-orm` for DB access and migration tooling.
- Uses existing `@moonwitness/ui` for UI components (UI_PURITY rule).
- Image storage handled by `addons/mw_storage` – must be configured in env.
- Must not introduce raw SQL (`NO_RAW_SQL` invariant) – all DB ops via ORM.
- Must respect existing lint rules (`UI_PURITY`, `PALETTE_PURITY`, `STYLE_PURITY`).

## Acceptance Criteria (Definition of Done)
- [ ] Database tables created and migrations applied without errors.
- [ ] API endpoints functional, pass type‑check and lint.
- [ ] Admin UI integrated under `/content` in Headquarter, passes UI tests and contrast.
- [ ] Migration script successfully imports existing manifest data.
- [ ] Static build generates identical pages as before (regression test).
- [ ] All CRUD actions generate audit records (`arsy.audit.event`).
- [ ] Documentation updated: spec, architecture diagram, API contract, UI guide.
- [ ] No lint or type failures across the monorepo (`pnpm lint:arch`, `pnpm typecheck`).
- [ ] Feature gated behind a feature flag (`FEATURE_CMS`) and disabled by default.

## Success Metrics
- Content change cycle time < 1 hour after editorial approval.
- Zero regression failures in existing Gate/Dock pages after enabling CMS.
- 100 % of content changes logged in audit trail.
- Positive internal reviewer score (≥ 4/5) for UI usability.

## Roadmap Alignment
- **Stage 1** – Legacy discovery: Formalizes existing static content model.
- **Stage 2** – Architecture reconciliation: Introduces proper data store and API.
- **Stage 4** – Product integration: Enables rapid content updates without deploy.
- **Stage 5** – Experience transformation: Provides richer, up‑to‑date narrative experience.
