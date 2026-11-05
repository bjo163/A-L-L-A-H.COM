---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-README"
version: "1.0.0"
owner: "product-design"
status: "approved"
last_verified: "2026-11-05"
---

# Moon UI — The Living Interface System

> One functional engine. Six unmistakable worlds. A cinematic interface that feels crafted, tactile, spatial, and alive — without sacrificing truth, speed, accessibility, or usability.

**Package:** `@moonwitness/ui`  
**Location:** `packages/ui/`  
**Runtime:** React 19 · Next.js applications · TypeScript source in this package  
**Product code convention:** JavaScript / Node.js for application and service implementation unless an existing package contract explicitly requires otherwise. This UI package currently contains typed TSX; do not misdescribe the repository's application/backend language because of this package's source format.

This README is the package-level product and contributor entrypoint. The full target contract, asset pipeline, world recipes, visual fidelity model, component roadmap, and acceptance gates live in [BLUEPRINT.md](./BLUEPRINT.md).

---

## 1. Mission

Moon UI is the single visual, interaction, and composition authority for the A-L-L-A-H.COM ecosystem. It translates the approved narrative and six Master Design DNA into interfaces that feel like entering distinct places rather than opening interchangeable SaaS dashboards.

The experience should evoke the craft of a premium console game: deliberate composition, convincing scale, layered atmosphere, material contrast, controlled light, responsive camera-like transitions, crisp typography, and meaningful interaction feedback. It must remain a real web product: fast to load, readable, navigable, accessible, responsive, secure, and honest about live data.

**The ambition is console-grade art direction and interaction craft, not a false claim that a browser UI is a native PlayStation game or a real-time 3D game engine.** Use WebGL/WebGPU/3D only where it adds meaningful value and passes device-aware performance budgets.

## 2. Canonical agreements

These agreements are non-negotiable unless a recorded decision explicitly supersedes them.

1. **Six DNA are six worlds, not six recolors.** Each world has its own visual grammar, spatial metaphor, typography, materials, composition, navigation language, artwork, and motion character.
2. **One functional engine.** Shared semantics, accessibility, keyboard behavior, validation, state handling, and data contracts remain consistent. World-specific presentation must not fork business logic.
3. **No generic dashboard template.** Avoid repetitive equal-card grids, default SaaS hero layouts, template-like sidebars, generic glassmorphism, arbitrary gradients, and decorative charts without meaning.
4. **No visible “HUD” label.** A diegetic instrument-like interface may use spatial cues and contextual indicators, but must not print the word “HUD” as a product label or pretend decorative elements are real telemetry.
5. **Truth before spectacle.** Never invent counts, status, telemetry, astronomy, progress, network activity, or AI activity. Mark illustrative/demo data clearly.
6. **Never depict ALLAH.** No face, body, avatar, silhouette, anthropomorphic proxy, or graphic claiming to represent ALLAH. IMPERIUM LUMEN uses abstract architecture, light, geometry, and atmosphere only.
7. **Human imagery restraint.** Cosmic and sacred narrative artwork uses no faces. Where a human figure is narratively required, prefer a distant/back-facing silhouette; preserve the ROCKSOUL visual canon (quiet storyteller, cinematic framing, hoodie/rain where appropriate) and do not fabricate identity.
8. **One token source.** SkinRoot publishes skin tokens; `theme.css` maps Tailwind utilities to them. Apps do not create competing palettes, font systems, or private component styles.
9. **Native-first primitives.** Use native platform semantics first. Add Base UI only inside this package when a documented interaction requirement cannot be met natively. Do not introduce a wholesale primitive-library migration during visual work.
10. **Evidence defines status.** A specification, mockup, or generated asset is not a shipped feature. Mark implementation status only after source, tests, app integration, and visual verification support the claim.

See [repository DESIGN.md](../../DESIGN.md), [DNA canon](../../DNA/README.md), [component mapping](../../DNA/07-COMPONENT-MAPPING.md), and [DECISIONS.md](../../DECISIONS.md).

## 3. The six Master DNA

| # | DNA | World identity | Visual signature | Canonical app usage |
|---|---|---|---|---|
| 01 | **IMPERIUM LUMEN** | A-L-L-A-H.COM · Empire of the Light | Monumental cosmic architecture, axial order, immense negative space, antique-gold light, ivory stone, obsidian depth | GATE and DOCK |
| 02 | **LUNAR CHRONICLES** | MoonWitness Universe | Lunar observatory, celestial atlas, orbital chronology, quiet silver-blue light, archival precision | MoonWitness ID / approved Lunar routes |
| 03 | **ROCKSOUL** | Silent storyteller / Born to Running narrative | Cinematic stills, chapter rhythm, tactile print, alternative-music energy, selective crimson, restrained grunge | HARBOR and approved ROCKSOUL scopes |
| 04 | **NEXUS PARADOX** | Future-game / experimental command environment | Spatial instruments, impossible geometry, technical precision, diegetic controls, signal cyan | HEADQUARTER |
| 05 | **RIOT ANARCHY** | Underground manga / punk / xerox culture | Collage, halftone, torn print, hard ink edges, kinetic typography, controlled disorder | MOONSKY and approved RIOT scopes |
| 06 | **MYCELIUM** | Living interconnected ecosystem | Biomorphic membranes, branching relationships, organic nodes, mineral greens, generative growth | WORLD OBSERVATORY / JIZZ |

