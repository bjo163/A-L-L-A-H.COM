# AGENTS.md

Target: `https://github.com/bjo163/A-L-L-A-H.COM.git` (branch: `dev`)
Contract: `AUTONOMOUS.md`, `GOAL.md`, `LEGACY_RECONCILIATION.md`

## Universal Engineering Rules
- **Autonomous execution**: Read `AUTONOMOUS.md`. Zero-confirmation loop for safe tasks.
- **Product & legacy integrity**: A-L-L-A-H.COM unifies MoonWitness & Empire of the Light. Follow `LEGACY_RECONCILIATION.md`. Preserve provenance; distinguish verified implementation from narrative/plan.
- **Architecture**:
  - `apps/server/src/core/`: Ql-Orm engine, BaseModel, Storage, Router state.
  - `apps/server/addons/`: Addons modular `base`, `mw_storage`, `mw_llm_router`.
  - `apps/server/src/controllers/`: Fast-path gateway `/v1/chat/completions`, `/v1/models`, `/v1/sdui`.
  - `apps/web/`: Next.js 16 (App Router) + React 19 + Tailwind v4.
- **Invariants**: Content-addressed write-once storage (SHA-256), fail-closed retention/holds, parameterized queries, tenant isolation (`company_id`).
- **Build gates (must pass 100%)**:
  1. `pnpm server:migrate`
  2. `cargo check --manifest-path apps/server/Cargo.toml`
  3. `pnpm web:build`
- **Doc sync**: Concurrently update `README.md`, `CHANGELOG.md`, `BLUEPRINT.md`, `DESIGN.md`, `BACKLOG.md`.
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
