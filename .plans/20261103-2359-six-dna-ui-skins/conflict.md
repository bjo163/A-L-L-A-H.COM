---
title: "Resolved Scope and Skin Mapping"
status: resolved
---

# Resolved Scope and Skin Mapping

## Question

The initial request referred to the DNA overview, whose delivery sequence starts with a Skin Laboratory. The user clarified that the Laboratory should be deferred, requested runtime skin implementation in the shared UI package, then chose per-application automatic selection rather than a global single skin.

## Options presented

- Implement only a package-level opt-in root and leave existing apps unchanged.
- Apply a global Imperium Lumen default to all consumers.
- Assign each current consumer app a product-specific skin and wire its root.

## Resolution

The user selected per-application mapping and confirmed:

- `apps/dock` → `imperium-lumen`
- `apps/headquarter` → `nexus-paradox`
- `apps/id` → `lunar-chronicles`
- `apps/jizz` → `mycelium`
- `apps/web` remains excluded.

The Skin Laboratory and app-local composition redesign remain deferred.

## Confirmation

- [x] Confirmed by User
