# Workshop Delivery Recovery Implementation Plan

> Execute inline with superpowers:executing-plans; use test-driven-development.

**Goal:** Reliable paid-order notifications with actionable admin diagnostics and safe retry.
**Architecture:** Existing PostgreSQL outbox; isolated transport, worker and admin query service.
**Tech Stack:** Existing TypeScript, node:test, pg, Express, React Query and UI components.
**Spec:** docs/superpowers/specs/2026-11-01-workshop-delivery-design.md

## Global constraints
Direct main publication only after local verification; manual production deployment.
No new runtime dependencies; no new incoming network endpoints for Telegram.
No mutations to payments, production or inventory. Admin UI remains Russian.

## Review focus
- Flood limits must survive retries/restarts and cannot be bypassed by the retry button.
- Sent, skipped, disabled-recipient and actively leased jobs cannot be manually resent.
- A stale lease owner cannot record a result over another worker's attempt.
- Telegram success followed by database failure is ambiguous, not a known send failure.
- Secrets and customer data must not leak in transport errors or delivery logs.

## Tasks
- [x] Write failing node:test cases for typed/redacted transport errors and retry decisions;
  implement server/lib/workshopTransport.ts and check the red-to-green result.
- [x] Write failing worker/admin-service tests for success, eligibility, cooldown, bounded
  retry, access revocation, lease fencing and connection cleanup. Implement
  server/lib/workshopDelivery.ts plus migrations/0016_workshop_delivery_recovery.sql.
- [x] Wire the existing bot and protected routes; add a paginated Russian admin log with
  confirmation dialog and explicit actionable errors. Preserve unrelated source bytes.
- [x] Run all available targeted tests, TypeScript checks and diff review; document actual
  limits. 67 tests passed; strict checks passed for the three new server/shared modules.
  A full build/live acceptance require the deployment environment.

## Publication
Publish the verified files in one atomic commit on the latest main without force.
Verify the remote ref and changed-file hashes; GitHub publication is not deployment.
