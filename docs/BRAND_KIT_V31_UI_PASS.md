# Trosheen website kit v3.1 UI pass
Source of truth: `Trosheen-Website-Kit/IMPLEMENTATION-GUIDE.md`.

Storefront-only changes. Leave gallery CRUD and 3D interactions, shop API and constructor, checkout verification, R2 homepage media override and admin untouched. The design kit's Lottie player, JSON, botanicals and optimized hero files are copied as unmodified Git blobs to `client/public/brand/`.

Motion rules: ambient loops are restrained, interface events trigger once; reduced-motion users see static poster art. The one-off family signature is used only on order success after server-verified payment.

Smoke tests before deployment: mobile 390 / tablet 768 / desktop 1440, keyboard navigation, LV/EN/RU/PL/UK; home media overridden via R2; gallery 3D/video/photos/search/load more, custom builder; empty shop, filter reset, product stock, cart, checkout, and paid/pending/unverified confirmation. Run `npm ci && npm run build` on a host with repository checkout, then browser QA. These commands were not executed in the connector-only environment.
