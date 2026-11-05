---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_HEADQUARTER_README"
version: "1.1.0"
owner: "frontend"
status: "implemented"
last_verified: "2026-11-06"
---
# HEADQUARTER — NEXUS PARADOX

**Strategic command center for A-L-L-A-H.COM.** Headquarter turns applications, services, projects, AI agents, knowledge, risks, and decisions into one trustworthy executive operating picture.

It is where leaders understand what matters, review evidence, make accountable decisions, and follow through. It is neither a generic admin dashboard nor the real-time NOC console.

**One trustworthy strategic picture. One accountable decision path. One traceable record of execution.**

See [blueprint.md](./blueprint.md) for the complete product narrative, boundaries, architecture, workflows, data ownership, security, visual doctrine and release stages.

## Ownership and boundaries
- Owns executive overview, governance, project/portfolio oversight, AI/agent governance, and knowledge-backed review.
- GATE owns public discovery; DOCK owns community participation; COCKPIT owns live NOC dispatch.
- MoonWitness ID / ARSY own identity, sessions, credentials, authorization, persistence and audit.
- Domain services remain authoritative for project, agent, provider, tool, telemetry and knowledge records.
- VS Code extension owns local workspace consent, file review and command execution policy.

ARSY is the server-side authority. UI visibility is never a security boundary.

## Current implementation inventory
Documentation baseline only; planned capabilities are not claims of completion. App uses Next.js 16.4.3, React 19.3.0, TypeScript, @moonwitness/ui and @allah/sdk; port 3002.

| Surface | Source evidence | Audit caveat |
|---|---|---|
| Overview | src/app/page.tsx | Hero and module index; not yet the strategic briefing in blueprint |
| AI Gateway | src/app/ai-gateway/ | Verify API contracts and configured provider state |
| Agent Studio | src/app/agent/page.tsx | Streaming UI and remote controls exist; audit cancellation, event lifecycle and permissions |
| Swarm Ops | src/app/swarm/ | Verify history, review, cancellation and persisted outcomes |
| Tool Registry | src/app/tools/ | Verify registry ownership and invocation permissions |
| Knowledge | src/app/knowledge/ | Verify citations, freshness and tenant visibility |
| Skin Laboratory | src/app/skin-lab/ | Utility route, not a strategic module |

**Known drift:** Make HQ_NAV the single source; headquarter-shell.tsx and src/app/page.tsx should not maintain separate lists. Classify Skin Laboratory separately.

## Architecture
- Next.js App Router / React / TypeScript, port 3002.
- NEXUS PARADOX skin through @moonwitness/ui.
- Typed contracts through @allah/sdk and @moonwitness/types.
- ARSY Fastify Hub, port 5150, is the backend authority.
- No direct database access, duplicated auth, or invented endpoint.

## Run locally
From repository root:
```bash
pnpm install
pnpm headquarter:dev
```
Open http://127.0.0.1:3002.

Useful checks:
```bash
pnpm --filter @moonwitness/headquarter typecheck
pnpm headquarter:build
pnpm docs:check
pnpm lint:arch
pnpm ui:test
pnpm ui:contrast
```
Use the root lockfile. Read [app guidance](./AGENTS.md), [root AGENTS](../../AGENTS.md), and installed Next.js docs before framework changes.

## Execution plan
Start at the [Headquarter command-center epic](https://github.com/bjo163/A-L-L-A-H.COM/issues/381) and its sub-issues, then follow the current rules and task lists for the Headquarter workstream. First gate: inspect route tree, SDK exports/types, ARSY endpoint schemas, tests and branch state. Do not add endpoints, tables, dependencies, services or duplicate primitives until a real gap is proven.

## Quality bar
No fake data/live states, dead controls, unexplained metrics, duplicate navigation sources, client-side authorization, silent destructive actions, or unsupported completion claims. Consequential workflows must be tenant-safe, evidence-backed, accessible, responsive and verifiable.
