---
title: "Design: Unified UI Hierarchy, Audio SFX & SDK API Architecture"
plan: "20261103-2116-master-ecosystem-unification"
date: "2026-11-03"
---

# Design Specification

## 1. UI Hierarchy & Atomic Taxonomy
`@moonwitness/ui` enforces the following layered architecture:

```
@moonwitness/ui
├── primitives/  --> Low-level headless wrappers over @base-ui/react (Dialog, Popover, Switch)
├── raw/         --> Unstyled state machines, hook primitives, canvas math
├── components/  --> Atomic styled UI elements (Button, Input, Card, Badge, Avatar)
├── blocks/      --> Assembled patterns (Navbar, Sidebar, SessionCard, AppLauncher)
├── sfx/         --> Procedural sound synthesis and tactile micro-animations
├── tokens/      --> Design constants (Empire Gold #F59E0B, Zinc 950 #09090B, radii, spacing)
└── css/         --> Global styles and Tailwind v4 theme definitions
```

### SFX Design Concept (Zero-Asset Procedural Audio)
Rather than loading bulky `.mp3` or `.wav` files over the network, `sfx/audio.ts` uses the browser's native **Web Audio API** (`AudioContext`) with oscillator waveforms to produce instant, zero-latency tactile feedback:
- `sfx.click()`: High-frequency 12ms dampened sine wave for tactile button press.
- `sfx.success()`: Rising dual-tone arpeggio (C5 to G5) for successful login/save.
- `sfx.revoke()`: Low resonant sawtooth tone for session invalidation.

## 2. Universal Client SDK API Contract (`@allah/sdk`)

```typescript
import { createClient } from '@allah/sdk';

export const sdk = createClient({
  baseUrl: process.env.NEXT_PUBLIC_ARSY_API_URL || 'http://localhost:5150',
});

// Authentication & Session Authority
const { user, sessionToken } = await sdk.auth.signIn({ email, password, deviceName });
const sessions = await sdk.auth.getSessions();
await sdk.auth.revokeSession(sessionId);
await sdk.auth.signOut();

// Smart LLM Gateway
const response = await sdk.router.chat({
  messages: [{ role: 'user', content: 'Audit codebase' }],
});

// SDUI Component Streaming
const uiSchema = await sdk.sdui.render('view.dashboard.main');
```

