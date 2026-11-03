# Design: Quality Gate Tightening

## Architecture

### Type-Checking Pipeline
```
pnpm typecheck
  → scripts/typecheck.ts
    → iterates all tsconfig.json files in packages/*, apps/*
    → runs `tsc --noEmit --project <path>` for each
    → aggregates exit codes; fails on first error
```

### Lint Pipeline
```
pnpm lint:arch
  → packages/lint/src/check-architecture.mjs
    → AST-based parsing with @typescript-eslint/parser
    → rules: UI_PURITY, ZERO_ORM_OVERLAP, UNIVERSAL_SDK_CLIENT,
        SHARED_DATA_CONTRACTS, TENANT_ISOLATION, PARAMETERIZED_QUERIES,
        NO_SECRETS, NO_DEBUGGER, TODO_FIXME_HACK, CIRCULAR_DEPENDENCY,
        ADDON_MANIFEST_CONSISTENCY

pnpm lint
  → eslint with root eslint.config.mjs
    → extends @moonwitness/lint/src/index.js flat config
    → scans all .ts/.tsx/.js/.mjs files excluding node_modules, dist, .next
```

### tsconfig Inheritance
```
tsconfig.base.json (canonical strict base)
  ├─ packages/arsy-orm/tsconfig.json (extends base)
  ├─ packages/arsy-core/tsconfig.json (extends base)
  ├─ packages/arsy-plugin-*/tsconfig.json (extends base)
  ├─ packages/types/tsconfig.json (extends base)
  ├─ packages/sdk/tsconfig.json (extends base)
  ├─ packages/ui/tsconfig.json (extends base)
  ├─ packages/lint/tsconfig.json (extends base)
  ├─ packages/sentinel-radius/tsconfig.json (extends base)
  ├─ packages/vscode-extension/tsconfig.json (extends base)
  ├─ apps/arsy/tsconfig.json (extends base)
  ├─ apps/dock/tsconfig.json (extends base)
  ├─ apps/headquarter/tsconfig.json (extends base)
  ├─ apps/id/tsconfig.json (extends base)
  ├─ apps/jizz/tsconfig.json (extends base)
  ├─ apps/web/tsconfig.json (extends base)
  └─ addons/*/tsconfig.json (extends base)
```

### Husky Hooks
```
pre-commit:
  1. pnpm docs:check          → Documentation contract (100/100)
  2. pnpm lint                 → ESLint code-style gate
  3. pnpm lint:arch            → Architectural invariant gate
  4. pnpm typecheck            → Strict TypeScript gate

pre-push:
  1. pnpm typecheck            → Re-verify all TS
  2. pnpm dock:build           → Next.js app build
  3. pnpm headquarter:build    → Next.js app build
  4. pnpm id:build             → Next.js app build
  5. pnpm jizz:build           → Next.js app build
  6. pnpm --filter @allah/arsy build → Fastify Hub build
  7. pnpm extension:build      → VS Code extension build
  8. pnpm docs:check           → Final doc verification
```

### CI Pipeline
```
verify-lint-arch    → pnpm lint:arch
verify-typecheck    → pnpm typecheck
verify-lint         → pnpm lint
verify-dock         → pnpm dock:build
verify-headquarter  → pnpm headquarter:build
verify-id           → pnpm id:build
verify-jizz         → pnpm jizz:build
verify-arsy         → pnpm --filter @allah/arsy build
verify-extension    → pnpm extension:build
verify-tests        → pnpm extension:test
verify-docs         → pnpm docs:check
promote-to-main     → needs: all verify jobs above
```

## Strict Flags (tsconfig.base.json)
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true,
  "noFallthroughCasesInSwitch": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noUncheckedIndexedAccess": true,
  "verbatimModuleSyntax": true,
  "exactOptionalPropertyTypes": true,
  "isolatedModules": true,
  "forceConsistentCasingInFileNames": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "declaration": true,
  "declarationMap": true,
  "sourceMap": true,
  "target": "ES2022",
  "module": "NodeNext",
  "moduleResolution": "NodeNext"
}
```

Note: Next.js apps override `module`/`moduleResolution` to `esnext`/`bundler` and `jsx` to `react-jsx`, which is expected and compatible with base.
