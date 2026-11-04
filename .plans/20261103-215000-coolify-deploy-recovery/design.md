---
status: in_progress
---

# Coolify Deploy Recovery Design

> Superseded by [Production Release and Docker Gate](../20261104-1200-production-release-docker-gate/spec.md). This design describes the former Rust/Loco deployment architecture.

## Architecture Context

### Current State
- **Coolify Application**: `cjkwqojavao2q8jaqhndxuyv` (A--L--L--A--H.-C-O-M:main-cjkwqojavao2q8jaqhndxuyv)
- **Repository**: `bjo163/A-L-L-A-H.COM`
- **Branch**: `main`
- **Git Commit SHA**: `HEAD` (not resolved to actual SHA due to failed build)
- **Build Pack**: `dockercompose`
- **Compose Location**: `/docker-compose.yml`
- **Status**: `exited:unhealthy`
- **Domains**: `{"web":{"domain":"https://a-l-l-a-h.com,https://www.a-l-l-a-h.com"},"server":{"domain":"https://api.a-l-l-a-h.com,https://www.api.a-l-l-a-h.com"}}`

### Target State
- **Status**: `running:healthy`
- **FQDN**: Populated (not null)
- **Git Commit SHA**: Resolved to actual commit SHA
- **Server Image**: `ghcr.io/bjo163/a-l-l-a-h.com-server:latest` (successfully built)
- **Web Image**: `ghcr.io/bjo163/a-l-l-a-h.com-web:latest` (already successfully built)

## Fix Design

### Module Path Resolution
The Rust module system requires:
```
src/controllers/
├── mod.rs           # Declares: pub mod llm_gateway;
├── llm_gateway/     # Directory (preferred for multi-file modules)
│   ├── mod.rs       # Declares submodules: controller, rate_limiter, etc.
│   ├── controller.rs
│   ├── rate_limiter.rs
│   ├── s3_sigv4.rs
│   ├── semantic_cache.rs
│   └── upstream.rs
```

The duplicate `llm_gateway.rs` file at `src/controllers/llm_gateway.rs` conflicts with the directory `src/controllers/llm_gateway/`.

**Resolution**: Delete `apps/server/src/controllers/llm_gateway.rs` (if it exists in working tree) and ensure the module is declared only via the directory structure.

### Build Verification
After the fix:
```bash
cd apps/server
cargo check  # Should pass without errors
cargo build --release  # Should complete successfully
```

### Deployment Flow
1. **Fix committed** → `git add apps/server/src/controllers/llm_gateway.rs` (remove from index if tracked)
2. **Push to main** → Triggers GitHub Actions `Publish and deploy` workflow
3. **GHCR publish** → `Publish server image` job succeeds
4. **Coolify deploy** → `Deploy on Coolify` job triggers deployment
5. **Health check** → Application serves HTTP 200

## API Contract

### Coolify Deployment Verification
```bash
# Trigger deployment
curl -X POST -H "Authorization: Bearer $TOKEN" \
  "https://apps.mycocolink.com/api/v1/deploy?uuid=cjkwqojavao2q8jaqhndxuyv&force=true"

# Poll deployment status
curl -H "Authorization: Bearer $TOKEN" \
  "https://apps.mycocolink.com/api/v1/deployments/{deployment_uuid}"

# Verify application health
curl -H "Authorization: Bearer $TOKEN" \
  "https://apps.mycocolink.com/api/v1/applications/cjkwqojavao2q8jaqhndxuyv"
```

### Domain Probing
```bash
# Probe each domain for HTTP 200
curl -I https://a-l-l-a-h.com/
curl -I https://www.a-l-l-a-h.com/
curl -I https://api.a-l-l-a-h.com/
curl -I https://www.api.a-l-l-a-h.com/
```

## Rollback Plan

If the fix does not resolve the issue:
1. Revert the commit that introduced `llm_gateway.rs`
2. Restore the previous working state
3. Investigate alternative causes (e.g., Dockerfile path, compose configuration)

---