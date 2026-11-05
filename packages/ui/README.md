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


---

# 12. Moon UI Creative Engine — Complete Capability Map

Moon UI is not only a component library. It is the ecosystem's **Creative Interface Engine**: a governed system for producing, composing, rendering, and verifying interface identity and media across six worlds.

The complete capability contract is defined in [BLUEPRINT.md](./BLUEPRINT.md). The following catalog establishes the intended breadth. Items not present in source remain **proposed**, not implemented.

## 12.1 The complete production domains

| Domain | What Moon UI owns | Signature output |
|---|---|---|
| **Atoms** | Smallest semantic visual units | text roles, labels, marks, status dots, values, metadata |
| **Raw layout** | Structure without brand opinion | stack, cluster, grid, container, section, flow |
| **Primitives** | Reusable interaction mechanics | focus, portal, overlay, selection, roving focus, motion |
| **Components** | Accessible controls and visual objects | buttons, fields, menus, tabs, switches, tables, dialogs |
| **Blocks** | Task-level compositions | hero, route shell, state panel, navigation, timeline |
| **World compositions** | Signature layouts for each DNA | gate, orbit, filmstrip, instrument bay, poster wall, living graph |
| **Skins** | Six complete visual grammars | tokens, shapes, materials, typography, density, motion, sound |
| **Effects** | Governed visual effects | atmosphere, depth, light, grain, halftone, parallax |
| **Lines & geometry** | A proprietary visual line language | orbital arcs, architectural axes, signal paths, print rules, organic branches |
| **Iconography** | Semantic and expressive symbols | action glyphs, status glyphs, world sigils, custom vector marks |
| **Brand system** | Logo and identity construction | emblem, wordmark, lockup, favicon, app icon, social avatar |
| **Avatar Studio** | MoonWitness identity/avatar generation | identity portraits, non-human symbols, role badges, profile frames |
| **Artwork Studio** | Art-directed scene and cover production | hero, world plate, chapter cover, episode, transmission, archive plate |
| **Asset system** | Discovery, metadata, delivery and provenance | manifest, variants, crops, fallbacks, licensing, integrity checks |
| **Motion Studio** | Motion grammar and reusable sequences | transitions, reveals, focus shifts, scene choreography |
| **SFX Studio** | Original interface sound language | selection, confirm, cancel, arrival, notification, ambient beds |
| **Loading & waiting** | Distinctive honest waiting experiences | world entry, skeleton, progress, spinner, streaming, offline |
| **Skin Laboratory** | Compare and certify all worlds | side-by-side identity, states, controls, responsive proofs |
| **Generators** | Repeatable creation workflows | avatar, icon, logo, cover, artwork, palette, motion and sound briefs |

## 12.2 Atomic visual vocabulary

The atom layer must include a consistent family of:
- display, heading, body, label, caption, mono and numeric text roles;
- eyebrow, kicker, overline, metadata, timestamp and source attribution;
- status mark, signal dot, index, counter, marker and rank;
- divider, hairline, frame, corner, bracket, notch, rail and rule;
- icon frame, emblem stamp, avatar frame and image placeholder;
- focus ring, selection mark, active indicator and progress segment;
- empty-space, safe-area and crop-anchor primitives.

Atoms must remain composable and semantically named. A decorative atom may not impersonate a live status or meaningful metric.

## 12.3 Component universe

The full target component catalog is grouped by task rather than by trend:

- **Actions:** Button, IconButton, Link, ButtonGroup, SplitButton, ToggleButton.
- **Inputs:** Input, Textarea, Select, Combobox, SearchField, Checkbox, RadioGroup, Switch, Slider, NumberField, DatePicker, TimePicker, FileUpload, PinInput.
- **Navigation:** Tabs, Breadcrumb, Pagination, Menu, DropdownMenu, ContextMenu, NavigationRail, CommandPalette.
- **Disclosure:** Accordion, Collapsible, Popover, Tooltip, HoverCard, Sheet, Drawer, Dialog, AlertDialog.
- **Feedback:** Badge, Status, Progress, Meter, Spinner, Skeleton, Toast, NotificationCenter, EmptyState, ErrorState, OfflineState.
- **Data:** Table, DataList, KeyValue, Stat, Timeline, Tree, Listbox, VirtualList, CodeBlock, LogStream.
- **Media & identity:** Avatar, AvatarGroup, Image, Artwork, Emblem, Logo, Icon, Cover, MediaFrame.
- **Spatial:** WorldMap, NodeGraph, OrbitMap, Pathway, SceneMarker, Viewport, FocusReticle.
- **Utility:** Separator, ScrollArea, Portal, VisuallyHidden, AspectFrame, Resizer, CopyButton.

