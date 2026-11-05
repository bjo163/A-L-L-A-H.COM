---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-CORE-RULES"
version: "1.0.0"
owner: "engineering"
status: "approved"
---

# Package UI — Autonomous Execution Rules

## 1. Scope and authority
- Work only in `bjo163/A-L-L-A-H.COM/packages/ui` plus this plan's documentation and required parent-plan evidence updates.
- Use existing `dev` only. No branch creation, no branch switching, no `main`.
- The parent Moon UI master plan is the canonical source for repository-wide priorities and status.
- This plan owns the detailed package execution view. Synchronize PUI task state with mapped MU task state.
- Accepted six-DNA canon, `DESIGN.md`, `DECISIONS.md`, `DNA/00-ENGINE-CONTRACT.md`, `DNA/07-COMPONENT-MAPPING.md` and `DNA/08-QUALITY-GATES.md` take precedence over proposals.

## 2. Autonomous execution
- Execute ordinary, reversible, in-scope work without routine confirmation.
- Re-read current source, tests, exports, consumers and active plans before each task.
- If acceptance criteria are already met, run the proof and record evidence rather than rewriting code.
- If one task is blocked, isolate it and continue independent work.
- Stop only for missing credentials/permissions, paid service, unresolved legal rights, irreversible migration/deletion or production action outside scope.

## 3. No-duplicate rule
- Extend existing SkinRoot/SkinScope, six skin definitions, components, blocks, raw primitives, MotionFrame, VisualEffectsProvider, SkinLaboratory and procedural SFX engine.
- Do not create a second package, token authority, skin registry, icon library, motion provider, audio engine or asset manifest.
- Before adding a component, prove a real consumer workflow and distinct semantic/behavioral need.
- Do not create speculative catalogue items merely because they appear in the blueprint.
- Do not replace native-first behavior with a wholesale primitive-library migration.

## 4. Six DNA and creative canon
- Keep the six approved worlds: IMPERIUM LUMEN, LUNAR CHRONICLES, ROCKSOUL, NEXUS PARADOX, RIOT ANARCHY and MYCELIUM.
- Differentiate worlds through composition, geometry, material, typography, density, navigation, iconography and motion—not color alone.
- Preserve app mapping: Gate+Dock=Imperium; ID=Lunar; Harbor=ROCKSOUL; Headquarter=Nexus; MoonSky=Riot; JIZZ=Mycelium.
- Do not add SkinRoot to ARSY or SENTINEL backend runtimes.
- Never depict ALLAH or claim an asset represents ALLAH. Sacred/cosmic artwork has no faces; preserve ROCKSOUL's established unseen-face direction.
- Never print “HUD” as a visible product label.
- No generic card-wall dashboards, fake telemetry, invented status, decorative controls or arbitrary gradients/glow.

## 5. Technology and package boundaries
- Preserve React 19 and TypeScript/TSX package source contract; preserve ESM and current workspace conventions.
- Apps own routing, API calls, business data, permissions, persistence and app workflows.
- Components/blocks receive data and callbacks; no fetching or authorization inside the package.
- Keep semantic HTML and keyboard behavior first; add Base UI only for a proven gap.
- Add no dependency without maintenance, license, security, SSR, bundle, accessibility, fallback and test review.
- WebGL/WebGPU/3D are optional enhancements, never baseline requirements.
- Keep essential text/actions in DOM; provide static and linear fallbacks for spatial media.

## 6. Accessibility, motion and audio
- Verify WCAG AA contrast for text and meaningful controls.
- Ensure keyboard access, visible focus, screen-reader names, focus return and responsive reflow.
- Respect `prefers-reduced-motion`; it overrides manual effects settings.
- Motion is purposeful, interruptible and must not block interaction.
- Sound is opt-in/off by default and never the only information channel.
- All spatial interactions have a keyboard-accessible linear/list/tree alternative.
- Progress values must describe measurable real work.

## 7. Asset rights and provenance
- Every production asset must have source/master, stable ID, dimensions, checksum, license, provenance, variants, fallback and alt/decorative classification.
- Unknown or unlicensed assets cannot ship.
- Never overwrite approved masters with generated derivatives.
- Use original artwork and vector assets; no copied game, manga, film, album or poster artwork.
- Audio must be original/procedural or properly licensed.

## 8. Verification and reporting
- Use commands found in the live root/package manifests. Known UI checks: `pnpm ui:test`, `pnpm ui:contrast`.
- Test behavior, not implementation trivia. Never weaken tests to obtain a pass.
- Record failing baseline checks separately from regressions.
- A task requires paths, exact test/manual evidence, result and commit SHA or reason no commit was needed.
- Never claim implemented/tested/visually verified/integrated/certified/released from documentation or source existence alone.
- Update package docs, this task list, coverage matrix and parent task ledger when status changes.
