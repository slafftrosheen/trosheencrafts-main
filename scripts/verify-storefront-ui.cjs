/**
 * Static UI contracts for the Trosheen public storefront.
 * No credentials, database or running server are required.
 * Run: npm run verify:storefront
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const failures = [];
function text(relativePath) {
  try { return fs.readFileSync(path.join(root, relativePath), "utf8"); }
  catch { failures.push("Missing source: " + relativePath); return ""; }
}
function expect(condition, message) {
  if (!condition) failures.push(message);
}
function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}
const kitAssets = [
  "client/public/brand/lottie/lottie.min.js",
  "client/public/brand/hero-desktop.webp",
  "client/public/brand/hero-desktop-1280.webp",
  "client/public/brand/hero-mobile.webp",
  "client/public/brand/hero-mobile-1080.webp",
  "client/public/brand/hero-wide.webp",
  "client/public/brand/lockup-horizontal-spruce.svg",
  "client/public/brand/seal-spruce.svg",
  "client/public/brand/signature-olegs.svg",
  "client/public/brand/signature-family.svg",
  "client/public/brand/botanical/trosheen-divider-vine.svg",
];
kitAssets.forEach(asset => expect(exists(asset), "Brand asset absent: " + asset));

const motion = text("client/src/components/shared/BrandMotion.tsx");
for (const match of motion.matchAll(/"([^"]+\.json)"/g)) {
  const file = match[1];
  if (file.startsWith("trosheen-")) {
    expect(exists("client/public/brand/lottie/" + file), "Lottie JSON absent: " + file);
  }
}
expect(motion.includes("prefers-reduced-motion"), "Respect reduced-motion preference");
expect(motion.includes("latestTrigger.current"), "Defer manual playback until data loaded");

const routes = text("client/src/App.tsx");
for (const route of ["/", "/shop", "/shop/:id", "/gallery", "/gallery/:slug", "/constructor", "/cart", "/checkout", "/order-confirmation", "/contact"]) {
  expect(routes.includes('path="' + route + '"'), "Public route missing: " + route);
}
for (const route of ["/admin", "/admin/gallery", "/admin/constructor", "/admin/homepage-media"]) {
  expect(routes.includes('path="' + route + '"'), "Admin route missing: " + route);
}

const home = text("client/src/pages/home.tsx");
expect(home.includes("useHomepageImages") && home.includes("image(\"hero\")"), "Keep R2-admin-editable homepage images");
expect(home.includes("hero-mobile-1080.webp"), "Keep responsive no-text hero art direction");
expect(home.includes("<PromotionalGallery embedded />"), "Keep promotions on homepage");
const shop = text("client/src/pages/shop.tsx");
expect(shop.includes("<CandleConstructor />"), "Keep full constructor embedded in shop");
expect(shop.includes("trosheen:shop-view"), "Keep shop tab/URL synchronization");
const gallery = text("client/src/pages/gallery.tsx");
expect(gallery.includes('"/gallery/" + item.slug'), "Keep gallery detail navigation");
expect(gallery.includes("selectedCategory") && gallery.includes("setPage("), "Keep gallery filtering and pagination");
const detail = text("client/src/pages/galleryDetail.tsx");
expect(detail.includes("<GltfModel url={modelUrl} />"), "Keep actual GLTF model rendering");
expect(detail.includes('"/gallery/items/" + id + "/like"'), "Keep gallery like API");
const cart = text("client/src/components/features/ShoppingCart.tsx");
const checkout = text("client/src/pages/checkout.tsx");
expect(cart.includes("disabled={hasStockIssue}"), "Basket drawer must respect available stock");
expect(checkout.includes("disabled={loading || hasStockIssue}"), "Checkout must respect available stock");
expect(checkout.includes('"/checkout/create-session"'), "Preserve payment session API");
const confirmation = text("client/src/pages/order-confirmation.tsx");
expect(confirmation.includes('"/checkout/status/"') && confirmation.includes("if (paid) clearCart()"), "Do not clear basket before verified paid status");
const seo = text("client/src/components/shared/SEO.tsx");
expect(!seo.includes("window.location.href"), "Never publish checkout token in canonical or OG URL");

const manifest = JSON.parse(text("client/public/manifest.json") || "{}");
for (const shortcut of manifest.shortcuts || []) {
  expect(shortcut.url !== "/inspiration", "Manifest links to a non-existent route");
}
if (failures.length) {
  for (const failure of failures) console.error("FAIL: " + failure);
  process.exitCode = 1;
} else {
  console.log("Trosheen storefront static contracts passed.");
}
