---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PRODUCTION-RELEASE-DOCKER-GATE-DESIGN"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---
# Production Release and Docker Gate Design

The production workflow validates the root Compose configuration and builds and publishes the four services declared in it: Arsy, Dock, Headquarter, and ID. Compose references those GHCR images with `pull_policy: always`, so Coolify pulls the published images instead of rebuilding locally. Coolify receives its own GitHub webhook and may start deployment while the image build is still running.

After CI promotes a passing `dev` commit to `main`, it dispatches the production image workflow explicitly because pushes made with `GITHUB_TOKEN` do not start a second workflow automatically. A GitHub release is created only after all image builds and pushes succeed.

The retired Rust server is removed from the active tree; its retirement rationale remains in the legacy reconciliation record and Git history.
