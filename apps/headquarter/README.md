---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_HEADQUARTER_README"
version: "0.1.0"
owner: "frontend"
status: "implemented"
last_verified: "2026-11-03"
---
# Headquarter — Command Center

The Headquarter is a Next.js command center for the A-L-L-A-H.COM platform. It runs on port 3002 and uses shared shadcn/ui components from `@moonwitness/ui`.

Check `package.json` and source for the current routes, dependencies, and features.

## Commands

Run these from the repository root:

| Command | Purpose |
|---|---|
| `pnpm headquarter:dev` | Start the development server on port 3002 |
| `pnpm headquarter:build` | Create a production build |
| `pnpm --filter @moonwitness/headquarter typecheck` | Type-check the Headquarter package |

Use root `pnpm dev` to start both Dock (3001) and Headquarter (3002) development servers.

## Project guidance

- [Root README](../../README.md) covers workspace setup and production deployment.
- [Root quality standards](../../QUALITY.md) define shared verification requirements.

Use the workspace package manager and lockfile. Do not assume routes, pages, or integrations exist unless they are present in the source.