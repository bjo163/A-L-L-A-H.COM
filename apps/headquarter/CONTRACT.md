---
contract: unit
id: APP_HEADQUARTER
tier: app
name: @moonwitness/headquarter
owner: frontend
version: 0.1.0
status: released
last_verified: 2026-02-10
summary: Agent operations console on the nexus-paradox skin
routes: [agent, ai-gateway, api, knowledge, projects, skin-lab, swarm, tools]
skin: nexus-paradox
ports: [3002]
---

# @moonwitness/headquarter — Unit Contract

The agent operations console on the `nexus-paradox` skin: agent sessions, swarm,
tools, knowledge, projects, AI-gateway observability, and the skin lab.

## Routes / skin / ports

Top-level `src/app` route segments: `agent`, `ai-gateway`, `api`, `knowledge`,
`projects`, `skin-lab`, `swarm`, `tools`. Skin `nexus-paradox` matches
`layout.tsx`. Port 3002.

## Depends

`@moonwitness/ui`, `@allah/sdk`, `@moonwitness/types`; framework `next`.

## Container contract

The image copies the app and every declared workspace dependency before building
the production Next.js bundle.
