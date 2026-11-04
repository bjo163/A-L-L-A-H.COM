# Design: Platform Capabilities Standardization

## High-Level Architecture

### Architecture Overview
This plan restructures the platform capabilities implementation around two interconnected systems:

1. **Skin System Standardization** - A deployment-wide skin integration layer that ensures all applications properly use the `@moonwitness/ui` SkinRoot component with valid skin IDs from the registry.

2. **Capability Implementation Framework** - A standardized pattern for implementing platform capabilities that ensures each capability has real code, verification evidence, and proper documentation.

### Component & Module Structure

#### Skin Integration Layer
```
packages/ui/src/skins/          (already exists - 6 skin definitions)
  ├── registry.ts               (already exists - skin IDs, tokens, identities)
  ├── root.tsx                  (already exists - SkinRoot component)
  └── index.ts                  (already exists - exports)

apps/                         (10 applications)
  ├── dock/                     (Next.js 16, port 3001)
  │   └── src/app/layout.tsx    (must wrap with SkinRoot)
  ├── gate/                     (Next.js 16, port 3000)
  │   └── src/app/layout.tsx    (must wrap with SkinRoot)
  ├── headquarter/              (Next.js 16, port 3002)
  │   └── src/app/layout.tsx    (must wrap with SkinRoot)
  ├── id/                       (Next.js 16, port 3003)
  │   └── src/app/layout.tsx    (must wrap with SkinRoot)
  ├── jizz/                     (Next.js 16, port 3004)
  │   └── src/app/layout.tsx    (must wrap with SkinRoot)
  ├── moonsky/                  (Next.js 16, port 3005)
  │   └── src/app/layout.tsx    (must wrap with SkinRoot)
  ├── harbor/                   (Next.js 16, port 3006)
  │   └── src/app/layout.tsx    (must wrap with SkinRoot)
  ├── arsy/                     (Fastify, port 5150)
  │   └── must integrate skin
  ├── sentinel/                 (RADIUS daemon)
  │   └── must integrate skin where applicable
  ├── server/                   (API server)
  │   └── must integrate skin where applicable
  └── dock/                     (Next.js 16, port 3001)
```

#### Capability Implementation Pattern
Each of the 11 DISCOVERED capabilities follows this pattern:
```
.plans/20261105-0000-platform-capabilities-standardization/
  └── capability-<n>/           (one dir per capability)
      ├── spec.md               (feature specification)
      ├── design.md             (technical & UX design)
      ├── task.md               (implementation breakdown)
      └── rule.md               (implementation rules & guardrails)
```

### Package Boundaries & Responsibilities

#### packages/ui
- Owns SkinRoot, skin registry, skin tokens
- Provides 6 pre-defined skin definitions
- No application should redefine skin tokens

#### packages/sdk
- Client↔hub communications
- Used by all applications

#### packages/types
- Shared contracts
- Used across all packages

#### apps/* (each application)
- Must wrap root with SkinRoot component
- Must declare valid skin ID from registry
- Must not define its own color/type variables
- Must target `--mw-*` tokens only via design-system utilities

### Data Models & Relationships

#### Skin Definition Model
```typescript
interface SkinDefinition {
  id: SkinId;           // from skinRegistry skinIds array
  name: string;
  signature: string;
  identity: SkinIdentity; // hero, emblem, themeColor
  tokens: SkinTokens;   // colors, typography, spacing, geometry, material, motion
}
```

#### Application-Skin Relationship
- Each app maps to exactly one skinId from the registry
- SkinId is resolved via `resolveSkinId()` (falls back to `defaultSkinId` = 'imperium-lumen')
- Skin tokens flow through `getSkinStyle()` to CSS custom properties `--mw-*`
- `data-moonframe-skin` attribute on SkinRoot indicates current skin

### API Contracts

No new APIs are introduced. The existing skin system APIs are used:
- `SkinRoot` component from `@moonwitness/ui`
- `getSkinStyle(skinDefinition)` returns CSSStyleDeclaration with `--mw-*` tokens
- `resolveSkinId(value)` validates and resolves skin ID
- `skinRegistry` contains all 6 skin definitions
- `skinIds` array contains valid skin identifiers

### Data Flow & System Interactions

1. Application wraps root with `<SkinRoot skin="imperium-lumen">` (or other skin Id)
2. SkinRoot resolves skinId via `resolveSkinId(skin)`
3. SkinRoot retrieves definition from `skinRegistry[skinId]`
4. SkinRoot calls `getSkinStyle(definition)` which returns `--mw-*` CSS custom properties
5. Root div receives these as inline `style` attributes and CSS classes `mw-skin-root`
6. All components inside use `--mw-*` tokens for colors, spacing, typography, etc.
7. `data-moonframe-skin` attribute on root enables targeting via `[data-moonframe-skin="imperium-lumen"]`

### UI/UX Flows & Design Specifications

#### Skin Selection Flow
1. App declares skin prop on SkinRoot (or omits for default)
2. `resolveSkinId()` validates the skin ID
3. If invalid, warning console and falls back to `imperium-lumen`
4. Definition retrieved from registry
5. `getSkinStyle()` generates `--mw-*` CSS variables
6. Application renders with correct tokens for that skin

