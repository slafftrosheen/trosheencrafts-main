# Workshop Production Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete production controls and audit history in Telegram and the admin order card.
**Architecture:** One versioned PostgreSQL service, shared domain rules, two UI adapters. Additive migration, no payment-state writes.
**Tech Stack:** TypeScript, Express, pg, React, TanStack Query, existing Telegram Bot API client.
**Spec:** ../specs/2026-11-01-workshop-production-design.md

## Global Constraints
- Russian staff-facing UI; plain full-width Telegram buttons; confirmation before changes.
- Preserve SumUp verification and manual deployment; write directly to main without force.
- No new runtime dependencies, public webhook, or customer-facing messages.

## Review Focus
- Double taps and old confirmations must create at most one transition.
- Revoked staff/admin access is checked again under the write transaction.
- Audit failure rolls back the production update.
- HTML-sensitive names and max callback IDs cannot break Telegram rendering.
- Large order queues and histories remain accessible via pagination.

### Task 1: Domain, storage and transactional service
- [x] Write failing node:test tests for allowed/blocked transitions, callbacks and transaction behaviour.
- [x] Add shared/workshopProduction.ts, migrations/0015_workshop_production.sql and server/lib/workshopProduction.ts.
- [x] Run node --test tests/workshop-production.test.cjs and inspect failures.

### Task 2: Telegram production controller
- [x] Test confirmation-only behaviour, stale buttons, permission rejection and escaped history.
- [x] Add server/lib/workshopTelegram.ts; wire buttons into telegramWorkshop.ts; paginate active orders.
- [x] Correct polling recovery after a failed pool connection and acknowledge callback spinners independently of business writes.

### Task 3: Admin and API
- [x] Mount read/change production endpoints under the existing admin-only Telegram Workshop router.
- [x] Add OrderProduction.tsx inside the expanded admin order card; polling, history paging, confirmation, error recovery.
- [x] Document migration and operator acceptance; verify source syntax and domain tests. Publishing is tracked by the verified GitHub main ref, not this checklist.
