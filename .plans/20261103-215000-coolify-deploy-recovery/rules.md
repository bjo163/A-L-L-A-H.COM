---
status: active
---

# Coolify Deploy Recovery Rules

> Superseded by [Production Release and Docker Gate](../20261104-1200-production-release-docker-gate/spec.md). The Rust module and server-image rules below are retained only as historical context.

## Invariants

### 1. Rust Module Path Uniqueness
**Rule**: Each Rust module must have exactly one path declaration. A module cannot exist as both `module_name.rs` and `module_name/mod.rs` simultaneously.

**Why**: The Rust compiler (`rustc`) enforces this constraint to prevent ambiguity in module resolution. Violation causes `error[E0761]` and build failure.

**How to apply**:
- Before committing any new Rust code, verify `cargo check` passes
- Use directory-based modules (`module_name/mod.rs`) for multi-file modules
- Use file-based modules (`module_name.rs`) only for single-file modules
- Never create both forms for the same module name

### 2. GHCR Image Publish Before Deploy
**Rule**: Docker images must be successfully published to GHCR before Coolify deployment can succeed.

**Why**: Coolify's compose deployment uses `pull_policy: always` and references images by tag. A missing or inaccessible image causes immediate deployment failure.

**How to apply**:
- Verify GHCR image availability before triggering Coolify deployment
- Use authenticated `docker pull` to confirm image accessibility
- Check GitHub Actions workflow logs for successful "Build and push image" step

### 3. Coolify Deployment Requires Healthy Containers
**Rule**: Application status must reach `running:healthy` before considering deployment complete.

**Why**: Coolify's health check determines whether the deployment succeeded. An `exited:unhealthy` status indicates container startup failure or health check failure.

**How to apply**:
- Poll `GET /api/v1/applications/{uuid}` until `status` field shows `running:healthy`
- Verify health check endpoint responds (e.g., `curl http://127.0.0.1:5150/api/v1/health`)
- Check container logs via `GET /api/v1/applications/{uuid}/logs` for startup errors

## Security Constraints

### 1. Token Handling
**Rule**: Coolify API token must never be committed to git or logged in plain text.

**Why**: The token provides full API access to the Coolify instance and all deployed applications.

**How to apply**:
- Store token in `C:\Users\bjo16\.config\coolify\token` (NTFS ACL restricted)
- Use environment variable or secure file read in scripts
- Never include token in chat output, memory, or commit messages

### 2. Repository Isolation
**Rule**: Only deploy from the `main` branch to production Coolify environment.

**Why**: Production deployments must be gated by CI validation and code review.

**How to apply**:
- Verify `git_branch: "main"` in Coolify application configuration
- Ensure GitHub Actions workflow triggers only on `push: branches: [main]`
- Never manually deploy from `dev` or feature branches to production

## Boundary Rules

### 1. Tenant Isolation
**Rule**: All database queries and API requests must include `company_id` filtering where applicable.

**Why**: Multi-tenant architecture requires strict data isolation between tenants.

**How to apply**:
- Use parameterized queries with `company_id` in WHERE clauses
- Verify ORM models include tenant scope by default
- Test with multiple tenant contexts to ensure isolation

### 2. Content-Addressed Storage
**Rule**: All stored objects must use SHA-256 digest addressing with write-once semantics.

**Why**: Content-addressed storage provides deduplication, integrity verification, and immutable audit trail.

**How to apply**:
- Compute SHA-256 hash before storing any object
- Use hash as the primary key in storage lookups
- Never modify existing objects; create new versions with new hashes

---