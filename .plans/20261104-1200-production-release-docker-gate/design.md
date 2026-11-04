---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PRODUCTION-RELEASE-DOCKER-GATE-DESIGN"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---
# Production Release and Docker Gate Design

The production workflow validates the root Compose configuration and builds and publishes the four services declared in it: Arsy, Dock, Headquarter, and ID. Compose references those GHCR images with `pull_policy: always`, so Coolify uses the exact images that passed the GitHub Docker gate instead of rebuilding locally. The Coolify webhook remains a downstream job that cannot start unless all image builds and pushes pass.

After CI promotes a passing `dev` commit to `main`, it dispatches the production workflow explicitly because pushes made with `GITHUB_TOKEN` do not start a second workflow automatically. A GitHub release is created only after the production workflow succeeds.

The retired Rust server is removed from the active tree; its retirement rationale remains in the legacy reconciliation record and Git history.