This is a governed target catalog, not permission to build every item immediately. Each component requires a real consuming workflow, accessibility model, responsive behavior, test coverage, and a reason not to use native HTML.

## 12.4 Block and world composition universe

Shared blocks include:
- WorldEntrance, CinematicHero, WorldSwitcher, DestinationField, NavigationConstellation;
- PageFrame, RouteShell, SectionHeading, ContentRail, EditorialSpread;
- SearchCommandSurface, FilterWorkbench, DetailInspector, ActivityTimeline;
- EmptyStateScene, ErrorScene, OfflineScene, PermissionScene, SuccessScene;
- LoadingWorld, TransitionCurtain, SceneBoundary, MediaStage;
- ChapterRail, TransmissionWall, ArchiveShelf, ObservatoryTimeline;
- InstrumentBay, SystemTopology, SignalConsole;
- PosterWall, ComicSpread, StickerBoard;
- LivingNetwork, GrowthPath, RelationshipMap.

Each block must declare whether it is shared semantic structure or a DNA-specific composition. Do not make one universal block with six superficial variants.

## 12.5 The MoonWitness Avatar Studio

The Avatar Studio is a first-class Moon UI capability, not a generic initials circle.

It should support:
- generated original illustrated portraits and non-human identity marks;
- configurable silhouette, crop, expression, clothing, palette, background, frame and material;
- profile avatar, small navigation avatar, group avatar, role emblem and anonymous identity;
- consistent identity across avatar sizes and future generations;
- a user-approved source image workflow where editing is requested;
- provenance, consent, visibility and regeneration metadata;
- deterministic fallback (initials or emblem) when no approved avatar exists;
- safe negative constraints: never generate an avatar that purports to depict ALLAH, a prophet, or a sacred entity; never imply a generated avatar is a real person's verified identity.

Avatar generation is an optional production workflow. Runtime rendering must use an approved stored asset; do not call a generative model every time a profile renders.

## 12.6 Logo, icon and vector foundry

The Foundry must provide:
- six independent DNA emblem families;
- parent brand and app-level lockups;
- wordmark, horizontal lockup, stacked lockup, compact mark and monogram;
- monochrome, inverse, small-size and high-contrast variants;
- semantic action icons and bespoke world sigils;
- SVG source, optimized SVG delivery, PNG export, favicon and maskable icon output;
- clear-space, minimum-size, alignment and safe-background rules;
- duplicate detection, SVG sanitization, viewBox checks and render snapshots.

An icon is not a logo. A logo is not an illustration. A world sigil is not a replacement for an accessible action icon.

## 12.7 Artwork and cover foundry

Standard asset families:
- Empire/world hero and gateway scene;
- MoonWitness universe atlas, observatory and lunar archive plates;
- ROCKSOUL chapter, episode, filmstrip and transmission covers;
- Nexus instrument bay and topology scene plates;
- Riot issue cover, poster wall, comic spread and xerox archive;
- Mycelium organism, node network and growth-path artwork;
- user profile and community identity artwork;
- loading/arrival/transition scene plates;
- Open Graph/social share, favicon and application icon variants.

Each family must have an art brief, DNA, composition, aspect ratio, source dimensions, focal point, text-safe area, delivery variants, license/provenance, alt/decorative metadata and fallback.

## 12.8 Lines, frames and geometry

