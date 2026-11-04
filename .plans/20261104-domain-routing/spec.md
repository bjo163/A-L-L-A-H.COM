---
title: "Domain, Destination & Application Routing Architecture"
status: "proposed"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Domain, Destination & Application Routing Architecture

## 1. Objective

Define one understandable public address map for the three owned domains, map every existing application to one canonical destination, expose planned applications only when justified, and prepare small deterministic execution tasks for AI coding agents.

This plan is an architecture proposal. It does not configure DNS, certificates, reverse proxies, production domains, deployment, or create GitHub issues.

## 2. Source-of-truth and constraints

- Repository: `bjo163/A-L-L-A-H.COM`.
- Work branch: existing `dev` only; never create a branch.
- `moonwitnessxv` and `moonwitness-reborn` are frozen historical references.
- ARSY is the single authority for identity, tenant context, authorization, business records and API contracts, except the accepted independent MOONSKY communication runtime boundary.
- Reuse existing apps, routes, shared UI, SDK and backend domains before proposing a new app.
- Domain mapping is not proof that an app or route is implemented.
- No production DNS, proxy, certificate, deployment, migration, release or main-branch change is authorized by this plan.

## 3. Domain strategy

### 3.1 Primary domains

| Domain | Public identity | Canonical destination | Purpose |
|---|---|---|---|
| `a-l-l-a-h.com` | A-L-L-A-H.COM / Empire of the Light | GATE — `apps/gate` | Main Empire gateway: explain the ecosystem, orient visitors and route them to the right experience. |
| `moonwitness.biz.id` | MoonWitness | DOCK — `apps/dock` (initial canonical host) | Public discovery, community entry and MoonWitness content discovery. Editorial/archive capabilities remain a distinct product boundary to be completed. |
| `e-isp.id` | E-ISP | GATE-hosted E-ISP public route initially | Commercial connectivity brand: plans, coverage, service proposition and customer/operator entry points. No separate E-ISP frontend exists in the current app inventory. |

The apex domains remain the short public addresses. Do not introduce long vanity subdomains as primary URLs.

### 3.2 Short subdomain map

| Host | Destination | Status / notes |
|---|---|---|
| `a-l-l-a-h.com` | GATE | Existing app; canonical Empire landing. |
| `dock.a-l-l-a-h.com` | DOCK | Existing app; optional alternate host, canonical public home is `moonwitness.biz.id`. |
| `hq.a-l-l-a-h.com` | HEADQUARTER | Existing app; authenticated command center. |
| `id.a-l-l-a-h.com` | MoonWitness ID | Existing app; login, registration and SSO. |
| `jizz.a-l-l-a-h.com` | WORLD OBSERVATORY / JIZZ | Existing app; public phenomena and perspective observatory. |
| `sky.a-l-l-a-h.com` | MOONSKY Console | Planned app/runtime; only after issue #22 integration is implemented and verified. |
| `my.e-isp.id` | HARBOR customer portal | Planned customer experience; initially a Dock/ID-integrated route if the API and authorization contracts support it. |
| `ops.e-isp.id` | WORKS ISP operator workspace | Existing Headquarter app route `/isp` is the intended first surface; not a separate frontend app. |
| `api.a-l-l-a-h.com` | ARSY API | Reserved service hostname; do not expose or configure until API ingress, auth, rate limits and deployment are verified. |
| `status.e-isp.id` | Service status | Deferred; use WATCHTOWER-backed public status only after a safe read-only projection exists. |

Aliases must redirect to one canonical host using a documented permanent redirect where safe. Do not serve duplicate independent content on both apex and alias hosts.

## 4. Existing application map (verified from dev tree)

| App / runtime | Repository path | Product responsibility | Domain / route |
|---|---|---|---|
| GATE | `apps/gate` | Empire of the Light gateway and ecosystem orientation | `a-l-l-a-h.com` |
| DOCK | `apps/dock` | Public discovery, community entry and MoonWitness content discovery | `moonwitness.biz.id`; alias `dock.a-l-l-a-h.com` |
| HEADQUARTER | `apps/headquarter` | Governance, administration, operator command center and WORKS ISP operations | `hq.a-l-l-a-h.com`; `ops.e-isp.id/isp` |
| MoonWitness ID | `apps/id` | Identity, registration, session and SSO | `id.a-l-l-a-h.com` |
| WORLD OBSERVATORY / JIZZ | `apps/jizz` | Public intelligence observatory and phenomena exploration | `jizz.a-l-l-a-h.com` |
| ARSY Hub | `apps/arsy` | Backend authority, API, tenant/authz, business domains and AI gateway | Internal service; reserve `api.a-l-l-a-h.com` |
| SENTINEL | `apps/sentinel` | RADIUS AAA runtime and access-policy execution | Private network service; never a public web app |

### 4.1 Existing backend domains and addons

These are product/domain capabilities, not automatically independent web applications:

