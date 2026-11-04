---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PRODUCTION-RELEASE-DOCKER-GATE-SPEC"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---
# Production Release and Docker Gate

## Goal

Retire the unused Rust/Cargo server and run the Docker image gate on GitHub. Coolify receives its deployment webhook independently.

## Requirements

- Remove the retired `apps/server/` Cargo application and its standalone Rust CI.
- Keep Arsy Fastify as the production API service.
- Include the root TypeScript config in each production Docker build context.
- Include the addon source imported by Arsy in its Docker build context.
- Build and publish Docker images for every service in `docker-compose.yml`.
- Configure Compose to pull those published images rather than rebuilding them on Coolify.
- Run all production Docker builds on GitHub Actions, not on developer machines.
- Trigger production publishing after CI promotes `dev` to `main`.
- Create a GitHub production release only after all production images publish successfully.
- Do not require Coolify secrets or invoke Coolify from the GitHub Actions workflow.
- Update canonical docs and documentation-contract coverage.

## Acceptance Criteria

- No Cargo manifests, lockfiles, Rust sources, Rust CI, or Rust Docker build remain in the active repository.
- Dockerfiles for all Compose services include the root TypeScript config needed by package builds.
- Compose image references match the names and tags published by GitHub Actions.
- Production workflow Docker-gates every Compose service before creating the GitHub release.
- Coolify deployment is triggered separately by its GitHub webhook integration.
- Coolify deployment can start before all production images publish.
- CI, typecheck, documentation check, ESLint, extension tests, and Docker image builds pass.
- GitHub release `v0.1.0` is published only after production image publishing succeeds.
