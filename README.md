# A-L-L-A-H.COM
## Unified MoonWitness & Empire of the Light Ecosystem

A-L-L-A-H.COM is the central home for the continued evolution of the MoonWitness universe and the broader Empire of the Light ecosystem.

Its mission is to preserve the legacy, reconcile generations, connect products and applications, consolidate useful technology, and provide one coherent platform without erasing the identity or history of earlier work.

This repository currently contains a Rust/Loco backend and a Next.js web application. Product vision and implementation status must remain separate: inspect source, tests, manifests, and runtime behavior before describing a capability as complete.

## Start here
1. [GOAL.md](GOAL.md) — master mission and local AI entrypoint.
2. [AUTONOMOUS.md](AUTONOMOUS.md) — autonomous development operating contract.
3. [AGENTS.md](AGENTS.md) — universal engineering rules.
4. [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) — preservation and reconciliation protocol.
5. [BLUEPRINT.md](BLUEPRINT.md) — target product and system architecture.
6. [DESIGN.md](DESIGN.md) — product experience and Moon UI principles.
7. [ROADMAP.md](ROADMAP.md) and [BACKLOG.md](BACKLOG.md) — strategic stages and actionable work.
8. [QUALITY.md](QUALITY.md) — verification and Definition of Done.
9. [DECISIONS.md](DECISIONS.md) — accepted decisions.
10. [CHANGELOG.md](CHANGELOG.md) — actual repository changes.

## Ecosystem scope
Discover and reconcile MoonWitness historical generations, Reborn, XV, narrative canon, ROCKSOUL, MYLUFT, research, creative assets, Moon UI, Headquarter, Dock, Cockpit, Qorpus, and related repositories or technical work where accessible. This is a discovery scope, not a claim that every item is implemented here or must be a separate application.

## Repository layout
- `apps/server/` — Rust backend using Loco and its associated ecosystem.
- `apps/web/` — Next.js frontend.
- Root manifests, deployment configuration, and canonical documentation.

Always inspect the current tree and manifests before relying on this summary.

## Development
Inspect `package.json`, `pnpm-workspace.yaml`, `apps/server/Cargo.toml`, and `apps/web/package.json` for exact commands and versions. Use the workspace package manager and app-specific instructions. Do not assume a command exists.

Never commit secrets, `.env` files, local databases, generated build output, or unrelated user changes.

## Production deployment
The root `docker-compose.yml` runs prebuilt images from GitHub Container Registry (GHCR); it does not build application code on the Coolify host. The `Publish and deploy` GitHub Actions workflow builds the server and web images in parallel, publishes `latest` and commit-specific tags, then triggers Coolify.

Configure these repository secrets in GitHub:
- `COOLIFY_WEBHOOK_URL` — the deployment webhook URL for the Compose application in Coolify.
- `COOLIFY_API_TOKEN` — a Coolify API token authorized to deploy that application.

After the first successful publish, set both GHCR packages to public in GitHub's package settings; public packages can be pulled by Coolify without registry credentials, so Docker Hub is not required. If the images stay private, configure GHCR read credentials in Coolify. Disable deployment directly from Git pushes so Coolify does not start before the images are published; use its deployment URL with `force=true` for the post-publish deployment. Set `IMAGE_PREFIX` to `ghcr.io/<owner>/<repository>` only if the image namespace differs from the default, `ghcr.io/bjo163/a-l-l-a-h.com`; set `IMAGE_TAG` to `latest` or a published `sha-<short-commit>` tag for a pinned rollback. Both services use `pull_policy: always`, so each Coolify deployment fetches the selected image.

## VS Code Extension
The official extension lives in `packages/vscode-extension`. It provides direct integration with MoonWitness for LLM routing, Echolog storage exploration, and gateway telemetry.
- Build command: `pnpm extension:build`

## Branch Strategy & CI/CD Release Gate
- `dev`: Primary development branch. All commits and features are pushed here.
- CI Gate (`.github/workflows/ci-dev.yml`): Validates Rust backend, Next.js web, and VS Code extension in parallel.
- `main`: Production release branch. Auto-promoted from `dev` only when all CI checks pass 100%. Pushes to `main` trigger GHCR image publishing and Coolify deployment.
