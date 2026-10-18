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
