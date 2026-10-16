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
// Kit v4.3 asset contracts: local fonts, the vendored Lottie runtime, the
// transparent logos, the ornament band and the gypsum texture the CSS references.
const kitAssets = [
  "client/public/vendor/lottie.min.js",
  "client/public/fonts/Fraunces-Variable.ttf",
  "client/public/fonts/Jost-Variable.ttf",
  "client/public/heroes/trosheen-hero-desktop-05-1920.webp",
  "client/public/heroes/trosheen-hero-mobile-12-1080.webp",
  "client/public/brand/trosheen-lockup-horizontal-spruce.svg",
  "client/public/brand/trosheen-lockup-horizontal-linen.svg",
  "client/public/brand/trosheen-seal-spruce.svg",
  "client/public/brand/trosheen-signature-ar-siltam-rokam-olegs-animated.svg",
  "client/public/brand/botanical/trosheen-divider-vine.svg",
  "client/public/brand/lottie/trosheen-28-loader-seal.json",
  "client/public/ornaments/svg/trosheen-jostas-raksts-band-spruce.svg",
  "client/public/textures/trosheen-texture-gypsum-tile-1024.webp",
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
expect(home.includes('image("storyHeritage")') && home.includes('image("storyMakers")') && home.includes('image("shopFeature")'), "Home photography must be connected to editor slots");
expect(!home.includes("FALLBACK_STRIP"), "Home must not fabricate portfolio imagery");
expect(routes.includes('path="/admin/content"'), "The public-site copy editor must remain accessible from admin");
const copyApi = text("server/routes/siteConfig.ts");
expect(copyApi.includes("get('/content'") && copyApi.includes("'/admin/content'"), "Copy overrides must be wired to persistent site-config APIs");
const v4Copy = text("client/src/lib/v4Copy.ts");
for (const line of v4Copy.split("\n").filter(line => /^\s*"v4\./.test(line))) {
  expect(/\bru:/.test(line) && /\bpl:/.test(line) && /\buk:/.test(line), "All five languages required: " + line.match(/"([^"]+)"/)?.[1]);
}
expect(/hero-mobile-\d+-1080\.webp/.test(home), "Keep responsive hero art direction");
expect(home.includes("<PromotionalGallery embedded />"), "Keep promotions on homepage");
expect(home.includes("className=\"hero\"") && home.includes("hero__content"), "Homepage hero must be kit v4 with live HTML copy");
expect(home.includes("brand.tagline") && home.includes("v4.hero.lead"), "Homepage hero copy must stay translatable");
expect(!/demo-assets|placeholder\./.test(home), "Never ship placeholder art on the homepage");
const about = text("client/src/pages/about.tsx");
expect(about.includes("chapter-nav") && about.includes("id=\"recepte\""), "Story page keeps its chapter navigation and recipe section");
expect(about.includes("v4.story.c7.cta1"), "Story page keeps its closing visit call to action");
const promotions = text("client/src/components/PromotionalGallery.tsx");
expect(promotions.includes("isKitBanner") && promotions.includes("brand-promo-media--kit"), "Kit collection banners must preserve their complete artwork");
expect(!promotions.includes('bg-gradient-to-t'), "Do not cover promo photography with heavy text gradients");
const shop = text("client/src/pages/shop.tsx");
expect(shop.includes("<CandleConstructor />"), "Keep full constructor embedded in shop");
expect(shop.includes("trosheen:shop-view"), "Keep shop tab/URL synchronization");
expect(shop.includes("v4.shop.tab.custom") && shop.includes("CustomWorkshopWizard"), "Shop keeps the ready/custom tabs and the v4 request wizard");
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

// Prevent silent UI regressions where t("missing.key") prints the key verbatim.
const translationText = text("client/src/lib/LanguageContext.tsx") + "\n" +
  text("client/src/lib/brandCopy.ts") + "\n" +
  text("client/src/lib/v4Copy.ts");
const translationKeys = new Set();
for (const match of translationText.matchAll(/(?:^|[,\n])\s*(?:"([^"]+)"|'([^']+)'|([a-zA-Z_][\w.]*))\s*:\s*\{\s*["']?(?:en|lv|ru|pl|uk)["']?\s*:/g)) {
  translationKeys.add(match[1] || match[2] || match[3]);
}
const localizedPages = [
  "client/src/pages/home.tsx", "client/src/pages/shop.tsx",
  "client/src/pages/gallery.tsx", "client/src/pages/galleryDetail.tsx",
  "client/src/pages/product-detail.tsx", "client/src/pages/cart.tsx",
  "client/src/pages/checkout.tsx", "client/src/pages/contact.tsx",
  "client/src/pages/order-confirmation.tsx", "client/src/pages/order-tracking.tsx",
  "client/src/pages/about.tsx", "client/src/pages/guide.tsx",
  "client/src/pages/blog.tsx", "client/src/pages/blog-post.tsx",
  "client/src/pages/not-found.tsx", "client/src/pages/privacy.tsx",
  "client/src/pages/terms.tsx", "client/src/pages/cookies.tsx",
  "client/src/pages/withdrawal.tsx",
  "client/src/components/shared/Footer.tsx",
  "client/src/components/shared/Navigation.tsx",
  "client/src/components/shared/Layout.tsx",
  "client/src/components/brand/NewsletterForm.tsx",
  "client/src/components/brand/ProductCardV4.tsx",
  "client/src/components/brand/SeasonRibbon.tsx",
  "client/src/components/brand/Ornament.tsx",
  "client/src/components/shared/LanguageSwitcher.tsx",
  "client/src/components/shared/LoadingStates.tsx",
  "client/src/components/features/ShoppingCart.tsx",
  "client/src/components/features/ContactForm.tsx",
  "client/src/components/shop/CandleConstructor.tsx",
  "client/src/components/NewsletterSubscribe.tsx",
  "client/src/components/PromotionalGallery.tsx",
];
for (const page of localizedPages) {
  for (const match of text(page).matchAll(/\bt\s*\(\s*["']([^"']+)["']/g)) {
    expect(translationKeys.has(match[1]), "Missing translation: " + match[1] + " in " + page);
  }
}

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
