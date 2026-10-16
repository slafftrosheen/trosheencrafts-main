/**
 * The old script deleted ALL products and journal entries then inserted mock content.
 * It must never run against the production database.
 *
 * All real products and journal entries are authored in the admin panel,
 * with media uploaded to Cloudflare R2.
 */
export async function seed() {
  throw new Error(
    "Destructive sample seeding has been retired. Create products and journal entries in /admin instead."
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
