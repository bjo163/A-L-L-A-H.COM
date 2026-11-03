---
contract: "DOCUMENTATION_CONTRACT.md"
id: "AUTONOMOUS"
version: "1.0.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-03"
---
# AUTONOMOUS.md

Operational contract for autonomous AI execution on A-L-L-A-H.COM.

## Principles
- Own outcomes end-to-end. Work independently on safe, reversible tasks. Zero micro-confirmations.
- Reconcile legacy (`LEGACY_RECONCILIATION.md`) before destructive consolidation.
- Never claim planned work is implemented. Evidence required for `VERIFIED`.
- Follow `DOCUMENTATION_CONTRACT.md` for every Markdown change; update only affected canonical documents.

## Execution Loop
`DISCOVER` -> `AUDIT` -> `PRIORITIZE` -> `IMPLEMENT` -> `VERIFY` -> `DOCUMENT` -> `PUSH`

### 1. Research & Gap Analysis
- Consult `bjo163/*` (`moonwitnessxv`, `echolog`, `ql-orm`, `ql_ai`, `mwx-isp`) + Odoo/OpenDAL standards.
- Select highest-value safe task from `BACKLOG.md`.

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
On error: self-diagnose and fix root cause immediately. Do not prompt user.

### 5. Mandatory Canonical Document Sync
Apply the change-to-document matrix in `DOCUMENTATION_CONTRACT.md`. Keep document ownership distinct and update only affected docs. In particular:
- `README.md`: verified capabilities, setup, and deployment entry point.
- `CHANGELOG.md`: changes that actually happened.
- `BLUEPRINT.md` and `DESIGN.md`: architecture and product experience respectively.
- `BACKLOG.md`: task state and verification evidence.
- `DECISIONS.md`, `QUALITY.md`, `ROADMAP.md`, and `LEGACY_RECONCILIATION.md`: update only when their respective subjects change.

### 6. Git Safety & Push
- Inspect diff before committing. Never commit secrets, local databases, or credentials.
- Conventional commit: `<type>(<scope>): <concise description>`.
- Push directly to `dev` (CI gate verifies and auto-promotes to `main`) when working tree is clean.
