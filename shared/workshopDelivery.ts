export const deliveryFilters = ["attention", "pending", "sent", "all"] as const;
export type DeliveryFilter = typeof deliveryFilters[number];
export const deliveryLabels = {
  queued: "В очереди", retrying: "Повторяем автоматически", sending: "Отправляется",
  paused: "Приостановлено", failed: "Нужна помощь", sent: "Доставлено в Telegram", skipped: "Не отправлено: заказ изменён",
} as const;
export type DeliveryState = keyof typeof deliveryLabels;
export interface DeliverySummary {
  pending: number; retrying: number; failed: number; sent: number; skipped: number; lastSentAt: string | null;
}
export interface DeliveryEntry {
  id: string; orderId: number; recipientName: string; recipientEnabled: boolean;
  state: DeliveryState; attempts: number; lastError: string | null; canRetry: boolean;
  nextAttemptAt: string | null; sentAt: string | null; retryRequestedAt: string | null;
}
export interface DeliveryReport {
  entries: DeliveryEntry[]; page: number; hasNext: boolean; configured: boolean; enabled: boolean;
  cooldownUntil: string | null; summary: DeliverySummary;
}
export function isDeliveryId(value: unknown): value is string {
  return typeof value === "string" && /^[1-9][0-9]{0,18}$/.test(value) && BigInt(value) <= 9223372036854775807n;
}
