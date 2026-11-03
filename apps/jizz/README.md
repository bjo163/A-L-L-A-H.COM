---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_JIZZ_README"
version: "0.1.0"
owner: "frontend"
status: "implemented"
last_verified: "2026-11-03"
---
# WORLD OBSERVATORY — Public Homepage

The WORLD OBSERVATORY is a Next.js public intelligence observatory app powered by ROCKSOUL JIZZ. It runs on port 3004 and presents source-grounded observations about public phenomena with perspective comparisons.

Check `package.json` and source for the current routes, dependencies, and features.

## Commands

Run these from the repository root:

| Command | Purpose |
|---|---|
| `pnpm jizz:dev` | Start the development server on port 3004 |
| `pnpm jizz:build` | Create a production build |
| `pnpm --filter @moonwitness/jizz typecheck` | Type-check the WORLD OBSERVATORY package |

Use root `pnpm dev` to start all apps (arsy, dock, headquarter, id, jizz) development servers.

## Project guidance

- [World Observatory agent guide](AGENTS.md) contains Next.js-specific instructions
- [Root README](../../README.md) covers workspace setup and production deployment
- [Root quality standards](../../QUALITY.md) define shared verification requirements

Use the workspace package manager and lockfile. Do not assume routes, pages, or integrations exist unless they are present in the source.