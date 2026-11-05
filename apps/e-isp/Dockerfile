# Multi-stage Dockerfile for E-ISP public site (top-of-funnel)
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/e-isp/package.json ./apps/e-isp/
COPY packages/ui/package.json ./packages/ui/
COPY packages/sdk/package.json ./packages/sdk/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY apps/e-isp ./apps/e-isp
COPY packages/ui ./packages/ui
COPY packages/sdk ./packages/sdk
COPY packages/types ./packages/types
RUN pnpm --filter @moonwitness/types build && pnpm --filter @allah/sdk build && pnpm --filter @moonwitness/e-isp build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3007

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/e-isp ./apps/e-isp

WORKDIR /app/apps/e-isp

EXPOSE 3007

CMD ["pnpm", "start"]
