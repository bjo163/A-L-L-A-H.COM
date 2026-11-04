# DESIGN: CI/CD & Build Gate Integration for harbor & moonsky

## 1. Current State Analysis

### 1.1 Root package.json Scripts (Current)

```json
{
  "scripts": {
    "dock:build": "pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/dock build",
    "headquarter:build": "pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/headquarter build",
    "id:build": "pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/id build",
    "jizz:build": "pnpm --filter @moonwitness/jizz build",
    "gate:build": "pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/gate build",
    "arsy:build": "pnpm --filter @allah/arsy build",
    "sentinel:build": "pnpm --filter @allah/sentinel build",
    "extension:build": "pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter allah-vscode-extension build",
    "dev": "pnpm lint:arch && pnpm typecheck && concurrently --kill-others --success first \"pnpm arsy:dev\" \"pnpm dock:dev\" \"pnpm headquarter:dev\" \"pnpm id:dev\" \"pnpm jizz:dev\" \"pnpm sentinel:dev\""
  }
}
```

**Pattern for Next.js apps depending on types + sdk:**
`pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/<app> build`

**Pattern for standalone Next.js apps (jizz):**
`pnpm --filter @moonwitness/jizz build`

### 1.2 harbor & moonsky package.json Dependencies

Both have:
```json
"dependencies": {
  "@allah/sdk": "workspace:*",
  "@moonwitness/types": "workspace:*",
  "@moonwitness/ui": "workspace:*",
  ...
}
```

→ **Both need the types+sdk prebuild pattern** (like dock, headquarter, id, gate)

### 1.3 ci-dev.yml Verify Jobs (Current)

10 verify jobs: `verify-lint-arch`, `verify-typecheck`, `verify-lint`, `verify-dock`, `verify-headquarter`, `verify-id`, `verify-jizz`, `verify-gate`, `verify-arsy`, `verify-sentinel`, `verify-extension`, `verify-tests`, `verify-docs`

**Pattern for Next.js app verify job:**
```yaml
verify-<app>:
  name: Verify <App> (Next.js)
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v7
    - uses: pnpm/action-setup@v6
      with: { version: 12.16.1 }
    - uses: actions/setup-node@v7
      with: { node-version: 22, cache: pnpm }
    - run: pnpm install --frozen-lockfile
    - run: pnpm <app>:build
```

### 1.4 publish-deploy.yml Matrix (Current)

```yaml
matrix:
  include:
    - component: arsy
      dockerfile: apps/arsy/Dockerfile
    - component: gate
      dockerfile: apps/gate/Dockerfile
    - component: dock
      dockerfile: apps/dock/Dockerfile
    - component: headquarter
      dockerfile: apps/headquarter/Dockerfile
    - component: id
      dockerfile: apps/id/Dockerfile
    - component: jizz
      dockerfile: apps/jizz/Dockerfile
    - component: sentinel
      dockerfile: apps/sentinel/Dockerfile
```

### 1.5 docker-compose.yml Services (Current)

7 services: `arsy` (5150), `gate` (3000), `dock` (3001), `headquarter` (3002), `id` (3003), `jizz` (3004), `sentinel` (1812/1813/9181)

**Pattern for Next.js app service:**
```yaml
<app>:
  build:
    context: .
    dockerfile: apps/<app>/Dockerfile
  pull_policy: always
  restart: unless-stopped
  ports:
    - "<port>:<port>"
  environment:
    - PORT=<port>
    - NODE_ENV=production
    - NEXT_PUBLIC_ECOSYSTEM_ORIGIN=${NEXT_PUBLIC_ECOSYSTEM_ORIGIN:-http://localhost}
  depends_on:
    - arsy
```

### 1.6 Existing Next.js App Dockerfiles (Reference)

Example `apps/dock/Dockerfile`:
```dockerfile
# Install dependencies only when needed
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# Generate Prisma client etc. if needed
# ...

# Build the application
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable pnpm && pnpm dock:build

# Production image, copy all the files and run next
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
```

