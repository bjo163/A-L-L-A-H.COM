# A-L-L-A-H.COM Platform — Walkthrough

## Overview

A-L-L-A-H.COM is a modular monorepo platform featuring:

- **ARSY Hub** (`apps/arsy`) — Fastify Hub with embedded PGlite ORM, technical plugins, and declarative business addons
- **Dock** (`apps/dock`) — Next.js 16 public homepage (port 3001)
- **Headquarter** (`apps/headquarter`) — Next.js 16 command center (port 3002)
- **MoonWitness ID** (`apps/id`) — Next.js account and SSO center (port 3003)
- **WORLD OBSERVATORY** (`apps/jizz`) — Next.js public observatory (port 3004)
- **Sentinel** (`apps/sentinel`) — RADIUS daemon (UDP 1812/1813, HTTP health 9181)
- **Shared UI** (`packages/ui`) — shadcn/ui component library (`@moonwitness/ui`)
- **Docker** — containerization with Coolify deployment support

## Recent Changes (Autonomous Evolution Engine)

### Legacy Server Retired
- **Retired from the active tree**: `apps/server/` (Rust/Loco backend) and `apps/web/` (legacy web app), in favour of Arsy, Dock, Headquarter, and MoonWitness ID. Rust source history remains in Git.
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

## Production Delivery
- Build and publish the six active service Docker images to GHCR: Arsy, Dock, Headquarter, ID, Jizz, and Sentinel.
- Let Coolify deploy from its GitHub webhook; production images are built and published separately by GitHub Actions.
- Create the versioned GitHub release after every production image publishes successfully.

## Next Steps
- Configure upstream LLM providers
- Enable SDUI dynamic form components