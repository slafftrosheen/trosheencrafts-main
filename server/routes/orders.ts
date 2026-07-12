import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { orders, orderItems, products } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware, authMiddleware } from '../middleware/auth';

export const ordersRouter = Router();

const createOrderSchema = z.object({
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
    paymentMethodId: z.string().optional(),
  }),
});

ordersRouter.post(
  '/',
  validateRequest(createOrderSchema),
  async (req, res, next) => {
    try {
      const { items, shippingAddress, paymentMethodId } = req.body as any;

      // Create order in transaction
      const order = await db.transaction(async (tx) => {
        // Calculate total (simplified for brevity)
        const totalAmount = "0"; // You should fetch prices from DB here

        const [newOrder] = await tx
          .insert(orders)
          .values({
            userId: (req as any).user?.id,
            totalAmount,
            status: 'pending',
            shippingAddress,
            paymentMethodId,
          })
          .returning();

        return newOrder;
      });

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }
);

ordersRouter.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === 'admin';

    let query = db.select().from(orders);

    if (!isAdmin) {
      query = query.where(eq(orders.userId, userId)) as any;
    }

    const userOrders = await query.orderBy(desc(orders.createdAt));
    res.json(userOrders);
  } catch (error) {
    next(error);
  }
});