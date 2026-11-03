---
title: "Six Master DNA — Canonical Design Specification"
status: "in_progress"
timestamp: "2026-11-03T22:07:00+07:00"
author: "OpenAI"
target_branch: "feature/moonframe-six-master-dna"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
---

# SPEC — SIX MASTER DNA

## Objective

Finalize and preserve six radically distinct Master Design DNA specifications for A-L-L-A-H.COM, MoonWitness Universe, ROCKSOUL, and the broader MoonFrame skin system. Store the canonical specifications in a root-level DNA directory on a dedicated feature branch.

## User outcome

A contributor or coding agent can understand each world, implement it without blending the identities, and prove that six skins differ structurally and experientially rather than only by color.

## Approved Master DNA

1. IMPERIUM LUMEN — A-L-L-A-H.COM / Empire of the Light; abstract monumental architecture and light.
2. LUNAR CHRONICLES — MoonWitness Universe; lunar cartography, astronomy, archive, and RPG exploration.
3. ROCKSOUL — the established silent-storyteller poster canon; rain-noir cinema, alternative music, and Gen-Z grunge.
4. NEXUS PARADOX — future-game diegetic HUD and spatial speculative technology.
5. RIOT ANARCHY — manga, xerox punk, underground poster, and controlled anti-design.
6. MYCELIUM — biological networks, biomorphic architecture, and generative organic systems.

## Repository baseline and constraints

- Repository: bjo163/A-L-L-A-H.COM.
- Base branch: dev.
- Feature branch: feature/moonframe-six-master-dna.
- Current shared UI foundation: packages/ui/, package name @moonwitness/ui.
- Current shared component implementation uses Base UI primitives and Tailwind-oriented recipes; do not assume Radix is installed.
- Preserve existing app and package contracts.
- Do not implement the runtime skins in this documentation-only task.
- Distinguish approved design direction from implemented and verified software.

## Scope

- Add canonical specifications under DNA/.
- Define one shared Skin Engine contract and a component mapping / quality gate.
- Update DESIGN.md, DECISIONS.md, BACKLOG.md, and CHANGELOG.md according to the documentation contract.
- Create and complete this plan with evidence after the branch push is verified.

## Out of scope

- Runtime skin selector, CSS token implementation, and component variants.
- Replacing Base UI or migrating to Radix.
- Refactoring Dock, Headquarter, or ID application layouts.
- New font, image, audio, shader, or 3D dependencies.
- Production deployment or merging into dev/main.

## Acceptance criteria

- Six canonical DNA documents exist with distinct thesis, composition, material, typography, color, navigation, motion, component mapping, and exclusions.
- Shared engine rules protect component contracts, accessibility, responsive behavior, performance, factual integrity, and asset licensing.
- ROCKSOUL retains unseen-face / back-view poster direction, red hoodie motif, rain-night atmosphere, alternative-music identity, and narrative provenance.
- IMPERIUM LUMEN preserves abstract visual symbolism and does not depict or claim to represent ALLAH.
- LUNAR CHRONICLES distinguishes measured astronomy from fictional / symbolic narrative.
- All internal links resolve.
- Documentation updates follow DOCUMENTATION_CONTRACT.md.
- Feature branch contains a scoped conventional commit and is independently verified.
- Runtime implementation is explicitly marked pending.