**Key requirements:**
- `next.config.ts` must have `output: 'standalone'`
- Multi-stage build (deps → builder → runner)
- Non-root user (nextjs:nodejs)
- Copies `.next/standalone` and `.next/static`

## 2. Remediation Strategy

### 2.1 Phase 1: Root package.json Scripts
Add 4 new scripts following the types+sdk prebuild pattern:
- `harbor:build` = `pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/harbor build`
- `moonsky:build` = `pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/moonsky build`
- `harbor:dev` = `pnpm --filter @moonwitness/harbor dev`
- `moonsky:dev` = `pnpm --filter @moonwitness/moonsky dev`

Update `dev` script to include harbor and moonsky in concurrently.

### 2.2 Phase 2: ci-dev.yml Jobs
Add two verify jobs:
- `verify-harbor` → runs `pnpm harbor:build`
- `verify-moonsky` → runs `pnpm moonsky:build`

Add both to `promote-to-main` needs array.

### 2.3 Phase 3: publish-deploy.yml Matrix
Add two matrix entries:
- `harbor` → `apps/harbor/Dockerfile`
- `moonsky` → `apps/moonsky/Dockerfile`

### 2.4 Phase 4: docker-compose.yml Services
Add two services:
- `harbor` → port 3006, depends_on: arsy
- `moonsky` → port 3005, depends_on: arsy

### 2.5 Phase 5: Dockerfiles
Create `apps/harbor/Dockerfile` and `apps/moonsky/Dockerfile` following the existing Next.js pattern. Ensure `next.config.ts` has `output: 'standalone'`.

### 2.6 Phase 6: Scaffold Validation Enhancement
Update `scripts/validate-workspace-scaffolds.mjs` to check that every `apps/*` directory:
- Has a valid Next.js structure (`app` or `pages` directory)
- Has a Dockerfile
- Is included in root package.json scripts
- Is included in ci-dev.yml
- Is included in publish-deploy.yml
- Is included in docker-compose.yml

## 3. Architecture Changes

### 3.1 File Modifications Summary

| File | Change |
|------|--------|
| `package.json` | +4 scripts, update `dev` |
| `.github/workflows/ci-dev.yml` | +2 jobs, update `needs` |
| `.github/workflows/publish-deploy.yml` | +2 matrix entries |
| `docker-compose.yml` | +2 services |
| `apps/harbor/Dockerfile` | New file |
| `apps/moonsky/Dockerfile` | New file |
| `scripts/validate-workspace-scaffolds.mjs` | Enhanced validation |

### 3.2 Port Assignments

| App | Dev Port | Docker Port | Notes |
|-----|----------|-------------|-------|
| harbor | 3006 | 3006 | Already in package.json |
| moonsky | 3005 | 3005 | Already in package.json |

No conflicts with existing apps (3000-3004 used by gate, dock, headquarter, id, jizz).

### 3.3 Environment Variables

Both harbor and moonsky need only:
- `NEXT_PUBLIC_ECOSYSTEM_ORIGIN` (standard for all Next.js apps)
- No server-only secrets (like `JIZZ_API_URL`/`JIZZ_API_KEY` for jizz)

## 4. API Contracts

No API contract changes. This is purely infrastructure integration.

## 5. UI/UX States

No UI changes. Harbor and moonsky already have their own SkinRoot configurations:
- harbor: `SkinRoot="rocksoul"`
- moonsky: `SkinRoot="riot-anarchy"`

## 6. Data Flow

No data flow changes. Infrastructure only.

## 7. Security Considerations

- Dockerfiles run as non-root user (nextjs:nodejs) — follows existing pattern
- No new secrets introduced
- `NEXT_PUBLIC_ECOSYSTEM_ORIGIN` is public by design
- SSRF validation unchanged (handled by ARSY hub)

## 8. Migration Plan

No migration needed — additive changes only. Existing apps unaffected.

---

*Generated by Qoder Agent (Ultra Planner) — 2026-11-05 00:00:00+07:00*