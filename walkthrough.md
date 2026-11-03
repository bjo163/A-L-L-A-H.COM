# A-L-L-A-H.COM Platform - Technical Walkthrough

## Overview
A-L-L-A-H.COM is a modular platform featuring:
- **Loco.rs 1.2.0** backend with Axum web framework
- **SeaORM** for database ORM
- **Next.js 16 / React 19** frontend
- **Docker** containerization with Coolify deployment support

## Recent Changes (Autonomous Evolution Engine)

### LLM Gateway Upgrade
- **File**: `apps/server/src/controllers/llm_gateway/` (new module)
- **Controller**: `controller.rs` - OpenAI-compatible chat completions API
- **Rate Limiting**: `rate_limiter.rs` - Token bucket algorithm with `lru::LruCache`
- **Semantic Caching**: `semantic_cache.rs` - SHA-256 canonical request hashing
- **Upstream Proxy**: `upstream.rs` - SSRF-guarded proxy with retries
- **S3 SigV4**: `s3_sigv4.rs` - AWS SigV4 signing for content-addressed storage

### Core Security Fixes
- **File**: `apps/server/src/core/security.rs`
- **SSRF Guard**: Fixed IP address validation for IPv4/IPv6 (private, link-local, unique local)
- **Constant-time comparison**: SHA-256 digest verification for timing attack resistance

### Module Organization
- Added `pub mod security;` to `core/mod.rs`
- Created `llm_gateway/mod.rs` with all 5 sub-modules
- Updated `app.rs` route registration to use `controllers::llm_gateway::controller::routes()`

### Dependencies Updated
- `lru = "0.13"` - LRU cache with `NonZeroUsize` capacity
- `hmac = "0.12"`, `hex = "0.4"` - SigV4 signing
- `reqwest = "0.12"` with rustls-tls, json, stream, http2 features
- `subtle = "2"` - Constant-time comparison

### Build Status
- ✅ Rust compilation: `cargo check` passes
- ✅ Frontend build: `pnpm web:build` passes
- ✅ Database migrations: `pnpm server:migrate` passes
- ✅ Docker compose: `docker-compose.yml` valid

## Next Steps
- Deploy to Coolify with custom domains
- Configure upstream LLM providers
- Enable SDUI dynamic form components