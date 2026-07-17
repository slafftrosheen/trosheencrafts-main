import { SumUp } from '@sumup/sdk';

if (!process.env.SUMUP_API_KEY) {
  console.warn('SUMUP_API_KEY is missing. SumUp payments will fail.');
}

if (!process.env.SUMUP_MERCHANT_CODE) {
  console.warn('SUMUP_MERCHANT_CODE is missing. SumUp payments will fail.');
}

// Initialize SumUp client
export const sumupClient = new SumUp({
  apiKey: process.env.SUMUP_API_KEY || 'dummy_key',
});

/**
 * Creates a SumUp checkout session
 */
export async function createSumupCheckout({
  amount,
  orderId,
  customerEmail,
  successUrl,
}: {
  amount: number; // in major units, e.g. 25.00 for 25 EUR
  orderId: string;
  customerEmail: string;
  successUrl: string;
}) {
  return await sumupClient.checkouts.create({
    amount,
    currency: 'EUR',
    checkout_reference: orderId,
    merchant_code: process.env.SUMUP_MERCHANT_CODE || 'dummy_merchant',
    description: `Trosheen Crafts Order #${orderId}`,
    return_url: successUrl,
    pay_to_email: customerEmail,
  });
}

/**
 * Verifies a SumUp checkout by ID
 */
export async function verifySumupCheckout(checkoutId: string) {
  return await sumupClient.checkouts.get(checkoutId);
}
