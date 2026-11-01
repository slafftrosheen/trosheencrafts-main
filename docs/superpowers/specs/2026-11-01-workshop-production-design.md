# Workshop production workflow

The agreed continuation is production control from the private Telegram bot and the Russian admin UI, not social messaging or a Mini App. Keep the existing Express/React/PostgreSQL stack and outbound Telegram polling. Direct writes to main are authorised; deployment is manual.

Production is a separate record: not_started → in_progress → completed → ready_to_ship. An explicit, confirmed reopen action returns completed/ready_to_ship to in_progress for corrections. No production action changes payment, stock or shipping. Only processing orders with a stored payment reference can advance. Pending, payment_review, cancelled, shipped and delivered orders are read-only.

Every write requires the current version, rechecks staff/admin authority in its transaction, locks the parent order, and records the actor and transition atomically. Stale buttons cannot advance a newer state. Historical actor names survive account/recipient removal. Both interfaces read the same records. Telegram uses labelled, one-per-row buttons and a separate confirmation view. The admin panel uses an accessible confirmation dialog and refreshes while open. History and the active-order list are paginated.

Alternatives: reuse orders.status (rejected: mixes payment/shipping and manufacture); build a Telegram Mini App (deferred: unnecessary UX/deployment overhead). The additive SQL table and ordinary bot buttons follow the existing integration and the user's agreed scope.

Verification: dependency-free runtime apart from the project's existing TypeScript compiler for unit tests; test transitions, permissions, stale revisions, transaction rollback and message formatting. Do not claim live PostgreSQL, SumUp, Telegram or Pi acceptance without running it.
