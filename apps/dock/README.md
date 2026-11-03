---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_DOCK_README"
version: "0.1.0"
owner: "frontend"
status: "implemented"
last_verified: "2026-11-03"
---
# Dock — Public Homepage

The Dock is a Next.js public discovery homepage for the A-L-L-A-H.COM platform. It runs on port 3001 and uses shared shadcn/ui components from `@moonwitness/ui`.

Check `package.json` and source for the current routes, dependencies, and features.

## Commands

Run these from the repository root:

| Command | Purpose |
|---|---|
| `pnpm dock:dev` | Start the development server on port 3001 |
| `pnpm dock:build` | Create a production build |
| `pnpm --filter @moonwitness/dock typecheck` | Type-check the Dock package |

Use root `pnpm dev` to start both Dock (3001) and Headquarter (3002) development servers.

## Project guidance

- [Dock agent guide](AGENTS.md) contains Next.js-specific instructions.
- [Root README](../../README.md) covers workspace setup and production deployment.
- [Root quality standards](../../QUALITY.md) define shared verification requirements.

Use the workspace package manager and lockfile. Do not assume routes, pages, or integrations exist unless they are present in the source.