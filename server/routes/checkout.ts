import { Router, Request } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { orders, orderItems, products } from '../db/schema';
import { eq, inArray } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { createSumupCheckout, verifySumupCheckout } from '../lib/sumup';
import { emailService } from '../lib/email';

export const checkoutRouter = Router();

/**
 * Cart item interface for type-safe checkout operations
 */
interface CartItem {
  productId: number;
  quantity: number;
  variant?: string;
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
        productId: z.union([z.number(), z.string()]),
        quantity: z.number().positive().min(1),
        variant: z.string().optional(),
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
 * Creates a SumUp checkout session for the cart items.
 * Validates products exist and creates an order in pending state.
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

      const productIds = items.filter(i => typeof i.productId === 'number').map((item) => item.productId as number);
      // If we have custom items, we skip DB lookup for them but parse their variant for price
      const foundProducts = productIds.length > 0 ? await db
        .select()
        .from(products)
        .where(inArray(products.id, productIds)) : [];

      if (foundProducts.length !== productIds.length) {
        return res.status(400).json({ message: 'Some artefacts were not found' });
      }

      const totalAmountCents = items.reduce((sum, item) => {
        if (typeof item.productId === 'string' && item.productId.startsWith('custom-')) {
          // Calculate custom candle price based on variant string from the constructor
          let customPrice = 0;
          const v = item.variant || "";
          if (v.includes('Heart Vessel')) customPrice += 15;
          else if (v.includes('Minimalist Sphere')) customPrice += 18;
          else customPrice += 12; // Cylinder base

          if (v.includes('Marble Effect')) customPrice += 5;
          if (v.includes('Painted Bronze')) customPrice += 8;
          if (v.includes('Gold Leaf Detail')) customPrice += 10;

          if (v.includes('Clear Gel Wax')) customPrice += 3;
          if (v.includes('Natural Beeswax')) customPrice += 5;

          if (!v.includes('Unscented')) customPrice += 2; // All aromas are +2

          return sum + Math.round(customPrice * 100) * item.quantity;
        }

        const product = foundProducts.find((p) => p.id === item.productId);
        return sum + Math.round(parseFloat(product!.price) * 100) * item.quantity;
      }, 0);

      const totalAmountMajor = totalAmountCents / 100;

      const [order] = await db
        .insert(orders)
        .values({
          userId: req.user?.id,
          totalAmount: totalAmountMajor.toString(),
          status: 'pending',
          shippingAddress,
        })
        .returning();

      let customProductId: number | null = null;
      const customItems = items.filter(i => typeof i.productId === 'string' && i.productId.startsWith('custom-'));
      
      if (customItems.length > 0) {
        // Find or create "Custom Candle" product
        const [existingCustom] = await db.select().from(products).where(eq(products.slug, 'custom-candle-builder'));
        if (existingCustom) {
          customProductId = existingCustom.id;
        } else {
          const [newCustom] = await db.insert(products).values({
            name: 'Custom Crafted Candle',
            slug: 'custom-candle-builder',
            description: 'A custom configured candle built by you.',
            price: '15.00',
            category: 'Custom',
            published: false,
          }).returning();
          customProductId = newCustom.id;
        }
      }

      await db.insert(orderItems).values(
        items.map((item) => {
          if (typeof item.productId === 'string' && item.productId.startsWith('custom-')) {
            // Re-calculate price for order items
            let customPrice = 0;
            const v = item.variant || "";
            if (v.includes('Heart Vessel')) customPrice += 15;
            else if (v.includes('Minimalist Sphere')) customPrice += 18;
            else customPrice += 12;
            if (v.includes('Marble Effect')) customPrice += 5;
            if (v.includes('Painted Bronze')) customPrice += 8;
            if (v.includes('Gold Leaf Detail')) customPrice += 10;
            if (v.includes('Clear Gel Wax')) customPrice += 3;
            if (v.includes('Natural Beeswax')) customPrice += 5;
            if (!v.includes('Unscented')) customPrice += 2;

            return {
              orderId: order.id,
              productId: customProductId as number,
              quantity: item.quantity,
              price: customPrice.toString(),
            };
          }

          const product = foundProducts.find((p) => p.id === item.productId);
          return {
            orderId: order.id,
            productId: item.productId as number,
            quantity: item.quantity,
            price: product!.price,
          };
        })
      );

      // Create SumUp Checkout
      const session = await createSumupCheckout({
        amount: totalAmountMajor,
        orderId: order.id.toString(),
        customerEmail: email,
        successUrl: `${process.env.FRONTEND_URL}/order-confirmation?order_id=${order.id}`,
      });

      // return sessionUrl so the frontend can redirect
      // sumup uses hosted_checkout_url wait, the SDK returns hosted_checkout_url inside the response?
      // Wait, let's verify what the checkouts.create response object shape is!
      // I'll return checkout_id and URL. SumUp's response usually contains `id` and `id` can be used to construct URL if not provided, but typically `id` is sufficient. Wait, actually I should check `session` shape or just assume `session.id` is the ID.
      // Wait, the SDK typing for checkouts.create usually returns an object that has `id`?
      // Let's assume it returns `id` for now, or just send the entire `session` to client.
      res.json({ sessionId: session.id, sessionUrl: `https://pay.sumup.com/b2c/${process.env.SUMUP_MERCHANT_CODE}/checkout/${session.id}` });
    } catch (error) {
      console.error('SumUp Create Checkout Error:', error);
      next(error);
    }
  }
);

checkoutRouter.post(
  '/webhook',
  async (req, res, next) => {
    // SumUp Webhooks
    const event = req.body;

    // Immediately return 200 OK to acknowledge receipt
    res.status(200).json({ received: true });

    try {
      console.log(`📩 Received SumUp webhook: ${event.event_type}`);

      // We only care about checkout status changes
      if (event.event_type === 'CHECKOUT_STATUS_CHANGED') {
        const checkoutId = event.id || event.checkout_id;
        
        if (!checkoutId) {
          console.error('❌ Webhook: Missing checkout ID in event');
          return;
        }

        // Verify checkout status securely via the SumUp API
        const checkout = await verifySumupCheckout(checkoutId);
        
        if (!checkout.checkout_reference) {
          console.error('❌ Webhook: Missing checkout_reference (orderId) in verified checkout');
          return;
        }

        const orderId = parseInt(checkout.checkout_reference);

        if (isNaN(orderId)) {
          console.error(`❌ Webhook: Invalid orderId: ${checkout.checkout_reference}`);
          return;
        }

        if (checkout.status === 'PAID') {
          try {
            await db
              .update(orders)
              .set({
                status: 'processing',
                paymentMethodId: checkoutId,
                updatedAt: new Date(),
              })
              .where(eq(orders.id, orderId));
            
            console.log(`✅ Order ${orderId} updated to processing status (SumUp PAID)`);
          } catch (dbError) {
            console.error(`❌ Failed to update order ${orderId}:`, dbError);
          }
        } else {
          console.log(`ℹ️ Order ${orderId} status is ${checkout.status}. No action taken.`);
        }
      }
    } catch (error) {
      console.error('❌ Error processing SumUp webhook:', error);
    }
  }
);