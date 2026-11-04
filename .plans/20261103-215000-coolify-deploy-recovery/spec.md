---
contract: "DOCUMENTATION_CONTRACT.md"
id: "COOLIFY-DEP-RECOVERY"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-03"
---

# Coolify Deploy Recovery Plan

> Superseded by [Production Release and Docker Gate](../20261104-1200-production-release-docker-gate/spec.md). This records the original Rust/Loco failure; do not execute its Cargo build or server-image steps.

## Problem

A-L-L-A-H.COM deployment to Coolify is failing. The application status is `exited:unhealthy` with `fqdn: null`. Root cause analysis of the failed deployment pipeline reveals:

### Primary Root Cause
**Rust compilation failure in GHCR server image build**. The GitHub Actions workflow `Publish and deploy` has a `Publish server image` job that fails because the Rust compiler cannot build `dx_server`:

```
error[E0761]: file for module `llm_gateway` found at both "src/controllers/llm_gateway.rs" and "src/controllers/llm_gateway/mod.rs"
```

This module path duplication causes `cargo build --release` to fail with exit code 101.

### Secondary Effect
The failed server image build causes the entire Coolify deployment to skip. The workflow then reaches the `Deploy on Coolify` step but has no valid server image to deploy. The existing Coolify application record `cjkwqojavao2q8jaqhndxuyv` remains in `exited:unhealthy` state.

### Evidence
- **GitHub Actions run 41626988966**: `Publish server image` job fails at `[builder 6/6] RUN cargo build --release` with duplicate module error
- **GHCR**: Server image `ghcr.io/bjo163/a-l-l-a-h.com-server:latest` returns 403 Forbidden (not yet successfully published)
- **Coolify API**: Application `cjkwqojavao2q8jaqhndxuyv` has `git_commit_sha: "HEAD"`, `status: "exited:unhealthy"`, `docker_compose_raw` references `/docker-compose.yml` with Rust server image
- **Working tree**: `apps/server/src/controllers/llm_gateway.rs` does NOT exist in committed HEAD but exists in working tree (newly created file causing the duplication)

### Scope
This plan covers:
1. Fix the Rust module path duplication in `apps/server/src/controllers/llm_gateway/`
2. Rebuild and publish the server image to GHCR
3. Trigger a Coolify deployment with the new image

### Acceptance Criteria
- [ ] Rust `cargo build --release` completes without errors for `dx_server`
- [ ] Server image `ghcr.io/bjo163/a-l-l-a-h.com-server:latest` is published successfully (or verified existing image is usable)
- [ ] Coolify deployment to `apps.mycocolink.com` completes with `status: running:healthy`
- [ ] Application responds with HTTP 200 on its domains (a-l-l-a-h.com, www.a-l-l-a-h.com, api.a-l-l-a-h.com, www.api.a-l-l-a-h.com)

### Verified Deliverables
- Fix in `apps/server/src/controllers/llm_gateway/` module path structure
- Updated Docker image published to GHCR
- Coolify deployment initiated and verified healthy

---