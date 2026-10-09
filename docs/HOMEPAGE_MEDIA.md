# Homepage media on Cloudflare R2

The nine editorial image placements rendered by `client/src/pages/home.tsx` are managed in **Admin → Контент → Фото главной** at `/admin/homepage-media`.

- `GET /api/site-config/homepage-images` is public and returns a map of Cloudflare image URLs for named slots. Missing entries use the original bundled photos. Broken CDN assets also fall back to the original bundled photos.
- `PUT /api/site-config/admin/homepage-images` requires admin session + CSRF and accepts `{ "slot": "hero", "url": "https://<R2_PUBLIC_URL>/homepage/....webp" }`. A null URL restores the default image. Valid image URLs must live under the configured R2 public base URL and in the `homepage/`, `images/` or `gallery/` object prefixes.
- `POST /api/upload/homepage-image` uploads a JPEG, PNG or WebP up to 12 MB using the existing Cloudflare bucket and returns `url` and `filename`. It verifies decoded image metadata, refuses images over 40 megapixels, applies orientation, resizes up to 2560 px and encodes to WebP. `POST /api/upload/image` is the shared R2 route for product, blog and promotion image uploaders.
- The image map is persisted atomically in the existing `site_config` PostgreSQL table under the `homepageImages` JSONB key. There is no migration or new table.
- The admin editor supports upload, direct R2 URL reuse, per-slot publish, per-slot reset, and one-click migration of all still-default bundled homepage images to the same R2 bucket.
- The admin editor also offers migration for **legacy promotional images** currently referenced by same-origin `/uploads/` URLs; the promo text, links and ordering remain untouched. Other remote image URLs require manual review. Video uploads are already handled by the separate R2 gallery uploader.
- Uploaded objects are never automatically deleted when a homepage slot is replaced or reset: a public URL might still be referenced by a product, gallery or promotion.

## Deployment prerequisites

In the application runtime environment configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` and **`R2_PUBLIC_URL`** to point at the existing publicly served Cloudflare R2 bucket. Do not use the placeholder public URL. Ensure Cloudflare serves public R2 objects (through a custom domain or an appropriate R2 public endpoint).

The code commit by itself **does not transfer files to R2**. After deploying and confirming these environment variables, open `/admin/homepage-media` and choose **Перенести стандартные фото в R2**. Verify that all nine slots show the R2 badge. Then choose **Перенести локальные промо-фото**, if any legacy files are reported.

## Smoke-test checklist

1. Open the storefront before any migration; all sections should retain the original photos.
2. Replace the hero via drag/drop or file picker, save, and refresh public page in private browsing. Confirm new image loads from R2.
3. Replace each chapter and lower feature image and check image cropping at mobile and desktop viewport widths.
4. Reuse a gallery R2 image URL; confirm it saves. Verify random external or `/uploads` URLs are rejected.
5. Reset a slot and confirm the original bundled photo returns without deleting any R2 object.
6. Temporarily use a deleted Cloudflare image URL and verify the browser shows the bundled fallback.
7. Test invalid image content (e.g. renamed text file), over-12-MB image, expired admin session, and unreachable R2. Confirm the old published selection remains.
8. Check `/admin/promotions` new image uploads resolve to R2 URLs and that legacy promo migration preserves record titles and links.
9. Test R2 caching and monitor the R2 requests after publish. Existing static originals intentionally remain in the client bundle until migration has been verified in production.

Deploy only after the normal `npm ci --legacy-peer-deps`, `npx tsc --noEmit`, and `npm run build` checks. Cloudflare and production upload functionality require an actual connected R2 environment, which GitHub-only editing cannot simulate.
