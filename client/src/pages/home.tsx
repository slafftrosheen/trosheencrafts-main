import { useMemo } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { useHomepageImages } from "@/hooks/useHomepageImages";
import { DEFAULT_HOMEPAGE_IMAGES } from "@/lib/homepageImages";
import { useProducts } from "@/hooks/useApi";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import { SplitWords } from "@/components/brand/SplitWords";
import { SeasonAmbient } from "@/components/brand/SeasonRibbon";
import { NewsletterForm } from "@/components/brand/NewsletterForm";
import { ProductCardV4, productImage } from "@/components/brand/ProductCardV4";
import { PromotionalGallery } from "@/components/PromotionalGallery";

const Arrow = () => (
  <svg
    className="tr-arrow"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
  >
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

export default function HomePage() {
  const { t } = useLanguage();
  const { image } = useHomepageImages();
  const { data: products } = useProducts();

  const hero = image("hero");
  const bundledHero = hero === DEFAULT_HOMEPAGE_IMAGES.hero;
  const galleryFeature = image("galleryFeature");
  const journalFeature = image("journalFeature");

  const published = useMemo(
    () => (products || []).filter((product) => product.published),
    [products],
  );
  const rail = useMemo(
    () =>
      [...published]
        .sort(
          (a, b) =>
            Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
            Date.parse(b.createdAt) - Date.parse(a.createdAt),
        )
        .slice(0, 6),
    [published],
  );

  const stripImages = useMemo(() => {
    const withImages = published.filter((product) => productImage(product));
    return withImages.slice(0, 12).map((product) => productImage(product));
  }, [published]);

  return (
    <div>
      {/* ---------- hero ---------- */}
      <section className="hero" style={{ "--focus": "50% 60%" } as React.CSSProperties}>
        <picture className={bundledHero ? "hero__media hero__media--uncropped" : "hero__media"}>
          {bundledHero && (
            <source
              media="(max-width:700px)"
              srcSet="/heroes/trosheen-hero-mobile-12-750.webp 750w, /heroes/trosheen-hero-mobile-12-1080.webp 1080w"
              type="image/webp"
            />
          )}
          {bundledHero && (
            <source
              srcSet="/heroes/trosheen-hero-desktop-05-1280.webp 1280w, /heroes/trosheen-hero-desktop-05-1920.webp 1920w, /heroes/trosheen-hero-desktop-05-2560.webp 2560w"
              type="image/webp"
            />
          )}
          <img
            src={bundledHero ? "/heroes/trosheen-hero-desktop-05-1920.jpg" : hero}
            alt={t("v4.hero.alt")}
            fetchPriority="high"
          />
        </picture>
        <SeasonAmbient />

        <div className="wrap hero__content">
          <p className="eyebrow">{t("v4.hero.eyebrow")}</p>
          <SplitWords text={t("brand.tagline")} />
          <p className="lead">{t("v4.hero.lead")}</p>
          <div className="btn-row">
            <Link className="btn btn--linen" href="/shop">
              {t("v4.hero.ctaPieces")} <Arrow />
            </Link>
            <Link className="btn btn--on-dark" href="/about">
              {t("v4.hero.ctaFamily")}
            </Link>
          </div>
        </div>

        <Lottie
          file="trosheen-01-seal-stamp-once.json"
          mode="once"
          className="hero__seal breathe"
        />
        <Lottie
          file="trosheen-12-scroll-cue.json"
          mode="loop"
          className="hero__scroll"
        />
      </section>

      {/* ---------- the letter ---------- */}
      <section className="section">
        <div className="wrap split">
          <div className="photo-pair" data-reveal>
            <figure className="polaroid" style={{ "--tilt": "-2.5deg", margin: 0, width: "78%" } as React.CSSProperties}>
              <img src={image("storyHeritage")} alt={t("v4.letter.caption1")} loading="lazy" />
              <figcaption>{t("v4.letter.caption1")}</figcaption>
            </figure>
            <figure className="polaroid" style={{ margin: 0 }}>
              <img src={image("storyMakers")} alt={t("v4.letter.caption2")} loading="lazy" />
              <figcaption>{t("v4.letter.caption2")}</figcaption>
            </figure>
          </div>
          <div className="letter" data-reveal style={{ "--delay": "150ms" } as React.CSSProperties}>
            <p className="eyebrow">
              <Ornament name="auseklis" size="sm" draw /> {t("v4.letter.eyebrow")}
            </p>
            <p>{t("v4.letter.p1")}</p>
            <p>{t("v4.letter.p2")}</p>
            <img
              className="signature"
              src="/brand/trosheen-signature-ar-siltam-rokam-olegs-animated.svg"
              alt={t("v4.letter.signAlt")}
            />
          </div>
        </div>
      </section>

      {/* ---------- four pillars ---------- */}
      <section className="section section--warm section--tight">
        <div className="wrap">
          <div className="center" data-reveal>
            <p className="eyebrow">{t("v4.pillars.eyebrow")}</p>
            <h2>{t("v4.pillars.title")}</h2>
          </div>
          <div className="grid grid-4" style={{ marginTop: "2.5rem" }} data-stagger>
            {[
              { orn: "austras-koks", title: "v4.pillar1.title", desc: "v4.pillar1.desc" },
              { orn: "jumis", title: "v4.pillar2.title", desc: "v4.pillar2.desc" },
              { orn: "saule", title: "v4.pillar3.title", desc: "v4.pillar3.desc" },
              { orn: "krustu-krusts", title: "v4.pillar4.title", desc: "v4.pillar4.desc" },
            ].map((pillar) => (
              <article className="card pillar" key={pillar.title}>
                <Ornament name={pillar.orn} draw />
                <h3>{t(pillar.title)}</h3>
                <p>{t(pillar.desc)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- three paths ---------- */}
      <section className="section section--tight cats-sec" aria-label={t("v4.cats.title")}>
        <div className="wrap">
          <div className="center" data-reveal>
            <p className="eyebrow">
              <Ornament name="jumis" size="sm" draw /> {t("v4.cats.eyebrow")}
            </p>
            <h2>{t("v4.cats.title")}</h2>
          </div>
          <div className="grid grid-3 cats" data-stagger style={{ marginTop: "2.5rem" }}>
            <Link className="card cat" href="/shop" data-lottie-host>
              <Lottie
                file="trosheen-19-candle-ignite.json"
                mode="hover"
                className="cat__art"
                style={{ width: 120, height: 120 }}
              />
              <h3>{t("v4.cat1.title")}</h3>
              <p className="note">{t("v4.cat1.note")}</p>
              <span className="link-arrow">{t("v4.cat1.link")}</span>
            </Link>
            <Link className="card cat" href="/shop" data-lottie-host>
              <Lottie
                file="trosheen-21-rosette.json"
                mode="view"
                className="cat__art"
                style={{ width: 120, height: 120 }}
              />
              <h3>{t("v4.cat2.title")}</h3>
              <p className="note">{t("v4.cat2.note")}</p>
              <span className="link-arrow">{t("v4.cat2.link")}</span>
            </Link>
            <Link className="card cat" href="/shop" data-lottie-host>
              <Lottie
                file="trosheen-20-leaf-stone.json"
                mode="view"
                className="cat__art"
                style={{ width: 120, height: 120 }}
              />
              <h3>{t("v4.cat3.title")}</h3>
              <p className="note">{t("v4.cat3.note")}</p>
              <span className="link-arrow">{t("v4.cat3.link")}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- photo strip ---------- */}
      <section className="section section--tight marquee-sec" aria-label={t("v4.works.title")}>
        <div className="wrap center" data-reveal>
          <p className="eyebrow">{t("v4.works.eyebrow")}</p>
          <h2>{t("v4.works.title")}</h2>
        </div>
        {stripImages.length > 0 && (
          <div className="marquee" aria-label={t("v4.works.title")}>
            <div className="marquee__track">
              {[...stripImages, ...stripImages].map((src, index) => (
                <figure className="marquee__item" key={`${src}-${index}`}>
                  <img src={src} alt="" loading="lazy" />
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Admin-managed promotions stay on the homepage; hidden until one exists. */}
        <div className="wrap" style={{ marginTop: "var(--s6)" }}>
          <PromotionalGallery embedded />
        </div>
      </section>

      {/* ---------- this season's pieces ---------- */}
      <section className="section">
        <div className="wrap">
          <div
            className="toolbar"
            style={{ border: 0, padding: 0, marginBottom: "2rem" }}
            data-reveal
          >
            <div>
              <p className="eyebrow">{t("v4.fresh.eyebrow")}</p>
              <h2 style={{ margin: 0 }}>{t("v4.fresh.title")}</h2>
            </div>
            <Link className="link-arrow" href="/shop">
              {t("v4.fresh.all")} <Arrow />
            </Link>
          </div>

          {rail.length ? (
            <div className="rail">
              {rail.map((product, index) => (
                <ProductCardV4 key={product.id} product={product} delay={index * 90} />
              ))}
            </div>
          ) : (
            <div className="empty" data-reveal>
              <Lottie
                file="trosheen-11-empty-shop-plant.json"
                mode="view"
                className="empty__art"
              />
              <h3>{t("v4.shop.empty.title")}</h3>
              <p>{t("v4.shop.empty.desc")}</p>
              <div className="btn-row" style={{ justifyContent: "center" }}>
                <Link className="btn" href="/constructor">
                  {t("v4.shop.empty.cta1")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="wrap">
        <div className="band" data-reveal="fade" aria-hidden="true" />
      </div>

      {/* ---------- making steps ---------- */}
      <section className="section">
        <div className="wrap">
          <div className="center" data-reveal>
            <p className="eyebrow">
              <Ornament name="jumis" size="sm" draw /> {t("v4.steps.eyebrow")}
            </p>
            <h2>
              {t("v4.steps.title")} <mark data-mark>{t("v4.steps.titleMark")}</mark>
            </h2>
            <p className="lead">{t("v4.steps.lead")}</p>
          </div>
          <div className="steps" style={{ marginTop: "3rem" }}>
            {[
              { lottie: "trosheen-13-step-recipe.json", mode: "view" as const },
              { lottie: "trosheen-14-step-pour.json", mode: "view" as const },
              { lottie: "trosheen-15-step-sculpt.json", mode: "view" as const },
              { lottie: "trosheen-16-step-rest.json", mode: "loop" as const },
              { lottie: "trosheen-17-step-paint.json", mode: "view" as const },
              { lottie: "trosheen-18-step-wrap.json", mode: "view" as const },
            ].map((step, index) => (
              <article
                className="step"
                key={step.lottie}
                data-reveal
                style={{ "--delay": `${(index % 3) * 120}ms` } as React.CSSProperties}
              >
                <div className="step__icon">
                  <Lottie file={step.lottie} mode={step.mode} />
                </div>
                <h3>{t(`v4.step${index + 1}.title`)}</h3>
                <p>{t(`v4.step${index + 1}.desc`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- story band ---------- */}
      <section className="section section--spruce">
        <div className="wrap split">
          <figure
            className="frame frame--arch frame--4x5"
            data-reveal
            style={{ margin: 0, maxWidth: 460 }}
          >
            <img
              src="/heroes/trosheen-hero-mobile-04-750.webp"
              alt={t("v4.band.title")}
              loading="lazy"
            />
          </figure>
          <div data-reveal style={{ "--delay": "150ms" } as React.CSSProperties}>
            <p className="eyebrow">
              <Ornament name="auseklis" size="sm" draw /> {t("v4.band.eyebrow")}
            </p>
            <h2>{t("v4.band.title")}</h2>
            <p className="lead">{t("v4.band.lead")}</p>
            <Link className="btn btn--on-dark" href="/about">
              {t("v4.band.cta")} <Arrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- custom workshop ---------- */}
      <section className="section">
        <div className="wrap split split--flip">
          <figure className="drawing" data-ink style={{ margin: 0, "--ar": "4/3" } as React.CSSProperties}>
            <img src={image("shopFeature")} alt={t("v4.custom.title")} loading="lazy" />
          </figure>
          <div data-reveal>
            <p className="eyebrow">{t("v4.custom.eyebrow")}</p>
            <h2>{t("v4.custom.title")}</h2>
            <p className="lead">{t("v4.custom.lead")}</p>
            <div className="btn-row">
              <Link className="btn" href="/constructor">
                {t("v4.custom.start")} <Arrow />
              </Link>
              <Link className="btn btn--ghost" href="/contact">
                {t("v4.custom.ask")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- gallery + journal ---------- */}
      <section className="section section--warm">
        <div className="wrap">
          <div className="center" data-reveal>
            <p className="eyebrow">{t("v4.duo.eyebrow")}</p>
            <h2>{t("v4.duo.title")}</h2>
          </div>
          <div className="grid grid-2" style={{ marginTop: "2.5rem" }}>
            <Link className="post card" href="/gallery" data-reveal>
              <div className="frame">
                {galleryFeature ? (
                  <img src={galleryFeature} alt={t("v4.duo.gallery.title")} loading="lazy" />
                ) : (
                  <span className="empty__art" aria-hidden="true"><Lottie file="trosheen-29-gallery-frame.json" mode="view" /></span>
                )}
              </div>
              <span className="post__meta">{t("v4.duo.gallery.meta")}</span>
              <h3>{t("v4.duo.gallery.title")}</h3>
              <p className="note">{t("v4.duo.gallery.note")}</p>
            </Link>
            <Link
              className="post card"
              href="/blog"
              data-reveal
              style={{ "--delay": "120ms" } as React.CSSProperties}
            >
              <div className="frame">
                {journalFeature ? (
                  <img src={journalFeature} alt={t("v4.duo.journal.title")} loading="lazy" />
                ) : (
                  <span className="empty__art" aria-hidden="true"><Lottie file="trosheen-04-sprouting-planter.json" mode="view" /></span>
                )}
              </div>
              <span className="post__meta">{t("v4.duo.journal.meta")}</span>
              <h3>{t("v4.duo.journal.title")}</h3>
              <p className="note">{t("v4.duo.journal.note")}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- letters from the workshop ---------- */}
      <section className="section" id="nl">
        <div className="wrap">
          <div className="newsletter" data-reveal>
            <div>
              <p className="eyebrow">
                <Ornament name="saule" size="sm" draw /> {t("v4.news.eyebrow")}
              </p>
              <h2>{t("v4.news.title")}</h2>
              <p className="lead" style={{ margin: 0 }}>
                {t("v4.news.lead")}
              </p>
            </div>
            <NewsletterForm source="homepage" />
          </div>
        </div>
      </section>
    </div>
  );
}
