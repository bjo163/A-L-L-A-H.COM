---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AUTONOMOUS"
version: "1.4.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-06"
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
gh issue list --state open --label status:in-progress   # resume claimed work first
gh issue list --state open --label status:pending --label priority:P0
# then P1, P2; within a priority pick the smallest tasklist
if no open work item fits:
    go to §8 EVOLVE
```

The GitHub queue is the entry point. Research sources: `bjo163/*` repos (`moonwitnessxv`, `echolog`, `ql-orm`, `ql_ai`, `mwx-isp`) + Odoo/OpenDAL standards.

## 2. Plan

Plan = GitHub issue, before writing any code (schema → [AGENTS.md](AGENTS.md) § Issues Standard). Write the body with `gh issue create --body-file`. One bounded plan per issue; a plan over ~40 checkboxes with phase sections becomes an epic plus one native sub-issue per phase (`gh api -X POST repos/bjo163/A-L-L-A-H.COM/issues/<epic>/sub_issues`). Tasklists live in the issue and are checked off live during execution.

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

Triggered when: the GitHub queue has no open work item to claim AND all quality gates pass.

### 8.1 Scan for Evolution Signals

Inspect in order:

| Source | Look for |
|---|---|
| [ROADMAP.md](ROADMAP.md) | Stages with `NOT_AUDITED` or unverified goals |
| GitHub queue (`gh issue list`) | Open `status:pending` / `status:in-progress` items |
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
→ create the GitHub issue with labels `evolve`, `type:task`, `status:pending`, priority (§2 Plan)
→ return to §1 DISCOVER (claim and execute the new issue immediately)
```

Guard (evolve-loop-guard): a new evolve issue is created only when the idea has a
concrete spec. The issue body must carry `Context / Spec` naming the specific
capability, the files/subsystems it touches, and the measurable acceptance
criteria. An issue titled "New platform capability" whose acceptance criteria only
repeat "implement the capability" is rejected; rephrase the idea until the spec is
specific, or drop it.

### 8.4 Evolve Constraints

- Max 1 new evolve issue created per evolve cycle (avoid runaway scope)
- Must pass §3 Security Audit before implementing any evolved idea
- Record brainstorm rationale in the issue body
- If all roadmap stages are `VERIFIED`: propose the next platform generation as a
  `blocked` issue comment for human steering

### 8.5 Verification Guard (evolve-loop-guard)

`VERIFIED` is a hard state: it requires a closing comment on the evolve issue that
records evidence actually produced, not a claim. Before closing any evolved item
as `VERIFIED`, the closing comment must name the commands run, the exit codes or
output, and the concrete files changed. A comment that only states "all quality
gates passing" with no command list, no exit codes, and no changed files is
treated as unverified; keep the issue open on `status:in-progress` instead.

### 8.6 Anti-Stacking Guard (evolve-loop-guard)

No new evolve issue is created while any `evolve` issue is open
(`gh issue list --state open --label evolve`). Resolve or reject the open issue
first (one stuck in `status:pending` with no code or spec may be closed as
`wontfix` with a one-line reason) before opening a new one. This prevents the
pile-up of empty `NEW-PLATFORM-CAPABILITY-N` plans seen in capability 4 through 13.
