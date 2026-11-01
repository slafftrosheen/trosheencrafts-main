/**
 * Trosheen Workshop: outbound-only Telegram polling, encrypted bot credentials,
 * expiring one-use staff invitations, and database-backed order notifications.
 * No webhook or public inbound port is required on Raspberry Pi.
 */
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { db, pool } from "../db";
import { orderItems, orders, products } from "../db/schema";
import { eq, sql } from "drizzle-orm";

type Bot = { bot_token_ciphertext: string; bot_id: string; bot_username: string;
  enabled: boolean; update_offset: string; last_error: string | null };
type Recipient = { id: number; chat_id: string; display_name: string;
  telegram_username: string | null; enabled: boolean };
type EventType = "paid" | "payment_review";
type Button = { text: string; callback_data: string };
type Chat = { id: number; type: string };
type Update = { update_id: number;
  message?: { chat: Chat; from?: { id: number; username?: string }; text?: string };
  callback_query?: { id: string; from: { id: number }; data?: string;
    message?: { message_id: number; chat: Chat } };
};
type Order = { id: number; status: string; totalAmount: string;
  shippingAddress: { name: string; phone?: string; email?: string; street: string;
    postalCode: string; city: string; country: string };
  items: { productName: string | null; productSlug: string | null;
    quantity: number; price: string; variant: string | null }[] };
const safe = (s: unknown, max = 160) => String(s ?? "").slice(0, max).replace(/&/g, "&amp;")
  .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const eur = (n: unknown) => Number(n ?? 0).toFixed(2).replace(".", ",") + " €";
const hash = (s: string) => createHash("sha256").update(s).digest("hex");
const paid = (s: string) => ["processing", "payment_review", "shipped", "delivered"].includes(s);

