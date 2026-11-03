---
title: "ADR: Shared UI Skin Selection"
status: accepted
---

# ADR: Shared UI Skin Selection

## Context

The UI package has hard-coded visual classes and no skin contract. The six approved DNA worlds must remain visually distinct while retaining one accessible functional foundation. The applications consume the package through separate Next.js roots and stylesheets.

## Decision

Implement all six skin IDs, tokens, and component recipes in `@moonwitness/ui`. Select the skin explicitly at each in-scope app root with a validated server-rendered attribute. Load one package-owned stylesheet from each consumer's existing global stylesheet. Keep component semantics and behavior common, and keep skin styles scoped to their root.

Assign Dock to Imperium Lumen, Headquarter to Nexus Paradox, ID to Lunar Chronicles, and Jizz to Mycelium. Exclude the unrelated `apps/web` app from this wiring. Use Imperium Lumen as the deterministic package fallback.

## Alternatives considered

- A global Imperium skin for every app would blur product identities.
- Client-only detection or persistence would risk hydration mismatch and is not authorized by the current settings/consent model.
- Six duplicated component libraries would fork behavior and accessibility.
- The Skin Laboratory could provide visual comparison evidence, but the user explicitly deferred it.

## Consequences

- Shared package and four application roots/stylesheets must change.
- App-local page compositions may not fully express their selected DNA until a later composition pass.
- The implementation can be reported at package/app wiring level, but full visual verification remains pending until Skin Laboratory comparison and the quality gates are completed.
