---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AUTONOMOUS"
version: "1.1.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-04"
---
# AUTONOMOUS.md

Autonomous execution contract for A-L-L-A-H.COM. See [AGENTS.md](AGENTS.md) for full rule set.

## Execution Loop

```
DISCOVER → PLAN (.plans/) → AUDIT → PRIORITIZE → IMPLEMENT → VERIFY → DOCUMENT → PUSH
```

## 1. Plan

Create `.plans/<timestamp>-<slug>/` with `spec.md`, `task.md`, `design.md`, `rules.md` before writing any code.
See [AGENTS.md](AGENTS.md) for artifact schema and status transitions.

Research sources: `bjo163/*` repos (`moonwitnessxv`, `echolog`, `ql-orm`, `ql_ai`, `mwx-isp`) + Odoo/OpenDAL standards.
Next task: pick highest-value safe item from [BACKLOG.md](BACKLOG.md).

## 2. Security Audit

| Check | Rule |
|---|---|
| Streaming | Zero-copy via `fastify` / `undici` |
| SQL | Parameterized only. No raw string queries. |
| Storage | SHA-256 content-addressed. Immutable. |
| Retention | Fail-closed: reject deletion on `legal_hold` / `retention_until`. |
| SSRF | Validate `base_url` before any upstream request. |

## 3. Implementation

| Layer | Stack |
|---|---|
| Backend | TypeScript · Fastify 5 · `addons/` · embedded PGlite (`@allah/arsy-orm`) |
| Frontend | Next.js 16 · App Router · React 19 · Tailwind v4 |
| Shared | `@moonwitness/ui` · `@allah/sdk` · `@moonwitness/types` |

Zero placeholder files. Strict types. High-signal comments only.

## 4. Build Gates

```bash
pnpm --filter @allah/arsy build
pnpm docs:check
```

On error: self-diagnose and fix. Do not prompt user.

## 5. Doc Sync

Apply change-to-document matrix from [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md). Update only affected canonical docs:

| Changed | Update |
|---|---|
| Capabilities / setup / deploy | `README.md`, `CHANGELOG.md` |
| Architecture / integration | `BLUEPRINT.md`, `DECISIONS.md` |
| Product experience | `DESIGN.md` |
| Task state / evidence | `BACKLOG.md` |
| Quality process | `QUALITY.md` |
| Provenance / legacy | `LEGACY_RECONCILIATION.md` |

Never duplicate canonical content. Link instead.

## 6. Git

```bash
git diff --staged   # no secrets, no local DBs, no credentials
git commit -m "<type>(<scope>): <description>"
git push origin dev # CI gate verifies; promotes dev→main on pass
```