function key() {
  const s = process.env.TELEGRAM_BOT_ENCRYPTION_SECRET || process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("Telegram encryption secret must have at least 32 characters.");
  return createHash("sha256").update("trosheen-workshop-v1:" + s).digest();
}
function encrypt(token: string) {
  const iv = randomBytes(12), c = createCipheriv("aes-256-gcm", key(), iv);
  const payload = Buffer.concat([c.update(token, "utf8"), c.final()]);
  return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"),
    payload.toString("base64")].join(":");
}
function decrypt(ciphertext: string) {
  const [version, iv, tag, payload] = ciphertext.split(":");
  if (version !== "v1" || !iv || !tag || !payload) throw new Error("Invalid encrypted bot token.");
  const c = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64"));
  c.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([c.update(Buffer.from(payload, "base64")), c.final()]).toString("utf8");
}
async function telegram<T>(token: string, method: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch("https://api.telegram.org/bot" + token + "/" + method, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params), signal: AbortSignal.timeout(10000),
  });
  const json = await res.json() as { ok?: boolean; result?: T; description?: string };
  if (!res.ok || !json.ok || json.result === undefined) {
    throw new Error("Telegram " + method + ": " + (json.description || res.status));
  }
  return json.result;
}
async function bot(): Promise<Bot | null> {
  const r = await pool.query<Bot>("SELECT * FROM telegram_workshop_config WHERE id = 1");
  return r.rows[0] || null;
}
export async function workshopSettings() {
  const config = await bot();
  const recipients = await pool.query<Recipient>(
    "SELECT id, chat_id, display_name, telegram_username, enabled " +
    "FROM telegram_workshop_recipients ORDER BY id"
  );
  const delivery = await pool.query<{
    pending: string; retrying: string; last_sent_at: Date | null;
  }>(
    "SELECT COUNT(*) FILTER (WHERE o.sent_at IS NULL) AS pending, " +
    "COUNT(*) FILTER (WHERE o.sent_at IS NULL AND o.attempts > 0) AS retrying, " +
    "MAX(o.sent_at) AS last_sent_at FROM telegram_workshop_outbox o " +
    "JOIN telegram_workshop_recipients r ON r.id = o.recipient_id AND r.enabled = TRUE"
  );
  const stats = delivery.rows[0];
  return { configured: Boolean(config), enabled: config?.enabled ?? false,
    delivery: { pending: Number(stats?.pending ?? 0), retrying: Number(stats?.retrying ?? 0),
      lastSentAt: stats?.last_sent_at?.toISOString() ?? null },
    username: config?.bot_username || null, lastError: config?.last_error || null,
    recipients: recipients.rows.map((r) => ({ id: r.id, displayName: r.display_name,
      telegramUsername: r.telegram_username, enabled: r.enabled })) };
}
export async function saveWorkshopSettings(input: { token?: string; enabled?: boolean }) {
  const old = await bot(), candidate = input.token?.trim();
  if (!old && !candidate) throw new Error("Укажите токен нового бота от @BotFather.");
  let cipher = old?.bot_token_ciphertext, botId = old?.bot_id, username = old?.bot_username;
  if (candidate) {
    const info = await telegram<{ id: number; is_bot: boolean; username?: string }>(candidate, "getMe");
    if (!info.is_bot || !info.username) throw new Error("Указанный токен не является токеном бота.");
    cipher = encrypt(candidate);
    botId = String(info.id);
    username = info.username;
  }
  if (!cipher || !botId || !username) throw new Error("Сначала настройте Telegram-бота.");
  const enabled = input.enabled ?? old?.enabled ?? false;
  if (enabled) await telegram<boolean>(candidate || decrypt(cipher), "deleteWebhook",
    { drop_pending_updates: false });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    if (old && old.bot_id !== botId) {
      // A different bot has a different set of Telegram chats and subscribers.
      await client.query("DELETE FROM telegram_workshop_pairings");
      await client.query("DELETE FROM telegram_workshop_recipients");
    }
    await client.query(
      "INSERT INTO telegram_workshop_config " +
      "(id, bot_token_ciphertext, bot_id, bot_username, enabled, update_offset) " +
      "VALUES (1, $1, $2, $3, $4, 0) ON CONFLICT (id) DO UPDATE SET " +
      "bot_token_ciphertext = EXCLUDED.bot_token_ciphertext, bot_id = EXCLUDED.bot_id, " +
      "bot_username = EXCLUDED.bot_username, enabled = EXCLUDED.enabled, " +
      "update_offset = CASE WHEN telegram_workshop_config.bot_id = EXCLUDED.bot_id " +
      "THEN telegram_workshop_config.update_offset ELSE 0 END, last_error = NULL, updated_at = NOW()",
      [cipher, botId, username, enabled]
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  return workshopSettings();
}
export async function inviteWorkshopRecipient(displayName: string) {
  const config = await bot();
  if (!config?.enabled) throw new Error("Сначала включите бота.");
  const code = randomBytes(24).toString("base64url");
  await pool.query("INSERT INTO telegram_workshop_pairings " +
    "(code_hash, display_name, expires_at) VALUES ($1, $2, NOW() + INTERVAL '15 minutes')",
    [hash(code), displayName.trim().slice(0, 80) || "Мастер"]);
  return { link: "https://t.me/" + config.bot_username + "?start=" + code,
    expiresInMinutes: 15 };
}
export async function workshopRecipientEnabled(id: number, enabled: boolean) {
  const result = await pool.query(
    "UPDATE telegram_workshop_recipients SET enabled = $1 WHERE id = $2", [enabled, id]
  );
  if (!result.rowCount) throw new Error("Получатель не найден.");
  return workshopSettings();
}
export async function testWorkshopRecipient(id: number) {
  const config = await bot();
  if (!config?.enabled) throw new Error("Бот выключен.");
  const result = await pool.query<Recipient>(
    "SELECT * FROM telegram_workshop_recipients WHERE id = $1 AND enabled = TRUE", [id]
  );
  if (!result.rows.length) throw new Error("Получатель не подключён.");
  await telegram(decrypt(config.bot_token_ciphertext), "sendMessage", {
    chat_id: result.rows[0].chat_id, parse_mode: "HTML",
    text: "✅ <b>Trosheen Workshop</b>\n\nПроверка успешна. Все новые оплаченные заказы будут приходить сюда.",
  });
}
async function loadOrder(id: number): Promise<Order | null> {
  const [record] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!record) return null;
  const items = await db.select({
    productName: products.name, productSlug: products.slug,
    quantity: orderItems.quantity, price: orderItems.price, variant: orderItems.variant,
  }).from(orderItems).leftJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, id));
  return { ...record, items };
}
function summary(order: Order, event: EventType = "paid") {
  const warning = order.status === "payment_review";
  return [
    warning ? "⚠️ <b>ОПЛАЧЕНО — ТРЕБУЕТ ПРОВЕРКИ</b>" :
      order.status === "delivered" ? "✅ <b>ЗАКАЗ ДОСТАВЛЕН</b>" :
      order.status === "shipped" ? "🚚 <b>ЗАКАЗ ОТПРАВЛЕН</b>" :
      "✅ <b>ОПЛАЧЕННЫЙ ЗАКАЗ</b>",
    "", "📦 <b>Trosheen · № " + order.id + "</b>",
    "👤 " + safe(order.shippingAddress.name),
    "🕯 Изделий: " + order.items.reduce((n, item) => n + item.quantity, 0),
    "💶 Итого: <b>" + eur(order.totalAmount) + "</b>",
    "📌 Состояние: " + (warning ? "Проверить остатки" :
      order.status === "delivered" ? "Доставлен" :
      order.status === "shipped" ? "Отправлен" : "В работе"),
    ...(warning ? ["", "❗ Проблема с остатками: не начинайте изготовление до проверки."] : []),
  ].join("\n");
}
function orderButtons(id: number): Button[][] {
  return [
    [{ text: "📋 Состав заказа", callback_data: "order:" + id + ":items:0" }],
    [{ text: "☎️ Контакты покупателя", callback_data: "order:" + id + ":contact" }],
    [{ text: "📦 Другие заказы", callback_data: "orders" }],
  ];
}
function details(order: Order, page: number) {
  const count = Math.max(1, Math.ceil(order.items.length / 4));
  const active = Math.min(Math.max(page, 0), count - 1);
  const lines = ["📋 <b>ЗАКАЗ № " + order.id + " · СОСТАВ</b>", ""];
  for (const item of order.items.slice(active * 4, (active + 1) * 4)) {
    const custom = item.productSlug === "custom-candle-builder";
    lines.push("• <b>" + safe(custom ? "Свеча на заказ" : item.productName || "Товар") +
      "</b> × " + item.quantity + " · " + eur(item.price) + " / шт.");
    if (item.variant) {
      const parts = item.variant.split(" / ");
      if (custom && parts.length === 4) {
        ["Форма", "Отделка", "Воск", "Аромат"].forEach((field, index) =>
          lines.push("   " + field + ": " + safe(parts[index], 150)));
      } else {
        lines.push("   Вариант: " + safe(item.variant, 550));
      }
    }
    lines.push("");
  }
  lines.push("Страница " + (active + 1) + " из " + count, "💶 Итого: " + eur(order.totalAmount));
  const navigation: Button[] = [];
  if (active > 0) navigation.push({ text: "⬅️ Назад", callback_data: "order:" + order.id + ":items:" + (active - 1) });
  if (active + 1 < count) navigation.push({
    text: "Дальше ➡️", callback_data: "order:" + order.id + ":items:" + (active + 1),
  });
  const buttons: Button[][] = [];
  if (navigation.length) buttons.push(navigation);
  buttons.push([{ text: "☎️ Контакты", callback_data: "order:" + order.id + ":contact" }]);
  buttons.push([{ text: "🏠 К заказу", callback_data: "order:" + order.id + ":summary" }]);
  return { text: lines.join("\n"), buttons };
}
function contacts(order: Order) {
  const a = order.shippingAddress;
  return ["☎️ <b>ЗАКАЗ № " + order.id + " · КОНТАКТЫ</b>", "",
    "👤 " + safe(a.name), a.phone ? "📱 <code>" + safe(a.phone, 40) + "</code>" : "📱 Телефон не указан",
    a.email ? "✉️ <code>" + safe(a.email, 254) + "</code>" : "✉️ Почта не указана",
    "📍 " + [a.street, a.postalCode, a.city, a.country].filter(Boolean).map((x) => safe(x)).join(", "),
  ].join("\n");
}
async function show(token: string, chat: number, text: string, buttons: Button[][], messageId?: number) {
  const params = { chat_id: chat, text, parse_mode: "HTML",
    reply_markup: { inline_keyboard: buttons } };
  if (messageId) {
    try { await telegram(token, "editMessageText", { ...params, message_id: messageId }); }
    catch (error) {
      if (!(error instanceof Error && error.message.includes("message is not modified"))) throw error;
    }
  } else {
    await telegram(token, "sendMessage", params);
  }
}
async function showOrder(token: string, chat: number, id: number, section: string, page: number, messageId?: number) {
  const order = await loadOrder(id);
  if (!order || !paid(order.status)) throw new Error("Заказ не найден.");
  if (section === "items") {
    const detail = details(order, page);
    return show(token, chat, detail.text, detail.buttons, messageId);
  }
  if (section === "contact") return show(token, chat, contacts(order), [
    [{ text: "📋 Состав", callback_data: "order:" + id + ":items:0" }],
    [{ text: "🏠 К заказу", callback_data: "order:" + id + ":summary" }],
  ], messageId);
  return show(token, chat, summary(order), orderButtons(id), messageId);
}
async function listOrders(token: string, chat: number, messageId?: number) {
  const { rows } = await pool.query<{ id: number; total_amount: string; status: string }>(
    "SELECT id, total_amount, status FROM orders WHERE " +
    "status IN ('processing','payment_review','shipped') ORDER BY created_at DESC LIMIT 12"
  );
  const buttons: Button[][] = rows.map((o) => [{
    text: (o.status === "payment_review" ? "⚠️ " : "📦 ") + "№" + o.id + " · " + eur(o.total_amount),
    callback_data: "order:" + o.id + ":summary",
  }]);
  buttons.push([{ text: "🔄 Обновить", callback_data: "orders" }]);
  return show(token, chat, rows.length ?
    "📦 <b>Последние оплаченные заказы</b>\n\nНажмите на заказ:" :
    "Нет оплаченных заказов в работе.", buttons, messageId);
}
async function isRecipient(userId: number) {
  const result = await pool.query("SELECT 1 FROM telegram_workshop_recipients " +
    "WHERE chat_id = $1 AND enabled = TRUE LIMIT 1", [String(userId)]);
  return Boolean(result.rows.length);
}
async function register(token: string, chat: Chat, from: { id: number; username?: string }, code: string) {
  if (chat.type !== "private" || chat.id !== from.id) return;
  const client = await pool.connect();
  let name: string | null = null;
  try {
    await client.query("BEGIN");
    const r = await client.query<{ display_name: string }>(
      "UPDATE telegram_workshop_pairings SET consumed_at = NOW() WHERE " +
      "code_hash = $1 AND consumed_at IS NULL AND expires_at > NOW() RETURNING display_name", [hash(code)]
    );
    if (r.rows.length) {
      name = r.rows[0].display_name;
      await client.query(
        "INSERT INTO telegram_workshop_recipients (chat_id, display_name, telegram_username, enabled) " +
        "VALUES ($1, $2, $3, TRUE) ON CONFLICT (chat_id) DO UPDATE SET " +
        "display_name = EXCLUDED.display_name, telegram_username = EXCLUDED.telegram_username, enabled = TRUE",
        [String(from.id), name, from.username || null]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
  await telegram(token, "sendMessage", { chat_id: chat.id, parse_mode: "HTML",
    text: name ? "✅ <b>Добро пожаловать, " + safe(name) +
      "!</b>\n\nTrosheen Workshop подключён. Оплаченные заказы будут приходить автоматически." :
      "Приглашение недействительно или просрочено. Попросите владельца создать новую ссылку.",
    reply_markup: name ? { inline_keyboard: [[{
      text: "📦 Посмотреть заказы", callback_data: "orders",
    }]] } : undefined,
  });
}
async function onUpdate(token: string, update: Update) {
  const m = update.message;
  if (m?.from && m.chat.type === "private" && m.chat.id === m.from.id) {
    const code = /^\/start(?:@\w+)?\s+([A-Za-z0-9_-]{16,80})\s*$/.exec(m.text || "");
    if (code) return register(token, m.chat, m.from, code[1]);
    if (!(await isRecipient(m.from.id))) return;
    if (/^\/orders(?:@\w+)?(?:\s|$)/i.test(m.text || "")) return listOrders(token, m.chat.id);
    if (/^\/(?:start|help)(?:@\w+)?(?:\s|$)/i.test(m.text || "")) {
      return show(token, m.chat.id,
        "🌿 <b>Trosheen · Мастерская</b>\n\n" +
        "Здесь появляются новые оплаченные заказы.\n\n" +
        "1. Нажмите «Заказы», чтобы увидеть список.\n" +
        "2. Выберите номер заказа.\n" +
        "3. Откройте «Состав» или «Контакты».\n\n" +
        "Команда /orders всегда открывает список.\n" +
        "Если уведомления не приходят, сообщите владельцу магазина.",
        [[{ text: "📦 Открыть заказы", callback_data: "orders" }]]);
    }
    return show(token, m.chat.id,
      "🌿 <b>Trosheen · Мастерская</b>\n\nВыберите действие ниже. Для помощи отправьте /help.",
      [[{ text: "📦 Открыть заказы", callback_data: "orders" }]]);
  }
  const cb = update.callback_query;
  if (!cb) return;
  const chat = cb.message?.chat;
  if (!chat || chat.type !== "private" || chat.id !== cb.from.id || !(await isRecipient(cb.from.id))) {
    await telegram(token, "answerCallbackQuery", { callback_query_id: cb.id, text: "Доступ закрыт.", show_alert: true });
    return;
  }
  try {
    if (cb.data === "orders") {
      await listOrders(token, chat.id, cb.message?.message_id);
    } else {
      const x = /^order:([1-9][0-9]*):(summary|items|contact)(?::([0-9]+))?$/.exec(cb.data || "");
      if (!x || !Number.isSafeInteger(Number(x[1]))) throw new Error("Кнопка устарела.");
      await showOrder(token, chat.id, Number(x[1]), x[2], Math.min(Number(x[3] || 0), 10000),
        cb.message?.message_id);
    }
    await telegram(token, "answerCallbackQuery", { callback_query_id: cb.id });
  } catch (error) {
    console.error("Telegram button:", error instanceof Error ? error.message : error);
    await telegram(token, "answerCallbackQuery", {
      callback_query_id: cb.id, text: "Не удалось открыть заказ. Попробуйте /orders.", show_alert: true,
    });
  }
}

/** Atomically queue notifications inside the existing verified-SumUp transaction. */
export async function queuePaidWorkshopOrder(tx: any, orderId: number, event: EventType) {
  if (!Number.isSafeInteger(orderId) || orderId < 1 || !["paid", "payment_review"].includes(event)) {
    throw new Error("Invalid workshop event");
  }
  // Queue on confirmed payment even if the bot is temporarily disabled.
  // Deliveries resume automatically once enabled; SQL values are parameterized.
  await tx.execute(sql`
    INSERT INTO telegram_workshop_outbox (order_id, recipient_id, event_type)
    SELECT ${orderId}, r.id, ${event}
    FROM telegram_workshop_recipients r
    JOIN telegram_workshop_config c ON c.id = 1
    WHERE r.enabled = TRUE
    ON CONFLICT (order_id, recipient_id, event_type) DO NOTHING
  `);
}
let polling = false;
async function poll() {
  if (polling) return;
  polling = true;
  const client = await pool.connect();
  let lock = false;
  try {
    const r = await client.query<{ acquired: boolean }>(
      "SELECT pg_try_advisory_lock($1) AS acquired", [920261031]
    );
    lock = Boolean(r.rows[0]?.acquired);
    if (!lock) return;
    const config = await bot();
    if (!config?.enabled) return;
    const token = decrypt(config.bot_token_ciphertext);
    const updates = await telegram<Update[]>(token, "getUpdates", {
      offset: Number(config.update_offset), limit: 20, timeout: 0,
      allowed_updates: ["message", "callback_query"],
    });
    for (const update of updates) {
      try { await onUpdate(token, update); }
      catch (error) {
        // Never acknowledge a failed update: retry on the next poll, preserving invite/callback actions.
        const message = error instanceof Error ? error.message.slice(0, 500) : "Telegram update error";
        console.error("Telegram update", update.update_id, message);
        await client.query(
          "UPDATE telegram_workshop_config SET last_error = $1 WHERE id = 1 AND bot_id = $2",
          [message, config.bot_id]
        );
        break;
      }
      await client.query(
        "UPDATE telegram_workshop_config SET update_offset = GREATEST(update_offset, $1), last_error = NULL " +
        "WHERE id = 1 AND bot_id = $2", [update.update_id + 1, config.bot_id]
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : "Telegram polling error";
    console.error("Telegram polling:", message);
    try { await client.query("UPDATE telegram_workshop_config SET last_error = $1 WHERE id = 1", [message]); }
    catch { /* database may be temporarily offline */ }
  } finally {
    if (lock) await client.query("SELECT pg_advisory_unlock($1)", [920261031]).catch(() => {});
    client.release();
    polling = false;
  }
}
let delivering = false;
async function deliver() {
  if (delivering) return;
  delivering = true;
  try {
    const config = await bot();
    if (!config?.enabled) return;
    const token = decrypt(config.bot_token_ciphertext);
    for (let i = 0; i < 10; i++) {
      const result = await pool.query<{ id: string; order_id: number; chat_id: string; event_type: EventType }>(
        "WITH job AS (SELECT o.id FROM telegram_workshop_outbox o " +
        "JOIN telegram_workshop_recipients r ON r.id = o.recipient_id AND r.enabled = TRUE " +
        "WHERE o.sent_at IS NULL AND o.available_at <= NOW() " +
        "AND (o.locked_until IS NULL OR o.locked_until < NOW()) " +
        "ORDER BY o.id FOR UPDATE OF o SKIP LOCKED LIMIT 1) " +
        "UPDATE telegram_workshop_outbox o SET attempts = attempts + 1, " +
        "locked_until = NOW() + INTERVAL '45 seconds' FROM job, telegram_workshop_recipients r " +
        "WHERE o.id = job.id AND r.id = o.recipient_id " +
        "RETURNING o.id, o.order_id, o.event_type, r.chat_id"
      );
      const job = result.rows[0];
      if (!job) break;
      try {
        const order = await loadOrder(job.order_id);
        if (!order || !paid(order.status)) throw new Error("Order is not paid");
        const sent = await telegram<{ message_id: number }>(token, "sendMessage", {
          chat_id: job.chat_id, text: summary(order, job.event_type),
          parse_mode: "HTML", reply_markup: { inline_keyboard: orderButtons(order.id) },
        });
        await pool.query(
          "UPDATE telegram_workshop_outbox SET sent_at = NOW(), locked_until = NULL, " +
          "telegram_message_id = $2, last_error = NULL WHERE id = $1", [job.id, sent.message_id]
        );
      } catch (error) {
        const message = error instanceof Error ? error.message.slice(0, 500) : "Telegram delivery error";
        console.error("Telegram order", job.order_id, message);
        await pool.query(
          "UPDATE telegram_workshop_outbox SET locked_until = NULL, last_error = $2, " +
          "available_at = NOW() + LEAST(3600, 20 * POWER(2, LEAST(attempts, 8))) * INTERVAL '1 second' " +
          "WHERE id = $1", [job.id, message]
        );
      }
    }
  } finally { delivering = false; }
}
export function startTelegramWorkshop() {
  const tick = () => {
    void poll().catch((error) => console.error("Telegram poll:", error));
    void deliver().catch((error) => console.error("Telegram delivery:", error));
  };
  const timer = setInterval(tick, 7000);
  timer.unref();
  tick();
}
