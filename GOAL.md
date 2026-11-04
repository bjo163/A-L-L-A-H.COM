---
contract: "DOCUMENTATION_CONTRACT.md"
id: "GOAL"
version: "1.1.0"
owner: "leadership"
status: "implemented"
last_verified: "2026-11-04"
---
# GOAL.md

## Mission

Unify MoonWitness & Empire of the Light into a high-performance Fastify/Next.js platform without narrative or technical erasure. See [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md).

## /goal Directive

```
Target : https://github.com/bjo163/A-L-L-A-H.COM.git  branch: dev → main
Contracts: AGENTS.md · AUTONOMOUS.md · DOCUMENTATION_CONTRACT.md · LEGACY_RECONCILIATION.md

LOOP:
  1. Read all contracts. Zero-confirmation mode.
  2. Research bjo163/* repos + Odoo/OpenDAL. Pick next task from BACKLOG.md.
  3. Security audit: streaming, parameterized SQL, SSRF guards, fail-closed retention.
  4. Build gates (self-heal all errors, never prompt):
       pnpm dock:build
       pnpm headquarter:build
       pnpm --filter @allah/arsy build
  5. Doc sync: update only affected canonical docs per DOCUMENTATION_CONTRACT.md.
  6. Conventional commit → push dev. CI promotes dev→main on 100% pass.
```
