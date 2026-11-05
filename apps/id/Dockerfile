# Multi-stage Dockerfile for MoonWitness ID account center
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/id/package.json ./apps/id/
COPY packages/ui/package.json ./packages/ui/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/types/package.json ./packages/types/
COPY packages/assets/package.json ./packages/assets/

RUN pnpm install --frozen-lockfile

COPY apps/id ./apps/id
COPY packages/ui ./packages/ui
COPY packages/sdk ./packages/sdk
COPY packages/types ./packages/types
COPY packages/assets ./packages/assets
RUN pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/id build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3003

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/id ./apps/id

WORKDIR /app/apps/id

EXPOSE 3003

CMD ["pnpm", "start"]
