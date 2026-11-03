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
