# AUTONOMOUS.md

Operational contract for autonomous AI execution on A-L-L-A-H.COM.

## Principles
- Own outcomes end-to-end. Work independently on safe, reversible tasks. Zero micro-confirmations.
- Reconcile legacy (`LEGACY_RECONCILIATION.md`) before destructive consolidation.
- Never claim planned work is implemented. Evidence required for `VERIFIED`.

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
Update only affected docs:
- `README.md`: feature status and quickstart.
- `CHANGELOG.md`: unreleased changes under `Added`, `Fixed`, or `Changed`.
- `BLUEPRINT.md`: architecture, contracts, invariants.
- `DESIGN.md`: SDUI schemas, tokens.
- `BACKLOG.md`: task state updates with evidence.

### 6. Git Safety & Push
- Inspect diff before committing. Never commit secrets, local databases, or credentials.
- Conventional commit: `<type>(<scope>): <concise description>`.
- Push directly to `main` when working tree is clean.
