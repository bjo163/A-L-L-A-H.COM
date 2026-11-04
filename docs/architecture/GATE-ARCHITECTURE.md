# GATE — Architecture Specification

**Project:** A-L-L-A-H.COM GATE / Empire Gateway  
**App Directory:** `apps/gate`  
**Runtime:** Next.js 16 (App Router), React 19, TypeScript 5.8 strict  
**Package Manager:** pnpm 12.16.1 (workspace)  
**Port:** 3000 (dev)  
**Status:** SPECIFIED  
**Owner:** Architecture / Engineering  
**Last Verified:** 2026-11-04

---

## 1. Monorepo Integration

### 1.1 Workspace Configuration
- **Root:** `pnpm-workspace.yaml` includes `apps/*`, `packages/*`
- **Package name:** `@moonwitness/gate`
- **Dependencies (workspace:*):**
  - `@moonwitness/ui` — mandatory for all UI controls
  - `@allah/sdk` — mandatory for all client↔hub communication
  - `@moonwitness/types` — mandatory for shared contracts
- **Dev Dependencies:** `next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@tailwindcss/turbopack`, `@types/*`

### 1.2 Required Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "typecheck": "tsc --noEmit"
  }
}
```

### 1.3 TypeScript Configuration
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@moonwitness/ui/*": ["../../packages/ui/src/*"],
      "@moonwitness/ui": ["../../packages/ui/src/index.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]
}
```

---

## 2. Next.js 16 Conventions (Breaking Changes)

### 2.1 App Router Patterns
- **Server Components by default** — no `'use client'` unless interactivity needed
- **Client Components** — only for: interactivity, browser APIs, `useState`, `useEffect`, event handlers
- **Metadata Export** — `export const metadata: Metadata = { ... }` in each route layout/page
- **Fonts** — `next/font/google` in layout, CSS variables applied to `<html>`
- **Images** — `next/image` with `priority` for hero, `fill` or explicit dimensions, `alt` descriptive/empty
- **Cache** — `cacheComponents: true`, `partialPrefetching: true` in `next.config.ts`
- **Dynamic Params** — `params` is Promise in Next 16: `const { slug } = await props.params`

### 2.2 Special Files (App Router)
| File | Purpose |
|---|---|
| `layout.tsx` | Root layout, SkinRoot, fonts, metadata, providers |
| `page.tsx` | Route page (Server Component unless interactive) |
| `loading.tsx` | Streaming loading UI (Suspense boundary) |
| `error.tsx` | Error boundary UI |
| `not-found.tsx` | 404 UI |
| `globals.css` | Tailwind v4 + skins.css import + custom styles |

### 2.3 Turbopack Config (next.config.ts)
```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" },
    },
  },
};
export default nextConfig;
```

---

## 3. Application Structure

```text
apps/gate/
├── package.json
├── tsconfig.json
├── next.config.ts
├── next-env.d.ts
├── eslint.config.mjs
├── components.json (shadcn config)
├── public/
│   ├── artwork/
│   │   └── imperium-lumen.png (reuse from dock)
│   └── brand/
│       └── emblem.svg (to create)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root: SkinRoot, fonts, metadata, providers
│   │   ├── globals.css         # Tailwind + skins.css + custom
│   │   ├── page.tsx            # Home (Movement 01 + 08)
│   │   ├── loading.tsx         # Global loading
│   │   ├── error.tsx           # Global error
│   │   ├── not-found.tsx       # Global 404
│   │   ├── universe/
│   │   │   └── page.tsx        # Movement 02
│   │   ├── explore/
│   │   │   └── page.tsx        # Movement 03
│   │   ├── transmissions/
│   │   │   ├── page.tsx        # Movement 04 (list)
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Transmission detail
│   │   ├── discover/
│   │   │   └── page.tsx        # Movement 05
│   │   ├── community/
│   │   │   └── page.tsx        # Movement 06
│   │   ├── journey/
│   │   │   └── page.tsx        # Movement 07
│   │   ├── about/
│   │   │   └── page.tsx        # Information page
│   │   ├── sources/
│   │   │   └── page.tsx        # Information page
│   │   └── privacy/
│   │       └── page.tsx        # Information page
│   ├── components/
│   │   ├── gate-navbar.tsx     # EcosystemNavbar wrapper (currentApp="gate")
│   │   ├── hero-arrival.tsx    # Movement 01 composition
│   │   ├── universe-map.tsx    # Movement 02 composition
│   │   ├── explore-index.tsx   # Movement 03 composition
│   │   ├── transmissions-feed.tsx # Movement 04 composition
│   │   ├── discover-filters.tsx # Movement 05 composition
│   │   ├── community-portal.tsx # Movement 06 composition
│   │   ├── journey-next.tsx    # Movement 07 composition
│   │   ├── closing-horizon.tsx # Movement 08 composition
│   │   ├── transmission-card.tsx
│   │   ├── destination-card.tsx
│   │   ├── story-world-card.tsx
│   │   └── info-page-shell.tsx # Shared layout for about/sources/privacy
│   ├── lib/
│   │   ├── content-manifest.ts # Typed content manifest loader
│   │   ├── auth.ts             # mwClient auth helpers
│   │   └── utils.ts            # cn, etc.
│   ├── content/
│   │   └── manifest.json       # Content manifest (adapts XV schema)
│   └── styles/
│       └── gate.css            # Movement-specific styles (CSS vars)
```

