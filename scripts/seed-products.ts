/**
 * Retired sample product importer.
 *
 * The original script inserted catalog fixtures with nonexistent local images.
 * Products and their media must be created through /admin/products and R2.
 * Kept as a safe failure for old operational commands: no database writes.
 */
throw new Error("Sample products are disabled. Add real products in /admin/products.");
