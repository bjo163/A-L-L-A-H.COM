---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-RESEARCH"
version: "1.0.0"
owner: "product-design"
status: "research"
last_verified: "2026-11-05"
---

# Moon UI — Research & Strategic Direction

> Evidence ledger and design implications for the next evolution of Moon UI. Proposed capabilities are not implementation claims.

## Research question

How can Moon UI evolve from a premium UI package into a governed creative-interface platform supporting seven distinct worlds, adaptive task experiences, AI-assisted work, spatial storytelling, original media, and production-grade interaction without sacrificing agency, accessibility, truth, or performance?

## Evidence classes

- **A — Peer-reviewed research:** informs interaction principles; findings remain bounded by study design.
- **B — Primary technical documentation / source:** validates platform capabilities, APIs, licensing, and constraints.
- **C — Community trend signal:** stars, downloads, and activity snapshots; discovery signal, not quality proof.
- **D — Visual inspiration:** Dribbble and galleries; composition and art direction, not usability evidence.

## Recent research

### Adaptive and generative interfaces

**Google Research (2026), Self-Evolving Systems: Moving Beyond Deterministic Interfaces to Adaptive Generative Interfaces**  
https://research.google/pubs/self-evolving-systems-moving-beyond-deterministic-interfaces-to-adaptive-generative-interfaces/  
Describes directed synthesis, inferred synthesis, and real-time adaptation. **Implication:** AI may propose task-specific arrangements and tools, but cannot silently rewrite identity, permissions, destructive-action behavior, or navigation semantics.

**CHI 2025, Generative and Malleable User Interfaces with Generative and Evolving Task-Driven Data Model**  
https://doi.org/10.1145/3706598.3713285  
Uses task-driven data models as an intermediate representation between user goals and generated UI. **Implication:** model entities, relationships, constraints, operations, and completion evidence before rendering an interface.

**CHI 2026, Just-In-Time Objectives: A General Approach for Specialized AI Interactions**  
https://doi.org/10.1145/3772318.3790713  
Explores inferring an in-the-moment objective and specializing tools and responses around it. **Implication:** an Intent Lens can focus a workspace on a task, but must expose the active objective and allow correction and reset.

**Findings of ACL 2026, Generative Interfaces for Language Models**  
https://aclanthology.org/2026.findings-acl.74/  
Proposes structured interface-specific representations and iterative refinement; reports up to 72% preference improvement in its evaluated settings. **Implication:** use task-specific UI when it improves a workflow, but do not generalize the reported result to every task.

### Agency, transparency, and trust

**Electronics (20 February 2026), The Agency-First Framework**  
https://www.mdpi.com/2079-9292/15/4/877  
Emphasizes granular control and intervention during generation. **Implication:** creative and AI workflows need steer, pause, revise, approve, reject, compare, and undo—not only a prompt box.

**CHI 2026, Sensemaking in Multi-Agent LLM Interfaces**  
https://doi.org/10.1145/3772318.3791157  
Finds transparency needs are task-sensitive; too much process visibility can increase cognitive effort. **Implication:** concise result first, optional sources, freshness, actions, disagreement, agent summaries, and audit detail on demand. Transparency is sufficiency, not maximum verbosity.

**CHI 2026, A Decision-Theoretic Representation of Assistive Interfaces**  
https://doi.org/10.1145/3772318.3791819  
Models assistance as sequential decision-making between a user and assistant under uncertainty. **Implication:** distinguish suggestion, co-creation, prepared action, bounded delegation, and automation. Each needs explicit authority and recovery.

### Visual complexity and structure

**Electronics (5 August 2026), Quantifying Visual Complexity in Generative AI-Designed User Interfaces**  
https://www.mdpi.com/2079-9292/15/15/3458  
Proposes a reproducible framework combining visual-complexity metrics with human-centered assessment. **Implication:** evaluate visual uniqueness alongside task performance, perceived load, hierarchy, density, and time-to-task.

**Trends in Neuroscience and Education (June 2026), Visual Cues as Perceptual Load**  
https://www.sciencedirect.com/science/article/pii/S2211949326000141  
Reports that cues perceived as helpful can still add cognitive demands in interactive visualizations. **Implication:** parallax, particles, labels, scan lines, and animated guides must earn their place; provide a quiet mode.