Moon UI requires its own recognizable graphic grammar:
- **Imperium:** monumental axes, threshold lines, architectural seams, measured concentric geometry.
- **Lunar:** orbital arcs, phase rings, ephemeris ticks, celestial connectors.
- **ROCKSOUL:** film perforations, edit marks, chapter rules, frame cuts.
- **Nexus:** instrument rails, calibration ticks, signal traces, scope boundaries.
- **Riot:** cut edges, registration offsets, xerox borders, panel gutters.
- **Mycelium:** organic branches, root paths, membrane contours, connection filaments.

These are reusable vector primitives with consistent stroke scale, caps, joins, animation rules and reduced-motion behavior. Lines must communicate hierarchy, connection, framing or direction—not fill empty space.

## 12.9 Effects, motion and loading

The effects engine should expose named, composable, device-aware effects:
- Atmosphere, DepthField, ParallaxField, LightSweep, VolumetricBackdrop;
- Grain, Halftone, ChromaticOffset, ScanTrace, Reflection, EdgeLight;
- RevealMask, FocusShift, SceneTransition, PortalOpen, OrbitTravel;
- ParticleField only when sparse, meaningful, pausable and performance-safe.

Loading family:
- WorldArrival (scene-level entry);
- PassageLoader (navigation transition);
- OrbitLoader (Lunar);
- FilmAdvanceLoader (ROCKSOUL);
- CalibrationLoader (Nexus);
- PrintRevealLoader (Riot);
- GrowthLoader (Mycelium);
- Spinner (small indeterminate task);
- Skeleton (known content shape);
- Progress (measurable determinate work);
- Streaming indicator (incremental content);
- Offline/retry state (network unavailable).

Never use a spinner for a known percentage, a fake progress bar for an unknown duration, or a skeleton for a long-running operation that needs an explicit status message.

## 12.10 Sound identity

SFX should be original, minimal and optional:
- focus / hover (only if useful);
- select / confirm / cancel;
- open / close / enter / exit;
- success / warning / error;
- incoming transmission / archive unlock / world arrival;
- soft ambient loops where explicitly enabled.

Every sound has a purpose, short duration, volume ceiling, mute behavior, reduced-sensory consideration and licensing/provenance. No copyrighted music or recognizable game sound imitation. Sound is off by default and never carries information unavailable visually.

## 12.11 Skin contract

A skin is a full world definition, not a color theme. It includes:
- identity metadata and brand marks;
- semantic palette and contrast pairs;
- display/body/label/mono typography;
- shape language, corner logic, border and line grammar;
- surface/material recipes and shadow model;
- density, spacing, sizing and responsive behavior;
- component recipes and world compositions;
- motion profile, easing and effect permissions;
- SFX profile and sensory policy;
- hero/artwork/cover references;
- exclusions and anti-patterns.

All six worlds must implement the same semantic state contract while expressing different visual identities. See the full matrix in BLUEPRINT.md.

## 12.12 Delivery principle

The intended end state is a complete, documented, testable design-and-media system. Build it in coherent releases: foundations → identity → atoms → controls → compositions → asset foundries → motion/effects → sound → generators → certification. A catalog entry is not complete until it is implemented, tested, integrated, and visually verified.


---

# 13. Premium Platform Parity — Beyond a Template Library

Moon UI must compete with the breadth and finish of mature premium interface systems while retaining a visual identity no purchased template can provide. The benchmark is **capability parity, not visual imitation**. Do not copy proprietary layouts, artwork, icon sets, sounds, or signature interactions.

## 13.1 Product-grade coverage

A premium system is not complete because it has many buttons. It must cover the real lifecycle of an application:

