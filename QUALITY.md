---
contract: "DOCUMENTATION_CONTRACT.md"
id: "QUALITY"
version: "1.5.0"
owner: "qa"
status: "implemented"
last_verified: "2026-11-04"
---
# QUALITY.md

Definition of done. Gates → [AGENTS.md](AGENTS.md) § Quality Gates. Invariants → [AGENTS.md](AGENTS.md) § Invariants.
States: `IMPLEMENTED` ≠ `VERIFIED` ≠ `RELEASED` ≠ `DEPLOYED`. Each requires distinct evidence.

## Backend Standards

| Standard | Spec |
|---|---|
| Framework | Fastify 5.x |
| Types | Strict TypeScript |
| Response | `{ success, data, error, meta }` |
| SQL | Parameterized · `@allah/arsy-orm` · PGlite WASM |
| Security | Fail-closed guards · SSRF validation · secret-safe Pino logging |
| Endpoints | `/health` · `/ready` |

## Frontend Standards

| Standard | Spec |
|---|---|
| UI controls | `@moonwitness/ui` only. No raw `<button>` / `<input>` / `<select>` / `<textarea>` / `<a>` / `<form>` / `<label>` / `<table>`, and no hand-written `mw-*` class names. |
| Style source | Tokens from `packages/ui/src/theme.css`. No colour or type literals, no `--background`/`--foreground`, no painted inline styles. `STYLE_PURITY` and `INLINE_STYLE_PURITY` are absolute: the ratchet baselines are empty. |
| Markup colour | No Tailwind palette hue in app JSX (`PALETTE_PURITY`). A palette utility cannot be re-themed, so the world stops deciding the look. |
| Composition | Hero, kicker, section heading, route shell, status, destination card, and state panel come from `@moonwitness/ui` blocks. Apps add layout, not a second copy of the vocabulary. |
| Client comms | `@allah/sdk` only |
| UI states | loading · empty · error — all three required, per app, as `loading.tsx`, an empty panel, and `error.tsx` |
| Route files | Every app ships `error.tsx` · `loading.tsx` · `not-found.tsx` |
| A11y | WCAG AA · keyboard · focus indicators |
| Layout | Responsive mobile |

## Integration Standards

Versioned contracts via `@moonwitness/types` · MoonWitness ID session tokens or virtual keys · timeout/retry/idempotency · automated integration tests · observability + cost metering in PGlite.

## Data & Legacy

Preserve originals · record mapping + provenance → [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) · validate counts/hashes/relationships · document rollback · no destructive deletion without authorization.

## Security Checklist

Secrets · least privilege · access control · injection · SSRF · dependency risks · abuse controls · observability · deployment · rollback.

## Evidence Standard

Record per verified task: exact command + output · test result · environment limits · path or commit · manual verification.
Never report skipped checks as passing.

## Delivery Feedback

- `pnpm verify:fast` is the local pre-push check: documentation contract, architecture invariants, ESLint on changed files, and full TypeScript project checks with incremental build metadata.
- `pnpm verify:release` runs all local checks, tests, scaffold validation, and workspace builds.
- CI remains authoritative for promotion and records elapsed time for each gate. Fast local checks do not replace required CI checks.

## Verification Baseline (2026-11-04)

Every row is a command run against the current worktree with its recorded exit code and counts. `IMPLEMENTED` claims without a row here are unverified.

| Check | Result |
|---|---|
| `pnpm typecheck` | pass — 28 projects, strict mode enabled in 9, 0 errors (EXIT=0) |
| `pnpm lint:arch` | pass — all invariants (18 rules incl. ICON_PURITY, LANDMARK_PURITY, NO_PUBLIC_CLIENT_SECRETS, artwork existence) · 2,397 files scanned (EXIT=0) |
| `pnpm lint` | pass — eslint `--max-warnings 0`, 0 errors / 0 warnings (EXIT=0) |
| `pnpm docs:check` | 100/100 · 95 plans audited (EXIT=0) |
| `pnpm ui:test` | 43/43 pass — component, skin, and brand-asset contracts incl. artwork existence and HD preview checks (EXIT=0) |
| `pnpm ui:contrast` | pass — 6 skins, every token pair measured ≥ WCAG threshold (EXIT=0) |
| `pnpm gate:build` · `dock:build` · `headquarter:build` · `id:build` · `jizz:build` | pass (EXIT=0 each) |
| `pnpm --filter @moonwitness/moonsky build` · `--filter @moonwitness/harbor build` | pass (EXIT=0 each) |
| `pnpm --filter @allah/arsy build` | pass (EXIT=0) |
| `pnpm --filter @moonwitness/sentinel build` · `pnpm extension:build` | pass (EXIT=0 each) |
| `pnpm --filter @allah/arsy test` | 60/60 pass — hub suite (swarm · ai_gateway · tools_mcp · agent_loop · onboarding · trust boundary) run serially via `--test-concurrency=1` (EXIT=0) |
