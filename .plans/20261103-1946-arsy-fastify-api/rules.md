---
title: "Rules & Invariants: Arsy Fastify Modular API"
date: "2026-11-03"
plan: "20261103-1946-arsy-fastify-api"
---

# Rules & Invariants: Arsy

1. In-process PostgreSQL via `@electric-sql/pglite` requires no external DB daemon.
2. Tenant isolation enforces `WHERE company_id = ?` parameterization on all queries.
3. Zero placeholder slop files.
