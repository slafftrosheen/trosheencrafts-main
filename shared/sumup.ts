/** Safe public/admin DTOs and validation. Never put credentials in these DTOs. */
export class SumupError extends Error {
  constructor(public readonly statusCode: number, public readonly code: string, message: string) {
    super(message); this.name = 'SumupError';
  }
}
export type SumupMerchant = {
  merchantCode: string; businessName: string; country: string; currency: 'EUR'; sandbox: boolean;
};
export type SumupAdminSettings = {
  version: number; source: 'database' | 'environment' | 'none'; keyConfigured: boolean;
  encryptionReady: boolean; enabled: boolean; merchantCode: string;
  siteUrl: string; descriptionPrefix: string; profile: SumupMerchant | null;
  checkedAt: string | null; webhookUrl: string; returnUrl: string;
};
export type SumupDraft = {
  expectedVersion: number; merchantCode: string; apiKey?: string;
  siteUrl: string; descriptionPrefix: string;
};
export type SumupTestCheckout = { id: string; url: string; amount: number; currency: 'EUR'; status: string };
export function validSettingsVersion(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value < 2147483647;
}
export function normalizeMerchantCode(value: string): string {
  const code = String(value ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9]{4,32}$/.test(code)) throw new SumupError(400, 'INVALID_MERCHANT', 'Укажите корректный Merchant code из аккаунта SumUp.');
  return code;
}
export function normalizeApiKey(value: string): string {
  const key = String(value ?? '').trim();
  if (key.length < 20 || key.length > 512 || /\s|[\x00-\x1f\x7f]/.test(key) || key.startsWith('sup_pk_')) {
    throw new SumupError(400, 'INVALID_API_KEY', 'Нужен секретный API key SumUp, не публичный или affiliate key.');
  }
  return key;
}
export function normalizeSiteOrigin(value: string): string {
  try {
    const url = new URL(String(value).trim());
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
      url.pathname !== '/' || url.port || !host.includes('.') || host.endsWith('.') ||
      /(^|\.)(localhost|local|internal|test|invalid)$/.test(host) ||
      /^[\d.]+$/.test(host) || host.includes(':') || host.includes('[')) throw Error();
    return url.origin;
  } catch {
    throw new SumupError(400, 'INVALID_SITE_URL', 'Укажите публичный HTTPS-домен сайта без пути, порта, логина или параметров.');
  }
}
export function normalizeDescription(value: string): string {
  const text = String(value ?? '').trim();
  if (!text || text.length > 100 || /[\x00-\x1f\x7f]/.test(text)) {
    throw new SumupError(400, 'INVALID_DESCRIPTION', 'Описание платежа: от 1 до 100 символов, без переносов строки.');
  }
  return text;
}
export function eurCents(value: unknown): number | null {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  const text = String(value);
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(text)) return null;
  const [whole, fraction = ''] = text.split('.');
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
export function validCheckoutId(value: string): boolean {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,128}$/.test(value);
}
export function trustedCheckoutUrl(value: unknown): string {
  try {
    const url = new URL(String(value));
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.sumup.com' || url.username || url.password || url.port) throw Error();
    return url.href;
  } catch {
    throw new SumupError(502, 'INVALID_CHECKOUT_RESPONSE', 'SumUp не вернул корректную страницу оплаты. Повторно не оплачивайте заказ без проверки.');
  }
}
