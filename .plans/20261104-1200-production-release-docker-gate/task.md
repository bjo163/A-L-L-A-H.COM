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
- [x] Remove the outbound Coolify deploy call; Coolify deploys through its GitHub webhook.
- [x] Dispatch production publishing after successful dev-to-main promotion.
- [x] Update deployment, legacy, and changelog documentation.
- [ ] Verify CI and Docker image publishing on GitHub; create the production release after image publishing succeeds.
