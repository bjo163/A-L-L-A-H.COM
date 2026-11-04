---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PRODUCTION-RELEASE-DOCKER-GATE-RULES"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---
# Production Release and Docker Gate Rules

- Never create a production GitHub release if any production Docker image fails to build or publish.
- Do not invoke Coolify from GitHub Actions; deployment is triggered by Coolify's GitHub webhook integration.
- Run production Docker builds only on GitHub Actions, not on developer machines.
- Configure Compose to pull the exact GHCR images produced by the GitHub gate.
- Release only the commit promoted to `main` and only after the production workflow succeeds.
- Preserve the Rust server retirement record and Git history while removing its unused source and build pipeline.
- Do not modify untracked or unrelated workspace files.
