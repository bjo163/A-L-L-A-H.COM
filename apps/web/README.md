---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_WEB_README"
version: "0.1.0"
owner: "frontend"
status: "implemented"
last_verified: "2026-11-03"
---
# Web Application

The web frontend is a Next.js application in this directory. Check `package.json` and source for the current routes, dependencies, and features.

## Commands

Run these from the repository root:

| Command | Purpose |
|---|---|
| `pnpm web:dev` | Start the development server |
| `pnpm web:build` | Create a production build |
| `pnpm --filter web lint` | Run the web package linter |

## Project guidance

- [Web agent guide](AGENTS.md) contains Next.js-specific instructions.
- [Root README](../../README.md) covers workspace setup and production deployment.
- [Root quality standards](../../QUALITY.md) define shared verification requirements.

Use the workspace package manager and lockfile. Do not assume routes, pages, or integrations exist unless they are present in the source.
