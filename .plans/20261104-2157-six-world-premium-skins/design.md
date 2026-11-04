# Design specification

## Direction read

Reading this as a multi-app design-system transformation for an Indonesian/English creative and research ecosystem, using the six approved visual worlds. Shared craft is funky and premium; each world retains its own visual vocabulary.

Overall dials: ENERGY 3 / RHYTHM 3 / MOTION 2.

## World-specific execution

| World | Signature composition | Vector-art direction | Motion purpose |
|---|---|---|---|
| IMPERIUM LUMEN | Axial threshold, long horizon, monumental planes | Abstract geometric architecture and controlled light | Reveal spatial depth |
| LUNAR CHRONICLES | Instrument atlas with orbital frame | Moon phases, calibrated arcs, coordinate marks | Focus an observation |
| ROCKSOUL | Rain-noir cinematic frame and deep negative space | Wet street reflections, anonymous environmental silhouette | Quiet scene reveal |
| NEXUS PARADOX | Asymmetric instrument bay and layered telemetry planes | Original sensor geometry and reticle architecture | Confirm active instrument state |
| RIOT ANARCHY | Offset print spread, torn geometry, controlled collision | Original xerox halftone and poster cutout forms | Short print-cut transition |
| MYCELIUM | Branching network and membrane-like layered plane | Original mycelial paths and cellular nodes | Trace a real visual connection |

No scene depicts divine form, uses sacred text as decoration, implies fake system data, or reproduces protected artwork.

## Components and states

- `WorldArtwork` provides the six static, scalable SVG scenes.
- `SkinScope` applies a nested route's tokens and world recipes without adding a separate motion toggle or provider.
- `PageHero` remains the semantic entry component; app routes choose a composition that suits their task.
- Static art remains informative as decoration only; no meaning depends on animation.
- Existing loading, empty, error, permission, and success semantics stay in the shared component library.
- Mobile reflows art and content instead of shrinking a desktop composition.
