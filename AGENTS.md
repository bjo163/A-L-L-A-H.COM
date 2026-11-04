---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AGENTS"
version: "1.3.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-04"
---
# AGENTS.md

Contracts: [AUTONOMOUS.md](AUTONOMOUS.md) · [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md) · [GOAL.md](GOAL.md) · [QUALITY.md](QUALITY.md) · [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) · [BLUEPRINT.md](BLUEPRINT.md)

## Exec

| Key | Value |
|---|---|
| Mode | Autonomous. Zero micro-confirmations on safe tasks. |
| Repo | `https://github.com/bjo163/A-L-L-A-H.COM.git` · branch `dev` |
| Loop | `DISCOVER → PLAN → AUDIT → IMPLEMENT → VERIFY → DOCUMENT → PUSH → EVOLVE` (detail: [AUTONOMOUS.md](AUTONOMOUS.md)) |
| Antislop | Load `antislop` · `antislop-ui` · `antislop-human` · `antislop-code` before any edit |
| Legacy | A-L-L-A-H.COM = MoonWitness + Empire of the Light → [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) |

## Monorepo Map

| Path | Import / Stack | Port |
|---|---|---|
| `apps/arsy/` | Fastify 5 · `@allah/arsy-orm` (PGlite) | 5150 |
| `apps/dock/` | Next.js 16 · React 19 · Tailwind v4 | 3001 |
| `apps/headquarter/` | Next.js 16 · React 19 · Tailwind v4 | 3002 |
| `apps/id/` | Next.js 16 · React 19 · Tailwind v4 · SSO | 3003 |
| `apps/jizz/` | Next.js 16 · React 19 · Tailwind v4 | 3004 |
| `addons/` | `base` · `mw_storage` · `mw_llm_router` · `mw_qorpus` | — |
| `packages/ui/` | `@moonwitness/ui` — **MANDATORY** all UI controls | — |
| `packages/sdk/` | `@allah/sdk` — **MANDATORY** all client↔hub comms | — |
| `packages/types/` | `@moonwitness/types` — **MANDATORY** shared contracts | — |
| `packages/lint/` | `@moonwitness/lint` → `pnpm lint:arch` | — |
| `packages/arsy-orm/` | `@allah/arsy-orm` — sole ORM | — |

**Forbidden in `apps/`**: raw `<button>` / `<input>` · local type redefinition · direct DB calls

## Invariants

| Rule | Spec |
|---|---|
| Storage | SHA-256 content-addressed · write-once · `data/storage/<digest>` |
| SQL | Parameterized only. No raw string queries. |
| Tenant | `company_id` on every row |
| ORM | Embedded PGlite via `@allah/arsy-orm` only. Zero overlap. |
| Retention | Fail-closed: reject on `legal_hold` / `retention_until` |
| SSRF | Validate `base_url` before every upstream request |

## Quality Gates

```
pnpm docs:check          # 100/100 required
pnpm lint:arch           # arch invariants
pnpm typecheck           # strict TS
pnpm dock:build
pnpm headquarter:build
pnpm id:build
pnpm --filter @allah/arsy build
```

Pre-commit: `docs:check` + `lint:arch` + `typecheck`. Pre-push: all build gates. Self-heal all errors. Never prompt user.

## Plans Standard

Path: `.plans/<timestamp>-<slug>/`

| Artifact | Required | Purpose |
|---|---|---|
| `spec.md` | always | Architecture · requirements · acceptance criteria · `status`: `proposed→in_progress→completed` |
| `task.md` | always | `- [ ] → - [/] → - [x]`. Update live during execution. |
| `design.md` | always | UX/UI states · API contracts |
| `rules.md` | always | Invariants · security · tenant isolation · SSRF |
| `conflict.md` | when blocked | Ambiguity / trade-off needing human input (`- [ ] Confirmed by User`) |
| `decision.md` | when ADR needed | Rationale · alternatives · consensus |
| `report.md` | on `completed` | Verified deliverables + evidence. No invented estimates. |

<!-- antislop:start -->
## Antislop
`antislop` · `antislop-ui` · `antislop-human` · `antislop-code`. Verify mode before every edit.
<!-- antislop:end -->
