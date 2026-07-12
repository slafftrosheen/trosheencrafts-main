CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text,
	"message" text NOT NULL,
	"status" text DEFAULT 'new',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"to" text NOT NULL,
	"from" text NOT NULL,
	"subject" text NOT NULL,
	"text" text,
	"html" text,
	"status" text DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"last_error" text,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_stripe_session_id_unique";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP CONSTRAINT "blog_posts_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "content" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "blog_posts" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "product_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping_address" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "shipping_address" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "billing_address" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "description" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "stock" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "images" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "images" SET DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin';--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "author" text DEFAULT 'Trosheen Crafts';--> statement-breakpoint
ALTER TABLE "blog_posts" ADD COLUMN "published" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "product_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "product_image" text;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "total" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_phone" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "subtotal" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tax" numeric(10, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "compare_at_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "category_id" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "published" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "featured_image";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "author_id";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "view_count";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "seo_title";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "seo_description";--> statement-breakpoint
ALTER TABLE "blog_posts" DROP COLUMN "tags";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "stripe_session_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "amount";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "name_translations";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "image";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "is_handmade";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "features";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "dimensions";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "weight";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "materials";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "techniques";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "made_by";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_order_number_unique" UNIQUE("order_number");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");