import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { products } from '../db/schema';
import { eq, ilike, and, desc } from 'drizzle-orm';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware } from '../middleware/auth';

export const productsRouter = Router();

const getProductsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    featured: z.coerce.boolean().optional(),
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
  }),
});

/**
 * GET /api/products
 * 
 * Get a paginated list of products with optional filtering.
 * Public users only see published products. Authenticated users see all products.
 * 
 * Query Parameters:
 * @param {string} [search] - Search products by name (case-insensitive)
 * @param {string} [category] - Filter by category name
 * @param {boolean} [featured] - Filter by featured status
 * @param {number} [limit=50] - Maximum number of results (1-100)
 * @param {number} [offset=0] - Number of results to skip for pagination
 * 
 * @returns {Array<Product>} 200 - Array of product objects
 * @returns {Object} 400 - Validation error
 * @returns {Object} 500 - Server error
 * 
 * @example
 * GET /api/products?search=concrete&category=planters&limit=10
 */
productsRouter.get(
  '/',
  validateRequest(getProductsSchema),
  async (req, res, next) => {
    try {
      const { search, category, featured, limit, offset } = req.query as any;

      let query = db.select().from(products);
      const conditions = [];
      
      if (!req.isAuthenticated()) {
        conditions.push(eq(products.published, true));
      }
      
      if (search) {
        conditions.push(ilike(products.name, `%${search}%`));
      }
      
      if (category && category !== 'all') {
        conditions.push(eq(products.category, category));
      }

      if (featured !== undefined) {
        conditions.push(eq(products.featured, featured));
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const results = await query
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);

      // Add computed inStock field and get first image
      const productsWithInStock = results.map((p: any) => ({
        ...p,
        inStock: (p.stock ?? 0) > 0,
        image: p.images?.[0] || null,
      }));

      res.json(productsWithInStock);
    } catch (error) {
      next(error);
    }
  }
);

const getProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().positive(),
  }),
});

/**
 * GET /api/products/:id
 * 
 * Get a single product by ID.
 * 
 * @param {number} id - Product ID (path parameter)
 * 
 * @returns {Object} 200 - Product object
 * @returns {Object} 404 - Product not found
 * @returns {Object} 500 - Server error
 * 
 * @example
 * GET /api/products/123
 */
productsRouter.get(
  '/:id',
  validateRequest(getProductSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as any;

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!product || (product.published === false && !req.isAuthenticated())) {
        return res.status(404).json({ message: 'Product not found' });
      }

      // Add computed inStock field and get first image
      const productWithInStock = {
        ...product,
        inStock: (product.stock ?? 0) > 0,
        image: product.images?.[0] || null,
      };

      res.json(productWithInStock);
    } catch (error) {
      next(error);
    }
  }
);

// Create product schema
const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    slug: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.coerce.number().positive(),
    category: z.string().min(1),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    stock: z.coerce.number().min(0).default(0),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    inStock: z.boolean().default(true),
  }),
});

/**
 * POST /api/products
 * 
 * Create a new product (admin only).
 * 
 * @returns {Object} 201 - Created product
 * @returns {Object} 400 - Validation error
 * @returns {Object} 401 - Not authenticated
 * @returns {Object} 403 - Not admin
 */
productsRouter.post(
  '/',
  adminAuthMiddleware,
  validateRequest(createProductSchema),
  async (req, res, next) => {
    try {
      const data = req.body;
      
      // Generate slug from name if not provided
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const [product] = await db.insert(products).values({
        name: data.name,
        slug,
        description: data.description || '',
        price: String(data.price),
        category: data.category,
        images: data.images || (data.image ? [data.image] : []),
        stock: data.inStock ? (data.stock || 10) : 0,
        featured: data.featured,
        published: data.published,
      }).returning();

      res.status(201).json(product);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ message: 'Product with this slug already exists' });
      }
      next(error);
    }
  }
);

/**
 * PUT /api/products/:id
 * 
 * Update an existing product (admin only).
 * 
 * @param {number} id - Product ID
 * @returns {Object} 200 - Updated product
 * @returns {Object} 404 - Product not found
 */
productsRouter.put(
  '/:id',
  adminAuthMiddleware,
  validateRequest(getProductSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as any;
      const data = req.body;

      const [existingProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const updateData: any = {
        updatedAt: new Date(),
      };

      if (data.name !== undefined) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.price !== undefined) updateData.price = String(data.price);
      if (data.category !== undefined) updateData.category = data.category;
      if (data.images !== undefined) updateData.images = data.images;
      if (data.image !== undefined && !data.images) updateData.images = [data.image];
      if (data.featured !== undefined) updateData.featured = data.featured;
      if (data.published !== undefined) updateData.published = data.published;
      
      // Handle stock: prefer explicit stock value, otherwise derive from inStock
      if (data.stock !== undefined) {
        updateData.stock = data.stock;
      } else if (data.inStock !== undefined) {
        // Only use inStock logic if stock wasn't explicitly provided
        updateData.stock = data.inStock ? 10 : 0;
      }

      const [product] = await db
        .update(products)
        .set(updateData)
        .where(eq(products.id, id))
        .returning();

      res.json(product);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/products/:id
 * 
 * Delete a product (admin only).
 * 
 * @param {number} id - Product ID
 * @returns {void} 204 - Product deleted
 * @returns {Object} 404 - Product not found
 */
productsRouter.delete(
  '/:id',
  adminAuthMiddleware,
  validateRequest(getProductSchema),
  async (req, res, next) => {
    try {
      const { id } = req.params as any;

      const [existingProduct] = await db
        .select()
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!existingProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }

      await db.delete(products).where(eq(products.id, id));

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
);