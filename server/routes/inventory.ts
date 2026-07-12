import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware } from '../middleware/auth';

export const inventoryRouter = Router();

/**
 * GET /api/inventory
 * 
 * Get inventory overview
 */
inventoryRouter.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const allProducts = await db.select().from(products);

    const inventory = {
      totalProducts: allProducts.length,
      lowStock: allProducts.filter(p => p.stock && p.stock < 5 && p.stock > 0).length,
      outOfStock: allProducts.filter(p => !p.stock || p.stock === 0).length,
      inStock: allProducts.filter(p => p.stock && p.stock >= 5).length,
      totalValue: allProducts.reduce((sum, p) => {
        return sum + (parseFloat(p.price) * (p.stock || 0));
      }, 0),
      products: allProducts.map(p => ({
        ...p,
        status: !p.stock || p.stock === 0 ? 'out_of_stock' : 
                p.stock < 5 ? 'low_stock' : 'in_stock',
      })),
    };

    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/inventory/low-stock
 * 
 * Get products with low stock
 */
inventoryRouter.get('/low-stock', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { threshold = '5' } = req.query;
    const thresholdNum = parseInt(threshold as string);

    const lowStockProducts = await db
      .select()
      .from(products)
      .where(
        and(
          sql`stock < ${thresholdNum}`,
          sql`stock > 0`
        )
      );

    res.json(lowStockProducts);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/inventory/out-of-stock
 * 
 * Get out of stock products
 */
inventoryRouter.get('/out-of-stock', adminAuthMiddleware, async (req, res, next) => {
  try {
    const outOfStockProducts = await db
      .select()
      .from(products)
      .where(eq(products.stock, 0));

    res.json(outOfStockProducts);
  } catch (error) {
    next(error);
  }
});

const updateStockSchema = z.object({
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    stock: z.number().int().min(0),
    reason: z.string().optional(),
  }),
});

/**
 * PUT /api/inventory/:id/stock
 * 
 * Update product stock
 */
inventoryRouter.put(
  '/:id/stock',
  adminAuthMiddleware,
  validateRequest(updateStockSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { stock, reason } = req.body;

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const oldStock = product.stock || 0;

      const [updated] = await db
        .update(products)
        .set({ 
          stock, 
          updatedAt: new Date() 
        })
        .where(eq(products.id, parseInt(id)))
        .returning();

      // Log stock change
      console.log('Stock updated:', {
        productId: id,
        productName: product.name,
        oldStock,
        newStock: stock,
        difference: stock - oldStock,
        reason: reason || 'Manual update',
        timestamp: new Date(),
      });

      res.json({
        product: updated,
        stockChange: {
          old: oldStock,
          new: stock,
          difference: stock - oldStock,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

const bulkUpdateStockSchema = z.object({
  body: z.object({
    updates: z.array(z.object({
      id: z.number().positive(),
      stock: z.number().int().min(0),
    })),
  }),
});

/**
 * POST /api/inventory/bulk-update
 * 
 * Bulk update product stock
 */
inventoryRouter.post(
  '/bulk-update',
  adminAuthMiddleware,
  validateRequest(bulkUpdateStockSchema),
  async (req, res, next) => {
    try {
      const { updates } = req.body;

      const results = [];

      for (const update of updates) {
        const [product] = await db
          .update(products)
          .set({ 
            stock: update.stock, 
            updatedAt: new Date() 
          })
          .where(eq(products.id, update.id))
          .returning();

        if (product) {
          results.push(product);
        }
      }

      res.json({
        updated: results.length,
        products: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/inventory/history/:id
 * 
 * Get stock history for a product (placeholder)
 */
inventoryRouter.get('/history/:id', adminAuthMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Implement stock history table
    res.json({
      productId: parseInt(id),
      history: [],
      message: 'Stock history tracking not yet implemented',
    });
  } catch (error) {
    next(error);
  }
});

const adjustStockSchema = z.object({
  params: z.object({
    id: z.coerce.number().positive(),
  }),
  body: z.object({
    adjustment: z.number().int(),
    reason: z.enum(['sale', 'restock', 'damage', 'return', 'correction', 'other']),
    note: z.string().optional(),
  }),
});

/**
 * POST /api/inventory/:id/adjust
 * 
 * Adjust stock (add or remove)
 */
inventoryRouter.post(
  '/:id/adjust',
  adminAuthMiddleware,
  validateRequest(adjustStockSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { adjustment, reason, note } = req.body;

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, parseInt(id)))
        .limit(1);

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const oldStock = product.stock || 0;
      const newStock = Math.max(0, oldStock + adjustment);

      const [updated] = await db
        .update(products)
        .set({ 
          stock: newStock, 
          updatedAt: new Date() 
        })
        .where(eq(products.id, parseInt(id)))
        .returning();

      console.log('Stock adjusted:', {
        productId: id,
        productName: product.name,
        oldStock,
        newStock,
        adjustment,
        reason,
        note,
        timestamp: new Date(),
      });

      res.json({
        product: updated,
        adjustment: {
          old: oldStock,
          new: newStock,
          change: adjustment,
          reason,
          note,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);
