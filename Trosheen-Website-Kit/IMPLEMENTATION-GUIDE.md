# Trosheen website: implementation guide

**For:** whoever builds or updates trosheen.shop
**Version:** 1.0 · matches Brand book v3.1 (October 2026)
**Live demo:** open `13-code/example-homepage.html` in a browser. It shows the header, hero, trust strip, collections, product cards, story, signature, newsletter and footer working together, using only files from this kit.

---

## 0. Start here: do these first

These problems exist on the site today (see the audit, brand book p. 16). Fix them before the visual update.

| # | Problem today | Fix |
|---|---|---|
| 1 | Shop shows "0 darbi" and "An error occurred". The hero button leads to an empty shop. | Publish the real pieces. Until then, show the designed empty state (§7.4) and remove the raw error messages. |
| 2 | "Design Yours" → `/constructor` returns 404. | Point it to a simple custom-order form (`/pasutijumi`) or the contact page. |
| 3 | Shop, gallery and journal footers show `hello@trosheen.crafts` and `+371 XXX XXXXX`. | Use one shared footer with **slaff.trosheen@gmail.com** and **+371 20 678 142** on every page. |
| 4 | Four spellings of the name. | Use **Trosheen** everywhere: header, footer, ©, page titles, care guide, emails. |
| 5 | Page title says "Handcrafted Concrete Art". | Use the new titles and descriptions (§2). |

---

## 1. What's in the kit

```
Trosheen-Website-Kit/
├─ index.html                 ← visual overview of everything (open in a browser)
├─ IMPLEMENTATION-GUIDE.pdf / .md
├─ 01-brand-book/             Brand book v3.1 (39 pages)
├─ 02-logos/                  seal, wordmark, horizontal + stacked lockups · 5 colours · SVG + PNG, transparent
├─ 03-favicon-app-icons/      favicon.ico/.svg, 16–512 px, apple-touch, maskable, social avatar
├─ 04-icons/                  46 line icons · SVG (currentColor), sprite, PNG Spruce/Linen
├─ 05-heroes/                 full-width homepage heroes (desktop, wide, 2× mobile)
│  ├─ no-text/                same photos without text (recommended for the live site)
│  └─ web/                    resized WebP + JPG ready to upload
├─ 06-banners-and-sections/   5 collection banners, about bands, trust strip, newsletter, email header (+ web/)
├─ 07-social-sharing/         share image 1200×630 (with and without text)
├─ 08-motion-lottie/          11 interface animations (12 files)
├─ 09-botanical-line-art/     fern, lilac, birch, oak, lily + 2 dividers · SVG (draw on scroll), Lottie, PNG
├─ 10-seasons/                4 seasons: ornament, ambient Lottie, banner, lines (seasons.json)
├─ 11-signature/              "Ar siltām rokām, Oļegs" etc. · self-animating SVG, Lottie, PNG
├─ 12-marketing-materials/    Instagram, carousel, product card, story, gift packaging, poster, business cards
├─ 13-code/                   trosheen.css, trosheen.js, head-snippet.html, site.webmanifest, example-homepage.html
├─ 14-fonts/                  Fraunces, Jost, Caveat (signature only) + OFL licences
├─ vendor/                    lottie.min.js (for the offline demo and index only)
└─ previews/                  motion previews (MP4) and the animation concept board
```

**Suggested server layout:**

| Kit folder | Upload to |
|---|---|
| `13-code/trosheen.css` | `/css/` |
| `13-code/trosheen.js` | `/js/` |
| All `.json` animations from 08, 09/lottie, 10, 11 | `/lottie/` |
| Images | `/img/` |
| Favicons + `site.webmanifest` | site root |
| Share image | `/og/` |

---

## 2. `<head>`: name, titles, sharing, icons, fonts

Paste `13-code/head-snippet.html` into every page's `<head>`. It contains the title and description, theme colour, sharing tags, icons, fonts, the brand CSS and the brand JS.

