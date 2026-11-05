---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AGENTS"
version: "1.9.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-06"
---
# AGENTS.md

Contracts: [AUTONOMOUS.md](AUTONOMOUS.md) · [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md) · [PLATFORM_CONTRACT.md](docs/architecture/PLATFORM_CONTRACT.md) · [GOAL.md](GOAL.md) · [QUALITY.md](QUALITY.md) · [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) · [BLUEPRINT.md](BLUEPRINT.md)

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
| `apps/gate/` | Next.js 16 · React 19 · Tailwind v4 | 3000 |
| `apps/headquarter/` | Next.js 16 · React 19 · Tailwind v4 | 3002 |
| `apps/id/` | Next.js 16 · React 19 · Tailwind v4 · SSO | 3003 |
| `apps/jizz/` | Next.js 16 · React 19 · Tailwind v4 | 3004 |
| `apps/moonsky/` | Next.js 16 · React 19 · Tailwind v4 | 3005 |
| `apps/harbor/` | Next.js 16 · React 19 · Tailwind v4 · E-ISP customer portal | 3006 |
| `apps/sentinel/` | Sentinel RADIUS daemon · UDP auth/accounting + HTTP health | 1812/1813/9181 |
| `addons/` | `base` · `works` · `nexus` · `orbit` · `mw_storage` · `mw_llm_router` · `mw_qorpus` | — |
| `packages/ui/` | `@moonwitness/ui` — **MANDATORY** all UI controls | — |
| `packages/sdk/` | `@allah/sdk` — **MANDATORY** all client↔hub comms | — |
| `packages/types/` | `@moonwitness/types` — **MANDATORY** shared contracts | — |
| `packages/lint/` | `@moonwitness/lint` → `pnpm lint:arch` | — |
| `packages/arsy-orm/` | `@allah/arsy-orm` — sole ORM | — |

**Forbidden in `apps/`**: raw `<button>` / `<input>` / `<select>` / `<textarea>` / `<a>` / `<form>` / `<label>` / `<table>` · hand-written `mw-*` component class names · local type redefinition · direct DB calls. The design system is the only place a native control may appear; `@moonwitness/ui` owns `Select`, `Table`, `Dialog`, `Form`/`FormField`, and `Link`, and `Button asChild` turns any router link into a button. Shared components expose `data-slot` attributes as the supported CSS hook; app CSS must not target private component classes.

## Invariants

| Rule | Spec |
|---|---|
| Storage | SHA-256 content-addressed · write-once · `data/storage/<digest>` |
| SQL | Parameterized values only, plus a column/sort identifier allowlist. No raw string queries; no arbitrary-SQL tool on the public surface. |
| Auth | Default-deny: every hub route needs a verified principal. Only an explicit public allowlist (`/health`, `/ready`, onboarding, non-prod `/docs`) is anonymous. |
| Tenant | `company_id` on every row, derived from the principal and fail-closed — never taken from the request body. |
| ORM | Embedded PGlite via `@allah/arsy-orm` only. Zero overlap. |
| Audit | Every model insert/update/delete writes one append-only event in the same transaction; events store changed field names, not values. |
| Global admin | Superuser access is server-authorized per admin route, requires a reason, and records the target tenant; generic CRUD never exposes identity, audit, or credential-bearing models. |
| Style source | `packages/ui/src/theme.css` maps Tailwind utilities onto skin tokens. Apps define no colour, type, or theme variables and target no private `mw-*` class (`STYLE_PURITY`). |
| Markup colour | App JSX never paints with a Tailwind palette hue (`PALETTE_PURITY`). Colour arrives from a component variant, a composition block, or a token-driven utility, so the selected world can restyle it. |
| Icon source | Third-party icon libraries (`lucide-react`, `react-icons`, `@tabler/icons-react`, `heroicons`) are imported only by `packages/ui/src/components/icon.tsx`; apps consume the design-system `Icon` component (`ICON_PURITY`). |
| Landmark purity | The skip-link `id="main-content"` landmark belongs to the design-system `RouteShell`; apps never hand-roll it (`LANDMARK_PURITY`). |
| Client secrets | No `'use client'` file may read a `NEXT_PUBLIC_*` value carrying a key/secret/token (`NO_PUBLIC_CLIENT_SECRETS`). Upstream credentials live server-side only — apps proxy through a same-origin route handler. |
| Composition blocks | Hero, kicker, section heading, route shell, status message, destination card, and state panel exist once in `packages/ui/src/blocks/`. Applications compose them instead of redefining the same vocabulary per app. |
| Route states | Every app ships `error.tsx`, `loading.tsx`, and `not-found.tsx` built from `StatePanel` (`STATE_PARITY`). |
| Skin ownership | Each app declares a valid `SkinRoot`; duplicate root worlds require an explicit lint-baseline exception. Route-specific experiences may use `SkinScope` without creating another app root or motion provider. |
| Retention | Fail-closed: reject on `legal_hold` / `retention_until` |
| SSRF | Validate `base_url` before the request and re-check the resolved IP, so a domain that resolves to a private or loopback address is refused. |

