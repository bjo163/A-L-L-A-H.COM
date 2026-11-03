---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CHANGELOG"
version: "0.1.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-03"
---
# CHANGELOG.md
## A-L-L-A-H.COM

This file records changes that actually happened. It is not a roadmap and must not claim unverified implementation.

## [Unreleased]

### Added
- GitHub Actions workflow to build and publish server/web container images to GHCR, then trigger Coolify deployment. The first production runs published the web image but failed while building the server image; see the deployment task in `BACKLOG.md`.
- CI validation gate (ci-dev.yml) to automatically test dev branch and auto-promote to main upon 100% test pass.
- Repository-wide documentation contract and updated app guides with workspace commands.
- Official VS Code extension package @allah/vscode-extension in packages/vscode-extension (MoonWitness LLM Router integration, Echolog storage explorer, and server telemetry status bar).

### Changed
- Production Compose now pulls prebuilt GHCR images instead of building on the Coolify host.

### Fixed
- No verified entries recorded yet.

Add dated release sections only when an actual repository milestone or release exists, with commit/release references where available.