| Field | Latviski (default) | English (`/en/`) |
|---|---|---|
| Title (home) | Trosheen — roku darbi mājai un dārzam no Daugavpils | Trosheen — handmade home & garden pieces from Latvia |
| Description | Unikāli akmens, ģipša un jaukto materiālu darbi, ar rokām veidoti ģimenes darbnīcā Daugavpilī. Radīts, lai nodotu tālāk. | One-of-a-kind stone, gypsum and mixed-media pieces, made by hand by a family workshop in Daugavpils. Made to be handed down. |
| Other pages | `<Page name> — Trosheen` | `<Page name> — Trosheen` |

- `theme-color` becomes **#24412F** (today it is `#ffffff`).
- `og:image`: upload `07-social-sharing/trosheen-social-share-1200x630.jpg` and use its absolute URL.
- Add `<link rel="alternate" hreflang="lv">` and `hreflang="en"` once the EN version exists.
- **Fonts:** body text currently uses **Inter**; replace it with **Jost**. Headlines already use Fraunces. The Google Fonts link in the snippet includes Latvian and Polish characters. To self-host instead, use the files in `14-fonts/` (open licence).

---

## 3. Colours, type and spacing (`trosheen.css`)

All values are CSS variables at the top of `trosheen.css`. Replace the site's current colours with them:

| Today | Replace with |
|---|---|
| text `#241E19` | `--tr-basalt #1F1D1A` |
| background `#F8F6F2` / `#FBFAF8` / white | `--tr-linen #F2EDE3` |
| nav grey `#6A6058` | `--tr-spruce #24412F` |
| font Inter | `--tr-font-body` (Jost) |

**Contrast rules (WCAG AA, checked):**

| Pair | Contrast | Use |
|---|---|---|
| Linen on Spruce | 9.6 : 1 | Any text |
| Basalt on Linen | 14.4 : 1 | Any text |
| Linen on Kiln | 5.1 : 1 | Any text |
| Basalt on Lichen | 5.6 : 1 | Any text |
| Gilt on Basalt | 5.8 : 1 | Any text |
| Gilt on Spruce | 3.9 : 1 | Large text and buttons only |
| Gilt or Lichen on Linen | 2.5 / 2.6 : 1 | **Never** for text |

**Type scale:**

| Style | Font and weight | Size | Class / element |
|---|---|---|---|
| H1 | Fraunces 340 | 44 → 72 px | `h1` |
| H2 | Fraunces 360 | 34 → 48 px | `h2` |
| H3 | Fraunces 420 | 26 px | `h3` |
| Body | Jost 350 | 18 / 1.6 | body text |
| Eyebrow | Jost 500, +0.24em, caps, Kiln | 13 px | `.tr-eyebrow` |
| Button | Jost 500, +0.1em, caps | 14 px | `.tr-btn` |

**Spacing:** an 8 px rhythm (8 · 16 · 24 · 40 · 64 · 96 · 144). Containers are 1280 px wide; sections use 96 px vertical padding (`.tr-section`).

---

## 4. Logo usage

| Place | File | Size |
|---|---|---|
| Header | `02-logos/svg/trosheen-lockup-horizontal-spruce.svg` | 46 px high (38 px when scrolled, 36 px on mobile) |
| Footer (on Spruce) | `trosheen-lockup-stacked-linen.svg` or `-horizontal-linen.svg` | 120–140 px high |
| Small spaces | `trosheen-seal-spruce.svg` | 48 px minimum |
| Below 48 px | the T app icon (`03-favicon-app-icons/favicon.svg`) | — |

- **Clear space:** ¼ of the seal's width on every side.
- **Colours:** use only the 5 provided colour files. Never stretch the logo, add effects, or place it on a busy part of a photo.
- **Alt text:** `alt="Trosheen"` on every logo image.

---

## 5. Page structure

### 5.1 Header (`.tr-header`)
- **Order:** logo (left) · navigation (centre) · search, account, wishlist, bag icons and **LV · EN** (right).
- **Menu (LV):** Veikals · Kolekcijas · Individuāli pasūtījumi · Mūsu stāsts · Žurnāls · Kopšana · Kontakti.
- **Active page:** add `aria-current="page"` to the link. A Gilt underline appears automatically.
- **Scrolling:** the header shrinks from 96 to 72 px (handled by `trosheen.js`). On mobile below 960 px, the menu collapses behind the `menu` icon.

