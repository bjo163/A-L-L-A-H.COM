# CHANGELOG: A-L-L-A-H.COM (MoonWitness Platform)

Seluruh perubahan, penambahan fitur, audit keamanan, dan pembaruan arsitektur pada platform didokumentasikan di sini mengikuti standar [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2026-11-03

### Added
- **Core Odoo/Ql-Orm Engine (`apps/server/src/core`)**:
  - Trait `BaseModel` & `ModelAudit` untuk audit fields (`id`, `name`, `active`, `create_date`, `write_date`, `owner_id`, `metadata`).
  - Strong field typing: `Char`, `Text`, `Integer`, `Float`, `Boolean`, `Datetime`, `Selection`, `Many2one`, `Json`.
  - Server-Driven UI (SDUI) view engine generator (`Tree`, `Form`, `Kanban`, `Search`).
- **Base Odoo Addon Migrations**:
  - `res_currency`: Multi-currency exchange rate & token cost calculator.
  - `res_country`: Master ISO countries & phone codes.
  - `res_company`: Hierarchical team workspaces / multi-tenancy.
  - `res_partner`: Developer identity, customer ledger, credit balance.
  - `ir_ui_view`: Database storage for dynamic SDUI schemas.
- **Echolog Content-Addressed Storage (`apps/server/src/core/storage.rs`)**:
  - SHA-256 digest addressable object store (`objects/<digest>`).
  - Write-once deduplication logic (idempotent re-uploads).
  - Retention deadlines & legal holds migration (`mw_storage_backend`, `ir_attachment`).
- **Smart LLM Router 2.0 (`apps/server/src/controllers/llm_gateway.rs`)**:
  - OpenAI-compatible endpoints: `POST /v1/chat/completions` & `GET /v1/models`.
  - In-memory routing state table (`RoutingTable`) untuk latency overhead < 2ms.
  - SDUI view metadata endpoint: `GET /v1/sdui/{model}/{view_type}`.
  - Migrasi database: `ai_provider`, `ai_model`, `ai_route`, `ai_virtual_key`, `ai_usage_log`.
- **Modern Next.js Frontend (`apps/web`)**:
  - Dashboard A-L-L-A-H Command Center dengan real-time service health check.
  - Live SDUI table preview untuk `res.partner`.
- **Coolify Production Deployment**:
  - `docker-compose.yml` dengan loopback binding (`127.0.0.1:5150` & `127.0.0.1:3000`), container healthchecks, dan persistent storage volume.
  - Multi-stage Dockerfiles bertenaga `rust:1.85-bookworm` dan `node:22-alpine`.

### Security & Optimization
- Base image Docker di-upgrade ke Debian Bookworm untuk mengatasi masalah mirror 404 security lama.
- Integrasi loopback ports untuk mencegah pembocoran port plaintext HTTP di luar proxy Traefik Coolify.
