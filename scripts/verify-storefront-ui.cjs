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
expect(home.includes('image("storyHeritage")') && home.includes('image("storyMakers")'), "Home workshop photographs must retain admin-editable media slots");
expect(!home.includes("FALLBACK_STRIP"), "Home must not fabricate portfolio imagery");
expect(routes.includes('path="/admin/content"'), "The public-site copy editor must remain accessible from admin");
const editor = text("client/src/pages/admin/WebsiteContent.tsx");
expect(editor.includes('Object.keys(translations)') && editor.includes('admin[._-]'),
  "Admin copy editor must expose public strings without changing Russian admin chrome");
expect(routes.includes('path="/admin/media"'), "R2 media library must be available to administrators");
const r2Routes = text("server/routes/r2Media.ts");
expect(r2Routes.includes("referenceLocations") && r2Routes.includes("download"),
  "R2 media library must support reference-guarded deletion and downloads");
const r2Picker = text("client/src/components/admin/R2MediaPicker.tsx");
expect(r2Picker.includes("onSelect") && r2Picker.includes("/media-library/files"),
  "Admin editors must be able to reuse existing R2 media");
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
expect(about.includes("v4.story.c1.title") && about.includes("v4.story.c2.title") && about.includes("v4.story.c3.title"), "About page must cover workshop, process and design inspiration");
expect(!about.includes("TIMELINE"), "Never publish an unverified family-history timeline");
expect(about.includes("v4.story.c7.cta1"), "Story page keeps its closing visit call to action");
const promotions = text("client/src/components/PromotionalGallery.tsx");
expect(promotions.includes("isKitBanner") && promotions.includes("brand-promo-media--kit"), "Kit collection banners must preserve their complete artwork");
expect(!promotions.includes('bg-gradient-to-t'), "Do not cover promo photography with heavy text gradients");
const shop = text("client/src/pages/shop.tsx");
expect(routes.includes('path="/constructor"') && routes.includes("<Constructor />"), "The existing stock-aware candle constructor remains at its dedicated route");
expect(!shop.includes("CustomWorkshopWizard") && !shop.includes("v4.shop.tab.custom"), "Remove the unapproved custom-shop request wizard");
expect(shop.includes('url.searchParams.get("view") === "custom"'), "Retired custom-shop deep links must normalize to the catalogue");
expect(shop.includes('url.searchParams.get("view") === "saved"'), "Preserve the saved-products deep link");
const care = text("client/src/pages/guide.tsx");
expect(care.includes("v4.care.materials.note") && care.includes("v4.care.candle.warning"), "Care page must explain material-specific limits and candle-vessel safety");
expect(!care.includes('className="hero hero--page"'), "Care page must not reintroduce overlapping photographic hero content");
const lottie = text("client/src/components/brand/Lottie.tsx");
expect(lottie.includes('IntersectionObserver') && lottie.includes('animation.pause()'), "Lottie player should lazy-load and pause offscreen");
const gallery = text("client/src/pages/gallery.tsx");
const galleryCard = text("client/src/components/gallery/GalleryMediaCard.tsx");
const galleryPreview = text("client/src/components/gallery/GalleryPreview.tsx");
expect(galleryCard.includes('"/gallery/" + encodeURIComponent(item.slug)'), "Gallery cards must link to the published detail route");
expect(galleryPreview.includes('featured: true') && galleryPreview.includes('"/gallery/items"'),
  "Homepage gallery preview must consume published featured entries through the existing API");
expect(home.includes("<GalleryPreview editorialImage={galleryFeature} />"),
  "Homepage gallery preview must retain the admin-managed image slot");
expect(gallery.includes("selectedCategory") && gallery.includes("useInfiniteQuery") && gallery.includes("fetchNextPage()"),
  "Keep gallery categories and offset pagination beyond the 100-item API limit");
expect(gallery.includes('type GalleryViewMode') && gallery.includes("changeView(id)"),
  "Gallery must offer accessible Masonry, Grid and List modes");
const navigation = text("client/src/components/shared/Navigation.tsx");
expect(navigation.includes('{ href: "/", label: t("v4.nav.home") }'),
  "Home should be present in the desktop and mobile navigation");
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
  "client/src/components/gallery/GalleryMediaCard.tsx", "client/src/components/gallery/GalleryPreview.tsx",
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