### 5.2 Homepage: five sections, in this order
1. **Hero:** full-width photo with live text and real buttons (§6.1), plus the ripple scroll cue (`trosheen-06-fountain-ripple.json`).
2. **Trust strip (`.tr-trust`):** five HTML items with icons. Don't use the PNG on the site; it is for email and social.

   | Icon | Title | Subtitle |
   |---|---|---|
   | `handmade` | Veidots ar rokām | Daugavpilī, Latvijā |
   | `one-of-a-kind` | Katrs darbs | vienīgais tāds |
   | `natural-materials` | Dabīgi minerāli | akmens, ģipsis un citi |
   | `parcel` | Rūpīgi iepakots | un nosūtīts ar rūpēm |
   | `secure-payment` | Droša apmaksa | vienkārši un droši |
3. **Collections:**
   - The eyebrow and heading become "Šīs sezonas izlase / Izvēlētās kolekcijas", replacing the English "Current edit".
   - Use two or three collection banners, then a row of product cards.
4. **Story band:**
   - Mūsu ģimenes stāsts with a botanical drawing and the animated signature.
   - It links to the story page.
5. **Newsletter (`.tr-dark`):**
   - "Vēstules no darbnīcas" with the candle animation.
   - **Footer:** Spruce background, stacked Linen logo, links, real contact details, legal links.

**Remove from today's homepage:**
- the repeated story sections
- the "30+ / 3 / 2K+" statistics row and the "Nulle" block, unless you can show proof
- the English "Current edit" block

### 5.3 Other pages
| Page | What changes |
|---|---|
| **Veikals** | Product cards (§7.2). "Tikai pieejamie" filter on by default. Empty state from §7.4. Filter labels in Latvian. |
| **Product page** | 4:5 photos in true colour. Material eyebrow in Kiln, name in Fraunces, price in Jost 500. Add-to-cart and wishlist animations. "Vienīgais eksemplārs" badge on one-off pieces. |
| **Individuāli pasūtījumi** | Replaces `/constructor`. Form fields: krāsa, apdare, aromāts, izmērs, ziņa. When the form is sent, play `trosheen-01-seal-stamp-once.json`. |
| **Mūsu stāsts** | Keep the existing copy. Add botanical drawings in the margins and the signature after Oļegs' section. Hero: `06-banners-and-sections/…about-page-hero`. |
| **Žurnāls** (was "Darbnīcas piezīmes") | Until there are posts, hide it from the menu or show the empty state. |
| **Kopšana** | Add seasonal tabs. The winter tab uses `trosheen-09-frost-to-drop.json`. Translate "MATERIAL QUALITIES" → "MATERIĀLA ĪPAŠĪBAS" and "TROSHEEN MATERIAL PHILOSOPHY" → "TROSHEEN MATERIĀLU FILOZOFIJA". |
| **Galerija** | Fold it into the story and product pages until it has content. Translate the filters: Foto · Video · Produktu foto. |
| **Kontakti** | Keep the "kā ģimenes darbnīca, nevis zvanu centrs" promise. Use form fields from §7.3. |
| **404** | `trosheen-10-404-rolling-stone.json` + "Šī darba šeit nav" + a "Uz sākumu" button. |
| **Checkout success** | `trosheen-08-wrapped-and-sealed.json` + "Paldies!" + the signature "Ar siltām rokām, Trosheen ģimene". |

---

## 6. Images

### 6.1 Hero: full width, live text, no baked-in buttons
- Use the **no-text** files from `05-heroes/web/` and write the headline, text and buttons in HTML. This keeps them translatable, readable by search engines, accessible, and lets the buttons work.
- The versions with text are for social media, presentations and email.
- Art-direct with `<picture>`:
  - desktop: `…desktop-1920x1080-no-text-{960,1280,1920}w.webp`
  - mobile: `…mobile-1080x1920-a-no-text-{720,1080}w.webp`