- WORKS: ISP commercial domain (subscriber, plans, subscription, billing). Operator UI belongs in HEADQUARTER first.
- NEXUS: network inventory/NAS domain.
- SENTINEL: native RADIUS AAA runtime.
- ORACLE: read-only analytics/projections.
- CHRONICLE: network event/syslog domain.
- WATCHTOWER: monitoring, probes and incident lifecycle.
- FORGE: safe configuration templates and approval workflow.
- PULSE: network job lifecycle.
- ORBIT: cloud compute domain; customer/operator UI remains deferred until a real lifecycle is proven.
- HELIOGRID: energy/physical infrastructure domain; start as backend capability and Headquarter module.
- MOONLAB: research/AI experiment domain; start as Headquarter module or gated workspace.
- SHADOW: creative production domain; start as a Dock/MoonWitness workflow until independent collaboration/media lifecycle justifies a dedicated studio.
- COCKPIT: real-time operations experience; do not create a new app until live operations requirements and separation from Headquarter are approved.
- MOONSKY: independent communication service with its own operator console, accepted by D-011; not present in the current `apps/*` tree yet.

## 5. Product boundary rules

1. GATE introduces the Empire; it is not the community feed, operator console or account portal.
2. DOCK discovers content, people, community and public journeys; it is not a duplicate GATE homepage.
3. MoonWitness is the canonical narrative/knowledge identity. In the first routing stage, its public discovery home is DOCK at `moonwitness.biz.id`. The dedicated editorial/archive experience is a future app only if the current DOCK capability cannot own it cleanly.
4. HEADQUARTER is the authenticated command surface. It owns administration and operator workflows; it is not a generic duplicate of every product UI.
5. ID owns authentication and SSO only; it does not own subscriber credentials, ISP billing or communication provider sessions.
6. E-ISP is the customer-facing ISP brand. Users should not need to understand WORKS, NEXUS or SENTINEL internals.
7. WORKS operator workflows start in `apps/headquarter` under `/isp`; customer self-service HARBOR starts as a scoped customer route integrated with DOCK/ID. Do not scaffold `apps/works` or `apps/harbor` without an approved separation case.
8. MOONSKY owns conversations, channels, provider sessions, delivery and its Console. HEADQUARTER only shows summary, alerts and deep-links (D-011).
9. ARSY remains the default backend authority; MOONSKY is the accepted independent communication runtime exception.
10. One domain has one canonical application destination per route. No overlapping ownership or duplicate business logic.

## 6. Missing application coverage and next-app decisions

### 6.1 Build / integrate next

**P0 — MOONSKY Console (`apps/moonsky`)**
- Missing from current `apps/*` tree.
- Already accepted in D-011 and tracked by master issue #22 / UI issue #27.
- Owns full communication operator workflows.
- Host: `sky.a-l-l-a-h.com`.
- Must remain an independent runtime with its own persistence/session storage; ARSY owns identity/tenant authorization.

**P1 — MoonWitness editorial/knowledge workspace (`apps/moonwitness`, proposed)**
- Not present as a dedicated app in current `apps/*` tree.
- Do not scaffold immediately. First audit DOCK and GATE routes/content models and determine whether editorial publishing, canonical archives, research provenance and story taxonomy can be owned by DOCK without duplication.
- If a distinct editorial lifecycle, authoring permissions, immutable provenance, archive ingestion and publishing workflow are proven, create this app.
- Candidate canonical host: `moonwitness.biz.id`; DOCK would then remain the discovery/community front door and link to it.
- Keep the existing host on DOCK until a verified replacement is ready.

### 6.2 Keep as modules / routes, not new apps now

- HARBOR: customer self-service route under `my.e-isp.id`, reusing ID + DOCK and ARSY contracts.
- WORKS: ISP operator module under `ops.e-isp.id/isp` using HEADQUARTER.
- E-ISP public site: GATE route/domain alias initially; dedicated app only if independent marketing, SEO, localization or release needs justify it.
- HELIOGRID, MOONLAB, SHADOW, ORBIT, NEXUS, ORACLE, CHRONICLE, WATCHTOWER, FORGE, PULSE: product modules/services under current app/backend boundaries first.
- COCKPIT: deferred pending a documented operator workflow split and performance evidence.

## 7. Phased delivery

- Phase A — Canon and audit: inventory routes, app manifests, domain conflicts, canonical redirects, ownership and missing capabilities.
- Phase B — Documentation alignment: make BLUEPRINT, README, DECISIONS, DESIGN and BACKLOG agree.
- Phase C — Existing route readiness: GATE, DOCK, ID, HEADQUARTER and JIZZ route ownership and auth states.
- Phase D — E-ISP customer journey: public proposition, plan discovery, ID sign-in, HARBOR route and WORKS operator entry.
- Phase E — MOONSKY: execute accepted issue #22 and #27; add hostname only after runtime verification.
- Phase F — MoonWitness editorial decision: audit content model and decide DOCK module vs dedicated app; create app only with evidence.
- Phase G — DNS/proxy/TLS/deployment runbook: separate plan and explicit authorization required.

## 8. Definition of Done

- [ ] Three apex domains each have one named identity and canonical destination.
- [ ] Short hostnames are documented and no unnecessarily long subdomains are introduced.
- [ ] Every current app/runtime is mapped or explicitly private/internal.
- [ ] Every planned app is marked planned, not implemented.
- [ ] GATE and DOCK no longer compete as two generic public homepages.
- [ ] E-ISP public, customer and operator journeys are distinct.
- [ ] MoonWitness content ownership and DOCK discovery ownership do not overlap.
- [ ] MOONSKY Console and Headquarter ownership follows D-011.
- [ ] BLUEPRINT and README match the actual app tree and implementation status.
- [ ] DNS/proxy/TLS changes remain unperformed until a separate approval and deployment plan.
- [ ] Every task has evidence and passes relevant quality gates.
