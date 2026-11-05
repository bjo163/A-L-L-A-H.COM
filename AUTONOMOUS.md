---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AUTONOMOUS"
version: "1.3.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-04"
---
# AUTONOMOUS.md

Execution process for autonomous agents on A-L-L-A-H.COM.
Rules: [AGENTS.md](AGENTS.md). Doc ownership: [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md).

## Loop

```
DISCOVER → PLAN → AUDIT → IMPLEMENT → VERIFY → DOCUMENT → PUSH → EVOLVE (if idle)
                                                                        ↑_____________|
```

## 1. Discover

```
if BACKLOG has READY / IN_PROGRESS items:
    pick highest-value safe task → go to §2
else:
    go to §8 EVOLVE
```

Research sources: `bjo163/*` repos (`moonwitnessxv`, `echolog`, `ql-orm`, `ql_ai`, `mwx-isp`) + Odoo/OpenDAL standards.

## 2. Plan

Create `.plans/<timestamp>-<slug>/` artifacts before writing any code. Schema → [AGENTS.md](AGENTS.md) § Plans Standard.

## 3. Security Audit

| Check | Rule |
|---|---|
| Streaming | Zero-copy via `fastify` / `undici` |
| SQL | Parameterized only. No raw strings. |
| Storage | SHA-256 · immutable |
| Retention | Fail-closed on `legal_hold` / `retention_until` |
| SSRF | Validate `base_url` before any upstream call |

## 4. Implement

Stack: TypeScript · Fastify 5 · `addons/` · PGlite (`@allah/arsy-orm`) · Next.js 16 · React 19 · Tailwind v4.
Shared: `@moonwitness/ui` · `@allah/sdk` · `@moonwitness/types`.
Zero placeholder files. Strict types. High-signal comments only.

## 5. Verify

```bash
pnpm verify:fast
```

On error: self-diagnose and fix root cause. Never prompt user.
Full gate list → [AGENTS.md](AGENTS.md) § Quality Gates. CI runs the full required quality checks and builds affected workspace components before promotion; `pnpm verify:release` runs the all-workspace release suite locally.

## 6. Document

Update only the canonical doc that owns the changed subject. Matrix → [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md) § Change Matrix.
Never duplicate canonical content. Link instead.

## 7. Push

```bash
git diff --staged          # no secrets · no local DBs · no credentials
git commit -m "<type>(<scope>): <description>"
git push origin dev        # CI promotes dev→main on 100% pass
```

→ return to §1 DISCOVER

---

## 8. Evolve (Self-Evolution Mode)

Triggered when: BACKLOG has no `READY` / `IN_PROGRESS` items AND all quality gates pass.

### 8.1 Scan for Evolution Signals

Inspect in order:

| Source | Look for |
|---|---|
| [ROADMAP.md](ROADMAP.md) | Stages with `NOT_AUDITED` or unverified goals |
| [BACKLOG.md](BACKLOG.md) | Items marked `DISCOVERED` with no active plan |
| [BLUEPRINT.md](BLUEPRINT.md) | Pending items (e.g. Skin Laboratory, missing integrations) |
| [QUALITY.md](QUALITY.md) | Verification gaps, pre-existing test failures |
| `apps/*/` source | Tech debt · missing UI states · a11y gaps · perf opportunities |
| `packages/*/` source | API surface gaps · type coverage holes · missing exports |
| `bjo163/*` repos | New capabilities not yet integrated into A-L-L-A-H.COM |
| Odoo / OpenDAL standards | Patterns applicable to current architecture |

### 8.2 Brainstorm

Generate 3–7 candidate ideas. For each score:

```
impact  : HIGH | MED | LOW   (user/product value)
effort  : HIGH | MED | LOW   (implementation complexity)
risk    : HIGH | MED | LOW   (reversibility, security surface)
priority: P0 | P1 | P2
```

Scoring rule: `HIGH impact + LOW/MED effort + LOW risk = P0 candidate`.
Never invent work that conflicts with [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) canon.

### 8.3 Select & Execute

```
pick top-scored idea
→ create .plans/<timestamp>-<slug>/ (§2 Plan)
→ append new entry to BACKLOG.md with status: READY
→ return to §1 DISCOVER (pick the new task immediately)
```

Guard (evolve-loop-guard): a new plan is created only when the idea has a
concrete spec. Before creating `.plans/<timestamp>-<slug>/`, write a
`spec.md` whose `## Architecture Requirements` and `## Acceptance Criteria`
name the specific capability, the files/subsystems it touches, and the
measurable acceptance criteria. A plan titled "New platform capability" with
acceptance criteria that only repeat "implement the capability" is rejected;
rephrase the idea until the spec is specific, or drop it.

### 8.4 Evolve Constraints

- Max 1 new plan created per evolve cycle (avoid runaway scope)
- Must pass §3 Security Audit before implementing any evolved idea
- Record brainstorm rationale in `spec.md` § Motivation
- If all roadmap stages are `VERIFIED`: propose next platform generation in a new `conflict.md` for human steering

### 8.5 Verification Guard (evolve-loop-guard)

`VERIFIED` in BACKLOG.md is a hard state: it requires a `report.md` in the
plan directory that records evidence actually produced, not a claim. Before
setting any evolved item to `VERIFIED`, the `report.md` must name the commands
run, the exit codes or output, and the concrete files changed. A report that
only states "all quality gates passing" with no command list, no exit codes,
and no changed files is treated as unverified and must not be marked
`VERIFIED`; set the item to `DISCOVERED` or `IN_PROGRESS` instead.

### 8.6 Anti-Stacking Guard (evolve-loop-guard)

No new evolve plan is created while any evolve plan exists in `proposed` or
`in_progress` state. Resolve or reject the open plan first (a plan stuck in
`proposed` with no code or spec may be marked `REJECTED` with a one-line
reason) before opening a new one. This prevents the pile-up of empty
`NEW-PLATFORM-CAPABILITY-N` plans seen in capability 4 through 13.
