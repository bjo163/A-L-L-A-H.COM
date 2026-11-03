# DESIGN — SIX MASTER DNA DOCUMENTATION

## Information architecture

The DNA directory is the canonical source for the six visual worlds:

- README.md is the index and status declaration.
- 00-ENGINE-CONTRACT.md defines shared architecture, technical, and accessibility boundaries.
- 01 through 06 define one world each.
- 07-COMPONENT-MAPPING.md compares the same semantic tasks across the six worlds.
- 08-QUALITY-GATES.md defines specification, implementation, verification, and release criteria.

## Visual direction

The six worlds are intentionally orthogonal:

| DNA | Primary composition | Material | Navigation metaphor |
|---|---|---|---|
| IMPERIUM LUMEN | Monumental axial architecture | Obsidian / ivory / controlled light | Gates and spaces |
| LUNAR CHRONICLES | Orbital and cartographic layers | Observatory instruments / lunar surfaces | Orbit and chronicle |
| ROCKSOUL | Cinematic frames and poster sequences | Wet asphalt / film / paper | Chapters and tracks |
| NEXUS PARADOX | Spatial instrument planes | Composite / holographic glass | Systems and coordinates |
| RIOT ANARCHY | Broken grid and collage | Xerox / ink / torn paper | Poster strips and issues |
| MYCELIUM | Branching and biomorphic networks | Membrane / mineral / organic matte | Living network |

## Repository integration

The shared functional package remains packages/ui. This task documents the design direction but does not add runtime dependencies, components, routes, or application-specific visual changes.

Root DESIGN.md links to the DNA index. DECISIONS.md records the accepted direction. BACKLOG.md tracks implementation. CHANGELOG.md records only the files actually added or changed.