- Preload the desktop 1920w image, and set `fetchpriority="high"` on the hero `<img>`.
- **Text position:** bottom right on desktop, bottom left on mobile. `trosheen.css` adds the soft dark shade behind it.
- The full markup is in `example-homepage.html`.

```html
<section class="tr-hero">
  <picture>
    <source media="(max-width:760px)" type="image/webp"
            srcset="/img/trosheen-home-hero-mobile-1080x1920-a-no-text-720w.webp 720w,
                    /img/trosheen-home-hero-mobile-1080x1920-a-no-text-1080w.webp 1080w" sizes="100vw">
    <source type="image/webp"
            srcset="/img/trosheen-home-hero-desktop-1920x1080-no-text-960w.webp 960w,
                    /img/trosheen-home-hero-desktop-1920x1080-no-text-1280w.webp 1280w,
                    /img/trosheen-home-hero-desktop-1920x1080-no-text-1920w.webp 1920w" sizes="100vw">
    <img src="/img/trosheen-home-hero-desktop-1920x1080-no-text-1920w.jpg" alt="Trosheen roku darbi dārzā"
         width="1920" height="1080" fetchpriority="high">
  </picture>
  <div class="tr-season-ambient" aria-hidden="true"></div>
  <div class="tr-hero__content">
    <p class="tr-eyebrow">Roku darbs · Daugavpils, Latvija</p>
    <h1>Radīts, lai<br>nodotu tālāk.</h1>
    <hr class="tr-rule">
    <p>Unikāli akmens, ģipša un jaukto materiālu darbi mājai un dārzam — ar rokām veidoti mūsu ģimenes darbnīcā.</p>
    <div class="tr-hero__actions">
      <a class="tr-btn tr-btn--gilt" href="/veikals">Skatīt veikalu</a>
      <a class="tr-btn tr-btn--secondary" href="/stasts">Mūsu stāsts</a>
    </div>
  </div>
  <div class="tr-hero__scroll" data-lottie="trosheen-06-fountain-ripple.json" data-play="loop" aria-hidden="true"></div>
</section>
```

### 6.2 Collection banners and sections
- Banners are 1920×640 with a colour panel, already designed with text. Use them as images inside a link.
- **Alt text:** write the banner's headline as the alt text.
- **Sizes:** `06-banners-and-sections/web/` has full and half widths (WebP + JPG).
- **Mobile:** below 760 px, show the product photo or a product grid instead. The panel text gets too small.

### 6.3 Photo rules (non-negotiable)
- Real pieces only, in their true colour. Never recolour, desaturate or swap in pieces you don't make.
- Text and logos never sit over a piece.
- **Alt text** describes the piece, for example `alt="Ar rokām apgleznots ģipša svečturis ar zelta pārslām"`.

---

## 7. Components

### 7.1 Buttons
| Class | Use |
|---|---|
| `.tr-btn.tr-btn--primary` | Spruce. Main action on Linen. |
| `.tr-btn.tr-btn--secondary` | Outline. Second action. |
| `.tr-btn.tr-btn--gilt` | Main action on Spruce or on photos. |
| `.tr-link` | Text links. Gilt underline draws on hover. |

- One primary button per section.
- Buttons are 56 px high, and the focus outline is always visible.
- **Labels (LV):**
  - Skatīt veikalu, Mūsu stāsts, Pievienot grozam
  - Pieteikt pasūtījumu, Pierakstīties, Lasīt vairāk, Uz sākumu

### 7.2 Product card (`.tr-card`)
```html
<article class="tr-card">
  <div class="tr-card__media"><img src="…" alt="…" loading="lazy" width="900" height="1125"></div>
  <span class="tr-badge">Vienīgais eksemplārs</span>
  <button class="tr-card__wish" data-wishlist aria-pressed="false" aria-label="Pievienot vēlmju sarakstam">
    <div data-lottie="trosheen-03-wishlist-heart.json" data-play="manual" style="width:44px;height:44px"></div>
  </button>
  <div class="tr-card__body">
    <div class="tr-card__material">Ģipsis · roku apgleznojums</div>
    <h3 class="tr-card__name">…</h3>
    <div class="tr-card__price">€ …</div>
    <button class="tr-btn tr-btn--primary" data-add-to-cart>Pievienot grozam
      <span data-lottie="trosheen-02-add-to-cart.json" data-play="manual" style="width:28px;height:28px"></span></button>
  </div>
</article>
```
- Photos are 4:5.
- **On hover:** the card lifts 4 px and the photo zooms slowly to 104%.

