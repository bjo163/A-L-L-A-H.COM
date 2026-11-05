---
title: "Six-world premium visual transformation"
version: "1.0.0"
status: superseded
owner: "product-design"
---

# Six-world premium visual transformation

## Motivation

The approved DNA documents define six distinct worlds, but current runtime proof is primarily token and component variation. The user authorized a full implementation across all six skins and consuming apps, with funky, premium, high-detail vector artwork and purposeful motion.

## Scope

- Add original, scalable vector artwork for all six DNA worlds in the shared UI package.
- Strengthen world-specific hero and surface compositions without replacing semantic component contracts.
- Apply the correct DNA at app roots and on route-specific worlds where an app hosts more than one world.
- Align Gate with IMPERIUM LUMEN, as requested, and document the Dock/Gate shared-world exception to the one-unique-skin-per-app lint rule.
- Correct the skin documentation and validation evidence to match runtime behavior.
- Preserve accessible controls, data semantics, reduced-motion behavior, and mobile reflow.

## Architecture requirements

- `@moonwitness/ui` remains the sole owner of shared skin tokens, composition, artwork, and recipes.
- Vector scenes are original inline SVG, resolution-independent, decorative to assistive technology, and do not claim to depict ALLAH or copy protected visual works.
- `SkinScope` is a presentation-only nested scope for a route inside an app with a different default DNA. It must not create another independent visual-effects state provider.
- Root skin uniqueness remains enforced except for the explicit IMPERIUM LUMEN pairing of Gate and Dock. Route scopes do not claim additional app roots.
- Motion is stateful and optional, paused by default, disabled for reduced-motion preferences, and remains understandable as a static image.
- Hero compositions use world-specific proportions, framing, and surface recipes rather than palette-only changes.

## Acceptance criteria

- [ ] Six original vector scenes render at 1600x900 viewBox with no external asset dependency.
- [ ] All six DNA IDs have a distinctive composition recipe beyond color and radius.
- [ ] Gate and Dock use IMPERIUM LUMEN; ID uses LUNAR CHRONICLES; Headquarter uses NEXUS PARADOX; Observatory defaults to MYCELIUM; ROCKSOUL and RIOT routes use explicit route scopes.
- [ ] Existing shared UI and per-app type/build checks pass.
- [ ] Contrast checks include every token pair used for normal text and non-text controls; no normal text pair falls below 4.5:1.
- [ ] Keyboard behavior, focus visibility, 44px touch targets, and reduced-motion behavior remain intact.
- [ ] Skin Laboratory can exercise every skin with equivalent content and a real interactive task.
- [ ] Canonical DNA docs accurately state the implementation and verification status.
- [ ] Browser review covers all six skins at desktop and narrow viewport; any blocked verification is reported.


---

## Execution disposition — 2026-11-05

The initial six-world runtime foundation is retained as existing implementation evidence. This plan is no longer an independent execution queue.

- Preserve completed work: six registered skins, initial six vector scenes, SkinScope, first hero recipes, root mapping and initial motion/contrast improvements.
- Do not rebuild or duplicate these capabilities.
- Residual fresh verification is tracked by MU-0011–MU-0020 and MU-0901–MU-0929.
- Further art/composition expansion is tracked by MU-0414–MU-0435 and MU-0601–MU-0617.
- Continue execution only through `.plans/20261105-moon-ui-master-consolidation/`.
