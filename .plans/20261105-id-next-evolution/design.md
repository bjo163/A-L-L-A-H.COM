---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-NEXT-EVOLUTION-DESIGN"
version: "1.0.0"
owner: "design"
status: "proposed"
last_verified: "2026-11-05"
---

# Design Direction — LUNAR CHRONICLES Identity Observatory

## Experience principle
An intimate identity observatory, not an admin dashboard. The visual metaphor organizes real account relationships; it never invents security or astronomical facts.

## Navigation proposal
- Arrival: identity status and one context-appropriate next action.
- Account: identity anchor and profile preferences.
- Trust: sessions, device records, security events, protective actions.
- Privacy: notices, consent history, export/deletion requests.
- Connected worlds: approved destinations and verified access hand-off.
- Developer integration: read-only client inventory and documentation (P2).

Do not add every route at once. Keep navigation proportional to capabilities actually shipped.

## Core compositions
1. **Identity Anchor:** name/email and editable fields explicitly supplied by ARSY.
2. **Trust Constellation:** current session, other sessions, expiry, revoke controls, and confirmed security events.
3. **Recovery Chamber:** request and complete recovery as separate, minimal journeys.
4. **Consent Archive:** notice version, purpose, choice, timestamp, and withdrawal behavior.
5. **Destination Orbit:** destination identity, purpose, configured origin, and access state. A link never implies permission.

## Visual DNA
- LUNAR CHRONICLES: midnight observatory, lunar cartography, archival typography, measured orbital geometry, quiet metallic accents.
- Personal and contemplative; less monumental than GATE and less operationally dense than HEADQUARTER.
- No generic centered-card wall, random orbital decoration, fake security seals, fake scores, or proprietary game UI imitation.
- One primary action per moment; destructive actions are visually distinct and require deliberate confirmation.
- Motion short, interruptible, and reduced under `prefers-reduced-motion`; sound is optional and never conveys the only status.

## State system
Every data-backed section must define: loading, ready, empty, stale, unavailable, unauthorized, and action-pending/action-confirmed/action-failed where applicable. Never translate an unavailable authority into a signed-out or safe state.

## Accessibility and localization
Use `@moonwitness/ui` exclusively for controls and composition primitives. Maintain visible focus, semantic headings, programmatic labels/errors, keyboard operation, contrast, zoom/reflow, and screen-reader announcements. Indonesian and English are first-class. Dates use the user's selected time zone while raw timestamps remain authority-sourced.

## Responsive behavior
Validate 360, 390, 768, 1024, and 1440 CSS px. Session/device rows must reflow without hiding revoke context. Security events use readable list layouts on mobile rather than a wide table.

## Design acceptance
The design is accepted only after browser evidence across target viewports, keyboard-only flow, screen-reader spot checks, reduced-motion, and real authority-backed state fixtures.
