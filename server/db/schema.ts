import { pgTable, serial, text, integer, decimal, boolean, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  usernameIdx: uniqueIndex('users_username_idx').on(table.username),
  roleIdx: index('users_role_idx').on(table.role),
}));

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category'),
  images: jsonb('images').$type<string[]>().default([]),
  stock: integer('stock').default(0),
  featured: boolean('featured').default(false),
  published: boolean('published').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('products_slug_idx').on(table.slug),
  categoryIdx: index('products_category_idx').on(table.category),
  featuredIdx: index('products_featured_idx').on(table.featured),
  publishedIdx: index('products_published_idx').on(table.published),
  createdAtIdx: index('products_created_at_idx').on(table.createdAt),
}));

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  shippingAddress: jsonb('shipping_address').notNull().$type<{
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    email?: string;
  }>(),
  paymentMethodId: text('payment_method_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  subscribedAt: timestamp('subscribed_at').notNull().defaultNow(),
  isActive: boolean('is_active').notNull().default(true),
  unsubscribedAt: timestamp('unsubscribed_at'),
  source: text('source').default('website'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  preferences: jsonb('preferences').$type<{
    marketing?: boolean;
    productUpdates?: boolean;
    blogUpdates?: boolean;
  }>().default({ marketing: true, productUpdates: true, blogUpdates: true }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('newsletter_subscribers_email_idx').on(table.email),
  isActiveIdx: index('newsletter_subscribers_is_active_idx').on(table.isActive),
  subscribedAtIdx: index('newsletter_subscribers_subscribed_at_idx').on(table.subscribedAt),
}));

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  variant: text('variant'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  orderIdIdx: index('order_items_order_id_idx').on(table.orderId),
  productIdIdx: index('order_items_product_id_idx').on(table.productId),
}));

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt').notNull(),
  image: text('image'),
  video: text('video'), // Video URL support
  mediaType: text('media_type').default('text'), // 'image', 'video', 'text'
  tags: jsonb('tags').$type<string[]>().default([]), // Tags array for social media
  author: text('author').notNull(),
  publishedAt: timestamp('published_at'),
  postedToSocial: boolean('posted_to_social').default(false), // Track if posted to social
  socialPostIds: jsonb('social_post_ids').$type<{
    instagram?: string;
    facebook?: string;
    telegram?: number;
  }>(), // Store social media post IDs
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('blog_posts_slug_idx').on(table.slug),
  publishedAtIdx: index('blog_posts_published_at_idx').on(table.publishedAt),
  createdAtIdx: index('blog_posts_created_at_idx').on(table.createdAt),
}));

export const contactSubmissions = pgTable('contact_submissions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('contact_submissions_status_idx').on(table.status),
  createdAtIdx: index('contact_submissions_created_at_idx').on(table.createdAt),
}));

export const galleryCategories = pgTable('gallery_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  type: text('type').notNull(), // '3d' or 'photo'
  featured: boolean('featured').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('gallery_categories_slug_idx').on(table.slug),
  typeIdx: index('gallery_categories_type_idx').on(table.type),
}));

export const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  categoryId: integer('category_id').references(() => galleryCategories.id, { onDelete: 'set null' }),
  type: text('type').notNull(), // '3d', 'photo', or 'video'
  mediaUrl: text('media_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  metadata: jsonb('metadata').$type<{
    modelFormat?: string;
    dimensions?: { width: number; height: number; depth?: number };
    materials?: string[];
    year?: number;
    location?: string;
    photographer?: string;
  }>(),
  tags: jsonb('tags').$type<string[]>().default([]),
  featured: boolean('featured').default(false),
  published: boolean('published').default(true),
  viewCount: integer('view_count').default(0),
  likes: integer('likes').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: uniqueIndex('gallery_items_slug_idx').on(table.slug),
  categoryIdIdx: index('gallery_items_category_id_idx').on(table.categoryId),
  typeIdx: index('gallery_items_type_idx').on(table.type),
  featuredIdx: index('gallery_items_featured_idx').on(table.featured),
  publishedIdx: index('gallery_items_published_idx').on(table.published),
}));

export const session = pgTable('session', {
  sid: text('sid').primaryKey(),
  sess: jsonb('sess').notNull(),
  expire: timestamp('expire', { precision: 6 }).notNull(),
});

// Site Configuration table for editable contact info and social links
export const siteConfig = pgTable('site_config', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  keyIdx: uniqueIndex('site_config_key_idx').on(table.key),
}));

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(),
  videoUrl: text('video_url'),
  linkUrl: text('link_url'),
  linkText: text('link_text'),
  active: boolean('active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  activeIdx: index('promotions_active_idx').on(table.active),
  sortOrderIdx: index('promotions_sort_order_idx').on(table.sortOrder),
}));

// Constructor Config Options (Finishes, Waxes, Aromas)
export const constructorOptions = pgTable('constructor_options', {
  id: serial('id').primaryKey(),
  type: text('type').notNull(), // 'finish', 'wax', 'aroma'
  key: text('key').notNull().unique(), // e.g., 'white-stone', 'soy', 'lavender'
  nameTranslations: jsonb('name_translations').notNull().$type<{
    en: string;
    lv?: string;
    ru?: string;
    pl?: string;
    uk?: string;
  }>(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull().default('0'),
  color: text('color'), // for finish swatches (hex or gradient)
  border: text('border'), // for finish swatch borders
  imageUrl: text('image_url'), // for vessel images
  descTranslations: jsonb('desc_translations').$type<{
    en?: string;
    lv?: string;
    ru?: string;
    pl?: string;
    uk?: string;
  }>(),
  active: boolean('active').default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  typeIdx: index('constructor_options_type_idx').on(table.type),
  keyIdx: uniqueIndex('constructor_options_key_idx').on(table.key),
  activeIdx: index('constructor_options_active_idx').on(table.active),
  sortOrderIdx: index('constructor_options_sort_order_idx').on(table.sortOrder),
}));