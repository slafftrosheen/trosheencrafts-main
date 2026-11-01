import { randomUUID } from 'node:crypto';
import { SumupError, eurCents, trustedCheckoutUrl, validCheckoutId, type SumupTestCheckout } from '../../shared/sumup';
import type { PaymentContext, PaymentDatabase, PaymentSql, SumupConfiguration } from './sumupConfiguration';
import type { SumupCheckout, SumupGateway } from './sumupGateway';
type OrderRow = { id: number; status: string; total_amount: string; payment_method_id: string | null };
type Binding = { checkout_id: string; checkout_reference: string; order_id: number | null;
  credential_id: number; merchant_code: string; amount: string; currency: string; kind: 'order' | 'setup'; hosted_url: string };
export type CreateSumupCheckoutInput = { amount: number; orderId: string; successUrl: string; callbackUrl: string; context: PaymentContext };

export function createSumupPayments(database: PaymentDatabase, configuration: SumupConfiguration, gateway: SumupGateway) {
  const binding = async (id: string) => (await database.query<Binding>(
    '/*sumup:binding*/ SELECT * FROM sumup_checkout_bindings WHERE checkout_id=$1', [id]
  )).rows[0] ?? null;
  async function insertBinding(sql: PaymentSql, checkout: SumupCheckout, context: PaymentContext, amount: number, reference: string, orderId: number | null) {
    await sql.query(`/*sumup:bind*/ INSERT INTO sumup_checkout_bindings
      (checkout_id,order_id,credential_id,merchant_code,amount,currency,kind,hosted_url,checkout_reference)
      VALUES ($1,$2,$3,$4,$5,'EUR',$6,$7,$8)`,
    [checkout.id, orderId, context.credentialId, context.merchantCode, amount.toFixed(2), orderId === null ? 'setup' : 'order', trustedCheckoutUrl(checkout.hosted_checkout_url), reference]);
  }
  function matches(checkout: SumupCheckout, id: string, reference: string, merchant: string, amount: unknown): boolean {
    const cents = eurCents(amount);
    return Boolean(checkout && checkout.id === id && checkout.checkout_reference === reference &&
      checkout.merchant_code === merchant && checkout.currency === 'EUR' && cents !== null && eurCents(checkout.amount) === cents);
  }
  async function issue(context: PaymentContext, reference: string, amount: number, successUrl: string, callbackUrl?: string) {
    const result = await gateway.createCheckout(context.apiKey, {
      amount, currency: 'EUR', checkout_reference: reference, merchant_code: context.merchantCode,
      description: context.descriptionPrefix + ' #' + reference, purpose: 'CHECKOUT',
      hosted_checkout: { enabled: true }, redirect_url: successUrl,
      ...(callbackUrl ? { return_url: callbackUrl } : {}),
    });
    if (!result || !validCheckoutId(result.id) || !matches(result, result.id, reference, context.merchantCode, amount)) {
      throw new SumupError(502, 'INVALID_CHECKOUT_RESPONSE', 'Не удалось проверить созданную оплату. Заказ сохранён для проверки.');
    }
    trustedCheckoutUrl(result.hosted_checkout_url);
    return result;
  }
  async function createCheckout(input: CreateSumupCheckoutInput) {
    const { context, amount, orderId, successUrl, callbackUrl } = input;
    if (context.sandbox !== false) throw new SumupError(409, 'SANDBOX_NOT_LIVE', 'Тестовая оплата не может использоваться для заказа покупателя.');
    const id = Number(orderId);
    if (!/^[1-9][0-9]*$/.test(orderId) || !Number.isSafeInteger(id) || id > 2147483647 || eurCents(amount) === null) {
      throw new SumupError(400, 'INVALID_ORDER', 'Некорректный заказ или сумма оплаты.');
    }
    let redirect: URL;
    try { redirect = new URL(successUrl); } catch { throw new SumupError(400, 'INVALID_RETURN_URL', 'Некорректный адрес возврата.'); }
    if (redirect.origin !== context.siteUrl || redirect.username || redirect.password ||
      redirect.pathname !== '/order-confirmation' || redirect.searchParams.get('order_id') !== orderId ||
      callbackUrl !== context.siteUrl + '/api/checkout/webhook') {
      throw new SumupError(400, 'INVALID_RETURN_URL', 'Адреса оплаты должны соответствовать сохранённому домену магазина.');
    }
    await configuration.assertCurrent(context);
    const expected = (await database.query<OrderRow>('/*sumup:order*/ SELECT id,status,total_amount,payment_method_id FROM orders WHERE id=$1', [id])).rows[0];
    if (!expected || expected.status !== 'pending' || expected.payment_method_id || eurCents(expected.total_amount) !== eurCents(amount)) {
      throw new SumupError(409, 'ORDER_CHANGED', 'Заказ уже изменён или имеет платёжную сессию.');
    }
    const checkout = await issue(context, orderId, amount, successUrl, callbackUrl);
    const client = await database.connect();
    try {
      await client.query('BEGIN');
      const locked = (await client.query<OrderRow>('/*sumup:order*/ SELECT id,status,total_amount,payment_method_id FROM orders WHERE id=$1 FOR UPDATE', [id])).rows[0];
      if (!locked || locked.status !== 'pending' || locked.payment_method_id || eurCents(locked.total_amount) !== eurCents(amount)) {
        throw new SumupError(409, 'ORDER_CHANGED', 'Заказ изменён во время создания оплаты. Нужна проверка.');
      }
      await insertBinding(client, checkout, context, amount, orderId, id);
      await client.query('/*sumup:attach*/ UPDATE orders SET payment_method_id=$2,updated_at=NOW() WHERE id=$1', [id, checkout.id]);
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK').catch(() => undefined); throw error; }
    finally { client.release(); }
    return { id: checkout.id, hosted_checkout_url: trustedCheckoutUrl(checkout.hosted_checkout_url) };
  }
  /** No payment mutations here: the existing webhook retains its atomic stock/outbox transaction. */
  async function verifyPayment(checkoutId: string): Promise<SumupCheckout | null> {
    if (!validCheckoutId(checkoutId)) return null;
    const saved = await binding(checkoutId);
    if (saved?.kind === 'setup') return null;
    const order = saved?.order_id
      ? (await database.query<OrderRow>('/*sumup:order*/ SELECT id,status,total_amount,payment_method_id FROM orders WHERE id=$1', [saved.order_id])).rows[0]
      : (await database.query<OrderRow>('/*sumup:order-by-checkout*/ SELECT id,status,total_amount,payment_method_id FROM orders WHERE payment_method_id=$1 LIMIT 1', [checkoutId])).rows[0];
    if (!order || order.payment_method_id !== checkoutId) return null;
    const account = saved ? await configuration.verificationCredential(saved.credential_id) : await configuration.legacyCredential();
    if (!account || account.sandbox === true) return null;
    // Pre-migration env credentials were not classified. Never assume they are live.
    if (account.sandbox === null && (await gateway.checkMerchant(account.apiKey, account.merchantCode)).sandbox) return null;
    if (saved && (saved.merchant_code !== account.merchantCode || saved.currency !== 'EUR' ||
      saved.checkout_reference !== String(order.id) || eurCents(saved.amount) !== eurCents(order.total_amount))) return null;
    const checkout = await gateway.getCheckout(account.apiKey, checkoutId);
    return matches(checkout, checkoutId, String(order.id), saved?.merchant_code || account.merchantCode, order.total_amount) ? checkout : null;
  }
  async function createSandboxCheckout(expectedVersion: number, actorId: string): Promise<SumupTestCheckout> {
    const context = await configuration.sandboxContext(expectedVersion, actorId);
    const reference = 'setup-' + randomUUID();
    // This creates only a sandbox checkout, not an order, charge request, stock change or notification.
    const checkout = await issue(context, reference, 1, context.siteUrl + '/admin/settings#sumup');
    await insertBinding(database, checkout, context, 1, reference, null);
    return { id: checkout.id, url: trustedCheckoutUrl(checkout.hosted_checkout_url), amount: 1, currency: 'EUR', status: 'PENDING' };
  }
  async function getSandboxCheckout(id: string): Promise<SumupTestCheckout> {
    if (!validCheckoutId(id)) throw new SumupError(400, 'INVALID_CHECKOUT_ID', 'Некорректная проверочная оплата.');
    const saved = await binding(id);
    if (!saved || saved.kind !== 'setup') throw new SumupError(404, 'TEST_NOT_FOUND', 'Проверочная оплата не найдена.');
    const account = await configuration.verificationCredential(saved.credential_id);
    if (account.sandbox !== true) throw new SumupError(409, 'SANDBOX_REQUIRED', 'Эта оплата не относится к Sandbox.');
    const checkout = await gateway.getCheckout(account.apiKey, id);
    if (!matches(checkout, id, saved.checkout_reference, saved.merchant_code, saved.amount)) throw new SumupError(502, 'CHECKOUT_MISMATCH', 'Ответ SumUp не соответствует проверочной оплате.');
    const status = ['PENDING', 'PAID', 'FAILED', 'EXPIRED'].includes(checkout.status) ? checkout.status : 'UNKNOWN';
    return { id, url: trustedCheckoutUrl(saved.hosted_url), amount: Number(saved.amount), currency: 'EUR', status };
  }
  return { createCheckout, verifyPayment, createSandboxCheckout, getSandboxCheckout };
}
