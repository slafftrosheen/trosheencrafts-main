import { randomUUID } from "node:crypto";
import { deliveryFailure, telegramRequest, TelegramRequestError } from "./workshopTransport";
import { deliveryFilters, isDeliveryId, type DeliveryFilter, type DeliveryReport,
  type DeliveryState, type DeliverySummary } from "../../shared/workshopDelivery";

// Structural interface keeps the service testable without importing a running database.
interface Queryable {
  query<R extends Record<string, unknown> = Record<string, unknown>>(text: string, values?: unknown[]):
    Promise<{ rows: R[]; rowCount: number | null }>;
}
interface Connection extends Queryable { release(destroy?: boolean): void }
interface Database extends Queryable { connect(): Promise<Connection> }
interface Bot { bot_id: string; bot_token_ciphertext: string }
interface Job { id: string; order_id: number; chat_id: string; attempt_streak: number; lock_token: string }
type Message = { text: string; reply_markup: { inline_keyboard: { text: string; callback_data: string }[][] } };
interface Dependencies {
  decrypt(cipher: string): string;
  render(orderId: number): Promise<Message | null>;
  send?(token: string, body: Record<string, unknown>): Promise<{ message_id: number }>;
}
export class DeliveryError extends Error {
  constructor(public readonly statusCode: number, message: string) { super(message); this.name = "DeliveryError"; }
}
const eligible = (status: string, payment: string | null) => Boolean(payment) &&
  ["processing", "payment_review", "shipped", "delivered"].includes(status);
const iso = (value: unknown): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
};
const LOCK = 920261102;
const active = "o.sent_at IS NULL AND o.failed_at IS NULL AND o.skipped_at IS NULL";
const retryGuard = `o.sent_at IS NULL AND o.skipped_at IS NULL AND o.failed_at IS NOT NULL
  AND (o.locked_until IS NULL OR o.locked_until < NOW()) AND r.enabled
  AND ord.status IN ('processing','payment_review','shipped','delivered')
  AND NULLIF(ord.payment_method_id, '') IS NOT NULL`;

