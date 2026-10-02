import { SumUp } from "@sumup/sdk";

if (!process.env.SUMUP_API_KEY) {
  console.warn("SUMUP_API_KEY is missing. SumUp payments will fail.");
}

if (!process.env.SUMUP_MERCHANT_CODE) {
  console.warn("SUMUP_MERCHANT_CODE is missing. SumUp payments will fail.");
}

export const sumupClient = new SumUp({
  apiKey: process.env.SUMUP_API_KEY || "dummy_key",
});

export async function createSumupCheckout({
  amount,
  orderId,
  successUrl,
  callbackUrl,
}: {
  amount: number;
  orderId: string;
  successUrl: string;
  callbackUrl?: string;
}) {
  const payload: any = {
    amount,
    currency: "EUR",
    checkout_reference: orderId,
    merchant_code: process.env.SUMUP_MERCHANT_CODE || "dummy_merchant",
    description: "Trosheen.Crafts order #" + orderId,
    purpose: "CHECKOUT",
    hosted_checkout: { enabled: true },
    redirect_url: successUrl,
  };

  if (callbackUrl) {
    payload.return_url = callbackUrl;
  }

  const checkout: any = await sumupClient.checkouts.create(payload);

  if (!checkout?.id || !checkout?.hosted_checkout_url) {
    throw new Error("SumUp did not return a hosted checkout URL.");
  }

  return checkout;
}

export async function verifySumupCheckout(checkoutId: string) {
  return await sumupClient.checkouts.get(checkoutId);
}
