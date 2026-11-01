/** Shared manufacturing rules. Payment and shipping are deliberately not modified here. */
export const productionStatuses = ["not_started", "in_progress", "completed", "ready_to_ship"] as const;
export type ProductionStatus = typeof productionStatuses[number];
export const productionActions = ["start", "finish", "ready", "reopen"] as const;
export type ProductionAction = typeof productionActions[number];
export const productionLabels: Record<ProductionStatus, string> = {
  not_started: "Ожидает изготовления", in_progress: "В работе",
  completed: "Изготовлено", ready_to_ship: "Готово к отправке",
};
export const productionActionLabels: Record<ProductionAction, string> = {
  start: "Взять в работу", finish: "Отметить: изготовлено",
  ready: "Готово к отправке", reopen: "Вернуть в работу",
};
export const productionQuestions: Record<ProductionAction, string> = {
  start: "Начать изготовление этого заказа?",
  finish: "Все изделия этого заказа изготовлены?",
  ready: "Заказ проверен, упакован и готов к отправке?",
  reopen: "Вернуть заказ в работу для исправлений?",
};
const transitions: Record<ProductionStatus, Partial<Record<ProductionAction, ProductionStatus>>> = {
  not_started: { start: "in_progress" }, in_progress: { finish: "completed" },
  completed: { ready: "ready_to_ship", reopen: "in_progress" },
  ready_to_ship: { reopen: "in_progress" },
};
export function productionTarget(status: string, action: string): ProductionStatus | null {
  if (!productionStatuses.includes(status as ProductionStatus) || !productionActions.includes(action as ProductionAction)) return null;
  return transitions[status as ProductionStatus][action as ProductionAction] ?? null;
}
export function canManufacture(orderStatus: string, paymentReference: string | null | undefined): boolean {
  return orderStatus === "processing" && Boolean(paymentReference?.trim());
}
export function availableProductionActions(status: ProductionStatus, editable: boolean): ProductionAction[] {
  return editable ? productionActions.filter((action) => productionTarget(status, action) !== null) : [];
}
export class WorkshopError extends Error {
  constructor(public readonly statusCode: 400 | 403 | 404 | 409, message: string) {
    super(message); this.name = "WorkshopError";
  }
}
export const validOrderId = (value: number) => Number.isInteger(value) && value > 0 && value <= 2147483647;
export const validVersion = (value: number) => Number.isInteger(value) && value >= 0 && value < 2147483647;
export const validHistoryPage = (value: number) => Number.isInteger(value) && value >= 0 && value <= 100000;
export type ProductionEvent = {
  id: string; fromStatus: ProductionStatus; toStatus: ProductionStatus;
  actorName: string; actorType: "admin" | "telegram"; createdAt: string;
};
export type ProductionSnapshot = {
  orderId: number; orderStatus: string; status: ProductionStatus; version: number;
  editable: boolean; updatedAt: string | null; history: ProductionEvent[];
  historyPage: number; historyHasMore: boolean;
};
export type ProductionActor = { kind: "admin"; id: string } | { kind: "telegram"; id: string; botId: string };
export type ProductionCommand =
  | { orderId: number; mode: "view" }
  | { orderId: number; mode: "history"; page: number }
  | { orderId: number; mode: "ask" | "confirm"; action: ProductionAction; version: number };
export function productionCallback(id: number, mode: "ask" | "confirm", action: ProductionAction, version: number): string {
  if (!validOrderId(id) || !validVersion(version) || !productionActions.includes(action)) throw new WorkshopError(400, "Некорректное действие.");
  return `wp:${id}:${mode}:${action}:${version}`;
}
export function parseProductionCallback(data: string): ProductionCommand | null {
  const match = /^wp:([1-9][0-9]*):(view|history|ask|confirm)(?::([a-z_]+|[0-9]+))?(?::([0-9]+))?$/.exec(data);
  if (!match || !validOrderId(Number(match[1]))) return null;
  const orderId = Number(match[1]);
  if (match[2] === "view" && match[3] === undefined && match[4] === undefined) return { orderId, mode: "view" };
  if (match[2] === "history" && /^[0-9]+$/.test(match[3] || "") && match[4] === undefined && validHistoryPage(Number(match[3]))) return { orderId, mode: "history", page: Number(match[3]) };
  if ((match[2] === "ask" || match[2] === "confirm") && productionActions.includes(match[3] as ProductionAction) && match[4] !== undefined && validVersion(Number(match[4]))) {
    return { orderId, mode: match[2], action: match[3] as ProductionAction, version: Number(match[4]) };
  }
  return null;
}