## Quality Gates

```
pnpm verify:fast         # local docs + architecture + changed-file lint + incremental full typecheck
pnpm verify:release      # all required checks, tests, scaffold validation, and workspace builds
pnpm docs:check          # 100/100 required
pnpm contract:check      # per-unit CONTRACT.md presence + code cross-check
pnpm docker:contract:check   # every app Docker image and runtime dependency
pnpm platform:contract:check # Compose, health, env, CI/API/model and release alignment
pnpm lint:arch           # arch invariants
pnpm lint                # eslint, --max-warnings 0
pnpm typecheck           # TS strict in packages/ui, dock, headquarter, id, jizz, gate
pnpm ui:test             # design system component and skin contracts
pnpm ui:contrast         # measured WCAG ratios for every skin's token pairs
pnpm dock:build
pnpm headquarter:build
pnpm id:build
pnpm jizz:build
pnpm gate:build
pnpm --filter @allah/arsy build
```

Pre-commit: `git diff --cached --check`. Pre-push: `verify:fast` for rapid local feedback; full build/test gates remain mandatory in CI before promotion. Commit-msg: commitlint. `verify:release` runs the full local release suite when requested.

Production Docker builds run on GitHub Actions only. Coolify receives its own GitHub webhook; image publication and Coolify deployment may run concurrently. Do not duplicate the resource-heavy Docker gate locally.

## Issues Standard

Queue: GitHub Issues on `bjo163/A-L-L-A-H.COM`. The issue is the only authoritative work item; `.plans/` folders are retired (D-018). All GitHub writes go through the `gh` CLI.

| Rule | Spec |
|---|---|
| Work item | One issue per bounded plan. Body: Context/Spec · Design · Rules · Tasks. Acceptance criteria name files/subsystems with measurable outcomes. |
| Tiering | ≤40 checkboxes → single issue with tasklist. >40 with phase sections → epic (`epic` label) + one native sub-issue per phase. |
| Labels | `type:task` + exactly one `status:*` · `epic` · `priority:P0\|P1\|P2` · domain labels · `blocked` when owner input is required · `evolve` for self-evolution work. |
| Status flow | proposed → open + `status:pending` · claim → `status:in-progress` + work-start comment · done → closing comment with evidence (commands, exit codes, files changed) then close · rejected → `wontfix` + pointer. |
| Conflicts | Blocked work gets `blocked` + a comment naming the open conflict IDs. Only dependent work stalls. |
| ADR | Decisions land as issue comments; repo-wide ones also append `DECISIONS.md`. |
| Resume | `gh issue list --state open --label status:in-progress`, then `status:pending` ordered by priority then smallest tasklist. |
| Anti-stacking | No new `evolve` issue while an `evolve` issue is still open. |

<!-- antislop:start -->
## Antislop
`antislop` · `antislop-ui` · `antislop-human` · `antislop-code`. Verify mode before every edit.
<!-- antislop:end -->
