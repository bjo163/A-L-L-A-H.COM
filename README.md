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

This repository contains a Fastify/TypeScript ARSY Hub, a Sentinel RADIUS daemon, and five Next.js web applications (GATE, Dock, Headquarters, MoonWitness ID, and WORLD OBSERVATORY). Product vision and implementation status must remain separate: inspect source, tests, manifests, and runtime behavior before describing a capability as complete.

## Start here
1. [GOAL.md](GOAL.md) â€” master mission and local AI entrypoint.
2. [AUTONOMOUS.md](AUTONOMOUS.md) â€” autonomous development operating contract.
3. [AGENTS.md](AGENTS.md) â€” universal engineering rules.
4. [DOCUMENTATION_CONTRACT.md](DOCUMENTATION_CONTRACT.md) â€” documentation ownership and consistency rules.
5. [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) â€” preservation and reconciliation protocol.
6. [BLUEPRINT.md](BLUEPRINT.md) â€” target product and system architecture.
7. [DESIGN.md](DESIGN.md) â€” product experience and Moon UI principles.
8. [ROADMAP.md](ROADMAP.md) and [BACKLOG.md](BACKLOG.md) â€” strategic stages and actionable work.
9. [QUALITY.md](QUALITY.md) â€” verification and Definition of Done.
10. [DECISIONS.md](DECISIONS.md) â€” accepted decisions.
11. [CHANGELOG.md](CHANGELOG.md) â€” actual repository changes.

ARSY provisions an idempotent `res.users` system identity named `bot` for system-owned writes. First-run onboarding creates the initial superuser without a seeded password; model writes record required `create_uid` and `write_uid` ORM user IDs and append a redacted audit event in the same transaction.

`apps/id` authenticates through Better Auth endpoints served by ARSY at `/api/auth/better/*`; the custom adapter stores users, credential accounts, sessions, and verification records through `@allah/arsy-orm`. Browser sessions are HttpOnly cookies, while tenant and role authorization continue to come from the linked ARSY identity. Initial onboarding remains a one-time ARSY operation, and later Better Auth registrations receive only the regular `user` role. Before production startup, configure `BETTER_AUTH_URL` (the public ARSY origin), a distinct `BETTER_AUTH_SECRET` of at least 32 characters, `NEXT_PUBLIC_AUTH_API_URL` (the browser-reachable ARSY origin), and any cross-origin web app origins in `CORS_ORIGINS`. The auth startup migration backfills credential accounts from existing password hashes; rehearse it against a restorable persistent-data copy before deploying.