---

## 4. Shared Package Integration

### 4.1 @moonwitness/ui (Mandatory)
**Exports used:**
- Components: `Button`, `Link`, `Badge`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Input`, `Select`, `Textarea`, `Form`, `FormField`, `Dialog`, `Table`, `Avatar`
- Blocks: `EcosystemNavbar`, `resolveEcosystemEndpoints`, `MotionFrame`, `SoundToggle`, `VisualEffectsToggle`
- Primitives: `VisualEffectsProvider`, `RawContainer`, `RawSection`, `RawStack`, `RawCluster`, `RawGrid`
- Skins: `SkinRoot`, `skinRegistry`, `getSkinStyle`, `resolveSkinId`, `skinIds`, `type SkinId`
- Tokens: `tokens`, `defaultSkinId`
- SFX: `sfx`

**UI_PURITY Lint Rules (Enforced):**
- No raw `<button>`, `<input>`, `<select>`, `<textarea>`, `<a>`, `<form>`, `<label>`, `<table>`
- No hand-written `mw-*` class names
- No local type redefinitions of shared entities

### 4.2 @allah/sdk (Mandatory)
**Auth Surface:**
```ts
import { mwClient } from '@allah/sdk';

// Session check
const { user } = await mwClient.auth.getCurrentUser();

// Sign out
await mwClient.auth.signOut();

// Register
await mwClient.auth.register({ email, password, name });

// Sign in
await mwClient.auth.signIn({ email, password, deviceName });
```

**Configuration:** `mwClient` uses `NEXT_PUBLIC_ARSY_URL` or defaults.

### 4.3 @moonwitness/types (Mandatory)
**Shared Entities (must import, not redefine):**
`UserSubject`, `ActiveSession`, `AuthResponse`, `ChatMessage`, `ChatCompletionRequest`, `ChatCompletionResponse`, `ChatCompletionChunk`, `GatewayModelInfo`, `GatewayTelemetry`, `GatewayProviderInfo`, `GatewayUsageLog`, `SDUINode`, `SDUIRoot`, `StorageItem`, `ToolParameter`, `ToolFunction`, `ToolDefinition`, `ToolCallFunction`, `ToolCall`, `ToolChoice`, `ToolResult`, `JsonRpcRequest`, `JsonRpcResponse`, `McpTool`, `McpToolsListResult`, `McpToolCallResult`, `IspPlanRecord`, `IspSubscriptionRecord`, `NexusNasRecord`, `NexusIpPoolRecord`, `SentinelAccountRecord`, `SentinelAccessDecision`, `SentinelSessionRecord`, `AgentThought`, `AgentToolCallEvent`, `AgentToolResultEvent`, `AgentSduiEvent`, `AgentStreamEvent`, `AgentStep`, `AgentRunRequest`, `AgentRunResponse`

---

## 5. Ecosystem Integration

### 5.1 Extended Endpoints (packages/ui/src/blocks/endpoints.ts)
**Add to DEV_PORTS:**
```ts
const DEV_PORTS = {
  dock: 3001,
  headquarter: 3002,
  id: 3003,
  jizz: 3004,
  gate: 3000,  // NEW
};
```

**Extend EcosystemAppEndpoints:**
```ts
export interface EcosystemAppEndpoints {
  dock: string;
  headquarter: string;
  id: string;
  jizz: string;
  gate: string;        // NEW
  accountPath: string;
  signInPath: string;
  registerPath: string;
}
```

### 5.2 Extended EcosystemNavbar
**Update currentApp union:**
```ts
currentApp?: 'dock' | 'headquarter' | 'id' | 'jizz' | 'gate';
```

**Add Gate link in nav:**
```tsx
<a href={endpoints.gate} className="mw-navbar__link" aria-current={currentApp === 'gate' ? 'page' : undefined}>
  Gate (Entrance)