#### Skin Consistency Across Routes
- Each app has a single SkinRoot at the layout level
- All pages within the app inherit the skin tokens
- No per-page skin switching (skin is app-level, not page-level)
- Hero artwork and emblem from skin identity are available at `/artwork/{skin}.png` and `/brand/emblem.svg`

### Integration Architecture

#### Skin Integration per Application
Each application needs:
1. Import SkinRoot from `@moonwitness/ui`
2. Wrap the app layout with `<SkinRoot>`
3. Pass a valid skinId prop or omit for default

#### Capability Integration
Each platform capability follows the same pattern:
1. spec.md defines what and why
2. design.md defines how and architecture
3. task.md breaks down implementation steps
4. rule.md enforces constraints and guardrails

### Error Handling & Failure Scenarios

#### Skin Integration Errors
- **Invalid skinId**: `resolveSkinId()` logs warning and falls back to default (`imperium-lumen`)
- **Missing SkinRoot**: Application renders without skin tokens; components using `--mw-*` may fall back or inherit
- **ThemeColor mismatch**: viewport.themeColor set from skin identity; if skin changes dynamically, color updates

#### Capability Implementation Errors
- Missing spec.md: Plan is incomplete, cannot be marked READY
- Missing design.md: Architecture unclear, implementation agent cannot proceed
- Missing task.md: No implementation roadmap, work cannot be sequenced
- Missing rule.md: No constraints enforced, potential for inconsistent implementation

### Security & Performance Considerations

#### Security
- Skin system is purely cosmetic (tokens, colors, typography)
- No authentication or authorization data in skin definitions
- Skin IDs are validated against whitelist (skinIds array)
- No external requests made during skin resolution

#### Performance
- Skin resolution is synchronous at render time
- Skin tokens are CSS custom properties - no runtime JavaScript overhead after initial resolution
- 6 predefined skins - no dynamic skin loading from external sources
- `getSkinStyle()` is a pure function - no allocations beyond CSS object

### Observability Strategy

#### Skin Observability
- `data-moonframe-skin` attribute on root element for debugging
- Console warning when invalid skinId falls back to default
- Skin token values available via `getComputedStyle()` for monitoring

#### Capability Observability
- Each capability has acceptance criteria that can be verified
- Quality gates (typecheck, lint:arch, docs:check, builds) serve as observability points
- report.md in each plan directory documents actual measured output

### Technical Decisions & Alternatives

#### Decision: Standardize on 6 Pre-defined Skins
**Rationale:** The skin registry already has 6 well-defined skins with complete token sets. Adding dynamic skin loading would introduce complexity without immediate benefit.

**Alternative Considered:** Dynamic skin loading from API
**Rejected:** Would require new API endpoints, authentication, versioning, and would break the write-once content-addressed storage invariant. The 6 existing skins cover the expressed needs (Imperium Lumen, Lunar Chronicles, Rocksoul, Nexus Paradox, Riot Anarchy, Mycelium).

#### Decision: Skin at Layout Level, Not Page Level
**Rationale:** Consistent skin across all routes of an application; simpler implementation; avoids per-page skin switching complexity.

**Alternative Considered:** Per-page skin switching
**Rejected:** Would require state management, URL parameters, and would create inconsistent experiences within an app. Skin is a world-level identity, not a per-page preference.

#### Decision: Three Evolve Loop Guardrails in AUTONOMOUS.md
**Rationale:** Directly addresses the identified problem of falsely VERIFIED capabilities without code.

**Alternative Considered:** Separate guardrail document
**Rejected:** Embedding in AUTONOMOUS.md is more visible and enforces at the policy level rather than as a separate document that might be ignored.

### Component Responsibility Matrix

| Component | Responsibility |
|-----------|---------------|
| `packages/ui/src/skins/registry.ts` | Skin IDs, tokens, identities, registry |
| `packages/ui/src/skins/root.tsx` | SkinRoot component, skin resolution |
| `packages/ui/src/skins/index.ts` | Exports |
| `apps/*/src/app/layout.tsx` | Wrap with SkinRoot, declare skinId |
| `BACKLOG.md` | Track capability statuses |
| `AUTONOMOUS.md` | Evolve loop guardrails |
| Each `.plans/*/spec.md` | Feature specification |
| Each `.plans/*/design.md` | Technical design |
| Each `.plans/*/task.md` | Implementation breakdown |
| Each `.plans/*/rule.md` | Rules & guardrails |

### Error Handling Summary

| Error Scenario | Handler | Result |
|----------------|---------|--------|
| Invalid skinId on SkinRoot | `resolveSkinId()` | Warning + fallback to `imperium-lumen` |
| SkinRoot not wrapped | Missing `--mw-*` tokens | Components use default or inherit |
| Capability spec.md missing | Planning gate | Plan not READY |
| Capability task.md missing | Planning gate | No implementation roadmap |
| Capability implemented without verification | Quality gate | Build/fail gates prevent merge |