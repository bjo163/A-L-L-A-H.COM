---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP_HEADQUARTER_BLUEPRINT"
version: "1.0.0"
owner: "architecture"
status: "proposed"
last_verified: "2026-11-05"
---
# HEADQUARTER — NEXUS PARADOX
## Product Blueprint v1.0

> Strategic command center of A-L-L-A-H.COM: understand the ecosystem, govern priorities, make accountable decisions, and follow execution. Not a generic dashboard and not a real-time operator console.

## Narrative and promise
Headquarter turns the ecosystem's applications, services, projects, AI capabilities, agents, knowledge, risks, and decisions into one trustworthy executive operating picture. It answers: What exists? What matters now? What is happening? What needs a decision? What changed, why, and with what outcome?

**One trustworthy strategic picture. One accountable decision path. One traceable record of execution.**

The experience belongs to NEXUS PARADOX: spatial, deliberate, instrument-grade, cinematic, calm under pressure. It must remain legible and serious; no decorative game HUD that obscures information, generic SaaS admin template, or wall of interchangeable cards.

## Product boundaries — no overlap
| Product | Owns | Does not own |
|---|---|---|
| GATE | Public entrance, discovery, invitation | Member workspace or administration |
| DOCK | Community/member participation and personal activity | System governance or infrastructure dispatch |
| HEADQUARTER | Executive overview, governance, portfolio, projects, AI/agent oversight, decisions | Live NOC dispatch, identity custody, public archive |
| COCKPIT | High-density real-time NOC/network/infrastructure operations | Executive portfolio and long-form governance |
| MoonWitness ID | Identity, sessions, account trust, credential lifecycle UX | Backend identity authority or secret plaintext custody |
| ARSY | Canonical APIs, identity, tenant/RBAC, policy, persistence, audit | Frontend product experience |
| SENTINEL / CHRONICLE / WATCHTOWER | Domain telemetry and operations | Headquarter executive workflow |
| QORPUS / WORLD OBSERVATORY | Knowledge corpus, source exploration, research | Governance record ownership |

Headquarter may summarize, link to, request authorized actions from, and record outcomes from other domains. It must not fork their source of truth.

## Strategic outcomes
- Situational awareness across applications, delivery, risks, and decisions.
- Evidence-backed decisions with provenance, uncertainty, alternatives, impact, and owner.
- Accountable execution: approved decisions link to tasks/missions and measurable outcomes.
- Portfolio coherence through stable IDs, ownership, dependencies, and maturity.
- Trust through server-side authorization, tenant isolation, and audit.
- Low cognitive load through progressive disclosure: executive first, evidence on demand.

## Information architecture
| Area | Purpose | Route target | Priority |
|---|---|---|---|
| Command Overview | Strategic pulse, priorities, exceptions, decision queue | / | P0 |
| Projects & Delivery | Projects, milestones, tasks, blockers, release readiness | /projects | P0 |
| Agent Governance | Paired devices, missions, approvals, execution evidence | /agent | P0 |
| Portfolio | Applications, services, ownership, dependencies, maturity | /portfolio | P1 |
| AI Governance | Provider/model policy, routing posture, metered usage | /ai-gateway | P1 |
| Swarm Governance | Multi-agent runs, delegated work, review, outcomes | /swarm | P1 |
| Tool Registry | MCP/tool catalogue, ownership, permissions | /tools | P1 |
| Knowledge & Evidence | Qorpus search, provenance, source freshness | /knowledge | P1 |
| Decisions & Audit | Proposals, approvals, decision history, audit navigation | /decisions | P1 |
| Settings | App preferences only | /settings | P2 |

Do not add placeholder routes to navigation. Each route requires a user task, source of truth, API contract, permission model, full state matrix, and acceptance test. Preserve existing URLs or document redirects before restructuring. Skin Laboratory remains a utility route, not a strategic module.

## Overview composition
1. Strategic header: tenant context, reporting window, last successful refresh, freshness.
2. Decision queue: items requiring this user's authority, impact, due date, evidence, next action.
3. Priority horizon: source-backed outcomes, milestones, and accountable owners.
4. Exception field: blocked projects, failed builds, unavailable critical services, overdue approvals, material risks.
5. Execution pulse: meaningful persisted mission/task transitions, not noisy event counters.
6. Ecosystem map: curated application/service relationships with verified status.
7. Recent decisions: decision, owner, rationale, linked work, outcome.

Every signal carries source, observed/updated time, freshness, status, and detail link. Distinguish zero, unknown, unavailable, stale, partial, and forbidden. Never infer health from page availability or invent aggregate counts.

## Core workflows
**Review and decide:** inspect recommendation → expand evidence/alternatives → assess impact and uncertainty → approve/reject/defer/request revision → provide reason when required → persist decision → link follow-up work.

**Govern an agent mission:** inspect scope and target → verify tenant/device/policy → submit or request cancellation through ARSY → review persisted event timeline and result → accept/reject outcome. Headquarter never receives local workspace paths or overrides extension consent and execution policy.

**Track delivery:** inspect project/milestones/tasks → identify blocker/dependency → assign owner → mutate through canonical project API → verify server-confirmed state.

