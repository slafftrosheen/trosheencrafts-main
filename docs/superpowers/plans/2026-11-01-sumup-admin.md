# SumUp Admin Setup Implementation Plan

> Execute inline with test-driven-development and verification-before-completion.

**Goal:** Manage and test SumUp credentials in the existing Russian settings page; checkout uses them immediately.
**Architecture:** Dedicated encrypted configuration and immutable credential revisions; order checkout bindings keep verification independent of later settings changes. Inject HTTP/database boundaries for tests.
**Tech stack:** Existing TypeScript, React Query, Express, PostgreSQL, Node crypto/fetch.
**Spec:** docs/superpowers/specs/2026-11-01-sumup-admin.md

## Tasks
- [x] Transport, validation, credential encryption: failing tests, implementation, green tests.
- [x] Additive 0017 migration; versioned admin settings, read-only merchant checks, enable/disable, legacy preservation.
- [x] Bind live checkout and sandbox setup sessions; exact payment verification after configuration changes; stop deleting pending orders after remote errors.
- [x] Admin-only routes, Russian settings UI, safe public availability and checkout messages.
- [x] Regression/security tests, strict type check where dependencies permit, syntax checks, inspect complete diff and atomic commit directly to main.

## Review focus
Secret leakage in errors/logs/DTO; invalid/missing sandbox flag; revoked admin or stale version; token rotation and merchant switching with pending sessions; disabling during an issued checkout; sandbox callbacks; transient upstream errors; modified configuration while test is pending; old environment orders.

## Decisions
A single currently selected merchant, not multiple stores/OAuth. Saved sandbox credentials are for admin testing only. Credential history is intentionally retained encrypted for old payment verification; removal is not automatic. Existing env fallback is read-only until first save. Connection test cannot certify merchant onboarding or card acceptance; UI and docs must say so.

Verification: 42 targeted tests pass; five core modules strict-typechecked; 13 TS/TSX files transpile. Full app build, browser, real PostgreSQL and provider tests remain deployment acceptance work. Remote publication is verified separately after the commit.
