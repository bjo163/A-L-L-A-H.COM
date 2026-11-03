---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AGENTS"
version: "1.0.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-03"
---
# AGENTS.md

Target: `https://github.com/bjo163/A-L-L-A-H.COM.git` (branch: `dev`)
Contracts: `AUTONOMOUS.md`, `DOCUMENTATION_CONTRACT.md`, `GOAL.md`, `LEGACY_RECONCILIATION.md`

## Universal Engineering Rules
- **Autonomous execution**: Read `AUTONOMOUS.md`. Zero-confirmation loop for safe tasks.
- **Spec-Driven Planning & Realtime Tracking (Canonical Artifact Standard)**:
  - Any multi-step task or architecture change MUST be planned under `.plans/<timestamp>-<slug>/` containing:
    1. `spec.md`: Functional architecture, requirements, and acceptance criteria.
    2. `task.md`: Actionable checklist with real-time status checkoff (`- [ ]` to `- [/]` or `- [x]`). Time and budget estimates are not required.
    3. `design.md`: UX/UI composition, interaction states, and API contract specifications.
    4. `rules.md`: Invariants, security constraints, and boundary rules (e.g. tenant isolation, anti-slop, SSRF guard).
  - **Resolution & Feedback Artifacts (Conditional / Completion)**:
    5. `conflict.md`: Mandatory whenever a plan encounters ambiguous requirements, conflicting legacy code, trade-offs, or blockers requiring human steering/approval, featuring structured options and confirmation checkboxes (`- [ ] Confirmed by User`).
    6. `decision.md`: Mandatory for recorded Architectural Decision Records (ADR) detailing rationale, alternatives considered, and consensus.
    7. `report.md`: Mandatory upon completion (`status: "completed"` in `spec.md`), detailing verified deliverables and evidence. Do not invent time or budget figures.
  - **Live Task Status Checkoff (Mandatory)**: During execution, the agent MUST update `task.md` checkboxes in realtime and update frontmatter `status:` in `spec.md` (`proposed` -> `in_progress` -> `completed`). Never leave finished items unchecked.
  - Compatible with the `allah-vscode-extension` Project Management tree view.
- **Documentation**: Follow `DOCUMENTATION_CONTRACT.md`; update only the canonical docs affected by a change.
- **Product & legacy integrity**: A-L-L-A-H.COM unifies MoonWitness & Empire of the Light. Follow `LEGACY_RECONCILIATION.md`. Preserve provenance; distinguish verified implementation from narrative/plan.
- **Architecture**:
  - `apps/arsy/`: Fastify Hub + embedded PGlite ORM (Ql-Orm engine, BaseModel, Storage, Router state).
  - `addons/`: Addons modular `base`, `mw_storage`, `mw_llm_router`.
  - `apps/arsy/src/controllers/`: Fast-path gateway `/v1/chat/completions`, `/v1/models`, `/v1/sdui`.
  - `apps/dock/`: Next.js 16 (App Router) + React 19 + Tailwind v4 — public homepage (port 3001).
  - `apps/headquarter/`: Next.js 16 (App Router) + React 19 + Tailwind v4 — command center (port 3002).
  - `apps/id/`: Next.js 16 (App Router) + React 19 + Tailwind v4 — unified account & SSO center (port 3003).
  - `packages/ui/`: Mandatory atomic UI system (`@moonwitness/ui`: `components`, `blocks`, `primitives`, `raw`, `sfx`, `tokens`, `css`). All client apps MUST import interactive elements from here. Raw ad-hoc styled buttons/inputs in `apps/` are forbidden.
  - `packages/sdk/`: Universal isomorphic client (`@allah/sdk`). All client-to-Fastify Hub communications and SSO session tokens MUST route through this SDK.
  - `packages/types/`: Universal shared data contracts (`@moonwitness/types`).
  - `packages/lint/`: Monorepo architectural rule linter (`@moonwitness/lint`).
  - `.husky/`: Mandatory local pre-commit (`pnpm docs:check`, typechecks) and pre-push gates.
- **Invariants**: Content-addressed write-once storage (SHA-256), fail-closed retention/holds, parameterized queries, tenant isolation (`company_id`), zero ORM overlap (embedded PGlite only).
- **Build gates (must pass 100%)**:
  1. `pnpm dock:build`
  2. `pnpm headquarter:build`
  3. `pnpm id:build`
  4. `pnpm --filter @allah/arsy build`
- **Doc sync**: Follow the change-to-document matrix in `DOCUMENTATION_CONTRACT.md`.
- **Git safety**: Review staged diff. No secrets/untracked bloat. Conventional commits + push to `dev` (CI auto-promotes to `main` upon 100% pass).

<!-- antislop:start -->
## antislop
Follow antislop skills strictly:
- Core: `.agents/skills/antislop/SKILL.md` (or user installed skill)
- UI: `antislop-ui`
- Human: `antislop-human`
- Code: `antislop-code`
Mode must be verified before presenting findings or making edits.
<!-- antislop:end -->
