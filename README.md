# A-L-L-A-H.COM (MoonWitness Platform)
**Autonomous Developer Platform & AI Gateway Engine**  
[![Build](https://github.com/bjo163/A-L-L-A-H.COM/actions/workflows/ci.yml/badge.svg)](https://github.com/bjo163/A-L-L-A-H.COM)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Deployment: Coolify](https://img.shields.io/badge/Deploy-Coolify-blue.svg)](docker-compose.yml)

A-L-L-A-H.COM ("Accountable Life, Learning & Action Hub") adalah platform pengembang modular berkinerja tinggi yang menyatukan arsitektur **Odoo-Style Enterprise OS**, **Echolog Content-Addressed Storage**, dan **Smart LLM Router 2.0** ke dalam satu kesatuan monorepo Rust/Next.js.

---

## 🏛️ Arsitektur Inti (Pillars)

1. **Enterprise OS Core (Odoo/Ql-Orm in Rust)**:
   - Pola Mixin & Audit fields bawaan (`id`, `name`, `active`, `create_date`, `write_date`, `create_uid`, `write_uid`, `owner_id`, `metadata` JSON).
   - Multi-Company / Team Workspace hierarkis (`res.company`).
   - Partner, Developer & Billing Ledger (`res.partner`).
   - Dynamic Currency & Rate Exchange untuk kalkulasi biaya token (`res.currency`).
   - Server-Driven Dynamic UI Engine (`ir.ui.view` -> Tree, Form, Kanban).

2. **All-in-One Content-Addressed Storage (Echolog Engine)**:
   - File disimpan beralamatkan **SHA-256 digest** (`objects/<digest>`).
   - Idempotent write-once: Re-upload file identik tidak memakan disk tambahan (zero byte duplication).
   - Fail-closed retention deadlines & legal holds (`ir.attachment`).
   - Dual-surface: REST API + Bounded S3 SigV4 endpoint.

3. **Smart LLM Router 2.0**:
   - Zero-copy streaming proxy berstandar OpenAI API (`/v1/chat/completions`).
   - Multi-tier routing strategies: Automatic Failover (Circuit Breaker), Lowest Cost, Lowest Latency, Weighted Round-Robin.
   - Cross-Provider Protocol Transformer (OpenAI standard <-> Anthropic Claude <-> Gemini).
   - In-memory routing state (`Arc<RwLock<RoutingTable>>`) untuk response ultra cepat (< 2ms proxy overhead).
   - Exact hash & semantic prompt caching.

---

## 📂 Struktur Monorepo

```text
A-L-L-A-H.COM/
├── apps/
│   ├── server/           # Backend Engine (Rust / Loco / SeaORM / Axum)
│   │   ├── src/core/     # Ql-Orm engine, BaseModel, Storage, Router State
│   │   ├── addons/       # Modular Addons (base, mw_storage, mw_llm_router)
│   │   └── migration/    # SeaORM automated database migrations
│   └── web/              # Frontend Platform (Next.js 16 + React 19 + Tailwind v4)
├── docker-compose.yml    # Coolify-optimized zero-hassle deployment
├── BLUEPRINT.md          # Master architecture and technical specification
├── DESIGN.md             # Visual design system & Server-Driven UI specification
├── CHANGELOG.md          # Continuous release and update history
└── package.json          # Root workspace scripts (pnpm)
```

---

## 🚀 Memulai Cepat (Quick Start)

### Kebutuhan:
- **Node.js** >= 22 & **pnpm** >= 10
- **Rust** >= 1.85 & **Cargo**

```bash
# 1. Install dependencies
pnpm install

# 2. Migrasi database server
pnpm server:migrate

# 3. Jalankan development server
pnpm dev              # menjalankan server & web secara paralel
# atau jalankan terpisah:
pnpm server           # Backend aktif di http://localhost:5150
pnpm web:dev          # Frontend aktif di http://localhost:3000
```

---

## 🐳 Deployment di Coolify (Production)

Stack ini dioptimasi penuh untuk **Coolify**:
- Gunakan Git Repository: `https://github.com/bjo163/A-L-L-A-H.COM.git` (Branch: `main`).
- Build Pack otomatis: **Docker Compose**.
- Port loopback terisolasi (`127.0.0.1:5150` & `127.0.0.1:3000`) yang aman di balik reverse proxy Traefik Coolify.

