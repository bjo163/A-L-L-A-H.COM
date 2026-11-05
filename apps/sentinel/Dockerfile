FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./
COPY apps/sentinel/package.json ./apps/sentinel/
COPY packages/arsy-core/package.json ./packages/arsy-core/
COPY packages/arsy-orm/package.json ./packages/arsy-orm/
COPY packages/sentinel-radius/package.json ./packages/sentinel-radius/

RUN pnpm install --frozen-lockfile

COPY packages/arsy-core ./packages/arsy-core
COPY packages/arsy-orm ./packages/arsy-orm
COPY packages/sentinel-radius ./packages/sentinel-radius
COPY addons ./addons
COPY apps/sentinel ./apps/sentinel

RUN pnpm --filter @allah/arsy-core build \
 && pnpm --filter @allah/arsy-orm build \
 && pnpm --filter @allah/sentinel-radius build \
 && pnpm --filter @allah/sentinel build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV SENTINEL_AUTH_PORT=1812
ENV SENTINEL_ACCT_PORT=1813
ENV SENTINEL_HTTP_PORT=9181
ENV PG_DATA_DIR=/app/data

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/addons ./addons
COPY --from=builder /app/apps/sentinel ./apps/sentinel

WORKDIR /app/apps/sentinel

EXPOSE 1812/udp 1813/udp 3799/udp 9181

CMD ["pnpm", "start"]
