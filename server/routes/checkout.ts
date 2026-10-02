import { Router, Request } from "express";
import { z } from "zod";
import { db } from "../db";
import { orders, orderItems, products } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { validateRequest } from "../middleware/validation";
import { createSumupCheckout, verifySumupCheckout } from "../lib/sumup";

export const checkoutRouter = Router();

interface CartItem {
  productId: number | string;
  quantity: number;
  variant?: string;
}

interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

const createCheckoutSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.union([z.number().int().positive(), z.string().min(1)]),
          quantity: z.number().int().positive().max(99),
          variant: z.string().max(1000).optional(),
        })
      )
      .min(1)
      .max(50),
    shippingAddress: z.object({
      name: z.string().trim().min(1).max(150),
      street: z.string().trim().min(1).max(200),
      city: z.string().trim().min(1).max(100),
      postalCode: z.string().trim().min(1).max(40),
      country: z.string().trim().min(1).max(100),
    }),
    email: z.string().trim().email().max(254),
  }),
});

function customPriceFromVariant(variant = "") {
  let price = 0;

  if (variant.includes("Heart Vessel")) price += 15;
  else if (variant.includes("Minimalist Sphere")) price += 18;
  else price += 12;

  if (variant.includes("Marble Effect")) price += 5;
  if (variant.includes("Painted Bronze")) price += 8;
  if (variant.includes("Gold Leaf Detail")) price += 10;
  if (variant.includes("Clear Gel Wax")) price += 3;
  if (variant.includes("Natural Beeswax")) price += 5;
  if (!variant.includes("Unscented")) price += 2;

  return price;
}

checkoutRouter.post(
  "/create-session",
  validateRequest(createCheckoutSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { items, shippingAddress, email } = req.body as {
        items: CartItem[];
        shippingAddress: ShippingAddress;
        email: string;
      };

      const productIds = Array.from(
        new Set(
          items
            .filter((item) => typeof item.productId === "number")
            .map((item) => item.productId as number)
        )
      );

      const foundProducts = productIds.length
        ? await db.select().from(products).where(inArray(products.id, productIds))
        : [];

      if (foundProducts.length !== productIds.length) {
        return res.status(400).json({ message: "Some pieces were not found." });
      }

      for (const item of items) {
        if (typeof item.productId !== "number") continue;

        const product = foundProducts.find((candidate) => candidate.id === item.productId);
        if (!product || product.published === false) {
          return res.status(400).json({ message: "A selected piece is not available." });
        }

        const stock = Number(product.stock ?? 0);
        if (stock < item.quantity) {
          return res.status(400).json({
            message: product.name + " does not have enough stock for that quantity.",
          });
        }
      }

      const totalAmount = items.reduce((sum, item) => {
        if (typeof item.productId === "string" && item.productId.startsWith("custom-")) {
          return sum + customPriceFromVariant(item.variant) * item.quantity;
        }

        const product = foundProducts.find((candidate) => candidate.id === item.productId);
        return sum + Number(product!.price) * item.quantity;
      }, 0);

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        return res.status(400).json({ message: "Unable to calculate a valid order total." });
      }

      let customProductId: number | null = null;
      const hasCustomItems = items.some(
        (item) => typeof item.productId === "string" && item.productId.startsWith("custom-")
      );

      if (hasCustomItems) {
        const [existingCustom] = await db
          .select()
          .from(products)
          .where(eq(products.slug, "custom-candle-builder"))
          .limit(1);

        if (existingCustom) {
          customProductId = existingCustom.id;
        } else {
          const [createdCustom] = await db
            .insert(products)
            .values({
              name: "Custom Crafted Candle",
              slug: "custom-candle-builder",
              description: "A custom configured candle built by the customer.",
              price: "15.00",
              category: "Custom",
              published: false,
              stock: 0,
            })
            .returning();

          customProductId = createdCustom.id;
        }
      }

      const order = await db.transaction(async (tx) => {
        const [createdOrder] = await tx
          .insert(orders)
          .values({
            userId: req.user?.id,
            totalAmount: totalAmount.toFixed(2),
            status: "pending",
            shippingAddress: { ...shippingAddress, email },
          })
          .returning();

        await tx.insert(orderItems).values(
          items.map((item) => {
            if (typeof item.productId === "string" && item.productId.startsWith("custom-")) {
              return {
                orderId: createdOrder.id,
                productId: customProductId as number,
                quantity: item.quantity,
                price: customPriceFromVariant(item.variant).toFixed(2),
              };
            }

            const product = foundProducts.find((candidate) => candidate.id === item.productId)!;
            return {
              orderId: createdOrder.id,
              productId: item.productId as number,
              quantity: item.quantity,
              price: product.price,
            };
          })
        );

        return createdOrder;
      });

      const publicBaseUrl =
        (process.env.SITE_URL || process.env.FRONTEND_URL || "https://trosheen.shop").replace(/\/$/, "");

      const checkout = await createSumupCheckout({
        amount: totalAmount,
        orderId: order.id.toString(),
        successUrl: publicBaseUrl + "/order-confirmation?order_id=" + order.id,
        callbackUrl: publicBaseUrl + "/api/checkout/webhook",
      });

      res.json({
        orderId: order.id,
        sessionId: checkout.id,
        sessionUrl: checkout.hosted_checkout_url,
      });
    } catch (error) {
      console.error("SumUp create checkout error:", error);
      next(error);
    }
  }
);

checkoutRouter.post("/webhook", async (req, res, next) => {
  try {
    const checkoutId = req.body?.id || req.body?.checkout_id;

    if (!checkoutId || typeof checkoutId !== "string") {
      return res.status(200).json({ received: true });
    }

    const checkout: any = await verifySumupCheckout(checkoutId);
    const orderId = Number.parseInt(String(checkout?.checkout_reference || ""), 10);

    if (!Number.isFinite(orderId)) {
      return res.status(200).json({ received: true });
    }

    if (checkout.status === "PAID") {
      await db.transaction(async (tx) => {
        const [existingOrder] = await tx
          .select()
          .from(orders)
          .where(eq(orders.id, orderId))
          .limit(1);

        if (!existingOrder || existingOrder.status !== "pending") {
          return;
        }

        const items = await tx
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, orderId));

        await tx
          .update(orders)
          .set({
            status: "processing",
            paymentMethodId: checkoutId,
            updatedAt: new Date(),
          })
          .where(eq(orders.id, orderId));

        for (const item of items) {
          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId))
            .limit(1);

          if (!product || product.slug === "custom-candle-builder") continue;

          await tx
            .update(products)
            .set({
              stock: Math.max(0, Number(product.stock ?? 0) - item.quantity),
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
      });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("SumUp webhook processing error:", error);
    next(error);
  }
});
