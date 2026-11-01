import { SumupError, normalizeApiKey, normalizeMerchantCode, validCheckoutId, type SumupMerchant } from '../../shared/sumup';
export type SumupCheckout = {
  id: string; checkout_reference: string; merchant_code: string; amount: number | string;
  currency: string; status: string; hosted_checkout_url?: string;
};
export function createSumupGateway(request: typeof fetch = fetch) {
  async function call<T>(apiKey: string, path: string, method = 'GET', body?: unknown): Promise<T> {
    const key = normalizeApiKey(apiKey);
    let response: Response;
    try {
      response = await request('https://api.sumup.com' + path, {
        method, headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(12000), redirect: 'error',
      });
    } catch {
      // Never attach a provider error/cause: request objects may contain Authorization.
      throw new SumupError(502, 'SUMUP_UNREACHABLE', 'Нет ответа от SumUp. Проверьте соединение и повторите проверку позже.');
    }
    if (!response.ok) {
      const errors: Record<number, [string, string]> = {
        400: ['SUMUP_REJECTED', 'SumUp отклонил параметры запроса. Проверьте данные и доступ к онлайн-платежам.'],
        401: ['SUMUP_UNAUTHORIZED', 'SumUp не принял API key. Проверьте секретный ключ и выбранный аккаунт.'],
        403: ['SUMUP_FORBIDDEN', 'Недостаточно прав SumUp. Проверьте принадлежность ключа и доступ аккаунта к онлайн-платежам.'],
        404: ['SUMUP_NOT_FOUND', 'SumUp не нашёл ресурс либо он недоступен этому аккаунту.'],
        429: ['SUMUP_RATE_LIMIT', 'SumUp временно ограничил запросы. Подождите перед повторной проверкой.'],
      };
      const [code, message] = errors[response.status] || ['SUMUP_UNAVAILABLE', 'Сервис SumUp временно недоступен. Повторите позже.'];
      throw new SumupError(502, code, message);
    }
    try { return await response.json() as T; }
    catch { throw new SumupError(502, 'SUMUP_INVALID_RESPONSE', 'SumUp вернул некорректный ответ. Повторите проверку позже.'); }
  }
  return {
    async checkMerchant(apiKey: string, merchantCode: string): Promise<SumupMerchant> {
      const code = normalizeMerchantCode(merchantCode);
      const data = await call<Record<string, unknown>>(apiKey, '/v1/merchants/' + code);
      if (!data || data.merchant_code !== code || typeof data.sandbox !== 'boolean') {
        throw new SumupError(502, 'MERCHANT_NOT_VERIFIED', 'Не удалось подтвердить продавца и режим аккаунта. Не включайте оплату до проверки в SumUp.');
      }
      if (data.default_currency !== 'EUR') throw new SumupError(409, 'CURRENCY_MISMATCH', 'Магазин работает в EUR. Валюта аккаунта SumUp должна быть EUR.');
      const profile = data.business_profile as { name?: unknown } | undefined;
      return { merchantCode: code, sandbox: data.sandbox, currency: 'EUR',
        businessName: typeof profile?.name === 'string' ? profile.name.slice(0, 160) : code,
        country: typeof data.country === 'string' ? data.country.slice(0, 2) : '',
      };
    },
    createCheckout: (apiKey: string, payload: Record<string, unknown>) => call<SumupCheckout>(apiKey, '/v0.1/checkouts', 'POST', payload),
    getCheckout(apiKey: string, id: string) {
      if (!validCheckoutId(id)) throw new SumupError(400, 'INVALID_CHECKOUT_ID', 'Некорректный идентификатор оплаты.');
      return call<SumupCheckout>(apiKey, '/v0.1/checkouts/' + encodeURIComponent(id));
    },
  };
}
export type SumupGateway = ReturnType<typeof createSumupGateway>;
