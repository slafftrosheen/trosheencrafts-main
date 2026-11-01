import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { orderItems, orders, products } from "../db/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { validateRequest } from "../middleware/validation";
import { adminAuthMiddleware, authMiddleware } from "../middleware/auth";

export const ordersRouter = Router();

ordersRouter.get("/", authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).user?.id;
    const isAdmin = (req as any).user?.role === "admin";

    let query = db.select().from(orders);

    if (!isAdmin) {
      query = query.where(eq(orders.userId, userId)) as any;
    }

    const userOrders = await query.orderBy(desc(orders.createdAt));

    if (userOrders.length === 0) {
      return res.json([]);
    }

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        variant: orderItems.variant,
        productName: products.name,
        productSlug: products.slug,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(inArray(orderItems.orderId, userOrders.map((order) => order.id)));

    const itemsByOrder = new Map<number, typeof items>();
    for (const item of items) {
      const currentItems = itemsByOrder.get(item.orderId) || [];
      currentItems.push(item);
      itemsByOrder.set(item.orderId, currentItems);
    }

    res.json(
      userOrders.map((order) => ({
        ...order,
        items: itemsByOrder.get(order.id) || [],
      }))
    );
  } catch (error) {
    next(error);
  }
});

const statusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["pending", "payment_review", "processing", "shipped", "delivered", "cancelled"]),
  }),
});

ordersRouter.patch(
  "/:id/status",
  adminAuthMiddleware,
  validateRequest(statusSchema),
  async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      // Payment state belongs to the verified SumUp webhook, never the admin UI.
      // Do not let a manual status change turn an unpaid/review order into a paid order.
      const transitions: Record<string, string[]> = {
        processing: ["shipped", "cancelled"],
        shipped: ["delivered", "processing", "cancelled"],
        delivered: [],
        cancelled: [],
      };
      const allowedFrom = Object.entries(transitions)
        .filter(([, targets]) => targets.includes(status))
        .map(([source]) => source);
      if (!allowedFrom.length) {
        return res.status(409).json({
          message: "Payment status cannot be changed manually. Verify payment in SumUp.",
        });
      }
      const [updated] = await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(and(eq(orders.id, id), inArray(orders.status, allowedFrom as any)))
        .returning();
      if (!updated) {
        const [existing] = await db.select({ id: orders.id }).from(orders)
          .where(eq(orders.id, id)).limit(1);
        return res.status(existing ? 409 : 404).json({
          message: existing
            ? "Status transition is not permitted. Payment must be verified first."
            : "Order not found",
        });
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  }
);
