# Multi-stage Dockerfile for Next.js Dock (public homepage)
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/dock/package.json ./apps/dock/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

COPY apps/dock ./apps/dock
COPY packages/ui ./packages/ui
RUN pnpm --filter @moonwitness/dock build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/dock ./apps/dock

WORKDIR /app/apps/dock

EXPOSE 3001

CMD ["pnpm", "start"]