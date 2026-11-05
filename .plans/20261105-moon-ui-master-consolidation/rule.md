---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MOON-UI-MASTER-RULES"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
---

# Moon UI — Autonomous Agent Rules

These rules are mandatory for every local AI agent executing this plan.

## 1. Authority and repository safety

1. Work only in `bjo163/A-L-L-A-H.COM`.
2. Work only on the already-existing `dev` branch. Never create a branch, worktree branch or temporary feature branch.
3. Never modify `main`, tags, release branches or production deployment configuration.
4. Before each task, fetch the latest `dev` head and inspect `git status`.
5. Preserve all pre-existing local modifications. Do not use `git reset --hard`, `git clean`, force checkout, force push, or destructive rebases.
6. If the local branch is behind remote, fast-forward only when the worktree is clean. If it is dirty or diverged, preserve changes and record a blocker; do not overwrite user work.
7. Commit coherent, independently passing task groups directly to `dev`. Use conventional commit messages. Push only fast-forward updates.
8. Do not claim a push, CI pass, build pass or visual review unless the operation actually succeeded and evidence is recorded.

## 2. No-confirmation autonomous execution

The owner has authorized autonomous execution of all ordinary, in-scope, reversible tasks in `task.md`.

- Do not ask for routine confirmation, design preference, file choice or implementation approval.
- Follow accepted DNA, decisions, mappings, current code conventions and this plan.
- For unspecified low-risk details, choose the smallest reversible implementation consistent with the architecture. Record the decision and continue.
- Do not stop the overall plan because one task is blocked. Isolate the blocked task and continue independent work.
- Do not ask the owner to resolve a conflict that can be resolved by the documented precedence. Record the conflict and follow the higher-precedence source.
- Do not create new product scope to make a task appear complete.

A task may be marked `[!]` only when it genuinely requires missing secrets/credentials, a paid external service, external account permission, uncertain legal rights, irreversible data deletion/migration, production DNS/deployment, or a user-owned external action. Record exact evidence and continue other tasks.

## 3. No-duplicate implementation rule

Before creating a component, block, primitive, skin, asset, generator, test, lab or helper:

1. Search current source, exports, package subpaths, tests, app consumers and active plans.
2. Identify the existing owner and public API.
3. Decide whether to reuse, extend, deprecate or replace.
4. Prefer extension over a second implementation.
5. Add no parallel package, token source, component system, icon library, sound engine, asset manifest or visual-effects provider.
6. If the capability already meets its acceptance criteria, run its proof and mark the task complete with evidence; do not rewrite it.
7. If an existing implementation is partial, write down the exact missing acceptance criterion before editing.
8. Do not keep two active plans for the same deliverable. Transfer tasks and mark the predecessor superseded.

## 4. Canon and identity rules

- The six worlds are IMPERIUM LUMEN, LUNAR CHRONICLES, ROCKSOUL, NEXUS PARADOX, RIOT ANARCHY and MYCELIUM.
- Six worlds must differ in composition, shape, material, typography, density, navigation, iconography and motion—not just palette.
- Preserve the approved app mapping in `spec.md`. A route-level `SkinScope` is allowed only where canonical and must not add a second effects provider.
- Gate and Dock use Imperium; ID Lunar; Harbor ROCKSOUL; Headquarter Nexus; MoonSky Riot; JIZZ Mycelium.
- ARSY and SENTINEL are backend/service runtimes, not frontend SkinRoot consumers.
- The approved Imperium reference palette and typography are explicit in `spec.md`. Do not force these tokens onto other DNA.
- Never depict ALLAH, create an avatar/stand-in for ALLAH, or imply an image represents ALLAH.
- Cosmic/sacred narrative artwork has no faces. Preserve ROCKSOUL's unseen-face/back-view direction wherever a human figure is explicitly required.
- Do not print the word “HUD” as a visible interface label.
- No fabricated telemetry, coordinates, progress, activity, astronomy, AI work, network links, metrics or statuses.
- Never use copyrighted game, manga, album, film, logo or poster art as a source to imitate or reproduce.

## 5. Architecture and technology rules

- `@moonwitness/ui` is the only shared visual/interaction authority.
- Keep existing React 19 and TypeScript/TSX package source contract. Do not rewrite UI package source to JavaScript.
- Keep application/backend implementation conventions already present in the repository; this UI plan does not change Fastify/ARSY or other backend stacks.
- Apps own routes, business logic, API access, authorization, persistence and app-specific data.
- Shared UI components receive data and callbacks; they do not fetch app business data or enforce authorization.
- One token source: SkinRoot/skin registry → theme mapping → skin recipes.
- No app-local palette, typography system, theme variables or duplicate shared components.
- Native-first semantics. Do not migrate the primitive system wholesale.
- Keep icon library imports inside the shared Icon component.
- Components and blocks must use stable public exports and documented props.
- Do not use private `mw-*` implementation selectors in apps.

## 6. Dependency and rendering rules

