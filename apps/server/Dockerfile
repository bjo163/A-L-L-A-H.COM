# Multi-stage Dockerfile for Rust Loco Server
FROM rust:1.85-bullseye AS builder

WORKDIR /usr/src/app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    sqlite3 \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY apps/server ./apps/server

WORKDIR /usr/src/app/apps/server
RUN cargo build --release

# Runner Stage
FROM debian:bullseye-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl1.1 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/apps/server/target/release/dx_server-cli /usr/local/bin/server-cli
COPY apps/server/config /app/config
COPY apps/server/assets /app/assets

ENV LOCO_ENV=production
ENV PORT=5150
ENV BINDING=0.0.0.0

EXPOSE 5150

CMD ["server-cli", "start"]
