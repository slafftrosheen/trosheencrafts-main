# Storefront QA — brand kit v3.1

## Automated gate
`npm run verify:storefront` checks presence of shipped brand assets/Lotties, preserved public/admin routes, checkout stock protection, gallery/constructor wiring and safe canonical URL handling. It runs before `npm run build`.

This is a **static contract check**, not a substitute for a TypeScript build, live backend test, performance audit or visual comparison against the brandbook.

## Browser checks before production
- At 390, 768, 1280 and 1440 CSS pixels, check header, drawer, hero crop, 5 trust details, collections, product cards, filters, constructor sidebars and sticky cart controls. Inspect at 200% browser zoom and landscape tablet too.
- Keyboard: skip link, language switcher, both navigation variants, shop filters/search, gallery filters/search, dedicated constructor option buttons, cart quantity controls, checkout/contact forms.
- Homepage: confirm admin-published R2 hero overrides all bundled sources; test image failures and fallback. Check section media/video on metered connection.
- Shop: default available-only filter; typing, category/sort, clear/reset; no stock vs API error distinct; `/constructor` (existing detailed candle builder), saved-item deep link, and browser back. The unapproved `/shop?view=custom` wizard must not render; legacy query URLs normalize to the ordinary `/shop` listing.
- Constructor: select vessel/finish/wax/aroma; toggle honest 3D illustration vs photography; add to cart; verify correct custom configuration, totals and line-item display.
- Gallery: all, photo, video and 3D filters; search while typing; pagination; fullscreen images; real GLB R2 URLs including extensionless CDN URLs; failed GLTF renders a useful fallback; likes and sharing.
- Cart/checkout: set quantity to and beyond available limit, try checkout from page and drawer; valid checkout preserves cart until signed payment status resolves. Verify pending and rejected confirmation URLs never show success motion.
- Motion: block `/brand/lottie/lottie.min.js` and individual JSON requests; every page must retain poster artwork, link interactions and readable text. Toggle `prefers-reduced-motion` at runtime.
- Localization: LV, EN, RU, PL, UK across nav, empty/error states, gallery, contact and checkout validation, order support and network banners.
- Lighthouse checks: LCP hero source, CLS from images with dimensions, unused JS, accessibility/contrast and mobile overflow. Capture actual browser screenshots to assert pixel-level alignment.

No visual pixel-perfect claim is possible until these viewport screenshots and functional flows are compared in a deployed test environment.

## October 2026 editorial and mobile corrections

- Source copy was rewritten in LV, EN, RU, PL and UK; avoid invented family quotations, dated histories, unsupported performance guarantees, and over-promising marketing text.
- Care lives at `/guide`; audit all instructions against actual product materials. No generic boiling-water wax removal, universal frost-proof claims, or food-safe reuse assertions.
- Lottie animations must defer mounting until near view, pause outside view and on hidden tabs, and respect reduced motion. Check narrow viewports and landscape touch devices for media/title overlap.
- `/shop?view=custom` and the marketing request wizard were not approved and must not be reintroduced. `/constructor` is retained solely for the existing real priced candle configurator and its admin-managed options; no homepage/menu/footer custom-wizard promotion.
- Public copy is editable under Russian admin `/admin/content`; existing database overrides take precedence over bundled translations. Review those overrides following deployment because older CMS text can still appear even when source strings are corrected.
- Source edits are not a substitute for a built/deployed device-matrix audit. Check 320, 360, 390, 768 and 1280px, five languages, reduced motion, scroll, focus, accessibility and no horizontal overflow.

## Gallery and editorial pass — October 18, 2026

- Homepage gallery now queries `GET /api/gallery/items?featured=true&limit=6` and falls back to the normal published listing when there are no featured entries. If the gallery is empty, do not render example cards. Preserve the existing editable `galleryFeature` media slot.
- Gallery layout controls: Masonry, Grid and List. Verify labels in LV/EN/RU/PL/UK, keyboard operation, touch targets, responsive widths and persistence of the selected layout in local storage.
- Verify `/gallery` type and category filters, debounced search, direct item links and 12-item offset pagination across more than 100 published records. API maximum per request is 100; never request `limit=page*12`.
- Check photo thumbnails, video thumbnails/videos, and 3D entries without a thumbnail. Cards must show only published R2-backed content and never manufacture an image. Detail pages retain the real photo/video/GLTF viewer, likes and sharing.
- Home is explicitly present in both desktop navigation and mobile drawer, with one active state and no duplicate drawer entry. The desktop menu switches to the drawer when available width is insufficient.
- Source translations are the fallback but previously saved CMS overrides may continue to surface the older text. Review `/admin/content` in Russian, especially gallery, journal, hero and footer; use the per-key Restore action after confirming the edited text is obsolete.
- Content principles: describe the actual media and products; no fictitious customer stories, made-up timeframes, guaranteed one-of-a-kind stock, or raw internal placeholders. Audit each language on narrow mobile widths.
