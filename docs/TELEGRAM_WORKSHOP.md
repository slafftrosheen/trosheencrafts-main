# Trosheen Workshop — private Telegram order notifications

## Scope (first release)

Trosheen Workshop is a **separate, private Telegram bot** for the production team.
It notifies authorized staff **only after SumUp has confirmed a PAID checkout**.
It does not read Instagram/Facebook direct messages and does not publish Journal posts.
Do not repurpose the site's existing `TELEGRAM_BOT_TOKEN` / social-posting bot.

Every new paid order message contains its number, customer name, quantity and EUR total.
Large inline buttons expose the itemized production specification and the customer's
contact details. The `/orders` command lists recent paid orders. Custom candle variants
include vessel/finish/wax/aroma, including custom finish notes.

Manual Instagram orders are **not** recognized as SumUp-paid website orders; do not label
or send them as "PAID" without a verified payment or an explicitly separate manual workflow.

## Architecture

- Admin API: `/api/admin/telegram-workshop` (requires existing admin session + CSRF).
- Token: validated using Telegram `getMe`, encrypted with AES-256-GCM in PostgreSQL.
  It is **never returned to the frontend**.
- Pairing: 15-minute, single-use `https://t.me/<bot>?start=<token>` link.
  Its random token is stored as a SHA-256 hash. Only a private Telegram conversation
  with the invited employee can consume it.
- Incoming bot actions: outbound HTTPS **`getUpdates` polling**, no Telegram webhook,
  no added incoming port or public Raspberry Pi IP. The polling process uses a PostgreSQL
  advisory lock to avoid concurrent processors.
- Payment: SumUp sends its checkout callback to
  `https://trosheen.shop/api/checkout/webhook` through the existing Cloudflare Tunnel.
  The server then **fetches checkout details from SumUp**, verifies PAID, exact checkout
  ID, order reference, EUR amount and merchant, and updates order/inventory.
  The notification outbox is written inside that order transaction.
- Delivery: PostgreSQL-backed outbox; one row per paid order/recipient/event;
  retries with increasing delay. Pausing the bot keeps queued notifications until
  re-enabled. The admin card shows pending and retrying deliveries.
- Authorization: only admin users can manage bot settings; only Telegram IDs that
  explicitly paired and remain enabled can open order details.

**Important:** This protects the Raspberry Pi origin address from exposure by the bot.
The separate SumUp callback must remain reachable through the existing HTTPS domain.

## Prepare Raspberry Pi environment

The existing Docker deployment uses `deploy.sh` and the migration runner. Before
deploying, set a stable, unique secret in the server's private `.env` file:

```dotenv
TELEGRAM_BOT_ENCRYPTION_SECRET=<generate-a-unique-32+-character-random-secret>
```

Generate locally, never commit or send the value to GitHub:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

A stable `SESSION_SECRET` of at least 32 characters can act as a fallback, but a
separate encryption secret is recommended. **Do not change it after connecting the
bot without first migrating/re-entering the token**; encrypted credentials will
otherwise become unreadable.

The new additive migration is `migrations/0014_telegram_workshop.sql`. For a normal
manual deployment with Docker and Cloudflare Tunnel:

```bash
./deploy.sh
```

This script builds the new image, starts PostgreSQL, runs `scripts/migrate.cjs` **before**
restarting the app, then checks `/api/health`. Do not restart an updated app without
applying the migration first. Do not run automatic schema pushes against production
just for this bot; the checked-in SQL migration is sufficient.

## Admin setup (owner only)

1. In Telegram, open the **official `@BotFather`** and create a new bot using `/newbot`.
   Give it a distinctive name such as `Trosheen Workshop`.
2. Sign into `trosheen.shop` as admin, open **Admin → Settings → Telegram**.
3. Paste the new bot token, select **Save and enable**. It is shown only while entering
   it and is stored encrypted in the database.
4. In **Invite employee**, enter the person's name and create an invitation link.
   Send the one-time link to your father privately. It expires after 15 minutes.
5. He opens the link in Telegram, presses **Start**, and receives a welcome message.
   No separate username, password, website login or phone-number lookup is needed.
6. Under **Connected employees**, press **Test**. Verify the test arrives in the
   intended private Telegram chat.
7. Use **Disable** next to a recipient to revoke their future bot access without
   revoking the whole bot. Changing to a different Telegram bot ID requires re-pairing.

The bot cannot initiate a Telegram conversation with an arbitrary phone number
or username. The person must first open the bot through the invitation.

## Pre-launch checks

- With no payment completed, an abandoned `pending` checkout sends **no** Telegram alert.
- With an actual/sandbox SumUp payment, confirm a verified **PAID** callback changes the
  order to `processing` and produces **one** alert to each enabled recipient.
  Never claim this test passed before real credentials and an actual transaction exist.
- Replay the same callback: no duplicate inventory decrement or duplicate outbox row.
- Wrong checkout ID, amount, currency or merchant: no paid status / notification.
- Click **Order items**: confirm every customized option and note is readable.
  Click **Contact buyer**: confirm saved phone/email/shipping address.
- Disable bot, complete another verified payment, re-enable: queue is delivered.
  Check pending/retry counts in the admin card.
- Disable a worker: bot callbacks must reject order details. Already sent Telegram
  messages remain in their chat history; treat customer data as confidential.
- Test after a Raspberry Pi/container restart. Outbox and Telegram polling offset
  should survive through the PostgreSQL volume.
- Verify checkout labels **SumUp** (not Stripe) in all storefront locales.

## Troubleshooting

**Bot enables but no invitation arrives:** confirm that the invited person pressed
**Start**, and the new bot username shown in admin matches the invitation link.
Generate a new link if the previous one has expired.

**A test message fails:** the user may have blocked the bot or the configured token
may be invalid. Confirm the private chat exists and inspect `docker compose logs app`.
The admin card shows Telegram polling errors and retry counts, but an enabled switch
on its own is not proof of successful delivery.

**Payment succeeded but no order alert:** inspect order status and SumUp callback
delivery first; a redirect back to the storefront is **not** payment confirmation.
Check the delivery queue and retry count, then confirm the SumUp callback URL is
reachable via Cloudflare Tunnel. Never manually set a pending payment to `processing`
solely to force a notification.

**Production migration fails:** `deploy.sh` aborts before updating the serving app.
Fix the SQL error or schema mismatch, back up the PostgreSQL volume, and rerun the
manual deployment. Do not delete order records or the production database.

## Future extension (not implemented here)

Explicit workshop actions such as **Accept order**, **Produced**, **Ready for dispatch**;
and a separate **manual Instagram/Facebook order entry** flow with source and payment
status. These should have audit logging and must not redefine a verified website payment.