The current app assignments are grounded in [DESIGN.md](../../DESIGN.md) and [DNA/README.md](../../DNA/README.md). Route-specific `SkinScope` usage must not silently change an app's root identity.

### 3.1 Imperium Lumen — approved palette and typography target

The previously accepted visual direction is **Cosmic Ivory & Antique Gold**, with **Monumental Cosmic Architecture** as the hero direction.

Approved reference palette:
- Obsidian `#090A0D`
- Lunar Slate `#20242B`
- Moon Gold `#C5A15A`
- Ivory `#F4F1E9`
- Moon Dust `#D9D4C8`
- Crimson `#8E2635` (selective narrative accent, not a general UI accent)

Approved type direction:
- Display/editorial: Cormorant Garamond
- Interface/body: Inter
- Technical/numeric: Cascadia Code

**Reconciliation note:** current `skinRegistry` values and system-font stacks do not exactly match this accepted target. This README records the approved direction; it does not pretend the current runtime has already migrated. The implementation plan must preserve contrast and semantic token roles, add properly licensed/self-hosted font assets, update the registry deliberately, and verify all consuming apps before calling the migration complete.

## 4. Product experience doctrine

- **Spatial, not flat:** establish foreground, content plane, world plane, and distant atmosphere. Use overlap, scale, perspective, occlusion, and light falloff only when they reinforce hierarchy.
- **Monumental when appropriate:** use scale and negative space for gateways and world entrances; do not make every route a giant hero.
- **Diegetic, not decorative:** controls should feel native to their world metaphor while remaining immediately understandable.
- **Editorial hierarchy:** strong title, short contextual copy, intentional supporting information, and one clear primary action.
- **No card wallpaper:** cards are one material among many, not the default container for every piece of content.
- **Purposeful transitions:** transitions explain where content went, what changed, or what is now available.
- **Quiet confidence:** effects are restrained. No constant pulsing, noisy particles, gratuitous parallax, random floating elements, or excessive glow.
- **Content remains king:** typography and controls remain crisp above artwork; visual media never blocks reading or interaction.
- **No false control-room theater:** decorative scan lines, meters, coordinates, stars, and system readouts are not presented as real system state.

## 5. Console-grade visual fidelity — realistic web implementation

The target is a highly polished, high-resolution web experience with game-art direction. It is not achieved by applying blur to every panel.

### Art and rendering
- Create original, art-directed master assets at 2K or 4K where the composition benefits from it; derive responsive AVIF/WebP delivery sizes. Keep SVG for logos, icons, diagrams, and clean vector geometry.
- Use physically plausible visual cues: coherent light direction, believable scale, contact shadows, atmospheric perspective, restrained reflections, material roughness, and consistent color grading.
- Build depth with a small number of intentional layers: foreground silhouette/structure, primary architecture or subject, secondary geometry, atmospheric background, and subtle light.
- Preserve clean edges and high-frequency detail. Avoid over-sharpening, noisy textures, banding, muddy gradients, and excessive bloom.
- Use CSS/SVG for interface-native geometry and lightweight atmosphere. Use pre-rendered art for complex scenes. Consider WebGL/WebGPU/3D only for a genuinely interactive scene, with a static fallback.
- Do not upscale a small source and label it 4K. Record source dimensions, crop, format, license/provenance, and intended placement.

### Motion and camera language
- Use cinematic easing and staged reveals: establish → focus → settle. Keep navigation transitions short enough not to delay tasks.
- Prefer subtle depth shift, parallax, masked reveals, light sweeps, and layered motion over constant movement.
- Motion must be interruptible, not block input, and respect `prefers-reduced-motion`.
- Do not animate large expensive filters continuously. Avoid layout thrashing; animate transform and opacity where possible.
- Offer a way to pause optional ambient effects. Reduced-motion preference always wins over the manual toggle.

### Device-aware performance
- Target stable 60fps for ordinary interactions on capable desktop hardware; provide a clean 30fps-or-static experience on constrained devices rather than forcing effects.
- Load hero media responsively and prioritize the first meaningful content. Lazy-load below-the-fold art and optional 3D.
- Use poster/static fallbacks for video or 3D. Never make a route unusable while an effect initializes.
- Measure LCP, CLS, INP, image transfer size, JS cost, and GPU-heavy effects on real target devices.
- Keep text and controls in DOM; do not bake interface text into images.

Detailed budgets and acceptance rules are in [BLUEPRINT.md](./BLUEPRINT.md).

## 6. Package architecture

