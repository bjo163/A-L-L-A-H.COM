---
contract: "DOCUMENTATION_CONTRACT.md"
id: "QUALITY"
version: "1.4.0"
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

## Verification Baseline (2026-11-04)

| Check | Result |
|---|---|
| `pnpm typecheck` | 0 errors (all 12 packages/apps) |
| `pnpm lint:arch` | 100% — UI Purity · Single ORM · Universal SDK · Shared Types |
| `pnpm docs:check` | 100/100 pts |
| `pnpm dock:build` + `pnpm headquarter:build` + `pnpm id:build` + `pnpm --filter @allah/arsy build` | pass |
| `swarm.test.mjs` | 5/5 pass |
| `ai_gateway.test.mjs` | model catalog · chat · virtual key · telemetry · usage — pass |
| `tools_mcp.test.mjs` | tools/list · pglite_query · storage_cas · SSRF guard · qorpus_retrieve · audit log — pass |
| `agent_loop.test.mjs` | run/session · max_steps — pass. SSE mock tool-call gaps: pre-existing. |
