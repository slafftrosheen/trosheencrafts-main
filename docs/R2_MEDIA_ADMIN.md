# Trosheen media and admin integration — source contract

All administrative editing is displayed in Russian. Public copy, products, Gallery,
Journal, and promotions support LV / EN / RU / PL / UK variants.

## Runtime configuration

The app container must have `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_URL`.
`R2_PUBLIC_URL` must point to the public HTTPS R2 custom domain or r2.dev
hostname, **without** a trailing path slash. Do not put R2 secrets in client code.

Cloudflare R2 access credentials need object read, write, list, and delete
permissions for the configured bucket. Public GET access is required for
product photos, hero assets, Gallery, and Journal. No browser-side write
permissions are needed; admin uploads go through authenticated Express routes.

## Storage contracts

- Images: `POST /api/upload/image` → R2 `images/*.webp`.
- Hero / page images: `POST /api/upload/homepage-image` → R2 `homepage/*.webp`.
- Gallery photos / GLB / glTF / MP4 / WebM: `POST /api/upload/gallery` → R2 `gallery/*`.
- Existing multi-file request: `POST /api/upload/gallery/multiple` → R2 gallery and thumbnails.
- Legacy `POST /api/uploads/image` is an R2-backed alias, not a disk write.
- Image inputs are decoded with Sharp and converted to WebP. Filenames are UUID-based;
  upload and replace never overwrite an earlier R2 object.
- Admin `GET /api/media-library/files` lists files with cursor pagination.
- Admin `GET /api/media-library/download?key=...` streams a download from R2.
- Admin `GET /api/media-library/references?key=...` checks CMS references.
- Admin `DELETE /api/media-library/file` accepts
  `{"key":"images/UUID.webp","confirmed":true}`; deletion is blocked if
  a known product, Gallery item, Journal entry, promo, site configuration or
  constructor option still references the object.

The media library is at `/admin/media`. Upload fields allow using existing
files via the R2 picker. Removal from a form unlinks the file, and **does not**
delete the underlying R2 object; unused files can be reviewed separately.

The app still serves `/uploads/*` locally for old references and migration.
Do not delete the legacy upload volume until all referenced content is moved.

## Deployment ordering

Run only when intentionally redeploying, not during source-only development:
`./deploy.sh` pulls and builds, starts PostgreSQL, applies tracked SQL
migrations, then switches to the new app version. This is important: the
new JSONB translation columns must exist **before** the updated queries run.
`scripts/migrate.cjs` is idempotent and records applied migrations.

Migrations include `0011_localized_content_and_fixture_cleanup.sql`,
`0012_promotion_translations.sql` and `0013_product_locales.sql`.
Migration `0011` removes only exact known sample content; it does not
delete arbitrary Gallery or Journal records.

No live R2 keys, credentials or production database data are checked as part
of source-only edits. Rebuild, deploy, and verify with the admin account later.
