# GATE — Implementation Rules & Invariants

## Architectural Invariants (Enforced by @moonwitness/lint)

### 1. UI_PURITY — Mandatory @moonwitness/ui
**Rule:** Raw interactive/structural controls forbidden outside packages/ui.
| Forbidden | Required Replacement |
|---|---|
| `<button>` | `<Button>` (variants: default, gold, outline, ghost, destructive) |
| `<input>` | `<Input>` via `<FormField>` |
| `<select>` | `<Select>` |
| `<textarea>` | `<Textarea>` |
| `<a>` | `<Link>` or `<Button asChild>` |
| `<form>` | `<Form>` with `<FormField>` |
| `<label>` | `<FormField label="...">` |
| `<table>` | `<Table>` family |

**Exempt:** `packages/ui/`, `packages/vscode-extension/`

### 2. ZERO_ORM_OVERLAP
**Rule:** No Drizzle, Prisma, TypeORM, Mongoose imports anywhere.
**GATE Impact:** Frontend only — not applicable, but must not import.

### 3. UNIVERSAL_SDK_CLIENT
**Rule:** No direct `fetch()` in client apps. All API via `@allah/sdk`.
**GATE Implementation:**
```ts
// Correct
import { mwClient } from '@allah/sdk';
const { user } = await mwClient.auth.getCurrentUser();

// Forbidden
fetch('/api/user'); // lint:arch will fail
```

### 4. SHARED_DATA_CONTRACTS
**Rule:** No local redeclaration of shared entities. Import from `@moonwitness/types`.
**Shared Entities (must import):**
`UserSubject`, `ActiveSession`, `AuthResponse`, `ChatMessage`, `ChatCompletionRequest`, `ChatCompletionResponse`, `ChatCompletionChunk`, `GatewayModelInfo`, `GatewayTelemetry`, `GatewayProviderInfo`, `GatewayUsageLog`, `SDUINode`, `SDUIRoot`, `StorageItem`, `ToolParameter`, `ToolFunction`, `ToolDefinition`, `ToolCallFunction`, `ToolCall`, `ToolChoice`, `ToolResult`, `JsonRpcRequest`, `JsonRpcResponse`, `McpTool`, `McpToolsListResult`, `McpToolCallResult`, `IspPlanRecord`, `IspSubscriptionRecord`, `NexusNasRecord`, `NexusIpPoolRecord`, `SentinelAccountRecord`, `SentinelAccessDecision`, `SentinelSessionRecord`, `AgentThought`, `AgentToolCallEvent`, `AgentToolResultEvent`, `AgentSduiEvent`, `AgentStreamEvent`, `AgentStep`, `AgentRunRequest`, `AgentRunResponse`

### 5. TENANT_ISOLATION
**Rule:** Storage models via `defineModel` must have `company_id`.
**GATE Impact:** Not applicable (no storage models).

### 6. PARAMETERIZED_QUERIES
**Rule:** No SQL string interpolation in `.query()`/`.execute()`.
**GATE Impact:** Not applicable.

### 7. NO_SECRETS
**Rule:** No hardcoded API keys, tokens, passwords.
**Check:** Lint scans for patterns (sk_live_, ghp_, AKIA, etc.).
**GATE:** Use `NEXT_PUBLIC_*` env vars only; no secrets in code.

### 8. NO_DEBUGGER
**Rule:** No `debugger` statements in committed code.

### 9. TODO_FIXME_HACK
**Rule:** No blocking TODO/FIXME/HACK comments.
**Allowed:** `TODO: refactor`, `TODO: cleanup`, `TODO: minor`, `TODO: polish`, `TODO: placeholder`

### 10. ADDON_MANIFEST_CONSISTENCY
**Rule:** Every addon must have `__manifest__.json` with name, version and `index.ts`.
**GATE Impact:** Not an addon.

---

## Project-Specific Rules

### Next.js 16 Conventions
1. **Server Components by default** — no `'use client'` unless:
   - Browser APIs (`window`, `localStorage`, `IntersectionObserver`)
   - React hooks (`useState`, `useEffect`, `useRef`)
   - Event handlers (`onClick`, `onSubmit`)
   - `@moonwitness/ui` client components (Button, Link, etc.)

