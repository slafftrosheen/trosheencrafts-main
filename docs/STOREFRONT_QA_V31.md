# Storefront QA — brand kit v3.1

## Automated gate
`npm run verify:storefront` checks presence of shipped brand assets/Lotties, preserved public/admin routes, checkout stock protection, gallery/constructor wiring and safe canonical URL handling. It runs before `npm run build`.

This is a **static contract check**, not a substitute for a TypeScript build, live backend test, performance audit or visual comparison against the brandbook.

## Browser checks before production
- At 390, 768, 1280 and 1440 CSS pixels, check header, drawer, hero crop, 5 trust details, collections, product cards, filters, constructor sidebars and sticky cart controls. Inspect at 200% browser zoom and landscape tablet too.
- Keyboard: skip link, language switcher, both navigation variants, shop tabs, gallery filters/search, constructor option buttons, cart quantity controls, checkout/contact forms. Only the active shop tab should have `aria-selected=true`.
- Homepage: confirm admin-published R2 hero overrides all bundled sources; test image failures and fallback. Check section media/video on metered connection.
- Shop: default available-only filter; typing, category/sort, clear/reset; no stock vs API error distinct; `/constructor`, `/shop?view=custom`, tab switching and browser back.
- Constructor: select vessel/finish/wax/aroma; toggle honest 3D illustration vs photography; add to cart; verify correct custom configuration, totals and line-item display.
- Gallery: all, photo, video and 3D filters; search while typing; pagination; fullscreen images; real GLB R2 URLs including extensionless CDN URLs; failed GLTF renders a useful fallback; likes and sharing.
- Cart/checkout: set quantity to and beyond available limit, try checkout from page and drawer; valid checkout preserves cart until signed payment status resolves. Verify pending and rejected confirmation URLs never show success motion.
- Motion: block `/brand/lottie/lottie.min.js` and individual JSON requests; every page must retain poster artwork, link interactions and readable text. Toggle `prefers-reduced-motion` at runtime.
- Localization: LV, EN, RU, PL, UK across nav, empty/error states, gallery, contact and checkout validation, order support and network banners.
- Lighthouse checks: LCP hero source, CLS from images with dimensions, unused JS, accessibility/contrast and mobile overflow. Capture actual browser screenshots to assert pixel-level alignment.

No visual pixel-perfect claim is possible until these viewport screenshots and functional flows are compared in a deployed test environment.
