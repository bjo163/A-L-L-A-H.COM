# Multi-stage Dockerfile for WORLD OBSERVATORY
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/jizz/package.json ./apps/jizz/
COPY packages/ui/package.json ./packages/ui/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/jizz ./apps/jizz
COPY packages/ui ./packages/ui
COPY packages/sdk ./packages/sdk
COPY packages/types ./packages/types
RUN pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/jizz build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3004

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/jizz ./apps/jizz

WORKDIR /app/apps/jizz

EXPOSE 3004

CMD ["pnpm", "start"]
