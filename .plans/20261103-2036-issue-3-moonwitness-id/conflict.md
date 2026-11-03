---
title: "Conflict & Human Confirmation: Session Expiry Policy"
date: "2026-11-03"
plan: "20261103-2036-issue-3-moonwitness-id"
status: "pending_review"
---

# Conflict / Human Decision Required: Session Expiry Policy

## 1. Issue Description
There is a trade-off regarding the default session lifetime for MoonWitness ID (`apps/id`):
- Option A: Extended sliding expiration (30 days with renewal on activity) — best user convenience for ecosystem apps.
- Option B: Strict banking-grade expiration (24 hours or browser-close session) — highest security boundary for enterprise identity.

## 2. Options Checklist for Human Approval
- [x] **Option A (Recommended)**: 30-day sliding session with instant remote revocation in `/account` dashboard.
- [ ] **Option B**: Strict 24-hour fixed expiration with immediate logout upon expiry.

*Note: Option A is pre-selected as the standard modern SaaS pattern, but user can toggle to Option B at any time.*
