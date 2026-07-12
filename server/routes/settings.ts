import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validation';
import { adminAuthMiddleware } from '../middleware/auth';
import fs from 'fs/promises';
import path from 'path';

export const settingsRouter = Router();

// Settings file path
const SETTINGS_FILE = path.join(process.cwd(), 'data', 'settings.json');

// Default settings
const DEFAULT_SETTINGS = {
  store: {
    name: 'Trosheen Crafts',
    email: 'info@trosheencrafts.com',
    phone: '',
    address: '',
    currency: 'EUR',
    currencySymbol: '€',
    taxRate: 0,
  },
  shipping: {
    defaultCost: 5.00,
    freeShippingThreshold: 50.00,
    enabled: true,
    methods: [
      { id: 'standard', name: 'Standard Shipping', cost: 5.00, days: '5-7' },
      { id: 'express', name: 'Express Shipping', cost: 15.00, days: '2-3' },
    ],
  },
  notifications: {
    emailEnabled: true,
    newOrderEmail: true,
    lowStockAlert: true,
    lowStockThreshold: 5,
  },
  features: {
    blog: true,
    reviews: false,
    wishlist: false,
    guestCheckout: true,
  },
};

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load settings from file
async function loadSettings() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    // Return defaults if file doesn't exist
    return DEFAULT_SETTINGS;
  }
}

// Save settings to file
async function saveSettings(settings: Record<string, unknown>) {
  await ensureDataDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

/**
 * GET /api/settings
 * 
 * Get all settings (admin only)
 */
settingsRouter.get('/', adminAuthMiddleware, async (req, res, next) => {
  try {
    const settings = await loadSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/settings/public
 * 
 * Get public settings (no auth required)
 */
settingsRouter.get('/public', async (req, res, next) => {
  try {
    const settings = await loadSettings();
    
    // Only return public settings
    res.json({
      store: {
        name: settings.store.name,
        currency: settings.store.currency,
        currencySymbol: settings.store.currencySymbol,
      },
      shipping: {
        freeShippingThreshold: settings.shipping.freeShippingThreshold,
        enabled: settings.shipping.enabled,
      },
      features: settings.features,
    });
  } catch (error) {
    next(error);
  }
});

const updateStoreSettingsSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    currency: z.string().length(3).optional(),
    currencySymbol: z.string().optional(),
    taxRate: z.number().min(0).max(100).optional(),
  }),
});

/**
 * PUT /api/settings/store
 * 
 * Update store settings
 */
settingsRouter.put(
  '/store',
  adminAuthMiddleware,
  validateRequest(updateStoreSettingsSchema),
  async (req, res, next) => {
    try {
      const settings = await loadSettings();
      settings.store = { ...settings.store, ...req.body };
      await saveSettings(settings);
      res.json(settings.store);
    } catch (error) {
      next(error);
    }
  }
);

const updateShippingSettingsSchema = z.object({
  body: z.object({
    defaultCost: z.number().min(0).optional(),
    freeShippingThreshold: z.number().min(0).optional(),
    enabled: z.boolean().optional(),
    methods: z.array(z.object({
      id: z.string(),
      name: z.string(),
      cost: z.number(),
      days: z.string(),
    })).optional(),
  }),
});

/**
 * PUT /api/settings/shipping
 * 
 * Update shipping settings
 */
settingsRouter.put(
  '/shipping',
  adminAuthMiddleware,
  validateRequest(updateShippingSettingsSchema),
  async (req, res, next) => {
    try {
      const settings = await loadSettings();
      settings.shipping = { ...settings.shipping, ...req.body };
      await saveSettings(settings);
      res.json(settings.shipping);
    } catch (error) {
      next(error);
    }
  }
);

const updateNotificationSettingsSchema = z.object({
  body: z.object({
    emailEnabled: z.boolean().optional(),
    newOrderEmail: z.boolean().optional(),
    lowStockAlert: z.boolean().optional(),
    lowStockThreshold: z.number().min(0).optional(),
  }),
});

/**
 * PUT /api/settings/notifications
 * 
 * Update notification settings
 */
settingsRouter.put(
  '/notifications',
  adminAuthMiddleware,
  validateRequest(updateNotificationSettingsSchema),
  async (req, res, next) => {
    try {
      const settings = await loadSettings();
      settings.notifications = { ...settings.notifications, ...req.body };
      await saveSettings(settings);
      res.json(settings.notifications);
    } catch (error) {
      next(error);
    }
  }
);

const updateFeatureSettingsSchema = z.object({
  body: z.object({
    blog: z.boolean().optional(),
    reviews: z.boolean().optional(),
    wishlist: z.boolean().optional(),
    guestCheckout: z.boolean().optional(),
  }),
});

/**
 * PUT /api/settings/features
 * 
 * Update feature flags
 */
settingsRouter.put(
  '/features',
  adminAuthMiddleware,
  validateRequest(updateFeatureSettingsSchema),
  async (req, res, next) => {
    try {
      const settings = await loadSettings();
      settings.features = { ...settings.features, ...req.body };
      await saveSettings(settings);
      res.json(settings.features);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/settings/reset
 * 
 * Reset all settings to defaults
 */
settingsRouter.post('/reset', adminAuthMiddleware, async (req, res, next) => {
  try {
    await saveSettings(DEFAULT_SETTINGS);
    res.json({ message: 'Settings reset to defaults', settings: DEFAULT_SETTINGS });
  } catch (error) {
    next(error);
  }
});
