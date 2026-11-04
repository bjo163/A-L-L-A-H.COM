---
contract: "DOCUMENTATION_CONTRACT.md"
id: "QUALITY"
version: "1.2.0"
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
| UI controls | `@moonwitness/ui` only. No raw `<button>` / `<input>`. |
| Client comms | `@allah/sdk` only |
| UI states | loading · empty · error — all three required |
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
