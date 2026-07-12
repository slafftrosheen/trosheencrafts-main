import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  // Use a fallback for build time, but actual server startup will fail if not provided
  console.warn('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

export async function createCheckoutSession(params: {
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[];
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}) {
  return await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: params.lineItems,
    mode: 'payment',
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.customerEmail,
    metadata: params.metadata,
  });
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  secret: string
) {
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