- **Application shells:** public gateway, authenticated workspace, immersive reader, operations cockpit, community portal, archive, settings and account center.
- **Navigation:** global, local, contextual, hierarchical, command-driven, spatial and mobile navigation.
- **Forms:** simple, multi-step, conditional, repeatable, validated, autosaved, review-and-submit and destructive confirmation flows.
- **Data experiences:** tables, filters, saved views, comparison, activity history, audit trail, timeline, graph, map, chart and export states.
- **Content:** editorial index/detail, long-form reading, media gallery, chapter reader, knowledge base, changelog, release notes and discussion.
- **Identity:** profile, avatar, membership, role, permissions, session, access request and account recovery.
- **Communication:** inbox, notification center, comments, mentions, threads, announcements and transmission feed.
- **Operations:** command palette, task queue, job detail, logs, system status, configuration, secrets, integration and diagnostics.
- **Commerce-ready patterns:** plans, entitlement comparison, checkout summary, invoice, payment status and subscription history only where a real product workflow requires them.
- **Spatial experiences:** maps, node graphs, topology, constellation, orbit, route and location detail.
- **Media:** image, video, audio, transcript, playlist, waveform, cover, poster and fullscreen viewing.
- **System states:** first run, loading, streaming, empty, no results, partial results, stale, offline, forbidden, expired, rate limited, failed, retrying, success and maintenance.

## 13.2 Premium application archetypes

Build composable archetypes rather than shipping one giant shell:
1. **Empire Gateway:** cinematic public entry, world discovery and destination transition.
2. **Community Dock:** member identity, activity, discussions, announcements and shared media.
3. **Operations Cockpit:** dense, precise control surfaces for people who need information quickly.
4. **Headquarter:** strategic overview, governance, cross-system navigation and executive context.
5. **MoonWitness Archive:** chapters, transmissions, timelines, source notes and universe index.
6. **Immersive Reader:** distraction-controlled long-form narrative and media.
7. **Instrument Workspace:** diagnostics, logs, configuration and live operational tools.
8. **Identity Center:** profile, avatar, access, sessions, preferences and security.
9. **Knowledge Observatory:** searchable documents, taxonomy, references and linked knowledge.
10. **Creative Foundry:** asset, skin, icon, vector, artwork, motion and sound production.
11. **Map & Network Explorer:** grounded geographic or relationship visualization.
12. **Settings Workbench:** grouped preferences, integrations, permissions and destructive actions.

Each archetype has a layout contract, navigation model, responsive behavior, state matrix and DNA-specific presentation recipes. The archetype must not own application data or duplicate domain logic.

## 13.3 Advanced component and pattern coverage

The target catalog additionally includes:
- **Data visualization:** ChartFrame, LineChart, AreaChart, BarChart, PieChart, ScatterPlot, Heatmap, Sparkline, Legend, Axis, TooltipLayer, DataTableBridge. Charts must expose accessible summaries and tabular alternatives.
- **Rich content:** RichText, MarkdownRenderer, TableOfContents, Footnote, Citation, Callout, Quote, CodeEditorFrame, DiffViewer, SyntaxBlock, MathBlock, MediaEmbed.
- **Communication:** Thread, Message, Composer, MentionPicker, ReactionBar, CommentAnchor, ActivityComposer, InboxRow.
- **Workflow:** Stepper, Wizard, ReviewPanel, ApprovalRail, TaskQueue, JobStatus, AuditEvent, RetryPanel, ConflictResolver.
- **Security and account:** PasswordField, PasskeyPrompt, SessionList, PermissionMatrix, RoleBadge, AccessRequest, RecoveryCodeList, SecretReveal, CopySecret, ExpiryNotice. Sensitive values must default to masked and never be written into logs.
- **Navigation and command:** GlobalSearch, SearchResults, RecentItems, QuickActions, CommandGroup, KeyboardHint, BreadcrumbTrail, MobileNavigationSheet.
- **Calendar and time:** CalendarGrid, Agenda, DateRangePicker, TimeZoneSelect, RelativeTime, EventMarker, ScheduleTimeline.
- **File and asset:** FileCard, FileList, UploadQueue, UploadProgress, AssetPicker, AssetPreview, MetadataEditor, VersionHistory.
- **Spatial:** MapCanvas, MapLegend, LayerControl, CoordinateReadout, RouteLine, NodeInspector, GraphLegend, Minimap, ViewportControls.
- **Media:** VideoFrame, AudioPlayer, Waveform, Transcript, CaptionTrack, Gallery, Lightbox, FullscreenStage.
- **Advanced feedback:** InlineValidation, FieldErrorSummary, ConnectionStatus, SyncStatus, SaveIndicator, UndoToast, ConflictBanner, MaintenanceNotice.

