/** Telegram errors deliberately exclude provider bodies, URLs, tokens and customer data. */
export class TelegramRequestError extends Error {
  constructor(public readonly code: number, public readonly retryAfter = 0, unchanged = false) {
    super(unchanged ? "Telegram 400: message is not modified" : "Telegram " + code + ": " + errorText(code));
    this.name = "TelegramRequestError";
  }
}
function errorText(code: number): string {
  if (code === 400) return "Telegram отклонил сообщение. Проверьте формат сообщения и доступность чата.";
  if (code === 401 || code === 404) return "Токен бота недействителен. Обновите его в настройках.";
  if (code === 403) return "Нет доступа к чату. Попросите сотрудника разблокировать бота и нажать «Начать».";
  if (code === 429) return "Telegram ограничил частоту отправки. Ожидаем разрешённого времени повтора.";
  return "Временная ошибка связи с Telegram. Отправка будет повторена автоматически.";
}
export async function telegramRequest<T>(token: string, method: string,
  params: Record<string, unknown> = {}, request: typeof fetch = fetch): Promise<T> {
  if (!/^[A-Za-z][A-Za-z0-9]{1,63}$/.test(method)) throw new TelegramRequestError(400);
  let response: Response;
  try {
    response = await request("https://api.telegram.org/bot" + token + "/" + method, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params), signal: AbortSignal.timeout(10000),
    });
  } catch { throw new TelegramRequestError(0); }
  let json: { ok?: boolean; result?: T; error_code?: number; description?: string;
    parameters?: { retry_after?: number } } | null;
  try { json = await response.json(); }
  catch { throw new TelegramRequestError(response.ok ? 502 : response.status); }
  if (!json || typeof json !== "object" || !response.ok || json.ok !== true || json.result === undefined) {
    const code = Number.isInteger(json?.error_code) && Number(json?.error_code) >= 400
      ? Number(json?.error_code) : response.ok ? 502 : response.status;
    const delay = json?.parameters?.retry_after;
    const retryAfter = typeof delay === "number" && Number.isSafeInteger(delay) && delay > 0 && delay <= 2147483647 ? delay : 0;
    throw new TelegramRequestError(code, retryAfter,
      code === 400 && typeof json?.description === "string" && json.description.includes("message is not modified"));
  }
  return json.result;
}
export function deliveryFailure(error: unknown, consecutiveAttempts: number) {
  const code = error instanceof TelegramRequestError ? error.code : 0;
  const attempts = Number.isFinite(consecutiveAttempts) ? Math.max(1, consecutiveAttempts) : 1;
  const cooldown = code === 429;
  const delaySeconds = cooldown
    ? Math.max(30, error instanceof TelegramRequestError ? error.retryAfter : 0)
    : Math.min(3600, 20 * 2 ** Math.min(attempts, 8));
  const terminal = !cooldown && ([400, 401, 403, 404].includes(code) || attempts >= 12);
  const message = terminal && ![400, 401, 403, 404].includes(code)
    ? "Автоматические попытки исчерпаны. Проверьте соединение и запустите повтор вручную."
    : errorText(code);
  return { code, terminal, cooldown, delaySeconds, message };
}
