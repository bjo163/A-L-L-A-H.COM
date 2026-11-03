---
status: in_progress
---

# Coolify Deploy Recovery Task List

## Priority Order

### Task 1: Fix Rust Module Duplication (BLOCKER)
- **Action**: Remove or consolidate the duplicate `llm_gateway.rs` file in `apps/server/src/controllers/llm_gateway/`
- **Rationale**: The file `apps/server/src/controllers/llm_gateway.rs` exists in the working tree but NOT in committed HEAD. It creates a duplicate with `llm_gateway/mod.rs`, causing `error[E0761]` during `cargo build --release`.
- **Check**: `git status apps/server/src/controllers/llm_gateway/` to confirm the file is untracked or staged incorrectly
- **Fix**: Either delete the duplicate `llm_gateway.rs` or move its contents into `mod.rs` / `controller.rs` following the existing Loco pattern

### Task 2: Rebuild and Publish Server Image to GHCR
- **Action**: Run `pnpm --filter @allah/arsy build` or `cargo build --release` to compile the fixed Rust code, then push the server image to `ghcr.io/bjo163/a-l-l-a-h.com-server:latest`
- **Dependencies**: Task 1 must complete first
- **Verification**: Confirm the image is pullable: `docker pull ghcr.io/bjo163/a-l-l-a-h.com-server:latest`

### Task 3: Trigger Coolify Deployment
- **Action**: Trigger a manual deployment via Coolify API or wait for the GitHub Actions workflow to complete the `Deploy on Coolify` step
- **Command**: `curl -X POST -H "Authorization: Bearer $COOLIFY_API_TOKEN" "$COOLIFY_WEBHOOK_URL"` (or use MCP `coolify_deploy`)
- **Dependencies**: Task 2 must complete first (new image available)
- **Verification**: Poll `GET /api/v1/deployments` until status is `completed`

### Task 4: Verify Application Health
- **Action**: Verify the application serves HTTP 200 on all expected domains
- **Domains**: a-l-l-a-h.com, www.a-l-l-a-h.com, api.a-l-l-a-h.com, www.api.a-l-l-a-h.com
- **Endpoints**: `/health` or root path
- **Dependencies**: Task 3 must complete

### Task 5: Clean Up and Report
- **Action**: Update `report.md` with start/end timestamps, duration vs. budget, verified deliverables, and evidence (logs, deployment UUIDs, SHA hashes)
- **Dependencies**: All previous tasks completed

## Blockers / Dependencies
- Task 1 blocks Task 2
- Task 2 blocks Task 3
- Task 3 blocks Task 4