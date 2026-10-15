import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { useHomepageImages } from "@/hooks/useHomepageImages";
import { DEFAULT_HOMEPAGE_IMAGES } from "@/lib/homepageImages";
import { PromotionalGallery } from "@/components/PromotionalGallery";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";
import { BrandMotion } from "@/components/shared/BrandMotion";

export default function HomePage() {
  const { t } = useLanguage();
  const { image } = useHomepageImages();
  const hero = image("hero");
  const defaultHero = hero === DEFAULT_HOMEPAGE_IMAGES.hero;
  const familyPhoto = image("familyFeature");
  const bundledStoryPhoto = familyPhoto === DEFAULT_HOMEPAGE_IMAGES.familyFeature;
  return (
    <div>
      <section className="brand-hero brand-hero--editorial" aria-labelledby="trosheen-hero-heading">
        <div className="brand-hero-photo">
          <picture>
            {defaultHero && <source media="(max-width: 767px)" type="image/webp" srcSet="/brand/hero-mobile.webp 720w, /brand/hero-mobile-1080.webp 1080w" sizes="100vw" />}
            {defaultHero && <source media="(min-width: 768px)" type="image/webp" srcSet="/brand/hero-desktop-1280.webp 1280w, /brand/hero-desktop.webp 1920w" sizes="(min-width:768px) 58vw, 100vw" />}
            <img src={hero} alt={t("brand.hero_alt")} fetchPriority="high" width="2560" height="1000"
              onError={(event) => {
                const target = event.currentTarget;
                if (target.dataset.fallbackApplied) return;
                target.dataset.fallbackApplied = "true";
                target.parentElement?.querySelectorAll("source").forEach(source => source.remove());
                target.src = DEFAULT_HOMEPAGE_IMAGES.hero;
              }} />
          </picture>
        </div>
        <div className="brand-hero-copy">
          <p className="eyebrow mb-5">{t("brand.location")}</p>
          <h1 id="trosheen-hero-heading">{t("brand.tagline")}</h1>
          <p className="lead mt-5 max-w-prose">{t("brand.intro")}</p>
          <div className="brand-hero-actions mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="brand-gilt-button"><Link href="/shop">{t("brand.shop")}<ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="brand-story-link"><Link href="/about">{t("nav_story")}</Link></Button>
            <Button asChild size="lg" variant="outline" className="brand-story-link"><Link href="/constructor">{t("shop_custom_builder")}</Link></Button>
          </div>
          <a className="brand-scroll-cue" href="#collection-title" aria-label={t("brand.collections")}><BrandMotion name="ripple" mode="loop" className="h-12 w-12" poster="/brand/icons/fountain.svg" /></a>
        </div>
      </section>

      <section className="border-b border-border">
        <ul className="site-container brand-trust">
          {[
            ["handmade", "brand.handmade", "/about"],
            ["one-of-a-kind", "brand.unique", "/shop"],
            ["natural-materials", "brand.materials", "/guide"],
            ["parcel", "brand.packed", "/shop"],
            ["secure-payment", "brand.payment", "/shop"],
          ].map(([icon, key, href]) => <li key={key}><img src={`/brand/icons/${icon}.svg`} alt="" width="24" height="24" /><Link href={href} className="hover:underline underline-offset-4">{t(key)}</Link></li>)}
        </ul>
      </section>

      <section className="section-space" aria-labelledby="collection-title">
        <div className="site-container">
          <p className="eyebrow">{t("brand.season")}</p>
          <div className="mb-10 flex items-end justify-between gap-5"><h2 id="collection-title" className="section-title mt-4">{t("brand.collections")}</h2><img src="/brand/botanical/trosheen-lilac.svg" alt="" className="hidden h-16 w-16 opacity-60 sm:block" loading="lazy" /></div>
          <PromotionalGallery embedded />
          <div className="space-y-8">
            {[
              { photo: "collection-mould", slot: "storyHeritage" as const, title: "brand.mould", body: "brand.mould_desc", dark: false },
              { photo: "collection-heirloom", slot: "storyMakers" as const, title: "brand.heirloom", body: "brand.heirloom_desc", dark: true },
            ].map((collection) => (
              <article key={collection.photo} className={`brand-panel ${collection.dark ? "brand-panel-dark brand-panel-reverse" : "bg-card"}`}>
                <div className="brand-panel-photo"><img src={image(collection.slot)} onError={(event) => { event.currentTarget.src = DEFAULT_HOMEPAGE_IMAGES[collection.slot]; }} alt={t(collection.title)} loading="lazy" width="960" height="640" className="brand-panel-image" /></div>
                <div className="brand-panel-copy">
                  <p className="eyebrow mb-5">Trosheen</p>
                  <h3 className="!text-[clamp(2.25rem,4vw,3.8rem)]">{t(collection.title)}</h3>
                  <p className="mt-5 leading-relaxed">{t(collection.body)}</p>
                  <Button asChild className={`mt-7 ${collection.dark ? "brand-gilt-button" : ""}`}><Link href="/shop">{t("brand.shop")}<ArrowRight className="h-4 w-4" /></Link></Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="border-y border-border">
        <div className="brand-panel">
          <div className={bundledStoryPhoto ? "brand-art-crop brand-art-crop--left" : "brand-editorial-media"}>
            <img
              src={familyPhoto}
              onError={(event) => {
                const target = event.currentTarget;
                if (target.dataset.fallbackApplied) return;
                target.dataset.fallbackApplied = "true";
                const wrapper = target.closest(".brand-editorial-media");
                wrapper?.classList.remove("brand-editorial-media");
                wrapper?.classList.add("brand-art-crop", "brand-art-crop--left");
                target.src = DEFAULT_HOMEPAGE_IMAGES.familyFeature;
              }}
              alt={t("brand.story_alt")}
              width="1920" height="860" loading="lazy" className="brand-panel-image"
            />
          </div>
          <div className="brand-panel-copy">
            <p className="eyebrow mb-5">{t("nav_story")}</p>
            <h2>{t("brand.story_title")}</h2>
            <p className="mt-5 leading-relaxed">{t("brand.story_desc")}</p>
            <img src="/brand/botanical/trosheen-divider-vine.svg" alt="" loading="lazy" className="mt-7 h-10 w-auto max-w-[220px]" />
            <Button asChild variant="outline" className="mt-7"><Link href="/about">{t("nav_story")}<ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </div>
      </section>

      <section className="site-container py-16 sm:py-24">
        <NewsletterSubscribe variant="hero" source="homepage" />
      </section>
    </div>
  );
}