## 13.4 Interaction recipes

Document complete behavior recipes, not isolated components:
- search → filter → sort → inspect → act;
- create → validate → review → confirm → receipt;
- upload → progress → processing → preview → publish;
- invite → accept → assign role → revoke;
- select asset → crop → preview → approve → export;
- open archive → navigate timeline → read chapter → follow references;
- monitor job → inspect logs → retry/cancel → verify result;
- configure integration → test connection → reveal status → rotate/revoke credential;
- explore map → select layer → inspect point → open detail;
- notification → open source → mark read → manage preference.

Each recipe includes success, failure, cancellation, timeout, empty and permission-denied paths.

## 13.5 Premium finish standards

- Optical alignment is measured by visual balance, not only equal CSS spacing.
- Typography uses deliberate line length, rhythm, hierarchy, numeral alignment and truncation rules.
- Surfaces have controlled contrast and material response; avoid universal glassmorphism.
- Every interaction has immediate feedback, clear focus, stable hit target and interruptible motion.
- Responsive layouts are composed for each viewport, not merely shrunk.
- Loading never blocks access without a real reason.
- Artwork and media have intentional crops, focal points, and safe areas.
- Empty states explain what is absent and what action is possible.
- Error states explain recovery without exposing secrets or stack traces.
- Data-heavy interfaces support density modes without becoming generic dashboard grids.

## 13.6 Quality parity rule

A component catalog item is not a delivered capability. A capability is delivered only when its public API, accessibility, responsive states, skin recipes, tests, documentation, visual fixture and at least one real consuming workflow are complete.


---

## 13. Research-informed next frontier

The next evolution of Moon UI is not simply “more components”. It is a governed creative-interface platform informed by current HCI research, visual practice, and open-source tooling.

### New strategic capabilities
- **Intent-to-Interface Compiler:** translate a task into a structured model, semantic design brief, approved composition, and testable interface. Generated output remains inside semantic, accessibility, security, and world-identity constraints.
- **World Grammar Engine:** make each DNA a versioned grammar of composition, geometry, material, light, typography, motion, sound, iconography, and fallback behavior—not a palette switch.
- **Intent Lens:** temporarily reorganize approved blocks around a task, visibly state the active objective, and let users correct, pin, or reset the adaptation.
- **Evidence Surface:** show a concise AI outcome first, then sources, freshness, actions, uncertainty, disagreement, and audit detail. Never expose private chain-of-thought.
- **Scene Graph:** represent worlds, passages, destinations, timelines, media, and relationships independently of their spatial or linear rendering.
- **Creative Foundry with provenance:** govern logo, vector, icon, avatar, artwork, cover, motion, effects, and sound production with stable IDs, source masters, derivatives, licenses, approvals, and validation.
- **Experience Quality Observatory:** certify performance, accessibility, visual regression, asset health, route coverage, and maturity with measured evidence.

### Research principles added to the doctrine
1. Adaptation preserves user agency: steer, pause, revise, approve, reject, undo, and reset.
2. Transparency is progressive and task-sensitive; more process detail is not always more useful.
3. Generate from structured task and semantic models, not unbounded prompt-to-markup.
4. Spatial depth and visual cues must reduce ambiguity or communicate relationships.
5. Every immersive feature has a semantic 2D fallback and respects reduced motion.
6. WebGPU is optional progressive enhancement, never a baseline requirement.
7. Visual direction is not certified until it passes task, accessibility, performance, responsive, and visual-quality checks.

See [RESEARCH-AND-DIRECTION.md](./RESEARCH-AND-DIRECTION.md) for sources, limitations, and adoption policy. The expanded implementation contract is in [BLUEPRINT.md](./BLUEPRINT.md).

**The new ambition:** one functional engine, six authored worlds, adaptive task experiences, evidence-led AI collaboration, original media foundries, and measurable experience quality.