### 7.3 Forms
```html
<div class="tr-field">
  <label for="email">E-pasts</label>
  <input id="email" type="email" autocomplete="email">
  <!-- on error: add .tr-field--error to the wrapper and <p class="tr-field__error">…</p> -->
</div>
```
Labels always sit above the field; never use a placeholder as the only label. Errors appear in Kiln.

### 7.4 Empty, error and 404 states
| State | Animation | Heading | Text | Button |
|---|---|---|---|---|
| Empty shop | `trosheen-11-empty-shop-plant.json` (loop) | **Plaukti atpūšas** | Mēs pašlaik veidojam jaunus darbus. Tikmēr pastāstiet, ko vēlaties — izveidosim to jums. | Individuāls pasūtījums |
| Load error (replaces "An error occurred") | `info` icon | **Kaut kas aizķērās** | Šo lapu neizdevās ielādēt. Lūdzu, mēģiniet vēlreiz vai rakstiet mums. | Mēģināt vēlreiz |
| 404 | `trosheen-10-404-rolling-stone.json` (view) | **Šī darba šeit nav** | Lapa varētu būt pārvietota. Darbnīca un veikals ir savās vietās. | Uz sākumu |

### 7.5 Icons
Inline the sprite (`04-icons/trosheen-icons-sprite.svg`) once after `<body>`, then use:
```html
<svg class="tr-icon" aria-hidden="true"><use href="#tr-bag"/></svg>
```
- **Accessibility:** icon-only links and buttons need an `aria-label`, for example `aria-label="Grozs"`.
- **Colour:** icons take the text colour, so they are always Spruce on Linen or Linen on Spruce.
- Never mix in other icon sets or emoji.

---

## 8. Motion

### 8.1 Principles
- One calm thing moves at a time.
- Use ease-in-out curves, short distances and no bounce.
- Motion never blocks a task.
- Every animation has a finished still state for visitors who turn motion off. `trosheen.css` and `trosheen.js` handle this automatically.

| Token | Value | Use |
|---|---|---|
| `--tr-dur-hover` | 200 ms | buttons, links, icons |
| `--tr-dur-base` | 400 ms | header, cards, menus |
| `--tr-dur-reveal` | 600 ms | headlines/images fading up |
| `--tr-dur-draw` | 1600 ms | botanical line art |
| `--tr-ease-calm` | cubic-bezier(.45,0,.2,1) | default |
| `--tr-ease-enter` | cubic-bezier(.2,.7,.2,1) | things appearing |

### 8.2 Scroll reveal
- Add `data-reveal` to headlines, text and images. They fade up 16 px when they scroll into view.
- `data-reveal="1"`, `"2"` and so on add an 80 ms stagger.
- Use it on a few elements per section, not on everything.

### 8.3 Lottie animations: one attribute, no custom code
Load `lottie_light.min.js` (already in the head snippet), set `LOTTIE_PATH` in `trosheen.js` (default `/lottie/`), then add a slot:
```html
<div data-lottie="trosheen-07-botanical-imprint.json" data-play="view" style="width:64px;height:64px"></div>
```
| `data-play` | Behaviour |
|---|---|
| `loop` | Loops (loader, candle, ripple, empty shop). |
| `view` | Plays once when 35% visible (signature, 404, success, imprint). |
| `hover` | Plays forward on hover and back on leave. Wrap the tile in `data-lottie-host`. |
| `manual` | You trigger it: `Trosheen.playOnce(el._lottie)`. Add-to-cart and wishlist are already wired via `data-add-to-cart` / `data-wishlist`. |

