---
contract: "DOCUMENTATION_CONTRACT.md"
id: "HEADQUARTER-COMMAND-CENTER-DESIGN"
version: "1.0.0"
owner: "product-design"
status: "in_progress"
---

# Headquarter command center design

## Direction

Use the NEXUS PARADOX world: precise instrument planes, clear signal traces, and deliberate technical density. Preserve the existing NEXUS `SkinRoot` and shared `@moonwitness/ui` tokens; do not introduce app-local theme variables or palette values.

## Navigation and composition

Derive the operational rail and Overview index from `HQ_NAV`. Keep utility routes separate from strategic modules. Compose pages from shared UI blocks and source-backed records rather than repeated generic card grids.

## Data states

Every data surface distinguishes loading, empty, partial, stale, offline, unauthorized/forbidden, and failure states where applicable. Unknown or unavailable values remain explicit; zero is shown only when the API reports zero. Display source, freshness, and severity for exceptions.

## Interaction and accessibility

Use semantic shared controls with visible labels, keyboard access, clear focus, responsive reflow, and reduced-motion behavior. Destructive or privileged actions require auditable confirmation; cancellation remains pending until confirmed by the server. Do not imply success before a persisted response.

## Boundaries

The app supplies data and callbacks. ARSY owns auth, tenant policy, persistence, and audit; the SDK owns client communication; the UI package owns shared controls and presentation. No hidden reasoning, credentials, local paths, or fabricated health/activity data appears in the interface.
