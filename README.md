---
contract: "DOCUMENTATION_CONTRACT.md"
id: "README"
version: "0.1.0"
owner: "ecosystem"
status: "implemented"
last_verified: "2026-11-04"
---

[![CI Status](https://github.com/bjo163/A-L-L-A-H.COM/actions/workflows/ci-dev.yml/badge.svg)](https://github.com/bjo163/A-L-L-A-H.COM/actions/workflows/ci-dev.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CodeQL](https://github.com/bjo163/A-L-L-A-H.COM/actions/workflows/codeql.yml/badge.svg)](https://github.com/bjo163/A-L-L-A-H.COM/actions/workflows/codeql.yml)
[![GitHub issues](https://img.shields.io/github/issues/bjo163/A-L-L-A-H.COM)](https://github.com/bjo163/A-L-L-A-H.COM/issues)

# A-L-L-A-H.COM
## Unified MoonWitness & Empire of the Light Ecosystem

A-L-L-A-H.COM is the central home for the continued evolution of the MoonWitness universe and the broader Empire of the Light ecosystem.

Its mission is to preserve the legacy, reconcile generations, connect products and applications, consolidate useful technology, and provide one coherent platform without erasing the identity or history of earlier work.

This repository contains a Fastify/TypeScript ARSY Hub, a Sentinel RADIUS daemon, and the ecosystem web applications (GATE, Dock, Headquarters, MoonWitness ID, WORLD OBSERVATORY, MOONSKY, and HARBOR). Product vision and implementation status must remain separate: inspect source, tests, manifests, and runtime behavior before describing a capability as complete.

## Start here
1. [GOAL.md](GOAL.md) — master mission and local AI entrypoint.
2. [AUTONOMOUS.md](AUTONOMOUS.md) — autonomous development operating contract.
3. [AGENTS.md](AGENTS.md) — universal engineering rules.
4. [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md) — documentation ownership and consistency rules.
5. [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) — preservation and reconciliation protocol.
6. [BLUEPRINT.md](BLUEPRINT.md) — target product and system architecture.
7. [DESIGN.md](DESIGN.md) — product experience and Moon UI principles.
8. [ROADMAP.md](ROADMAP.md) and [BACKLOG.md](BACKLOG.md) — strategic stages and actionable work.
9. [QUALITY.md](QUALITY.md) — verification and Definition of Done.
10. [DECISIONS.md](DECISIONS.md) — accepted decisions.
11. [CHANGELOG.md](CHANGELOG.md) — actual repository changes.

ARSY provisions an idempotent `res.users` system identity named `bot` for system-owned writes. First-run onboarding creates the initial superuser without a seeded password; model writes record required `create_uid` and `write_uid` ORM user IDs and append a redacted audit event in the same transaction.

`apps/id` authenticates through Better Auth endpoints served by ARSY at `/api/auth/better/*`; the custom adapter stores users, credential accounts, sessions, and verification records through `@allah/arsy-orm`. Browser sessions are HttpOnly cookies, while tenant and role authorization continue to come from the linked ARSY identity. Initial onboarding remains a one-time ARSY operation, and later Better Auth registrations receive only the regular `user` role. Before production startup, configure `BETTER_AUTH_URL` (the public ARSY origin), a distinct `BETTER_AUTH_SECRET` of at least 32 characters, `NEXT_PUBLIC_AUTH_API_URL` (the browser-reachable ARSY origin), and the explicitly trusted browser origins in `CORS_ORIGINS`. Production startup fails closed if the Better Auth secret, public URL, or trusted origins are missing. The auth startup migration backfills credential accounts from existing password hashes; rehearse it against a restorable persistent-data copy before deploying.

Superusers access other tenants only through explicit `/v1/admin/*` routes. Each cross-tenant request supplies a non-zero target `company_id` and a reason; the audit event stores the reason hash, actor, target, request ID, operation, and changed field names. Generic CRUD never exposes identity, audit, or credential-bearing models, even when they appear in `GENERIC_MODEL_ALLOWLIST`. Audit events do not retain before/after values and have no automatic purge; configure a retention policy before claiming a retention period. See [D-014](DECISIONS.md#d-014-explicit-global-admin-and-append-only-audit-history).

Persistent PGlite upgrades apply idempotent schema sync plus versioned identity and audit migrations at startup. Before upgrading a persistent data directory, test on a restorable copy and verify identity links, audit UID foreign keys, tenant boundaries, and migration retry/rollback; production data was not migrated as part of this change.

## MoonWitness ID — Identity, Secrets & Access Control Plane

MoonWitness ID is the human-facing control plane for personal identity and approved access assets across the ecosystem. Its strategic direction includes identity and sessions, service identities, API credentials, environment configuration references, secret lifecycle workflows, project access, and audit visibility. This is a product direction, not a claim that every capability is implemented.

**Authority boundary:** ID owns the user experience and request orchestration. ARSY remains the sole server-side authority for authentication, authorization, secret custody, encryption/decryption, key issuance and revocation, policy evaluation, audit, and environment deployment integrations. Destination services validate credentials and enforce their own authorization. No secret plaintext is stored in ID browser state, local storage, URLs, logs, analytics, source control, or client-readable configuration.

Current repository evidence includes encrypted NAS secret storage using the ARSY master key and hashed AI virtual keys. These are existing, distinct mechanisms—not a complete general-purpose vault. General secret management, environment versioning, personal API key issuance, service identities, and rotation workflows remain proposed until independently implemented and verified.

See [MoonWitness ID product contract](apps/id/README.md), [system architecture](BLUEPRINT.md), and the active plan [MoonWitness ID — Identity & Secrets Control Plane](https://github.com/bjo163/A-L-L-A-H.COM/issues/443).

## Ecosystem scope
Discover and reconcile MoonWitness historical generations, Reborn, XV, narrative canon, ROCKSOUL, MYLUFT, research, creative assets, Moon UI, Headquarter, Dock, Cockpit, Qorpus, and related repositories or technical work where accessible. This is a discovery scope, not a claim that every item is implemented here or must be a separate application.

## Repository layout
- `apps/arsy/` — Fastify Hub backend with embedded PGlite ORM.
- `apps/gate/` — Next.js public entrance / Empire Gateway (port 3000).
- `apps/dock/` — Next.js public homepage (port 3001).
- `apps/headquarter/` — Next.js command center (port 3002).
- `apps/id/` — Next.js identity, account-trust, and proposed secrets control center (port 3003); secret custody and authorization remain server-side in ARSY.
- `apps/jizz/` — Next.js WORLD OBSERVATORY (port 3004), reached through a server-only ARSY proxy.
- `packages/ui/` — shared atomic UI system (`@moonwitness/ui`).
- `packages/sdk/` — isomorphic Fastify Hub client (`@allah/sdk`), including cross-app session handling.
- `packages/types/` — shared data contracts (`@moonwitness/types`).
- `packages/lint/` — monorepo architectural lint rules (`@moonwitness/lint`).
- `packages/arsy-*` — ARSY plugin packages.
- `addons/` — ARSY declarative addons (`base`, `mw_storage`, `mw_llm_router`).
- Root manifests, canonical documentation.

Always inspect the current tree and manifests before relying on this summary.

Active services also include WORLD OBSERVATORY at `apps/jizz/` (port 3004) and the Sentinel RADIUS daemon at `apps/sentinel/` (UDP 1812/1813; health on 9181).

## Development
Inspect `package.json`, `pnpm-workspace.yaml`, and each app's `package.json` for exact commands and versions. Use the workspace package manager and app-specific instructions. Do not assume a command exists.

Run `pnpm dev` to start Arsy, Sentinel, and all five Next.js apps concurrently: Arsy on port `5150`, GATE on `http://127.0.0.1:3000/`, Dock on `http://127.0.0.1:3001/`, Headquarters on `http://127.0.0.1:3002/`, MoonWitness ID on `http://127.0.0.1:3003/`, and WORLD OBSERVATORY on `http://127.0.0.1:3004/`. Sentinel serves health and metrics on port `9181` and RADIUS over UDP ports `1812` and `1813`. To run one app, use its script: `pnpm arsy:dev`, `pnpm sentinel:dev`, `pnpm gate:dev`, `pnpm dock:dev`, `pnpm headquarter:dev`, `pnpm id:dev`, or `pnpm jizz:dev`.

`apps/jizz` reads its upstream credentials (`JIZZ_API_URL`, `JIZZ_API_KEY`) only inside the server-side route proxy (`apps/jizz/src/app/api/jizz/[...path]`); client components fetch same-origin `/api/jizz/*` and never receive the key, and the architectural linter fails any `'use client'` file that touches a `NEXT_PUBLIC_*` secret.

`.husky/pre-commit` runs `pnpm docs:check`, `pnpm lint:arch`, `pnpm lint`, `pnpm typecheck`, and the `pnpm ui:contrast` gate; `.husky/commit-msg` runs commitlint; `.husky/pre-push` runs the typecheck, every app build (Dock, Headquarter, ID, Jizz, Gate, Arsy, Sentinel, extension), `pnpm ui:test`, and `pnpm ui:contrast`.

Never commit secrets, `.env` files, local databases, generated build output, or unrelated user changes.

## Production deployment
The root `docker-compose.yml` is the Coolify stack. Each of the ten services builds from its own `apps/<app>/Dockerfile` with the repository root as the build context; Coolify builds the images from the Git source, while the `Publish production images` GitHub Actions workflow publishes the same images to GHCR with `latest` and `sha-<short-commit>` tags for pinned rollbacks.

Ports follow the Coolify convention: Compose puts every service on one isolated network, so a container is reachable by its peers as `http://<service>:<port>`. HTTP services therefore declare their listening port under `expose:` and publish nothing on the host; the domain assigned in Coolify carries the container port as a suffix (for example `https://dock.a-l-l-a-h.com:3001`) so the proxy knows where to send the request. Publishing a host port would bypass that proxy, collide with whatever already owns the port on the server, and expose an internal service. The only host-published ports in the stack are Sentinel's `1812/1813/3799` UDP, because RADIUS authentication, accounting, and Change-of-Status are raw UDP the HTTP proxy cannot forward.

Required production credentials (`JWT_SECRET`, `ARSY_MASTER_KEY`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `CORS_ORIGINS`) are declared in Coolify's environment for the resource; Compose fails closed before any container starts when one is missing, and `ARSY_MASTER_KEY` must be the identical value in `arsy` and `sentinel` because one encrypts and the other decrypts NAS secrets.

## Branch Strategy & CI/CD Release Gate
- `dev`: Primary development branch. All commits and features are pushed here.
- CI Gate (`.github/workflows/ci-dev.yml`): Validates all six active service builds and the documentation contract before promotion.
- `main`: Production release branch. Auto-promoted from `dev` only when all CI checks pass. Promotion dispatches the Docker-gated GHCR publish and Coolify workflow; the workflow creates the root package's versioned GitHub release after the webhook succeeds.
