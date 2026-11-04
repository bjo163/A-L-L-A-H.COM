---
contract: "DOCUMENTATION_CONTRACT.md"
id: "NARRATIVE-CMS-RULES"
version: "1.0.0"
owner: "product"
status: "proposed"
last_verified: "2026-11-04"
---
# Narrative CMS — Invariants & Security Rules

Non-negotiable guards for [spec.md](spec.md) and [design.md](design.md).

## Invariants

| Rule | Requirement |
|---|---|
| ORM | All DB access through `@allah/arsy-orm` only (`NO_RAW_SQL`); parameterized values plus column/sort allowlists; no arbitrary query surface. |
| Tenant | `company_id` on every row, derived from the verified principal and fail-closed — never read from the request body. |
| Audit | Every insert/update/delete writes one append-only `arsy.audit.event` in the same transaction; events store changed field names, not values. |
| Storage | Images via `mw_storage`: SHA-256 content-addressed, write-once `data/storage/<digest>`; DB stores only the `imageKey`. |
| Retention | Delete is fail-closed against `legal_hold` / `retention_until`. |
| UI_PURITY | Admin UI uses `@moonwitness/ui` controls only; no raw native elements, no `mw-*` class hand-writing, no palette hues (`PALETTE_PURITY`), no inline painted style (`STYLE_PURITY`/`INLINE_STYLE_PURITY`). |
| STATE_PARITY | `/content` ships `loading.tsx` · `error.tsx` · `not-found.tsx` from `StatePanel`. |
| SDK | Client↔hub comms exclusively via `@allah/sdk`. |
| Types | Contracts shared in `@moonwitness/types`; no local type redefinition. |

## Security

- Default-deny: every `/v1/cms/*` route requires a verified principal; `admin` role checked server-side per route. No anonymous content mutation.
- `FEATURE_CMS` disabled by default; flag check server-side, not just UI hiding.
- Input validation: `SAFE_ID` pattern on `id`; publication state transitions restricted to draft → proposed → published (retire via explicit action); publish blocked unless provenance is `verified` or the item is a system item with `provenance: null`.
- Global-admin access to another tenant's content requires an admin route with a recorded reason and target tenant — generic CMS CRUD never exposes identity, audit, or credential-bearing models.
- SSRF: the CMS accepts no caller-supplied fetch targets; image bytes arrive only through upload.
- Secrets: nothing editorial-related may be prefixed `NEXT_PUBLIC_`; storage credentials stay server-only.

## Migration Guards

- `manifest.json` import must be idempotent and preserve IDs; rerun produces zero duplicates.
- Rollback script prepared and dry-run verified before any production migration.
- Static snapshot output diffed against pre-CMS pages as a regression gate.
