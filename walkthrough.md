# A-L-L-A-H.COM Platform — Walkthrough

## Overview

A-L-L-A-H.COM is a modular monorepo platform featuring:

- **ARSY Hub** (`apps/arsy`) — Fastify Hub with embedded PGlite ORM, technical plugins, and declarative business addons
- **Dock** (`apps/dock`) — Next.js 16 public homepage (port 3001)
- **Headquarter** (`apps/headquarter`) — Next.js 16 command center (port 3002)
- **Shared UI** (`packages/ui`) — shadcn/ui component library (`@moonwitness/ui`)
- **VS Code Extension** (`packages/vscode-extension`) — `.plans` workflow, MoonWitness LLM gateway, Arsy Fastify API views
- **Docker** — containerization with Coolify deployment support

## Recent Changes (Autonomous Evolution Engine)

### Rust Server Removed
- **Retired**: `apps/server/` (Rust/Loco backend) and `apps/web/` (legacy web app), in favour of Arsy, Dock, and Headquarter
- **Added**: `apps/headquarter/` Next.js command center, `apps/id/` MoonWitness ID account & SSO center, `packages/types/`, `packages/sdk/`, and `packages/lint/`
- **Added**: `packages/arsy-plugin-*` (auth, sdui, llm-gateway, storage) technical plugins

### Arsy Modular Ecosystem
- **Hub**: `apps/arsy/` Fastify + embedded PGlite ORM
- **Plugins**: auth, sdui, llm-gateway, storage
- **Addons**: `addons/base`, `addons/mw_storage`, `addons/mw_llm_router`

### Build Status
- ✅ Dock build: `pnpm dock:build` passes
- ✅ Headquarter build: `pnpm headquarter:build` passes
- ✅ ARSY build: `pnpm --filter @allah/arsy build` passes
- ✅ VS Code extension build: `pnpm extension:build` passes

## Next Steps
- Publish dock and headquarter images to GHCR
- Deploy to Coolify with custom domains
- Configure upstream LLM providers
- Enable SDUI dynamic form components