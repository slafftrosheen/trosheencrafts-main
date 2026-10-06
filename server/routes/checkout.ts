import { Router, Request } from "express";
import { z } from "zod";
import { db } from "../db";
import { constructorOptions, orders, orderItems, products } from "../db/schema";
import { eq, inArray } from "drizzle-orm";
import { validateRequest } from "../middleware/validation";
import { createSumupCheckout, verifySumupCheckout } from "../lib/sumup";

export const checkoutRouter = Router();

interface CustomConfiguration {
  vesselId: number;
  finishId: number;
  waxId: number;
  aromaId: number;
  customDescription?: string;
}

interface CartItem {
  productId: number | string;
  quantity: number;
  variant?: string;
  customConfiguration?: CustomConfiguration;
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

const customConfigurationSchema = z.object({
  vesselId: z.number().int().positive(),
  finishId: z.number().int().positive(),
  waxId: z.number().int().positive(),
  aromaId: z.number().int().positive(),
  customDescription: z.string().trim().max(500).optional(),
});

const createCheckoutSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.union([z.number().int().positive(), z.string().min(1)]),
          quantity: z.number().int().positive().max(99),
          variant: z.string().max(1000).optional(),
          customConfiguration: customConfigurationSchema.optional(),
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

const optionName = (option: typeof constructorOptions.$inferSelect) => {
  const names = option.nameTranslations as { en?: string };
  return names?.en || option.key;
};

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
        if (typeof item.productId === "string" && !item.productId.startsWith("custom-")) {
          return res.status(400).json({ message: "A selected piece is not valid." });
        }

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

      const customItems = items.filter(
        (item) => typeof item.productId === "string" && item.productId.startsWith("custom-")
      );

      for (const item of customItems) {
        if (!item.customConfiguration) {
          return res.status(400).json({
            message: "A custom piece is missing its configuration. Please rebuild it in the workshop.",
          });
        }
      }

      const optionIds = Array.from(
        new Set(
          customItems.flatMap((item) => {
            const config = item.customConfiguration!;
            return [config.vesselId, config.finishId, config.waxId, config.aromaId];
          })
        )
      );

      const foundOptions = optionIds.length
        ? await db.select().from(constructorOptions).where(inArray(constructorOptions.id, optionIds))
        : [];

      const optionById = new Map(foundOptions.map((option) => [option.id, option]));

      const pricedItems = items.map((item) => {
        if (typeof item.productId === "number") {
          const product = foundProducts.find((candidate) => candidate.id === item.productId)!;
          return {
            item,
            unitPrice: Number(product.price),
            variant: item.variant?.trim() || null,
          };
        }

        const config = item.customConfiguration!;
        const vessel = optionById.get(config.vesselId);
        const finish = optionById.get(config.finishId);
        const wax = optionById.get(config.waxId);
        const aroma = optionById.get(config.aromaId);

        const typedOptions = [
          ["vessel", vessel],
          ["finish", finish],
          ["wax", wax],
          ["aroma", aroma],
        ] as const;

        for (const [expectedType, option] of typedOptions) {
          if (!option || option.type !== expectedType || option.active === false) {
            throw new Error("INVALID_CUSTOM_CONFIGURATION");
          }
        }

        const unitPrice =
          Number(vessel!.price) +
          Number(finish!.price) +
          Number(wax!.price) +
          Number(aroma!.price);

        const customNote = config.customDescription?.trim();
        const finishLabel =
          optionName(finish!) + (customNote ? " (" + customNote + ")" : "");

        return {
          item,
          unitPrice,
          variant: [
            optionName(vessel!),
            finishLabel,
            optionName(wax!),
            optionName(aroma!),
          ].join(" / "),
        };
      });

      const totalAmount = pricedItems.reduce(
        (sum, priced) => sum + priced.unitPrice * priced.item.quantity,
        0
      );

      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        return res.status(400).json({ message: "Unable to calculate a valid order total." });
      }

      let customProductId: number | null = null;

      if (customItems.length > 0) {
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
              price: "0.00",
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
          pricedItems.map(({ item, unitPrice, variant }) => ({
            orderId: createdOrder.id,
            productId:
              typeof item.productId === "number"
                ? item.productId
                : (customProductId as number),
            quantity: item.quantity,
            price: unitPrice.toFixed(2),
            variant,
          }))
        );

        return createdOrder;
      });

      const publicBaseUrl =
        (process.env.SITE_URL || process.env.FRONTEND_URL || "https://trosheen.shop").replace(/\/$/, "");

      try {
        const checkout = await createSumupCheckout({
          amount: totalAmount,
          orderId: order.id.toString(),
          successUrl: publicBaseUrl + "/order-confirmation?order_id=" + order.id,
          callbackUrl: publicBaseUrl + "/api/checkout/webhook",
        });

        return res.json({
          orderId: order.id,
          sessionId: checkout.id,
          sessionUrl: checkout.hosted_checkout_url,
        });
      } catch (checkoutError) {
        await db.delete(orders).where(eq(orders.id, order.id));
        throw checkoutError;
      }
    } catch (error: any) {
      if (error?.message === "INVALID_CUSTOM_CONFIGURATION") {
        return res.status(400).json({
          message: "A custom option is no longer available. Please review the custom piece before checkout.",
        });
      }

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