| File | Where | Size on page |
|---|---|---|
| `trosheen-01-seal-stamp-loop.json` | page/section loader | 96–160 px |
| `trosheen-01-seal-stamp-once.json` | order confirmed, custom-order sent | 120–160 px |
| `trosheen-02-add-to-cart.json` | inside the add-to-cart button | 24–32 px |
| `trosheen-03-wishlist-heart.json` | wishlist button | 32–44 px |
| `trosheen-04-sprouting-planter.json` | Dārzs category tile (hover) | 64–96 px |
| `trosheen-05-living-candle.json` | Sveces category, newsletter | 96–220 px |
| `trosheen-06-fountain-ripple.json` | hero scroll cue, fountains | 48–64 px |
| `trosheen-07-botanical-imprint.json` | "one of a kind" trust item, loaders | 44–96 px |
| `trosheen-08-wrapped-and-sealed.json` | checkout success | 120–160 px |
| `trosheen-09-frost-to-drop.json` | Kopšana winter tab | 44–64 px |
| `trosheen-10-404-rolling-stone.json` | 404 page | 140–200 px |
| `trosheen-11-empty-shop-plant.json` | empty shop | 140–200 px |

**Performance:**
- The files are tiny: 3–7 KB each, about 53 KB for the seal.
- `lottie_light` is enough. Load animations only on pages that use them.
- Pause the ambient layer when it's off screen (already handled).

### 8.4 Botanical line art (draws on scroll)
Paste the SVG code of a file from `09-botanical-line-art/svg/` directly into the HTML. Keep `class="tr-botanical"` and the `pathLength="1"` attributes.
```html
<svg class="tr-botanical tr-divider" viewBox="0 0 1200 80" …>…</svg>
```
- **Where:** section dividers (vine, meadow), story page margins, empty states.
- **How:** Spruce or Linen only, at 50–75% opacity. Never over a product.
- **Motion:** draws once and doesn't redraw when scrolling back.

### 8.5 Seasons of the courtyard
- `trosheen.js` sets `<html data-season="spring|summer|autumn|winter">` by month:
  - Mar–May: spring
  - Jun–Aug: summer
  - Sep–Nov: autumn
  - Dec–Feb: winter
- **Manual override:** set the attribute on `<html>` yourself, for example for a winter sale in March.
- **What changes:**
  - **Accent rule:** `.tr-season-rule` under the header switches to the season colour (Lichen, Gilt, Kiln or Spruce).
  - **Ambient layer:** put `<div class="tr-season-ambient" aria-hidden="true"></div>` inside the hero. It loads `trosheen-<season>-ambient.json` (lilac flowers, summer seeds, oak leaves or snow, 12 s loop, 55% opacity).
  - **Season lines** (from `10-seasons/seasons.json`):
    ```html
    <span data-season-only="spring">Ceriņi zied pie darbnīcas durvīm.</span>
    <span data-season-only="summer">Garas vasaras dienas pagalmā.</span> …
    ```
  - **Ornaments and banners:** `10-seasons/trosheen-<season>-ornament.svg` and `-banner-1920x120.png`, for announcement bars and emails.
- The logo, palette and type **never** change with the season. Use only one ambient layer per page, on the hero only.

### 8.6 Animated signature
| Where | Version |
|---|---|
| Story page, after Oļegs' section | `trosheen-signature-ar-siltam-rokam-olegs.json`, `data-play="view"`, 150–200 px high |
| Order confirmed | `trosheen-signature-trosheen-gimene.json` |
| No-JavaScript option | `*-animated.svg` plays by itself (`<img src="…-animated.svg" alt="Ar siltām rokām, Oļegs">`) |
| Emails | `11-signature/*-spruce.png` |

- **Accessibility:** add `role="img" aria-label="Ar siltām rokām, Oļegs"` to the animation's container.
- Show the signature once per page. The handwriting font (Caveat) is for the signature only.

---

## 9. Copy: Latvian first, English as a full twin