```
packages/ui/
  src/
    components/   semantic atoms and controls
    blocks/       reusable experience compositions
    primitives/   shared behavior providers and motion primitives
    raw/          layout-only structural primitives
    skins/        SkinRoot, registry, skin identity
    tokens/       public token exports
    lib/           internal helpers
    sfx/           sound-effect contracts/utilities
    theme.css      Tailwind-to-skin token mapping
    skins.css      world-specific visual recipes
  test/            component, skin, asset, and contract tests
  README.md        package entrypoint and doctrine
  BLUEPRINT.md     complete visual and technical target
```

### Layer ownership

| Layer | Owns | Must not own |
|---|---|---|
| Tokens / skins | Color, typography, spacing, geometry, materials, motion values, identity metadata | App business data |
| Raw | Layout structure and responsive composition helpers | Brand decisions, fetching, domain logic |
| Components | Accessible semantic controls and atoms | App-specific business workflows |
| Primitives | Cross-cutting interaction/motion providers | Product navigation or remote data |
| Blocks | Reusable sections and task compositions | Fetching, persistence, app-specific authorization |
| Apps | Routes, content, data fetching, domain workflow, app-specific scene orchestration | Duplicate controls, tokens, private component styles |

## 7. Current source inventory

This is a point-in-time inventory; verify exports and source before extending.

- **Components:** Button, Input, Textarea, Select, Form, Card, Badge, Avatar, Table, Dialog, Link, Skeleton, Icon, Emblem, Checkbox, ToolRegistryCard, ToolDetailPanel, ToolParameterField.
- **Blocks:** EcosystemNavbar, Endpoints, SessionCard, SoundToggle, VisualEffectsToggle, useEcosystemSession, WorldArtwork, DestinationCard, Kicker, PageHero, RouteShell, SectionHeading, SkipLink, StatePanel, StatusMessage, SkinLaboratory.
- **Raw layout:** RawContainer, RawSection, RawStack, RawCluster, RawGrid.
- **Primitives:** VisualEffectsProvider, useVisualEffects, MotionFrame.
- **Skins:** six IDs in `src/skins/registry.ts`.
- **Tokens:** exported through `src/tokens/index.ts`; Tailwind mapping lives in `src/theme.css`; visual recipes in `src/skins.css`.

Do not create a component merely because it appears on a generic component checklist. First map it to a real workflow, semantic need, and DNA composition. The blueprint includes a prioritized gap map.

## 8. Use from an application

Import controls and blocks from the shared package. Do not re-create their markup, styling, or behavior in an app.

```tsx
import {
  SkinRoot,
  RouteShell,
  PageHero,
  SectionHeading,
  Button,
  WorldArtwork,
} from '@moonwitness/ui';

export function ExampleRoute() {
  return (
    <SkinRoot skin="imperium-lumen">
      <RouteShell>
        <PageHero
          title="Enter the Empire"
          description="A monumental gateway into the living ecosystem."
          media={<WorldArtwork skin="imperium-lumen" />}
        />
        <SectionHeading title="Explore the world" />
        <Button>Continue</Button>
      </RouteShell>
    </SkinRoot>
  );
}
```

This is an API illustration only. Check the exported prop signatures before copying it into a real route; do not assume the example is a verified build fixture.

## 9. Contributor workflow

1. Read [BLUEPRINT.md](./BLUEPRINT.md), [DESIGN.md](../../DESIGN.md), the relevant DNA spec, and [DECISIONS.md](../../DECISIONS.md).
2. Inspect the existing package source, exports, tests, app consumers, and current CI before changing anything.
3. Identify whether the change belongs in a token, raw primitive, component, block, skin recipe, or app composition.
4. Preserve semantic behavior and parity across all six skins.
5. Add or update tests for behavior, accessibility contracts, token integrity, and asset provenance as appropriate.
6. Verify all consuming app builds and visual states; never infer success from a unit test alone.
7. Update documentation and status based on evidence.
8. Work on `dev`; do not create a branch unless the user explicitly changes the repository branching rule.

## 10. Quality gates

Run the commands that exist in the current root manifest; expected design-system checks include:

```sh
pnpm ui:test
pnpm ui:contrast
pnpm lint:arch
pnpm lint
pnpm typecheck
pnpm dock:build
pnpm gate:build
pnpm headquarter:build
pnpm id:build
pnpm jizz:build
```

A passing UI test does not imply every app builds. Report each gate separately, preserve failing evidence, and do not claim a full pass unless all required gates pass.

## 11. Canonical references

- [Full package blueprint](./BLUEPRINT.md)
- [Six Master DNA](../../DNA/README.md)
- [DNA component mapping](../../DNA/07-COMPONENT-MAPPING.md)
- [DNA quality gates](../../DNA/08-QUALITY-GATES.md)
- [Product design doctrine](../../DESIGN.md)
- [Architecture decisions](../../DECISIONS.md)
- [Engineering invariants](../../AGENTS.md)
- [Repository quality contract](../../QUALITY.md)
