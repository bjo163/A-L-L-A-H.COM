# Rules: JIZZ Phase 1 — Foundation & Next.js 16 Application Scaffolding

## Invariants
1. **Skin Boundary**: Do not duplicate or rebuild skins inside `apps/jizz/`. All visual tokens and skin classes must be consumed directly from `@moonwitness/ui`.
2. **UI Purity**: All interactive buttons, inputs, cards, and navigation elements must be imported from `@moonwitness/ui`.
3. **Port Isolation**: JIZZ runs on port 3004, distinct from Dock (3001), Headquarter (3002), and ID (3003).

