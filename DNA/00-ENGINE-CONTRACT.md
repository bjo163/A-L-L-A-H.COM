---
title: "MoonFrame Skin Engine Contract"
version: "1.0.0"
status: "approved"
last_verified: "2026-11-03"
owner: "architecture"
---

# MOONFRAME SKIN ENGINE — SHARED CONTRACT

## 1. Objective

Provide one reliable functional foundation that can express seven independent visual worlds without multiplying business logic, breaking application behavior, or reducing accessibility.

A skin is a complete design language, not a theme-color switch.

## 2. Separation of concerns

### Shared platform layer

Owns semantic behavior and stable contracts:

- component APIs and event behavior;
- keyboard interaction and focus management;
- accessible names, roles, and states;
- form validation and error semantics;
- data formatting and business rules;
- loading, empty, error, success, offline, and permission states;
- responsive behavior and performance budgets;
- application routing and authorization.

### Master DNA layer

Owns presentation and experiential composition:

- color, typography, spacing, scale, density, radii, borders, elevation;
- layout grammar and navigation metaphor;
- component recipes and visual variants;
- surfaces, textures, icons, illustration and image direction;
- motion, transitions, sound policy, and reduced-motion fallback;
- responsive composition for each world.

### Product layer

Owns product-specific information architecture, content, domain behavior, and canon. A product selects an approved DNA and may define documented product-specific compositions. It must not fork shared business logic for visual reasons.

## 3. Current repository compatibility

The current shared UI package is `../packages/ui/`, published internally as `@moonwitness/ui`. Its existing source uses Base UI primitives and Tailwind-oriented component recipes. Treat this as the observed baseline.

Implementation rules:

- inspect the current package source and app integrations before coding;
- extend existing exports rather than creating a parallel component library;
- retain the current primitive and package contracts unless a separately reviewed architecture decision changes them;
- use shadcn/ui conventions where compatible with the existing implementation;
- do not add Radix, another component framework, a second token engine, or a new animation dependency without evidence and an explicit decision;
- do not copy app-local components into a second shared library.

## 4. Skin selection and runtime contract

The implementation may use a typed skin registry and a root skin identifier (for example, a data attribute), but the exact API must be confirmed against existing app composition before coding.

Minimum runtime requirements:

- one explicit, validated skin identifier;
- deterministic fallback to a safe default when the identifier is missing or invalid;
- no untrusted CSS or arbitrary class injection from user input;
- no cross-skin state leakage;
- stable semantic component props;
- no hydration mismatch caused by client-only skin detection;
- preference persistence only after the application has an agreed settings and consent model;
- SSR and initial render must agree on the selected skin.

Do not hard-code seven unrelated copies of the same page. Do not force all seven worlds into one shared layout either. Share primitives; specialize compositions.

## 5. Token domains

Every DNA must declare values or rules for:

- color roles: canvas, surface, elevated surface, text, muted text, border, accent, status, focus;
- typography: display, heading, body, label, numeric, code, line-height, tracking, measure;
- spacing and density: compact, comfortable, spacious, section rhythm;
- geometry: corner treatment, line weight, clipping, shape vocabulary;
- depth and material: flat, paper, metal, glass, film, membrane, or architectural mass;
- motion: entrance, exit, feedback, ambient movement, duration, easing, reduced motion;
- responsive behavior: wide, medium, narrow, touch, and low-capability modes;
- component recipes: actions, navigation, surfaces, forms, data, overlays, feedback.

Avoid encoding all roles into a single color variable. Semantic roles must remain consistent within each skin.

## 6. Motion, sound, and assets

- Motion must communicate state, hierarchy, spatial continuity, or feedback.
- Ambient animation must never be required to understand content.
- Respect `prefers-reduced-motion`; provide a useful non-animated equivalent.
- Do not autoplay audio. Sound effects must be optional, controllable, and muted by default.
- Provide poster/static fallbacks for expensive 3D, shader, video, or canvas effects.
- Lazy-load large assets and avoid blocking primary interactions.
- Use original, commissioned, or properly licensed fonts, images, textures, audio, and 3D assets.

## 7. Accessibility and resilience

Each skin must preserve semantic HTML, keyboard access, visible focus, sufficient contrast, screen-reader labels, reduced motion, zoom/reflow, and touch target requirements. Visual experimentation cannot turn essential controls into image-only or pointer-only interactions.

Critical content must remain available when WebGL, canvas, animation, audio, or remote assets fail. Use progressive enhancement.

## 8. Explicit exclusions

- No generic dashboard grid copied across all seven skins.
- No universal glassmorphism, neon, gradient, blur, round-card, or glow treatment.
- No decorative HUD around ordinary forms without a task reason.
- No intentional illegibility for primary labels, data, or controls.
- No fake progress, fake telemetry, fabricated astronomical values, or simulated operational status presented as real.
- No divine depiction, anthropomorphic divine imagery, or claim that a design depicts ALLAH.
- No unauthorized copying of recognizable game, manga, music, or brand assets.

## 9. Change control

Any change to a Master DNA requires:

1. a documented reason and affected world;
2. a before/after visual comparison;
3. review against the relevant world-specific exclusions;
4. accessibility and responsive checks;
5. an update to the owning DNA document;
6. evidence in the implementation report.

Shared behavior changes require review of all seven skins. A product may not silently redefine a Master DNA locally.
