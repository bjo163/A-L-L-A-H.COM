# Multi-stage Dockerfile for Next.js Headquarters (command center)
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/headquarter/package.json ./apps/headquarter/
COPY packages/ui/package.json ./packages/ui/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/headquarter ./apps/headquarter
COPY packages/ui ./packages/ui
COPY packages/sdk ./packages/sdk
COPY packages/types ./packages/types
RUN pnpm --filter @moonwitness/headquarter build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/headquarter ./apps/headquarter

WORKDIR /app/apps/headquarter

EXPOSE 3002

CMD ["pnpm", "start"]