**Investigate risk:** inspect affected services/projects and blast radius → follow evidence sources → check freshness → assign mitigation → record decision → track resolution. Live response remains COCKPIT's job.

**Review AI/swarm:** inspect configured provider/policy state, metered usage, run roles/tools/permissions, failures and disagreements. Present concise rationale, actions, evidence and output; never expose hidden chain-of-thought.

## Data ownership and architecture
ARSY is the sole server-side authority for authentication, authorization, tenant membership, policy, persistence, and audit. Headquarter consumes typed @allah/sdk contracts and never accesses the database directly.

| Domain | Source of truth | Headquarter role |
|---|---|---|
| User/session/tenant/role | ARSY / MoonWitness ID | Display authorized context |
| Projects/tasks/milestones | Existing project API/integration; verify | Read and authorized mutations |
| Devices/missions/events | ARSY agent-control APIs | Tenant-scoped lifecycle and review |
| Providers/models/usage | ARSY AI Gateway | Governance and evidence-backed summaries |
| Swarm runs/events | ARSY Swarm APIs | Inspect, review, record outcome |
| Tools/grants | ARSY tool registry | Discover and review metadata |
| Knowledge | Qorpus | Search and cite; no corpus fork |
| Decisions | Existing governance API if present; otherwise new ADR/API proposal | Workflow UX and decision content |
| Live telemetry | Domain services via COCKPIT/ARSY | Summarized exceptions only |

No new DB, ORM, service, or endpoint is approved by this blueprint alone. Search existing schemas and APIs first. Any confirmed gap requires ownership, tenant model, authorization, audit, migration, ADR, and contract tests before implementation.

Architecture:
Human → Headquarter Next.js app (3002) → @allah/sdk → ARSY Fastify Hub (5150) → ORM/domain plugins/Qorpus/integrations. Domain services remain authoritative for their own telemetry and actions.

## Frontend and security invariants
- Next.js 16 / React 19 / TypeScript as declared; read installed Next.js docs before framework changes.
- Use @moonwitness/ui for all controls and shared composition. Respect UI_PURITY, STYLE_PURITY, INLINE_STYLE_PURITY, PALETTE_PURITY, STATE_PARITY.
- NEXUS PARADOX is the only Headquarter skin; no private primitive kit or second effects provider.
- HQ_NAV is the single navigation source for rail and overview; classify utility routes explicitly.
- Server components by default; client components only for real interaction. Keep privileged actions and credentials server-side.
- ARSY enforces tenant and role authorization on every request; UI hiding is not security.
- No tokens, pairing secrets, virtual keys, secret prompts, workspace paths or private file content in URLs, logs, analytics, or client storage.
- Cancellation is a request until server-confirmed. No optimistic success for privileged actions.
- Every mutation needs authorization, validation, idempotency strategy, request correlation, audit, and explicit failure semantics.
- No hidden autonomous execution or destructive action without confirmation.

## NEXUS PARADOX visual doctrine
Spatial hierarchy: one dominant strategic plane, secondary orbital workstreams, contextual detail surfaces. Use asymmetric composition, intentional negative space, tactile depth, restrained glow, and meaningful motion. Overview remains calm; governance and evidence views may be denser. Status uses text/shape/icon as well as color. No fake 3D controls, neon overload, decorative charts, repeated equal-card grids, or meaningless HUD copy. Do not print the word HUD as visible content.

## Accessibility, responsive behavior, performance
WCAG 2.2 AA target; keyboard-complete flows, visible focus, semantic landmarks, accessible dialogs, reduced-motion support, and desktop/tablet/mobile reflow. Paginate histories, bound event buffers, clean up streams, reconnect with backoff, and avoid polling storms. Never cache authorization across users or tenants.

## Release stages
- **P0 trustworthy command center:** contract/route reconciliation, unified navigation, source-backed overview, project inventory and task flow, agent/device/mission governance, tenant/security states, accessibility.
- **P1 governance depth:** portfolio, AI gateway, swarm review, tool registry, Qorpus evidence, decisions/audit and dependency/risk relationships.
- **P2 executive intelligence:** configurable briefings, trend comparisons, risk synthesis, decision outcome measurement, reports and notifications.
- **Evidence-gated later:** predictive scoring, simulation, autonomous approvals, cross-tenant admin UX. No autonomous approval without explicit policy, audit, and human override.

## Definition of ready/done
Ready: user task, owner, source, API contract, permissions, states, route, and tests documented.
Done: implementation matches source contracts; all data has provenance/freshness; tenant isolation and authorization tested; controls work with server-confirmed feedback; all states/accessibility/responsive/reduced-motion verified; focused and root quality gates pass; report contains commands, evidence, limitations, and remaining work.

## Canonical references
- [Root architecture](../../BLUEPRINT.md) · [Design doctrine](../../DESIGN.md) · [Engineering rules](../../AGENTS.md)
- [Quality](../../QUALITY.md) · [Decisions](../../DECISIONS.md) · [App agent rules](AGENTS.md)
- [Execution plan](https://github.com/bjo163/A-L-L-A-H.COM/issues/381)