Before adding a dependency, document:
- exact requirement not met by current platform/source;
- active maintenance and release history;
- license and security posture;
- React/Next.js/SSR compatibility;
- minified and compressed bundle impact;
- tree-shaking behavior;
- accessibility behavior;
- fallback if unavailable;
- test and build evidence.

No dependency is added merely because it is trending, popular on GitHub or shown in a Dribbble shot.

- Prefer CSS/SVG and semantic DOM.
- Use original pre-rendered media for complex scenes.
- WebGL/WebGPU/Three/R3F/Drei/Postprocessing/Theatre are optional, only after a task-level case and device fallback are proven.
- Never make WebGPU a baseline requirement.
- Avoid unbounded SVG filters, excessive particles, continuous large blur, layout thrashing and high-cost mobile effects.
- Use responsive assets and lazy loading; do not send oversized desktop art to mobile.
- All essential text, actions and data remain in the DOM.

## 7. Accessibility, agency and data truth

- WCAG AA contrast for text and meaningful controls.
- Keyboard operation, visible focus, correct focus return, screen-reader names and semantics.
- Touch targets meet the established project standard.
- Respect `prefers-reduced-motion`; it overrides manual visual-effect settings.
- Motion can be paused/interrupted and never blocks interaction.
- Sound is off by default and never required.
- Every spatial interaction has an equivalent linear/list/table/tree path.
- Loading/progress must describe a real operation; progress values must be measurable.
- Stale, unavailable, empty, denied and error states are explicit.
- AI/LLM-generated input is untrusted; validate against a bounded schema.
- Never expose private chain-of-thought, secrets or credentials in Evidence Surface or quality UI.
- Intent Lens must not profile sensitive traits or silently remove critical context.
- Avatar creation is explicit, user-triggered, replaceable and removable.

## 8. Asset and licensing rules

- Every shipped asset has a stable ID, source/master, owner, license, provenance, dimensions, checksum, variants, fallback and alt/decorative classification.
- Unknown/unlicensed assets cannot be shipped.
- Prefer original SVG/CSS for UI geometry.
- Retain editable masters; never upscale a small image and call it 4K.
- Do not overwrite an approved master with a generated derivative.
- Raster generation must be original and provenance must be recorded.
- No faces in cosmic/sacred art; no depiction of ALLAH.
- Audio must be original/procedural or properly licensed. Never use copyrighted music as an SFX preview.

## 9. Task and evidence rules

- Each task should be a small change with one clear outcome and focused verification.
- Split a task if it crosses independent subsystems, apps or decisions.
- Each completed task requires: changed paths, exact command/manual check, result, and commit SHA or reason no commit was needed.
- Tests must verify behavior, not implementation trivia.
- Never weaken or delete a test merely to get a green result.
- Existing unrelated failures must be reported separately and not attributed to the current task.
- Do not mark `VERIFIED` or `CERTIFIED` from documentation, mockups or source existence alone.
- Status meanings: APPROVED ≠ SPECIFIED ≠ IMPLEMENTED ≠ TESTED ≠ VISUALLY VERIFIED ≠ INTEGRATED ≠ CERTIFIED ≠ RELEASED.

## 10. Documentation and plan rules

- Keep `README.md` concise and factual; keep complete requirements in `BLUEPRINT.md`.
- `RESEARCH-AND-DIRECTION.md` records sources, limits, adoption/defer/reject decisions; research is not an implementation claim.
- DNA mapping records actual public API and status.
- DECISIONS.md contains accepted architecture decisions only; do not put routine implementation choices there.
- BACKLOG.md is the canonical actionable backlog; ROADMAP.md remains strategic.
- Update plan task statuses and coverage matrix as evidence changes.
- Do not create generic or empty plans.
- Do not create child plans for tasks already listed here.
- If a new independent scope is discovered, first finish or disposition this plan's relevant work; then add a concrete spec only if it truly has a separate owner/lifecycle.

## 11. Prohibited actions

- No new Git branch.
- No changes to `main`.
- No force push or destructive git commands.
- No production deployment, DNS, proxy, certificate or release action.
- No secrets in code, tests, reports, prompts or screenshots.
- No paid API/service or external asset licensing purchase.
- No new standalone app or backend service as part of Moon UI.
- No duplicate app/domain workflow inside the UI package.
- No arbitrary executable markup generation.
- No fabricated quality metrics or fake success indicators.
- No unlicensed or copied media.
- No broad refactor unrelated to an acceptance criterion.

## 12. Completion gate

Before final completion:
1. All applicable task IDs have evidence and a truthful status.
2. Coverage matrix has no unexplained requirement.
3. No active duplicate predecessor plan remains.
4. All relevant UI, contrast, architecture, lint, typecheck, docs and frontend app builds have exact recorded results.
5. Visual/accessibility evidence covers all six worlds and required states/viewports.
6. Docs and implementation agree.
7. Final changes are committed to `dev` and remote head is verified.
8. `main` remains untouched.
