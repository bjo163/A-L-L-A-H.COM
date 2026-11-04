---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PRODUCTION-RELEASE-DOCKER-GATE-TASK"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-04"
---
# Production Release and Docker Gate Tasks

- [x] Retire the unused Rust/Cargo app and remove obsolete documentation checks.
- [x] Fix production Docker build contexts and configure publication for all Compose images.
- [x] Gate Coolify deployment on successful publication of every production image.
- [x] Dispatch production publishing after successful dev-to-main promotion.
- [x] Update deployment, legacy, and changelog documentation.
- [ ] Verify CI, Docker builds, deploy workflow, and publish the production release.
