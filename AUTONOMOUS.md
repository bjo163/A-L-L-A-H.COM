# AUTONOMOUS.md

Operational contract for autonomous AI execution loop on A-L-L-A-H.COM.

## Execution Pipeline
```
[Research/Gap Analysis] -> [Security & Integrity Audit] -> [Modular Implementation] -> [Build Gates] -> [Doc Sync] -> [Git Push]
```

### 1. Research & Gap Analysis
- Reference sources: `bjo163/*` (`moonwitnessxv`, `echolog`, `ql-orm`, `ql_ai`, `mwx-isp`) + Odoo 18 / OpenDAL / OpenRouter.
- Prioritize high-value unbuilt slices (LLM streaming proxy, storage deduplication, SDUI renderers).
- Execute without asking confirmation for individual files.

### 2. Security & Integrity Audit
- Zero-copy stream pipes (`axum::body::Body::from_stream`).
- Parameterized DB queries (SeaORM/SQLx). No raw string SQL.
- Storage immutability: SHA-256 content addressable (`objects/<digest>`).
- Fail-closed access: `legal_hold` and `retention_until` checks enforce deletion rejection.
- Upstream guard: validate `base_url`, prevent SSRF.

### 3. Implementation Standards
- Backend: Rust (`apps/server`), Loco framework, modular addons in `addons/`.
- Frontend: Next.js (`apps/web`), App Router, React 19, Tailwind v4.
- Anti-slop: zero placeholder files, concise logic, strict types, high-signal comments only.

### 4. Build Gates (Zero-Error Mandate)
Execute and verify:
```bash
pnpm server:migrate
cargo check --manifest-path apps/server/Cargo.toml
pnpm web:build
```
On error: self-diagnose and fix immediately. Do not prompt user.

### 5. Mandatory Canonical Document Sync
Every functional or structural change MUST update:
- `README.md`: feature status and quickstart.
- `CHANGELOG.md`: unreleased changes under `Added`, `Fixed`, or `Changed`.
- `BLUEPRINT.md`: architecture, contracts, invariants.
- `DESIGN.md`: SDUI schemas, tokens.

### 6. Git Push Mandate
```bash
git add .
git commit -m "<type>(<scope>): <concise description>"
git push origin main
```
Done when `git status` is clean and commit is live on `main`.