**DIS 2026, Structural Interaction: Shifting the Focus of UI Design**  
https://dis.acm.org/2026/wp-content/uploads/2026/06/toc_companion.html  
Frames UI structure as a graph of elements and rules, with separate dimensions of rigidity and enforcement. **Implication:** composition rules may be flexible, but semantic, accessibility, and security invariants are not.

**CHI 2026, Bridging Gulfs in UI Generation through Semantic Guidance**  
https://hcix.snu.ac.kr/research/semantic-ui-generation  
Uses hierarchical design semantics to make intent and generated outcomes more interpretable. **Implication:** create structured semantic design briefs instead of relying on vague prompts.

**Computers (12 April 2026), Design Behaviour and Interface Consistency in Generative No-Code Tools**  
https://www.mdpi.com/2073-431x/15/4/238  
Reviews variation in generated UI outcomes across tools and repeated runs. **Implication:** generation needs deterministic tokens, versioned constraints, reusable recipes, and visual regression.

## Visual and web research

### Dribbble spatial studies
- 3D UI Dashboard — Spatial Interface Motion Study: https://dribbble.com/shots/27719924-3D-UI-Dashboard-Spatial-Interface-Motion-Study
- Spatial Dashboard search: https://dribbble.com/search/spatial-dashboard

Observed vocabulary includes spatial depth, camera framing, layered surfaces, lighting, and dynamic object relationships. These are visual references only; shots do not establish accessibility, task performance, or production readiness.

**Spatial Without the Gimmick**
1. Depth communicates hierarchy or relationships.
2. Camera motion follows user intent and remains interruptible.
3. Spatial objects remain semantic DOM controls where possible.
4. Every spatial scene has a usable 2D and reduced-motion fallback.
5. No arbitrary floating panels, fake metrics, or perpetual motion.

### Web direction
**Figma, Top Web Design Trends for 2026:** https://www.figma.com/resource-library/web-design-trends/  
Highlights 3D/immersive elements and experimental navigation. Moon UI can use non-linear exploration for worlds, archives, maps, and creative spaces while retaining search, history, keyboard access, landmarks, and clear exits.

**Web Association of Canada, Experimental Navigation (26 January 2026):** https://wwwac.ca/en/news/web-design-trends-2026-2-experimental-navigation-redefining-exploration-web-design  
Frames navigation as participatory exploration. Essential routes must never be hidden behind discovery-only interactions.

## GitHub ecosystem snapshot — 5 November 2026

Trend aggregators use different methods. Star velocity is a discovery signal only. Verify license, releases, maintenance, issues, framework compatibility, and bundle cost before adoption.

### Design intelligence and anti-slop
- pbakaus/impeccable — https://github.com/pbakaus/impeccable — design vocabulary and critique workflows for coding agents.
- Nutlope/hallmark — https://github.com/Nutlope/hallmark — anti-AI-slop design skill.
- nextlevelbuilder/ui-ux-pro-max-skill — https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — searchable design and UX guidance.
- Leonxlnx/taste-skill — https://github.com/Leonxlnx/taste-skill — art direction and anti-template guidance.
- feimacode/open-design-agent-kit — https://github.com/feimacode/open-design-agent-kit — agent-oriented design skills and brand systems.
- VoltAgent/awesome-design-md — https://github.com/VoltAgent/awesome-design-md — curated DESIGN.md references.

**Implication:** own a design constitution and deterministic critique pipeline. Borrow methods, never external brand identity or assets.

### Motion and spatial rendering
- motiondivision/motion — https://github.com/motiondivision/motion — declarative motion, gestures, springs, layout and scroll transitions.
- pmndrs/react-three-fiber — https://github.com/pmndrs/react-three-fiber — React renderer for Three.js.
- pmndrs/drei — https://github.com/pmndrs/drei — helpers for React Three Fiber.
- theatre-js/theatre — https://github.com/theatre-js/theatre — web motion design; public README says 1.0 development temporarily moved to a private repo.
- pmndrs/postprocessing — https://github.com/pmndrs/postprocessing — Three.js post-processing effects.

