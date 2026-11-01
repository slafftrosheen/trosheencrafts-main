import {
  availableProductionActions, parseProductionCallback, productionActionLabels,
  productionCallback, productionLabels, productionQuestions, productionTarget, WorkshopError,
  type ProductionActor, type ProductionSnapshot,
} from "../../shared/workshopProduction";
import type { WorkshopProductionService } from "./workshopProduction";

export type WorkshopMessage = { text: string; buttons: { text: string; callback_data: string }[][] };
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const time = (value: string) => new Date(value).toLocaleString("ru-RU", {
  timeZone: "Europe/Riga", dateStyle: "short", timeStyle: "short",
});

function panel(state: ProductionSnapshot, notice?: string): WorkshopMessage {
  const buttons: WorkshopMessage["buttons"] = availableProductionActions(state.status, state.editable).map((action) => [{
    text: productionActionLabels[action],
    callback_data: productionCallback(state.orderId, "ask", action, state.version),
  }]);
  buttons.push([{ text: "📖 История изготовления", callback_data: `wp:${state.orderId}:history:0` }]);
  buttons.push([{ text: "🔄 Обновить состояние", callback_data: `wp:${state.orderId}:view` }]);
  buttons.push([{ text: "📋 Состав заказа", callback_data: `order:${state.orderId}:items:0` }]);
  buttons.push([{ text: "📦 Все заказы", callback_data: "orders" }]);
  return {
    text: [notice ? escapeHtml(notice) + "\n" : "", `<b>🛠 Заказ № ${state.orderId} · Изготовление</b>`, "",
      `<b>${productionLabels[state.status]}</b>`,
      state.updatedAt ? "Обновлено: " + time(state.updatedAt) : "Изготовление ещё не отмечено.", "",
      state.editable ? "Выберите следующий шаг. Изменение потребует подтверждения." :
        "Только просмотр: заказ требует проверки оплаты/остатков, отменён или уже отправлен.",
      "Отметка готовности не означает отправку и не изменяет оплату.",
    ].filter((line) => line !== undefined).join("\n"), buttons,
  };
}

/** The caller must authenticate the private chat. Writes recheck authority in the service. */
export async function handleProductionCommand(service: WorkshopProductionService, data: string, actor: ProductionActor): Promise<WorkshopMessage> {
  const command = parseProductionCallback(data);
  if (!command) throw new WorkshopError(400, "Кнопка устарела. Откройте заказ заново.");
  try {
    const state = await service.get(command.orderId, command.mode === "history" ? command.page : 0);
    if (command.mode === "history") {
      const lines = [`<b>📖 Заказ № ${state.orderId} · История</b>`, `Страница ${state.historyPage + 1} · время Риги`, ""];
      for (const event of state.history) {
        lines.push(time(event.createdAt),
          `${productionLabels[event.fromStatus]} → <b>${productionLabels[event.toStatus]}</b>`,
          `${escapeHtml(event.actorName.slice(0, 80))} · ${event.actorType === "telegram" ? "Telegram" : "Админка"}`, "");
      }
      if (!state.history.length) lines.push("На этой странице пока нет записей.");
      const buttons: WorkshopMessage["buttons"] = [];
      if (state.historyPage > 0) buttons.push([{ text: "⬅️ Более новые записи", callback_data: `wp:${state.orderId}:history:${state.historyPage - 1}` }]);
      if (state.historyHasMore) buttons.push([{ text: "Более ранние записи ➡️", callback_data: `wp:${state.orderId}:history:${state.historyPage + 1}` }]);
      buttons.push([{ text: "🛠 К изготовлению", callback_data: `wp:${state.orderId}:view` }]);
      return { text: lines.join("\n"), buttons };
    }
    if (command.mode === "view") return panel(state);
    if (!state.editable) throw new WorkshopError(409, "Сейчас нельзя менять изготовление этого заказа.");
    if (state.version !== command.version) throw new WorkshopError(409, "Заказ уже изменён. Ниже показано актуальное состояние.");
    if (!productionTarget(state.status, command.action)) throw new WorkshopError(409, "Действие больше недоступно. Выберите актуальный шаг.");
    if (command.mode === "ask") {
      return {
        text: `<b>Подтвердите действие · заказ № ${state.orderId}</b>\n\n${productionQuestions[command.action]}\n\nОплата и доставка не изменятся.`,
        buttons: [
          [{ text: "✅ Да, подтвердить", callback_data: productionCallback(state.orderId, "confirm", command.action, command.version) }],
          [{ text: "↩️ Нет, вернуться", callback_data: `wp:${state.orderId}:view` }],
        ],
      };
    }
    await service.change(command.orderId, command.action, command.version, actor);
    return panel(await service.get(command.orderId), "✅ Изменение сохранено.");
  } catch (error) {
    if (!(error instanceof WorkshopError)) throw error;
    if (error.statusCode === 409) return panel(await service.get(command.orderId), "⚠️ " + error.message);
    return { text: escapeHtml(error.message), buttons: [[{ text: "📦 К заказам", callback_data: "orders" }]] };
  }
}