export function createWorkshopDelivery(database: Database) {
  let running = false;
  async function summary(): Promise<DeliverySummary> {
    const { rows } = await database.query(`/* workshop:summary */
      SELECT COUNT(*) FILTER (WHERE ${active}) AS pending,
        COUNT(*) FILTER (WHERE ${active} AND o.attempts > 0) AS retrying,
        COUNT(*) FILTER (WHERE o.failed_at IS NOT NULL AND o.sent_at IS NULL) AS failed,
        COUNT(*) FILTER (WHERE o.sent_at IS NOT NULL) AS sent,
        COUNT(*) FILTER (WHERE o.skipped_at IS NOT NULL) AS skipped,
        MAX(o.sent_at) AS last_sent_at FROM telegram_workshop_outbox o`);
    const r = rows[0] || {};
    return { pending: Number(r.pending || 0), retrying: Number(r.retrying || 0), failed: Number(r.failed || 0),
      sent: Number(r.sent || 0), skipped: Number(r.skipped || 0), lastSentAt: iso(r.last_sent_at) };
  }
  async function list(page = 0, filter: DeliveryFilter = "attention"): Promise<DeliveryReport> {
    if (!Number.isInteger(page) || page < 0 || page > 100000 || !deliveryFilters.includes(filter)) {
      throw new DeliveryError(400, "Некорректная страница или фильтр уведомлений.");
    }
    const filters = {
      attention: "o.sent_at IS NULL AND o.skipped_at IS NULL AND (o.failed_at IS NOT NULL OR o.attempts > 0)",
      pending: active, sent: "o.sent_at IS NOT NULL", all: "TRUE",
    };
    const meta = await database.query(`/* workshop:meta */
      SELECT enabled, CASE WHEN delivery_retry_at > NOW() THEN delivery_retry_at END AS cooldown
      FROM telegram_workshop_config WHERE id = 1`);
    const { rows } = await database.query(`/* workshop:list */
      SELECT o.id, o.order_id, r.display_name, r.enabled AS recipient_enabled, o.attempts, o.attempt_streak,
        o.last_error_code, (o.last_error IS NOT NULL) AS has_error, o.available_at, o.sent_at, o.retry_requested_at,
        (${retryGuard}) AND COALESCE(c.enabled, FALSE) AS can_retry,
        CASE WHEN o.sent_at IS NOT NULL THEN 'sent' WHEN o.skipped_at IS NOT NULL THEN 'skipped'
          WHEN o.failed_at IS NOT NULL THEN 'failed' WHEN NOT r.enabled OR NOT COALESCE(c.enabled, FALSE) THEN 'paused'
          WHEN o.locked_until > NOW() THEN 'sending' WHEN o.attempts > 0 THEN 'retrying' ELSE 'queued' END AS state
      FROM telegram_workshop_outbox o JOIN telegram_workshop_recipients r ON r.id = o.recipient_id
      JOIN orders ord ON ord.id = o.order_id LEFT JOIN telegram_workshop_config c ON c.id = 1
      WHERE ${filters[filter]} ORDER BY o.id DESC LIMIT 21 OFFSET $1`, [page * 20]);
    return { page, hasNext: rows.length > 20, configured: Boolean(meta.rows[0]), enabled: meta.rows[0]?.enabled === true,
      cooldownUntil: iso(meta.rows[0]?.cooldown), summary: await summary(), entries: rows.slice(0, 20).map(r => ({
        id: String(r.id), orderId: Number(r.order_id), recipientName: String(r.display_name),
        recipientEnabled: r.recipient_enabled === true, state: r.state as DeliveryState, attempts: Number(r.attempts),
        canRetry: r.can_retry === true, nextAttemptAt: iso(r.available_at), sentAt: iso(r.sent_at),
        retryRequestedAt: iso(r.retry_requested_at),
        // Never expose historic raw errors; older workers may have stored sensitive provider text.
        lastError: r.state === "skipped" ? "Заказ больше не подходит для этого уведомления. Отправка остановлена."
          : r.has_error ? deliveryFailure(new TelegramRequestError(Number(r.last_error_code || 0)), Number(r.attempt_streak)).message : null,
      })) };
  }
  async function retry(id: string, actorId: number) {
    if (!isDeliveryId(id) || !Number.isInteger(actorId) || actorId < 1 || actorId > 2147483647) {
      throw new DeliveryError(400, "Некорректное уведомление или сотрудник.");
    }
    const client = await database.connect();
    try {
      await client.query("BEGIN");
      const config = await client.query(`/* workshop:retry-config */
        SELECT id FROM telegram_workshop_config WHERE id = 1 AND enabled = TRUE FOR SHARE`);
      if (!config.rows.length) throw new DeliveryError(409, "Сначала включите бота в настройках.");
      const admin = await client.query(`/* workshop:admin */
        SELECT id FROM users WHERE id = $1 AND role = 'admin' FOR SHARE`, [actorId]);
      if (!admin.rows.length) throw new DeliveryError(403, "Недостаточно прав для повторной отправки.");
      const job = await client.query(`/* workshop:retry-job */
        SELECT o.id, (${retryGuard}) AS can_retry FROM telegram_workshop_outbox o
        JOIN telegram_workshop_recipients r ON r.id = o.recipient_id JOIN orders ord ON ord.id = o.order_id
        WHERE o.id = $1 FOR UPDATE OF o FOR SHARE OF r, ord`, [id]);
      if (!job.rows.length) throw new DeliveryError(404, "Уведомление не найдено.");
      if (job.rows[0].can_retry !== true) throw new DeliveryError(409,
        "Повтор недоступен: сообщение уже отправлено, обрабатывается, заказ изменён или сотрудник отключён. Обновите список.");
      await client.query(`/* workshop:retry */
        UPDATE telegram_workshop_outbox o SET failed_at = NULL, last_error = NULL, last_error_code = NULL,
          attempt_streak = 0, locked_until = NULL, lock_token = NULL,
          available_at = GREATEST(NOW(), c.delivery_retry_at), retry_requested_at = NOW(), retry_requested_by = $2
        FROM telegram_workshop_config c WHERE o.id = $1 AND c.id = 1`, [id, actorId]);
      await client.query("COMMIT");
      return { ok: true };
    } catch (error) { await client.query("ROLLBACK").catch(() => {}); throw error; }
    finally { client.release(); }
  }
  async function deliver(deps: Dependencies) {
    if (running) return;
    running = true;
    let client: Connection | undefined; let locked = false;
    try {
      client = await database.connect();
      const lock = await client.query(`/* workshop:lock */ SELECT pg_try_advisory_lock($1) AS acquired`, [LOCK]);
      locked = lock.rows[0]?.acquired === true;
      if (!locked) return;
      const config = await client.query<Bot & Record<string, unknown>>(`/* workshop:config */
        SELECT bot_id, bot_token_ciphertext FROM telegram_workshop_config WHERE id = 1 AND enabled = TRUE
          AND (delivery_retry_at IS NULL OR delivery_retry_at <= NOW())`);
      const bot = config.rows[0];
      if (!bot) return;
      let token: string;
      try { token = deps.decrypt(bot.bot_token_ciphertext); }
      catch { throw new DeliveryError(503, "Не удалось прочитать токен бота. Проверьте ключ шифрования сервера."); }
      for (let i = 0; i < 10; i++) {
        const claim = await client.query<Job & Record<string, unknown>>(`/* workshop:claim */
          WITH next_job AS (
            SELECT o.id, r.chat_id FROM telegram_workshop_outbox o
            JOIN telegram_workshop_recipients r ON r.id = o.recipient_id AND r.enabled = TRUE
            JOIN telegram_workshop_config c ON c.id = 1 AND c.enabled = TRUE
              AND c.bot_id = $1 AND c.bot_token_ciphertext = $2
            WHERE ${active} AND o.available_at <= NOW()
              AND (c.delivery_retry_at IS NULL OR c.delivery_retry_at <= NOW())
              AND (o.locked_until IS NULL OR o.locked_until < NOW())
            ORDER BY o.id FOR UPDATE OF o SKIP LOCKED LIMIT 1
          ) UPDATE telegram_workshop_outbox o SET attempts = attempts + 1, attempt_streak = attempt_streak + 1,
            locked_until = NOW() + INTERVAL '60 seconds', lock_token = $3 FROM next_job
          WHERE o.id = next_job.id RETURNING o.id, o.order_id, next_job.chat_id, o.attempt_streak, o.lock_token`,
        [bot.bot_id, bot.bot_token_ciphertext, randomUUID()]);
        const job = claim.rows[0]; if (!job) break;
        const check = await client.query(`/* workshop:preflight */
          SELECT ord.status, ord.payment_method_id FROM telegram_workshop_outbox o
          JOIN orders ord ON ord.id = o.order_id JOIN telegram_workshop_recipients r ON r.id = o.recipient_id
          JOIN telegram_workshop_config c ON c.id = 1
          WHERE o.id = $1 AND o.lock_token = $2 AND r.enabled = TRUE AND c.enabled = TRUE
            AND c.bot_id = $3 AND c.bot_token_ciphertext = $4
            AND (c.delivery_retry_at IS NULL OR c.delivery_retry_at <= NOW())`,
        [job.id, job.lock_token, bot.bot_id, bot.bot_token_ciphertext]);
        if (!check.rows[0]) {
          await client.query(`/* workshop:release */ UPDATE telegram_workshop_outbox SET locked_until = NULL,
            lock_token = NULL, attempt_streak = GREATEST(0, attempt_streak - 1)
            WHERE id = $1 AND lock_token = $2 AND sent_at IS NULL`, [job.id, job.lock_token]);
          break;
        }
        const skip = async () => client!.query(`/* workshop:skip */ UPDATE telegram_workshop_outbox
          SET skipped_at = NOW(), locked_until = NULL, lock_token = NULL, last_error = NULL, last_error_code = NULL
          WHERE id = $1 AND lock_token = $2 AND sent_at IS NULL`, [job.id, job.lock_token]);
        if (!eligible(String(check.rows[0].status), check.rows[0].payment_method_id as string | null)) { await skip(); continue; }
        let sent: { message_id: number };
        try {
          const message = await deps.render(job.order_id);
          if (!message) { await skip(); continue; }
          const body = { chat_id: job.chat_id, parse_mode: "HTML", ...message };
          sent = deps.send ? await deps.send(token, body) : await telegramRequest(token, "sendMessage", body);
          if (!Number.isSafeInteger(sent?.message_id) || sent.message_id < 1) throw new TelegramRequestError(502);
        } catch (error) {
          const failure = deliveryFailure(error, job.attempt_streak);
          await client.query("BEGIN");
          try {
            if (failure.cooldown) await client.query(`/* workshop:cooldown */ UPDATE telegram_workshop_config
              SET delivery_retry_at = GREATEST(delivery_retry_at, NOW() + $3 * INTERVAL '1 second')
              WHERE id = 1 AND bot_id = $1 AND bot_token_ciphertext = $2
                AND EXISTS (SELECT 1 FROM telegram_workshop_outbox WHERE id = $4 AND lock_token = $5)`,
            [bot.bot_id, bot.bot_token_ciphertext, failure.delaySeconds, job.id, job.lock_token]);
            await client.query(`/* workshop:failure */ UPDATE telegram_workshop_outbox
              SET last_error = $3, last_error_code = $4, failed_at = CASE WHEN $5 THEN NOW() ELSE NULL END,
                available_at = NOW() + $6 * INTERVAL '1 second', locked_until = NULL, lock_token = NULL
              WHERE id = $1 AND lock_token = $2 AND sent_at IS NULL AND skipped_at IS NULL`,
            [job.id, job.lock_token, failure.message, failure.code, failure.terminal, failure.delaySeconds]);
            await client.query("COMMIT");
          } catch (storageError) { await client.query("ROLLBACK").catch(() => {}); throw storageError; }
          if (failure.cooldown || failure.code === 401) break;
          continue;
        }
        // Telegram accepted this message. A failed receipt write is ambiguous, not a send failure.
        // Leave the lease intact; recovery may duplicate delivery. Never claim exactly-once.
        await client.query(`/* workshop:sent */ UPDATE telegram_workshop_outbox SET sent_at = NOW(),
          telegram_message_id = $3, locked_until = NULL, lock_token = NULL, last_error = NULL, last_error_code = NULL
          WHERE id = $1 AND lock_token = $2 AND sent_at IS NULL`, [job.id, job.lock_token, sent.message_id]);
      }
    } finally {
      try { if (locked && client) await client.query(`/* workshop:unlock */ SELECT pg_advisory_unlock($1)`, [LOCK]); }
      catch { client?.release(true); client = undefined; }
      finally { client?.release(); running = false; }
    }
  }
  return { summary, list, retry, deliver };
}
