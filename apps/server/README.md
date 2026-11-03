---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_SERVER_README"
version: "0.1.0"
owner: "backend"
status: "implemented"
last_verified: "2026-11-03"
---
# Server Application

The Rust backend is in this directory. The application uses Loco and SeaORM; check `Cargo.toml`, source, and migrations for the current modules and capabilities.

## Commands

Run these from the repository root:

| Command | Purpose |
|---|---|
| `pnpm server` | Start the development server |
| `pnpm server:migrate` | Apply database migrations |
| `cargo check --manifest-path apps/server/Cargo.toml` | Check Rust compilation |
| `cargo test --manifest-path apps/server/Cargo.toml` | Run server tests |

## Project guidance

- [Server agent guide](AGENTS.md) contains Loco-specific implementation guidance.
- [Loco skill](.claude/skills/loco/SKILL.md) and its linked recipes document framework workflows.
- [Root quality standards](../../QUALITY.md) define the shared verification requirements.

Configuration, models, controllers, migrations, tests, and assets are maintained in this application directory. Verify current paths in the source tree before relying on examples.