| Today | New |
|---|---|
| GIMENES DARBNĪCA - DAUGAVPILS, LATVIJA | ĢIMENES DARBNĪCA · DAUGAVPILS, LATVIJA |
| Veidots ar Ģimenes Rokām | Radīts, lai nodotu tālāk. |
| Pirkt roku darbus / Iepazīstiet mūs | Skatīt veikalu / Mūsu stāsts |
| CURRENT EDIT · Featured Collections | ŠĪS SEZONAS IZLASE · Izvēlētās kolekcijas |
| Handcrafted Concrete Art · Shop Now | Roku darbs no akmens un ģipša · Skatīt darbus |
| Custom Orders Welcome · Design Yours | Individuāli pasūtījumi · Pieteikt pasūtījumu |
| MATERIAL QUALITIES | MATERIĀLA ĪPAŠĪBAS |
| TROSHEEN MATERIAL PHILOSOPHY | TROSHEEN MATERIĀLU FILOZOFIJA |
| Photos · Videos · Product Photography | Foto · Video · Produktu foto |
| EKSKLUZĪVI JAUNUMI · Esiet informēti | VĒSTULES NO DARBNĪCAS · Jaunie darbi — vispirms jums |
| …noveco gracioziun. | …noveco graciozi un. |
| Daugavpils,Latvija | Daugavpils, Latvija |
| Trosheen.Crafts / Trosheen Crafts | Trosheen |

- **Claims:** keep "2K+ laimīgas mājas", "Nulle bez atkritumiem", "100% ekoloģisks" and "pārtikas klases" only if you can show proof for them.
- **Voice:** warm, calm, honest, crafted, quietly proud. Use short sentences, no exclamation marks in headlines, and no emoji.
- **Proofreading:** have a native speaker read the new Latvian lines before launch.

---

## 10. Beyond the website

- **Checkout and order emails:**
  - sender name **Trosheen**
  - header `06-banners-and-sections/trosheen-email-header-1200x360.png`
  - signature PNG at the end
- **Social:**
  - Rename Instagram and Facebook from `trosheencrafts` to Trosheen if the names are free, then update the links in the footer and the Brand Kit.
  - Profile picture: `03-favicon-app-icons/social-profile-avatar-1080.png`.
- **Marketing:** the files in `12-marketing-materials/` are ready for Instagram, Facebook, packaging and print.

---

## 11. Launch checklist

**Must**
- [ ] Shop shows real pieces, or the designed empty state. No raw error messages anywhere.
- [ ] "Design Yours" / custom-order link works.
- [ ] Real email and phone in every footer.
- [ ] Name is "Trosheen" everywhere, including titles, ©, the guide and emails.
- [ ] Head snippet on every page: titles, descriptions, share image, favicon set, theme colour.
- [ ] Jost replaces Inter, and the colour tokens replace the old colours.

**Should**
- [ ] Homepage rebuilt in five sections, with the no-text hero and live buttons.
- [ ] Header, footer, buttons, cards and forms use `trosheen.css` classes.
- [ ] Latvian label fixes applied, and EN twin written.
- [ ] Animations wired: cart, wishlist, 404, empty shop, success, scroll cue.

**Nice**
- [ ] Botanical dividers, seasons and the signature on the story page.
- [ ] Seasonal announcement bar.

**QA**
- [ ] Test on a phone (390 px), tablet and desktop.
- [ ] Keyboard only: every button and link has a visible Gilt focus ring.
- [ ] With "reduce motion" switched on, everything shows its finished state and nothing falls or loops.
- [ ] Lighthouse: LCP image is the preloaded hero, and all images have width/height and alt text.
- [ ] Share a link in Messenger/WhatsApp: the new title, description and image appear.

---

## 12. Rules that never change

- **Products:** real pieces in true colour. Never recolour, desaturate, replace or invent them.
- **Logo:** never redraw or recolour the seal, never stretch it, never put it over a piece.
- **Buttons:** no buttons inside images. Buttons are always live HTML.
- **Colour:** Gilt and Lichen are never text colours on Linen.
- **Brand names:** never use the old name or the old seasonal logos.

*Questions about the brand: see Brand book v3.1. Questions about code: everything shown here is working in `13-code/example-homepage.html`.*
