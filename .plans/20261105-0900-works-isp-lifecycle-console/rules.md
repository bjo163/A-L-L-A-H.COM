---
status: proposed
plan: "works-isp-lifecycle-console"
owner: "engineering"
---

# Works ISP Lifecycle Console — Mandatory Guidelines & Invariants

These rules are non-negotiable for this plan. Violations block merge. They restate the `AGENTS.md`
invariants as they apply to the ISP console surface.

## R1 — Tenant isolation is mandatory on every read and write
- Every repository call uses `tenantOf(request)` for its scope. `company_id` is taken from the
  authenticated principal, never from the request body or a client-supplied value.
- A `plan_id`/`subscription_id` belonging to another tenant resolves to 404, not a mutation of
  foreign data (the existing `findById(id, scope)` behavior must be preserved, not widened).

## R2 — Parameterized access only; no arbitrary SQL
- All data access flows through `BaseRepository` / the ORM `QueryBuilder`. No raw
  `dbEngine.query`/`exec` string concatenation is introduced for the console.

## R3 — Fail-closed state transitions
- A transition from an illegal source state returns `409 INVALID_TRANSITION` and writes nothing.
- The declared state set (`draft`, `active`, `grace`, `suspended`, `cancelled`) is the authority;
  the route map and the model selection must stay consistent (manifest/lint enforced).

## R4 — Audit is append-only and actor-attributed
- Mutations run inside a transaction so the ORM's DB trigger records the audit event with the
  actor from `actorOf(request)`. The console does not create a parallel audit table or mutate
  historical audit rows.

## R5 — Default-deny authentication
- Every `/v1/works/*` route sits behind the existing auth hook; there is no unauthenticated
  console read and no fallback that treats a missing tenant as "all tenants".

## R6 — UI uses design-system blocks only
- Render via `@moonwitness/ui` (`StatePanel`, `Card`, `Table`, `Badge`, `Button`). No Tailwind
  palette colors, no new icon libraries, one skin root per app, and STATE_PARITY: every async
  surface has explicit error, loading, and not-found states.

## R7 — Additive to the repaired foundation
- This console builds on the roadmap's T2 (single `isp_commercial` source of truth) and T8 (shared
  dependency-ordered loader). It must not reintroduce duplicate `isp_*` model definitions or a
  hand-wired registration sequence.

## R8 — Test gates
- New routes require hub tests (transition legality, tenant isolation, invoice lifecycle). The
  existing trust-boundary and tenant-isolation suites must remain unchanged and green, and the full
  battery (`typecheck`, `lint`, `build`, `docs:check`, app builds) must exit 0.
