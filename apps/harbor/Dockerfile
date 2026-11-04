# Multi-stage Dockerfile for HARBOR (E-ISP Customer Portal)
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/harbor/package.json ./apps/harbor/
COPY packages/ui/package.json ./packages/ui/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/harbor ./apps/harbor
COPY packages/ui ./packages/ui
COPY packages/sdk ./packages/sdk
COPY packages/types ./packages/types
RUN pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/harbor build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3006

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/harbor ./apps/harbor

WORKDIR /app/apps/harbor

EXPOSE 3006

CMD ["pnpm", "start"]