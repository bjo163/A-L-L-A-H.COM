---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AGENTS"
version: "1.1.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-04"
---
# AGENTS.md

Ref: [AUTONOMOUS.md](AUTONOMOUS.md) | [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md) | [GOAL.md](GOAL.md) | [QUALITY.md](QUALITY.md) | [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md)

## Exec Rules

| Rule | Value |
|---|---|
| Mode | Autonomous. Zero micro-confirmations on safe tasks. |
| Repo | `https://github.com/bjo163/A-L-L-A-H.COM.git` branch `dev` |
| Loop | `DISCOVER→PLAN→AUDIT→IMPLEMENT→VERIFY→DOCUMENT→PUSH` |
| Antislop | Load skills: `antislop`, `antislop-ui`, `antislop-human`, `antislop-code` before any edit. |
| Legacy | A-L-L-A-H.COM = MoonWitness + Empire of the Light. See [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md). |

## Plans Standard `.plans/<timestamp>-<slug>/`

Required artifacts (create before coding):

| File | Purpose |
|---|---|
| `spec.md` | Architecture, requirements, acceptance criteria. `status`: `proposed→in_progress→completed`. |
| `task.md` | Checklist `- [ ]` → `- [/]` → `- [x]`. Update live. |
| `design.md` | UX/UI states, API contracts |
| `rules.md` | Invariants, security, tenant isolation, SSRF guard |

Conditional artifacts:

| File | When |
|---|---|
| `conflict.md` | Ambiguity / blocker / trade-off → human input (`- [ ] Confirmed by User`) |
| `decision.md` | ADR: rationale, alternatives, consensus |
| `report.md` | On `status: completed` — verified deliverables + evidence. No invented estimates. |

## Monorepo Map

| Path | Stack | Port |
|---|---|---|
| `apps/arsy/` | Fastify 5 + PGlite (`@allah/arsy-orm`) | 5150 |
| `apps/dock/` | Next.js 16 + React 19 + Tailwind v4 | 3001 |
| `apps/headquarter/` | Next.js 16 + React 19 + Tailwind v4 | 3002 |
| `apps/id/` | Next.js 16 + React 19 + Tailwind v4 (SSO) | 3003 |
| `addons/` | `base`, `mw_storage`, `mw_llm_router`, `mw_qorpus` | — |
| `packages/ui/` | `@moonwitness/ui` — MANDATORY for all UI controls | — |
| `packages/sdk/` | `@allah/sdk` — MANDATORY for all client↔hub comms | — |
| `packages/types/` | `@moonwitness/types` — MANDATORY shared contracts | — |
| `packages/lint/` | `@moonwitness/lint` — arch invariant gate (`pnpm lint:arch`) | — |

Forbidden in `apps/`: raw `<button>`/`<input>` tags · local entity redefinition · direct DB calls outside `@allah/arsy-orm`.

## Invariants

- Storage: SHA-256 content-addressed, write-once (`data/storage/<digest>`)
- DB: parameterized queries only. No raw SQL strings.
- Tenant: `company_id` on all data.
- ORM: embedded PGlite only. Zero ORM overlap.
- Retention: fail-closed on `legal_hold` / `retention_until`.
- Upstream: validate `base_url`, block SSRF.

## Quality Gates (100% required, self-heal on error)

```
pnpm docs:check
pnpm lint:arch
pnpm typecheck
pnpm dock:build
pnpm headquarter:build
pnpm id:build
pnpm --filter @allah/arsy build
```

Pre-commit (`.husky/`): `docs:check` + `lint:arch` + `typecheck`. Pre-push: build gates.

## Git

```
git diff --staged   # review: no secrets, no local DBs
git commit -m "<type>(<scope>): <description>"
git push origin dev # CI promotes dev→main on 100% pass
```

<!-- antislop:start -->
## Antislop
Skills: `antislop` (core) | `antislop-ui` | `antislop-human` | `antislop-code`. Verify mode before edits.
<!-- antislop:end -->