Superusers access other tenants only through explicit `/v1/admin/*` routes. Each cross-tenant request supplies a non-zero target `company_id` and a reason; the audit event stores the reason hash, actor, target, request ID, operation, and changed field names. Generic CRUD never exposes identity, audit, or credential-bearing models, even when they appear in `GENERIC_MODEL_ALLOWLIST`. Audit events do not retain before/after values and have no automatic purge; configure a retention policy before claiming a retention period. See [D-014](DECISIONS.md#d-014-explicit-global-admin-and-append-only-audit-history).

Persistent PGlite upgrades apply idempotent schema sync plus versioned identity and audit migrations at startup. Before upgrading a persistent data directory, test on a restorable copy and verify identity links, audit UID foreign keys, tenant boundaries, and migration retry/rollback; production data was not migrated as part of this change.

## Ecosystem scope
Discover and reconcile MoonWitness historical generations, Reborn, XV, narrative canon, ROCKSOUL, MYLUFT, research, creative assets, Moon UI, Headquarter, Dock, Cockpit, Qorpus, and related repositories or technical work where accessible. This is a discovery scope, not a claim that every item is implemented here or must be a separate application.

## Repository layout
- `apps/arsy/` â€” Fastify Hub backend with embedded PGlite ORM.
- `apps/gate/
- `apps/gate/` (Next.js public entrance / Empire Gateway, port 3000)
- `apps/dock/`` â€” Next.js public homepage (port 3001).
- `apps/headquarter/` â€” Next.js command center (port 3002).
- `apps/id/` â€” Next.js unified account and SSO center (port 3003).
- `packages/ui/` â€” shared atomic UI system (`@moonwitness/ui`).
- `packages/sdk/` â€” isomorphic Fastify Hub client (`@allah/sdk`), including cross-app session handling.
- `packages/types/` â€” shared data contracts (`@moonwitness/types`).
- `packages/lint/` â€” monorepo architectural lint rules (`@moonwitness/lint`).
- `packages/arsy-*` â€” ARSY plugin packages.
- `addons/` â€” ARSY declarative addons (`base`, `mw_storage`, `mw_llm_router`).
- Root manifests, canonical documentation.

Always inspect the current tree and manifests before relying on this summary.

Active services also include WORLD OBSERVATORY at `apps/jizz/` (port 3004) and the Sentinel RADIUS daemon at `apps/sentinel/` (UDP 1812/1813; health on 9181).

## Development
Inspect `package.json`, `pnpm-workspace.yaml`, and each app's `package.json` for exact commands and versions. Use the workspace package manager and app-specific instructions. Do not assume a command exists.

Run `pnpm dev` to start Arsy, Sentinel, and all five Next.js apps concurrently: Arsy on port `5150`, GATE on `http://127.0.0.1:3000/`, Dock on `http://127.0.0.1:3001/`, Headquarters on `http://127.0.0.1:3002/`, MoonWitness ID on `http://127.0.0.1:3003/`, and WORLD OBSERVATORY on `http://127.0.0.1:3004/`. Sentinel serves health and metrics on port `9181` and RADIUS over UDP ports `1812` and `1813`. To run one app, use its script: `pnpm arsy:dev`, `pnpm sentinel:dev`, `pnpm gate:dev`, `pnpm dock:dev`, `pnpm headquarter:dev`, `pnpm id:dev`, or `pnpm jizz:dev`.

`.husky/pre-commit` runs `pnpm docs:check`; `.husky/pre-push` runs the Dock, Headquarter, ID, and Arsy builds.

Never commit secrets, `.env` files, local databases, generated build output, or unrelated user changes.

## Production deployment
The root `docker-compose.yml` pulls seven images from GHCR: `arsy`, `gate`, `dock`, `headquarter`, `id`, `jizz`, and `sentinel`. The `Publish production images` GitHub Actions workflow validates the Compose configuration and builds and publishes every service image. Coolify receives its own GitHub webhook and pulls these images rather than rebuilding them. CI promotion explicitly dispatches the image workflow because it uses `GITHUB_TOKEN`; a versioned GitHub release is created after all six images publish successfully. Coolify's GitHub webhook and image publishing can run concurrently, so Coolify may try to deploy before the new image tags are available.

Before the first deployment, set the GHCR packages to public in GitHub's package settings or configure GHCR read credentials in Coolify. Public packages can be pulled without registry credentials, so Docker Hub is not required. Set `IMAGE_PREFIX` to `ghcr.io/<owner>/<repository>` only if the image namespace differs from the default, `ghcr.io/bjo163/a-l-l-a-h.com`; set `IMAGE_TAG` to `latest` or a published `sha-<short-commit>` tag for a pinned rollback.

## VS Code Extension
The extension in `packages/vscode-extension` integrates the `.plans` workflow, the MoonWitness LLM gateway, and the Arsy Fastify API.
- The Plans tree supports pending, in-progress, and completed tasks, opens plan/task files, watches `.plans` changes, and can target any workspace root. Context actions mark tasks in progress, complete, or reset to pending.
- Local and gateway-generated plans contain `spec.md`, `task.md`, `design.md`, and `rules.md`. AI generation stops on gateway errors, malformed output, or Arsy mock completions.
- The Arsy API view checks `/health` and `/ready` and opens the Swagger UI at `/docs`.
- The model picker uses identifiers from Arsy's gateway catalog. Catalog entries do not confirm that an upstream provider is configured.
- The Windows-local agent supports Ask, Plan, Code, Debug, Ideate, and Autopilot modes with workspace-scoped tools, explicit context consent, reviewable edits, and bounded validation commands.
- Headquarter can pair/revoke extension devices, submit/cancel missions, and view persisted events. New accounts receive isolated personal tenants; shared device access requires explicit membership in the same organization tenant.
- Verification commands: `pnpm extension:test`, `pnpm --filter allah-vscode-extension typecheck`, and `pnpm extension:build`.
- Arsy and the extension default to port `5150`. If Arsy uses another port, set both `allah.arsyUrl` and `allah.gatewayUrl` to that server's URL.
- Extension-specific setup and commands: [`packages/vscode-extension/README.md`](packages/vscode-extension/README.md).

## Branch Strategy & CI/CD Release Gate
- `dev`: Primary development branch. All commits and features are pushed here.
- CI Gate (`.github/workflows/ci-dev.yml`): Validates all six active service builds, VS Code extension, and documentation contract before promotion.
- `main`: Production release branch. Auto-promoted from `dev` only when all CI checks pass. Promotion dispatches the Docker-gated GHCR publish and Coolify workflow; the workflow creates the root package's versioned GitHub release after the webhook succeeds.
