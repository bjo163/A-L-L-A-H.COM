# Multi-stage Dockerfile for Arsy Fastify Gateway Runtime Server
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/arsy/package.json ./apps/arsy/
COPY packages/arsy-core/package.json ./packages/arsy-core/
COPY packages/arsy-orm/package.json ./packages/arsy-orm/
COPY packages/arsy-plugin-auth/package.json ./packages/arsy-plugin-auth/
COPY packages/arsy-plugin-storage/package.json ./packages/arsy-plugin-storage/
COPY packages/arsy-plugin-llm-gateway/package.json ./packages/arsy-plugin-llm-gateway/
COPY packages/arsy-plugin-sdui/package.json ./packages/arsy-plugin-sdui/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY packages/arsy-core ./packages/arsy-core
COPY packages/arsy-orm ./packages/arsy-orm
COPY packages/arsy-plugin-auth ./packages/arsy-plugin-auth
COPY packages/arsy-plugin-storage ./packages/arsy-plugin-storage
COPY packages/arsy-plugin-llm-gateway ./packages/arsy-plugin-llm-gateway
COPY packages/arsy-plugin-sdui ./packages/arsy-plugin-sdui
COPY packages/types ./packages/types
COPY addons ./addons
COPY apps/arsy ./apps/arsy

RUN pnpm --filter @allah/arsy-core build \
 && pnpm --filter @allah/arsy-orm build \
 && pnpm --filter @moonwitness/types build \
 && pnpm --filter @allah/arsy-plugin-auth build \
 && pnpm --filter @allah/arsy-plugin-storage build \
 && pnpm --filter @allah/arsy-plugin-llm-gateway build \
 && pnpm --filter @allah/arsy-plugin-sdui build \
 && pnpm --filter @allah/arsy build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5150

COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/packages ./packages
COPY --from=builder --chown=node:node /app/addons ./addons
COPY --from=builder --chown=node:node /app/apps/arsy ./apps/arsy

WORKDIR /app/apps/arsy

# /health and /ready are the only public routes, so the probe needs no credentials.
USER node
EXPOSE 5150

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1 || exit 1

CMD ["pnpm", "start"]