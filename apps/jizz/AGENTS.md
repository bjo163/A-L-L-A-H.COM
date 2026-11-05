<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_JIZZ_AGENTS"
version: "0.1.0"
owner: "frontend"
status: "implemented"
last_verified: "2026-11-05"
---

# World Observatory Agent Guidance

Follow the repository-wide [AGENTS.md](../../AGENTS.md) and [documentation contract](../../DOCUMENTATION_CONTRACT.md). This file adds Next.js-specific guidance for the WORLD OBSERVATORY app.

## App-specific instructions

- **Port**: 3004
- **Name**: WORLD OBSERVATORY (public intelligence observatory)
- **Engine**: ROCKSOUL JIZZ (perspective-only read access)
- **Theme**: Premium cinematic source-grounded intelligence, not a generic dashboard
- **Dependencies**: @moonwitness/ui, @allah/sdk, @moonwitness/types

## Shared components

Import interactive elements from `@moonwitness/ui`. Raw HTML controls (`<button>`, `<input>`) are forbidden by `@moonwitness/lint`.

## Data access

- Use `@allah/sdk` for all client-server communication
- Initial integration is read-only; do not mutate canonical JIZZ records
- Runtime-validate upstream payloads; never guess unknown semantics
- Preserve source/provenance references and timestamps
- Handle loading, empty, partial, stale, unavailable states

## Quality gates

- `pnpm jizz:build` must pass
- `pnpm --filter @moonwitness/jizz typecheck` must pass
- `pnpm docs:check` must pass (app README and docs)
- No TODO-only components or dead code
- Every visible control performs its advertised action
- Keyboard accessible, visible focus, reduced-motion support
- Desktop/tablet/mobile responsive layout
- No unverified live/realtime/AI/global-coverage claims

## Documentation

- Update `CHANGELOG.md` for actual changes
- Record evidence in task status when verifying implementation
- Link to this AGENTS.md from README.md
- Follow the documentation contract for all markdown files