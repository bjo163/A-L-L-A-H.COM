---
title: "Full UI Transformation Decisions"
status: in_progress
---

# Full UI Transformation Decisions

## ADR 1: Extend the shared UI engine

Use `@moonwitness/ui` rather than app-specific component forks.

Reason: One semantic interaction engine with six visual recipes preserves accessibility, state behavior, and keyboard parity without duplicating business logic.

## ADR 2: Use a Skin Laboratory

Build the laboratory from one representative task set reused across all six worlds.

Reason: Direct comparison exposes real differences in layout, navigation, typography, motion, and state, not unrelated demos.

## ADR 3: Verify production hydration

Judge interaction readiness in production builds and hydrated browser sessions.

Reason: Development HMR failures can hide whether React handlers are mounted. Production runtime evidence is required for completion.