2. **Client Component Boundary** — wrap interactive islands minimally:
   ```tsx
   // page.tsx (Server Component)
   import { HeroArrival } from '@/components/hero-arrival'; // Client Component
   
   export default function HomePage() {
     return <HeroArrival />; // Only HeroArrival is client
   }
   ```

3. **Metadata Export** — every route:
   ```ts
   export const metadata: Metadata = {
     title: { default: 'A-L-L-A-H.COM | Gate', template: '%s | A-L-L-A-H.COM' },
     description: 'Public entrance to the Empire of the Light...',
   };
   ```

4. **Fonts** — `next/font/google` in layout, CSS variables on `<html>`:
   ```tsx
   const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
   const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });
   <html className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
   ```

5. **Images** — `next/image` with explicit dimensions or `fill`:
   ```tsx
   <Image src="/artwork/imperium-lumen.png" alt="" width={1600} height={900} priority className="hero-image" />
   ```

6. **Dynamic Params** — `params` is Promise:
   ```tsx
   export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
     const { slug } = await params;
   }
   ```

### Skin & Theme Rules
1. **IMPERIUM LUMEN only** — `SkinRoot skin="imperium-lumen"` at root layout
2. **No hardcoded colors** — use `var(--mw-*)` or component variants
3. **No arbitrary Tailwind colors** — semantic tokens only
4. **Reduced Motion** — `VisualEffectsProvider` at SkinRoot; respect `prefers-reduced-motion`

### Content & Integrity Rules
1. **Indonesian-first** — all visible text from `src/lib/catalog/id.json`; English in `en.json`
2. **No hardcoded strings** in components — use catalog keys
3. **Sacred Content Provenance** — every transmission requires:
   - `sourceType`: 'quran' | 'hadith' | 'historical' | 'personal' | 'fictional'
   - `reference`: exact (e.g., "Al-Fatihah 1:1-7" or "AngelWithShotgun Chapter 1")
   - `edition`/`translator` if scripture/historical
   - `author`, `date`
   - `rendering`: 'full' | 'excerpt' | 'paraphrase'
   - `status`: 'verified' | 'pending_review' | 'disputed'
4. **Honest Status Labels** — only: Available / Unavailable / Restricted / Planned / Draft
5. **No Fake Data** — zero invented metrics, counts, LIVE badges, testimonials

### Ecosystem Integration Rules
1. **Extend, Don't Fork** — add `gate` to `packages/ui/src/blocks/endpoints.ts` and `navbar.tsx`
2. **Cross-App Links** — use `resolveEcosystemEndpoints(process.env)` for all external app URLs
3. **Auth via SDK** — `mwClient.auth.getCurrentUser()`, `mwClient.auth.signOut()`
4. **No Direct ARSY Calls** — all backend via `@allah/sdk`

### Quality Gate Commands (Must Pass)
```bash
pnpm --filter @moonwitness/gate typecheck   # 0 errors
pnpm lint:arch                              # 100% pass
pnpm docs:check                             # 100/100
pnpm --filter @moonwitness/gate build       # Production build pass
```

### Git & Deployment Constraints
- **Branch:** `dev` only (never `main`)
- **No force-push**
- **No production deployment**
- **No DNS changes**
- **No env var modifications**
- **Preserve uncommitted user changes**
- **No secrets in commits** (lint enforces)

---

## Antislop Enforcement (Mode: DURING)

**Global preference:** `during` (from `%APPDATA%\antislop\settings.json`)

**Before every edit:** Verify technique passes purpose test:
1. What does this visual decision serve? (orientation, hierarchy, feedback, narrative)
2. Is it the minimal effective technique?
3. Does it respect reduced motion, contrast, keyboard access?
4. Is it distinguishable from generic SaaS defaults?

**Forbidden by Default (unless purpose documented):**
- Blue/purple gradients
- Glassmorphism on >2 elements
- Uniform border-radius on all elements
- Glow on >2 elements
- Background grids/noise without world-building purpose
- Repeated identical card layouts
- Fake metrics/LIVE badges/testimonials
- HUD labels, fake coordinates, decorative telemetry

**Required for Every Movement:**
- Distinct composition (not a template repeat)
- Semantic heading hierarchy
- Keyboard-accessible navigation
- Reduced-motion functional equivalent
- Honest loading/empty/error states

---

**These rules are non-negotiable. Violations detected by lint:arch or manual review must be fixed before commit.**