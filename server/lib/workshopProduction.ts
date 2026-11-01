import type { Pool } from "pg";
import {
  canManufacture, productionActions, productionTarget, validHistoryPage,
  validOrderId, validVersion, WorkshopError,
  type ProductionAction, type ProductionActor, type ProductionEvent,
  type ProductionSnapshot, type ProductionStatus,
} from "../../shared/workshopProduction";

const PAGE_SIZE = 8;
type SnapshotRow = {
  id: number; order_status: string; payment_method_id: string | null;
  status: ProductionStatus; version: number; updated_at: Date | null;
  history: ProductionEvent[];
};

/** Injected pg pool keeps rules testable without booting the website or Telegram. */
export function createWorkshopProduction(database: Pick<Pool, "query" | "connect">) {
  async function get(orderId: number, page = 0): Promise<ProductionSnapshot> {
    if (!validOrderId(orderId) || !validHistoryPage(page)) throw new WorkshopError(400, "Некорректный заказ или страница.");
    // A single statement gives the state and history the same MVCC snapshot.
    const { rows } = await database.query<SnapshotRow>(`
      SELECT o.id, o.status AS order_status, o.payment_method_id,
        COALESCE(p.status, 'not_started') AS status, COALESCE(p.version, 0) AS version,
        p.updated_at,
        COALESCE((SELECT jsonb_agg(h.entry ORDER BY h.event_id DESC) FROM (
          SELECT e.id AS event_id, jsonb_build_object(
            'id', e.id::text, 'fromStatus', e.from_status, 'toStatus', e.to_status,
            'actorName', e.actor_name, 'actorType', e.actor_type, 'createdAt', e.created_at
          ) AS entry FROM order_production_events e WHERE e.order_id = o.id
          ORDER BY e.id DESC LIMIT $2 OFFSET $3
        ) h), '[]'::jsonb) AS history
      FROM orders o LEFT JOIN order_production p ON p.order_id = o.id WHERE o.id = $1
    `, [orderId, PAGE_SIZE + 1, page * PAGE_SIZE]);
    const row = rows[0];
    if (!row) throw new WorkshopError(404, "Заказ не найден.");
    return {
      orderId: row.id, orderStatus: row.order_status, status: row.status, version: row.version,
      editable: canManufacture(row.order_status, row.payment_method_id),
      updatedAt: row.updated_at?.toISOString() ?? null,
      history: row.history.slice(0, PAGE_SIZE), historyPage: page,
      historyHasMore: row.history.length > PAGE_SIZE,
    };
  }

  async function change(orderId: number, action: ProductionAction, expectedVersion: number, actor: ProductionActor) {
    if (!validOrderId(orderId) || !validVersion(expectedVersion) || !productionActions.includes(action)) {
      throw new WorkshopError(400, "Некорректное действие или версия заказа.");
    }
    if (!actor || !/^[1-9][0-9]{0,18}$/.test(actor.id) || !["admin", "telegram"].includes(actor.kind)) {
      throw new WorkshopError(403, "Доступ закрыт.");
    }
    const client = await database.connect();
    try {
      await client.query("BEGIN");
      let actorName: string | undefined;
      if (actor.kind === "telegram") {
        const config = await client.query(
          "SELECT id FROM telegram_workshop_config WHERE id = 1 AND enabled = TRUE AND bot_id = $1 FOR SHARE",
          [actor.botId]
        );
        if (!config.rows.length) throw new WorkshopError(403, "Бот выключен или заменён. Откройте актуального бота.");
        const staff = await client.query<{ name: string }>(
          "SELECT display_name AS name FROM telegram_workshop_recipients WHERE chat_id = $1 AND enabled = TRUE FOR SHARE",
          [actor.id]
        );
        actorName = staff.rows[0]?.name;
      } else {
        const admin = await client.query<{ name: string }>(
          "SELECT username AS name FROM users WHERE id = $1 AND role = 'admin' FOR SHARE", [actor.id]
        );
        actorName = admin.rows[0]?.name;
      }
      if (!actorName) throw new WorkshopError(403, "Доступ сотрудника отключён. Обратитесь к владельцу.");
      // Also serialises against the existing fulfilment/payment updates to this order.
      const locked = await client.query<{ status: string; payment_method_id: string | null }>(
        "SELECT o.status, o.payment_method_id FROM orders o WHERE o.id = $1 FOR UPDATE OF o", [orderId]
      );
      const order = locked.rows[0];
      if (!order) throw new WorkshopError(404, "Заказ не найден.");
      if (!canManufacture(order.status, order.payment_method_id)) {
        throw new WorkshopError(409, "Изготовление недоступно: заказ не подтверждён, требует проверки или уже закрыт для производства.");
      }
      await client.query("INSERT INTO order_production (order_id) VALUES ($1) ON CONFLICT (order_id) DO NOTHING", [orderId]);
      const current = await client.query<{ status: ProductionStatus; version: number }>(
        "SELECT status, version FROM order_production WHERE order_id = $1 FOR UPDATE", [orderId]
      );
      const state = current.rows[0];
      if (!state || state.version !== expectedVersion) throw new WorkshopError(409, "Заказ уже изменён. Обновите карточку и подтвердите актуальное действие.");
      const target = productionTarget(state.status, action);
      if (!target) throw new WorkshopError(409, "Этот переход сейчас недоступен. Обновите карточку заказа.");
      const changed = await client.query<{ status: ProductionStatus; version: number; updated_at: Date }>(
        "UPDATE order_production SET status = $2, version = version + 1, updated_at = NOW() WHERE order_id = $1 RETURNING status, version, updated_at",
        [orderId, target]
      );
      await client.query(
        "INSERT INTO order_production_events (order_id, version, action, from_status, to_status, actor_type, actor_id, actor_name) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
        [orderId, changed.rows[0].version, action, state.status, target, actor.kind, actor.id, actorName.slice(0, 80)]
      );
      await client.query("COMMIT");
      return { status: target, version: changed.rows[0].version };
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally { client.release(); }
  }
  return { get, change };
}
export type WorkshopProductionService = ReturnType<typeof createWorkshopProduction>;
