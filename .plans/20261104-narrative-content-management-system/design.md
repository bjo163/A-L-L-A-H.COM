---
contract: "DOCUMENTATION_CONTRACT.md"
id: "NARRATIVE-CMS-DESIGN"
version: "1.0.0"
owner: "product"
status: "proposed"
last_verified: "2026-11-04"
---
# Narrative CMS — Technical Design

Design for [spec.md](spec.md) · tracked in [task.md](task.md) · guarded by [rules.md](rules.md).

## 1. Architecture

```
Headquarter /content (admin UI, @moonwitness/ui)
        │ @allah/sdk (verified principal, admin role)
        ▼
ARSY hub  /v1/cms/*  ──FEATURE_CMS flag──►  404 when disabled
        │ @allah/arsy-orm (PGlite, parameterized only)
        ▼
cms_world · cms_transmission · cms_destination   (+ append-only arsy.audit.event)
        │ build-time snapshot step
        ▼
public/content-snapshot.json  →  Gate / Dock static pages (unchanged rendering path)
```

## 2. Data Model

| Table | Key fields | Notes |
|---|---|---|
| `cms_world` | `id` (SAFE_ID), `company_id`, `title`, `publicationState`, `provenance`, `imageKey` | mirrors manifest `worlds[]` |
| `cms_transmission` | `id`, `company_id`, `worldId`, `body`, `publicationState`, `provenance` | publish requires provenance `verified` |
| `cms_destination` | `id`, `company_id`, `worldId`, `route`, `publicationState` | route hints for Gate/Dock |

`company_id` on every row, derived from the principal — never from the request body. Images stay in `mw_storage` (SHA-256 content-addressed); tables store only the `imageKey` digest.

## 3. API Contract

All routes default-deny; require verified principal with `admin` role. Responses use the hub envelope `{ success, data, error, meta }`.

| Method + Path | Request | Result |
|---|---|---|
| `GET /v1/cms/worlds` | `?status&category&author&page` | list, sorted by allowlisted columns only |
| `GET /v1/cms/worlds/:id` | — | single item or 404 |
| `POST /v1/cms/worlds` | item body (no `company_id`, no actor fields) | 201 + audit event |
| `PATCH /v1/cms/worlds/:id` | partial body | 200 + audit event (changed field names only) |
| `DELETE /v1/cms/worlds/:id` | `?reason` | 204; retention check (legal_hold / retention_until) fail-closed |

Transmissions and destinations expose the identical shape. Validation errors return 422 with field-level messages; state-machine violations (e.g. publish without verified provenance) return 409.

## 4. UI & States

- List: `Table` with filter bar; empty state = `StatePanel kind="empty"`; loading = skeleton-free `StatePanel kind="loading"`; errors surface cause + retry action.
- Edit form: `Form`/`FormField`, live validation, `SAFE_ID` regex on `id`; image upload previews via stored `imageKey`; every native control comes from `@moonwitness/ui` only.
- Workflow toggle reflects server state; optimistic UI never overrides `publicationState` returned by the hub.
- Route files: `/content` ships `loading.tsx` · `error.tsx` · `not-found.tsx` built from `StatePanel` (STATE_PARITY); rendered inside headquarter's NEXUS PARADOX `SkinRoot` (one world per app).
