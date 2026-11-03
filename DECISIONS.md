---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DECISIONS"
version: "1.0.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-03"
---
# DECISIONS.md
## Accepted Product & Architecture Decisions

Record accepted decisions and rationale only. Proposals and unresolved questions remain in the backlog.

### D-001 — A-L-L-A-H.COM is the unified home
- Status: ACCEPTED
- Decision: A-L-L-A-H.COM is the central home and unified continuation of the MoonWitness journey and Empire of the Light ecosystem.
- Rationale: Consolidation and evolution, not an isolated replacement project.

### D-002 — Preserve generations and provenance
- Status: ACCEPTED
- Decision: Reborn, XV, and earlier generations must be reconciled without silently erasing historical material.
- Consequence: Follow LEGACY_RECONCILIATION.md before migration, rewrite, archive, or retirement.

### D-003 — Unify without forcing one application
- Status: ACCEPTED
- Decision: Share foundations where justified while preserving clear product boundaries and identities.
- Rationale: Avoid fragmentation and unnecessary over-centralization.

### D-004 — One actionable backlog
- Status: ACCEPTED
- Decision: BACKLOG.md is canonical task tracking; ROADMAP.md is strategic.

### D-005 — Evidence-based completion
- Status: ACCEPTED
- Decision: Implementation, verification, release, and deployment are distinct states.

### D-006 — Six Master DNA for MoonFrame
- Status: ACCEPTED
- Date: 2026-11-03
- Context: The ecosystem needs a visual system that is recognizably different across its major identities and experimental experiences, without fragmenting shared UI behavior.
- Decision: Approve six distinct Master DNA: IMPERIUM LUMEN, LUNAR CHRONICLES, ROCKSOUL, NEXUS PARADOX, RIOT ANARCHY, and MYCELIUM. Each DNA defines its own world metaphor, composition, shape/material language, typography, color roles, navigation, motion, component recipes, and exclusions. They share one functional UI engine.
- Alternatives: A single universal theme with color variants; separate component libraries per skin; fewer generic SaaS themes.
- Rationale: Preserve A-L-L-A-H.COM / Empire of the Light and MoonWitness identities, protect the established ROCKSOUL poster canon, and create three additional experimental worlds that are orthogonal rather than cosmetic recolors.
- Consequences: Canonical specifications live in DNA/. Runtime implementation is tracked separately in BACKLOG.md. Current shared package remains packages/ui/; no primitive-library migration is implied. Documentation approval does not mean the six runtime skins are implemented or verified.
- Related tasks: SKIN-001.

### D-007 — One Shared Runtime Skin Engine
- Status: ACCEPTED
- Date: 2026-11-03
- Context: Six approved Master DNA must shape shared components without forking interaction, accessibility, or business behavior.
- Decision: Implement all six skin IDs, semantic tokens, and component recipes in `packages/ui/`. Applications select a typed skin at a server-rendered root; package styles remain scoped to that root, with deterministic Imperium Lumen fallback.
- Alternatives: A global style switch, client-only skin detection, or six independent component libraries.
- Rationale: Keep the package API and initial render deterministic while preserving distinct product identities and one semantic component engine.
- Consequences: Dock selects Imperium Lumen, Headquarter selects Nexus Paradox, ID selects Lunar Chronicles, and WORLD OBSERVATORY selects Mycelium. ROCKSOUL and RIOT ANARCHY remain available for future consumers. Skin Laboratory comparison and complete visual verification remain pending.
- Related tasks: MOONFRAME-SIX-DNA-UI-SKINS.

### D-008 — Isolated Personal Tenants for New Accounts
- Status: ACCEPTED
- Date: 2026-11-04
- Context: Newly registered accounts need tenant assignment to use paired-device and remote-mission APIs, but sharing one default tenant would expose devices across unrelated accounts.
- Decision: Assign each new account a personal tenant whose integer ID is the negative of its unique positive user ID. Reserve positive IDs for organization tenants and zero for unassigned accounts. Device-control APIs accept non-zero safe integer tenant IDs and continue to reject unassigned users.
- Alternatives: Keep registration blocked until an administrator assigns an organization tenant; introduce a central tenant registry/ID allocator before enabling personal tenants.
- Rationale: The existing integer `company_id` field and user sequence provide distinct per-account IDs without introducing a shared tenant or colliding with positive organization IDs.
- Consequences: New accounts are isolated by default. Organization sharing requires explicit administrative assignment of users to the same positive tenant. Tenant-scoped queries must treat the ID as an opaque non-zero key rather than assuming it is positive.
- Related tasks: WINDOWS-VSCODE-LOCAL-AGENT.

## Decision template
### D-XXX — Title
- Status: PROPOSED / ACCEPTED / SUPERSEDED
- Date:
- Context:
- Decision:
- Alternatives:
- Rationale:
- Consequences:
- Related tasks:
