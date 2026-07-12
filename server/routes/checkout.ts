import { Router, Request } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { orders, orderItems, products } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { createCheckoutSession, constructWebhookEvent } from '../lib/stripe';
import { emailService } from '../lib/email';
import type Stripe from 'stripe';

export const checkoutRouter = Router();

/**
 * Cart item interface for type-safe checkout operations
 */
interface CartItem {
  productId: number;
  quantity: number;
}

/**
 * Shipping address interface matching database schema
 */
interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * Extended request interface with authenticated user
 */
interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

const createCheckoutSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.number().positive(),
        quantity: z.number().positive().min(1),
      })
    ).min(1),
    shippingAddress: z.object({
      name: z.string().min(1),
      street: z.string().min(1),
      city: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().min(1),
    }),
    email: z.string().email(),
  }),
});

/**
 * POST /api/checkout/create-session
 * 
 * Creates a Stripe checkout session for the cart items.
 * Validates products exist and creates an order in pending state.
 * 
 * @param {CartItem[]} items - Array of cart items with productId and quantity
 * @param {ShippingAddress} shippingAddress - Customer shipping address
 * @param {string} email - Customer email for receipt
 * 
 * @returns {Object} 200 - { sessionId, sessionUrl } for Stripe redirect
 * @returns {Object} 400 - Product not found or validation error
 * @returns {Object} 500 - Server error
 */
checkoutRouter.post(
  '/create-session',
  validateRequest(createCheckoutSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { items, shippingAddress, email } = req.body as {
        items: CartItem[];
        shippingAddress: ShippingAddress;
        email: string;
      };

      const productIds = items.map((item) => item.productId);
      const foundProducts = await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds));

      if (foundProducts.length !== productIds.length) {
        return res.status(400).json({ message: 'Some artefacts were not found' });
      }

      const totalAmountCents = items.reduce((sum, item) => {
        const product = foundProducts.find((p) => p.id === item.productId);
        return sum + Math.round(parseFloat(product!.price) * 100) * item.quantity;
      }, 0);

      const [order] = await db
        .insert(orders)
        .values({
          userId: req.user?.id,
          totalAmount: (totalAmountCents / 100).toString(),
          status: 'pending',
          shippingAddress,
        })
        .returning();

      await db.insert(orderItems).values(
        items.map((item) => {
          const product = foundProducts.find((p) => p.id === item.productId);
          return {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product!.price,
          };
        })
      );

      const session = await createCheckoutSession({
        lineItems: items.map((item) => {
          const product = foundProducts.find((p) => p.id === item.productId);
          return {
            price_data: {
              currency: 'eur',
              product_data: {
                name: product!.name,
                images: product!.images && product!.images.length > 0 ? [product!.images[0]] : [],
              },
              unit_amount: Math.round(parseFloat(product!.price) * 100),
            },
            quantity: item.quantity,
          };
        }),
        successUrl: `${process.env.FRONTEND_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
        cancelUrl: `${process.env.FRONTEND_URL}/cart`,
        customerEmail: email,
        metadata: {
          orderId: order.id.toString(),
        },
      });

      res.json({ sessionId: session.id, sessionUrl: session.url });
    } catch (error) {
      next(error);
    }
  }
);

checkoutRouter.post(
  '/webhook',
  async (req, res, next) => {
    const signature = req.headers['stripe-signature'] as string;
    
    // Validate required webhook configuration
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET is not configured');
      return res.status(500).json({ 
        message: 'Webhook not configured',
        received: false 
      });
    }

    if (!signature) {
      console.error('❌ Missing stripe-signature header in webhook request');
      return res.status(400).json({ 
        message: 'Missing signature',
        received: false 
      });
    }

    try {
      const event = constructWebhookEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`📩 Received Stripe webhook: ${event.type}`);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (!session.metadata?.orderId) {
          console.error('❌ Webhook: Missing orderId in session metadata');
          return res.status(400).json({ 
            message: 'Missing order metadata',
            received: false 
          });
        }

        const orderId = parseInt(session.metadata.orderId);

        if (isNaN(orderId)) {
          console.error(`❌ Webhook: Invalid orderId: ${session.metadata.orderId}`);
          return res.status(400).json({ 
            message: 'Invalid order ID',
            received: false 
          });
        }

        try {
          await db
            .update(orders)
            .set({
              status: 'processing',
              paymentMethodId: session.payment_intent as string,
              updatedAt: new Date(),
            })
            .where(eq(orders.id, orderId));
          
          console.log(`✅ Order ${orderId} updated to processing status`);
        } catch (dbError) {
          console.error(`❌ Failed to update order ${orderId}:`, dbError);
          // Still return 200 to Stripe to prevent retries for DB issues
          // The order can be reconciled manually or via a retry job
        }
      }

      res.json({ received: true });
    } catch (error) {
      // Log webhook signature validation errors
      console.error('❌ Webhook signature verification failed:', error);
      return res.status(400).json({ 
        message: 'Webhook signature verification failed',
        received: false 
      });
    }
  }
);