</a>
```

### 5.3 Cross-App Navigation Flow
| From GATE | To | Method |
|---|---|---|
| Universe → MoonWitness | `/stories`, `/transmissions` | `Link href={endpoints.moonwitness || '/stories'}` |
| Universe → Dock | `/account` | `Link href={endpoints.dock + endpoints.accountPath}` |
| Universe → Cockpit | `/cockpit` | `Link href={endpoints.cockpit}` (mark unavailable if not implemented) |
| Universe → Headquarter | `/command-center` | `Link href={endpoints.headquarter}` (restricted label) |
| Navbar Sign In | ID app `/login` | `Link href={endpoints.id + endpoints.signInPath}` |
| Navbar Register | ID app `/register` | `Link href={endpoints.id + endpoints.registerPath}` |

---

## 6. Data & Content Architecture

### 6.1 Content Manifest (JSON, typed)
```ts
// src/content/manifest.json → loaded at build time
interface GateManifest {
  schema: string;
  site: { name: string; descriptor: string; universe: string; headline: string; tagline: string };
  navigation: NavItem[];
  worlds: StoryWorld[];
  transmissions: Transmission[];
  destinations: Destination[];
}
```

### 6.2 i18n Catalogs
- `src/lib/catalog/id.json` — Indonesian (default)
- `src/lib/catalog/en.json` — English
- All visible text from catalogs; no hardcoded strings in components

### 6.3 Sacred Content Provenance Type
```ts
interface SacredProvenance {
  sourceType: 'quran' | 'hadith' | 'historical' | 'personal' | 'fictional';
  reference: string;           // e.g., "Al-Fatihah 1:1-7"
  edition?: string;            // e.g., "King Fahd Complex 1420H"
  translator?: string;
  rendering: 'full' | 'excerpt' | 'paraphrase';
  status: 'verified' | 'pending_review' | 'disputed';
}
```

---

## 7. Quality Gates (Commands)

### 7.1 Local Verification
```bash
# From repo root
pnpm --filter @moonwitness/gate typecheck   # 0 errors required
pnpm lint:arch                              # 100% pass required
pnpm docs:check                             # 100/100 required
pnpm --filter @moonwitness/gate build       # Production build pass
```

### 7.2 CI Integration (.github/workflows)
- Add `gate` to matrix in existing workflows (typecheck, lint, build)
- Ensure `pnpm --filter @moonwitness/gate build` runs in Docker build context

---

## 8. Security & Invariants (from AGENTS.md)

| Invariant | Enforcement |
|---|---|
| **Storage** | SHA-256 content-addressed, write-once — not applicable (GATE is frontend) |
| **SQL** | Parameterized only — not applicable (no direct DB) |
| **Tenant** | `company_id` on every row — not applicable |
| **ORM** | Embedded PGlite via @allah/arsy-orm only — not applicable |
| **Retention** | Fail-closed on legal_hold/retention_until — not applicable |
| **SSRF** | Validate base_url before upstream — @allah/sdk handles |
| **UI Purity** | @moonwitness/lint blocks raw controls |
| **Universal SDK** | @allah/sdk only for API calls |
| **Shared Types** | @moonwitness/types only for contracts |
| **No Secrets** | Lint scans for hardcoded keys/tokens |

---

## 9. Deployment Constraints (Non-Negotiable)

- **No production deployment** — local dev only
- **No DNS changes** — localhost:3000 only
- **No env var changes** — use existing `.env.example` pattern
- **No dev→main merge** — stay on `dev`
- **No release publishing** — implementation only
- **Coolify/GitHub Actions** — not triggered by this work

---

## 10. File Ownership (Documentation Contract)

| Document | Owner | Updated by GATE Work |
|---|---|---|
| `docs/product/GATE-PRODUCT-SPEC.md` | product-design | Yes (this file) |
| `docs/design/GATE-DESIGN-SYSTEM.md` | product-design | Yes |
| `docs/architecture/GATE-ARCHITECTURE.md` | architecture | Yes (this file) |
| `docs/content/GATE-CONTENT-MAP.md` | content | Yes |
| `docs/implementation/GATE-IMPLEMENTATION-REPORT.md` | engineering | Yes (after implementation) |
| `docs/audits/GATE-LEGACY-RECONCILIATION.md` | engineering | Yes (audit report) |
| Root docs (README, BLUEPRINT, DESIGN, etc.) | various | Only if GATE changes project-wide boundaries |

---

**End of Architecture Specification**