**Implication:** Motion is a candidate for common UI transitions. R3F, Drei, Theatre, and postprocessing are optional scene tools, not mandatory runtime dependencies.

### Trend snapshots
- GitTrend design systems, 3 Nov 2026: https://gittrend.io/trending/design-system
- GitTrend UI components, 3 Nov 2026: https://gittrend.io/trending/ui-components
- Upstar design tools, 4 Nov 2026: https://upstar.dev/t/design-tools
- GitHub.Locker UI design topic, 4 Nov 2026: https://github.locker/topics/ui-design

Observed community themes: design-agent skills, anti-slop critique, collaborative design workspaces, and richer motion/design tooling.

## Platform constraints

**MDN WebGPU API:** https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API  
MDN currently marks WebGPU as limited availability and not Baseline, and notes it requires secure contexts. **Rule:** WebGPU is progressive enhancement behind capability detection, never a baseline requirement.

## Strategic concepts worth owning

1. **Intent-to-Interface Compiler:** user intent → task model → semantic design brief → approved recipe → UI composition → evaluation → approval.
2. **World Grammar Engine:** seven versioned grammars for composition, geometry, materials, light, typography, motion, sound, iconography, media, and fallback.
3. **Intent Lens:** temporary task-focused arrangement of approved blocks, with visible objective, user correction, pinning, and reset.
4. **Evidence Surface:** concise AI outcome first; sources, freshness, actions, uncertainty, disagreement, and audit details on demand. Never expose private chain-of-thought.
5. **Scene Graph:** data-first model of worlds, passages, destinations, timelines, media, and relationships; render as spatial map, orbit, archive, graph, or linear view.
6. **Creative Foundry with provenance:** stable IDs, masters, derivatives, licenses, approvals, focal points, alt text, and validation for every generated asset.
7. **Experience Quality Observatory:** measured performance, accessibility, visual regressions, asset health, route coverage, and maturity.

## Research-to-roadmap map

| Research signal | Product response | Maturity |
|---|---|---|
| Adaptive generative UI | Intent-to-Interface Compiler | Research / design |
| Task-driven data model | Task and intent schema | Proposed |
| User agency | Action authority, preview, undo, approval | Design requirement |
| Progressive transparency | Evidence Surface | Proposed |
| Structural interaction | World Grammar and composition constraints | Proposed |
| Semantic UI guidance | Semantic design brief | Proposed |
| Visual complexity | Experience Quality Observatory | Proposed |
| Immersive navigation | Scene Graph and spatial fallback | Proposed |
| Anti-slop agent skills | Owned critique and screenshot review | Proposed |
| Motion tool ecosystem | Motion choreography adapter | Evaluate |
| WebGPU limitations | Capability-based rendering tiers | Design requirement |

## Adoption policy

Before adopting an external library or pattern: verify maintenance, license, security, React/Next compatibility, and package size; prototype in isolation; compare native HTML/CSS/SVG; measure real devices and accessibility; record the decision and exit strategy.

## Source limitations

- Paper findings are bounded by their study design, participants, tasks, and publication status.
- Research concepts are not automatically proven product patterns.
- Dribbble shots are visual inspiration, not usability evidence.
- GitHub stars and trend aggregators are noisy and time-sensitive.
- Library READMEs describe capabilities, not proof of repository fit.
- Browser capabilities vary; test target devices.

**Conclusion:** Moon UI's defensible advantage should be the integration of seven authored world grammars, task-aware composition, user-agency controls, evidence-led AI surfaces, original media production, and rigorous experience certification, not the number of components or amount of 3D.


---

## Execution mapping and adoption status

Research-derived concepts are proposals until implemented and verified. Their bounded implementation tasks, existing-code overlap checks and adoption/defer decisions are tracked in the [Moon UI Master Consolidation Plan](../../.plans/20261105-moon-ui-master-consolidation/spec.md), especially its coverage matrix and task list.

Do not add a library, runtime AI service, WebGL/WebGPU renderer or generative pipeline solely because it appears in a paper, Dribbble study or GitHub trend. The master plan requires a real workflow, current-source gap, license/maintenance/security review, accessible fallback and measurable verification before adoption.
