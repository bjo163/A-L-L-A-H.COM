# AGENTS.md

Target: `https://github.com/bjo163/A-L-L-A-H.COM.git` (branch: `main`)
Contract: `AUTONOMOUS.md`

## Rules
- Autonomous execution: read `AUTONOMOUS.md`. Zero-confirmation loop.
- Modular architecture: Ql-Orm engine in `apps/server/src/core/`, addons in `apps/server/addons/`, controllers in `apps/server/src/controllers/`, UI in `apps/web/`.
- Invariants: Content-addressed write-once storage (SHA-256), fail-closed retention/holds, parameterized queries, multi-company tenant isolation (`company_id`).
- Build gates (must pass 100%):
  1. `pnpm server:migrate`
  2. `cargo check --manifest-path apps/server/Cargo.toml`
  3. `pnpm web:build`
- Auto-sync docs: `README.md`, `CHANGELOG.md`, `BLUEPRINT.md`, `DESIGN.md`.
- Git: conventional commit + auto push to `main`.

<!-- antislop:start -->
## antislop
Follow antislop skills strictly:
- Core: `.agents/skills/antislop/SKILL.md` (or user installed skill)
- UI: `antislop-ui`
- Human: `antislop-human`
- Code: `antislop-code`
Mode must be verified before presenting findings or making edits.
<!-- antislop:end -->
