# Workshop delivery recovery

Continue the approved private, Russian-language order bot; changes go directly to main.
Orders and production remain authoritative on the existing backend. No new inbound
ports, Telegram webhook, paid services, social integrations or automatic deployment.

## Approach
Keep the transactional PostgreSQL outbox, rather than adding Redis or sending within
checkout requests. Extract a testable delivery worker and Telegram transport. Add
persisted failed/skipped states, bounded retries, flood-control cooldown, lease fencing
and an admin-only paginated delivery log with a confirmed retry action. A retry never
resends a recorded success, bypasses a disabled recipient, changes payment or production,
or overrides Telegram's cooldown. Retry actor and time are recorded. Disable/replace
checks run immediately before sending; an already in-flight HTTP request is not retractable.

Transient failures retry up to 12 consecutive attempts with exponential backoff capped
at one hour. Telegram 429 respects retry_after and pauses the outbox for this bot;
400/401/403 failures require intervention. Orders no longer eligible are skipped, not
retried forever. Successful Telegram delivery and its database receipt are not atomic:
ambiguous transport/DB failures can cause duplicates. Do not claim exactly-once delivery.

Existing settings, staff pairing, production controls and access checks stay intact.
Operator text is Russian, buttons have labels, and the log explains the difference
between queued, temporarily retrying, failed, paused, sent and skipped notifications.
