# SumUp admin setup

User scope: configure website SumUp from Russian admin pages, including API key and merchant code; commit directly to main. No live payment or deployment during implementation.

Use existing Express/PostgreSQL/React stack and hosted checkout. A dedicated private configuration stores AES-256-GCM encrypted credentials, merchant identity, HTTPS site origin, description prefix and explicit live-payment enable state. UI never reads a secret back. Check merchant access using SumUp GET /v1/merchants/{code}, check EUR and the sandbox flag; checking/saving never charges. New/changed credentials are saved disabled. Explicit enabling requires a fresh live-merchant check. Sandbox setup may create an explicitly confirmed, isolated EUR 1 test checkout, never a shop order.

Preserve existing environment configuration until first admin save. Snapshot credential/account identity for every newly issued checkout, retain encrypted credential revisions for in-flight sessions, and preserve the previous environment credential when replacing it. Disabling stops new sessions, not verification of issued payments. Verify exact checkout ID, reference, merchant, currency and amount server-side; test payments must never fulfil orders. On a possibly successful remote creation, retain the local pending order rather than deleting it.

Callbacks and return URLs derive from the admin-configured public HTTPS origin, never the HTTP Host header. SumUp callback uses the existing Cloudflare-proxied website route; no new incoming port. This is website checkout, not terminal pairing or third-party OAuth.

No new runtime dependency, automatic deploy or public credential endpoint. All mutations use admin auth, existing CSRF, version checks and in-transaction role recheck. Unknown credentials, unknown environment and mismatched responses fail closed. Public availability exposes no keys or merchant information.
