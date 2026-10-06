import { Link } from "wouter";
import { ArrowRight, Heart, Recycle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { HeroPhotos, ScrollStoryPhotos, WorkshopTourPhotos, BrandAssets } from "@/lib/imageAssets";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";
import { PromotionalGallery } from "@/components/PromotionalGallery";

const chapters = [
  {
    id: "heritage",
    eyebrowKey: "chapter_heritage_eyebrow",
    titleKey: "chapter_heritage_title",
    image: ScrollStoryPhotos.chapter1_heritage,
    bodyKey: "chapter_heritage_body_1",
  },
  {
    id: "makers",
    eyebrowKey: "chapter_makers_eyebrow",
    titleKey: "chapter_makers_title",
    image: ScrollStoryPhotos.chapter3_crafting,
    bodyKey: "chapter_makers_body_1",
  },
  {
    id: "legacy",
    eyebrowKey: "chapter_legacy_eyebrow",
    titleKey: "chapter_legacy_title",
    image: ScrollStoryPhotos.chapter4_family,
    bodyKey: "chapter_legacy_body_1",
  },
  {
    id: "philosophy",
    eyebrowKey: "chapter_philosophy_eyebrow",
    titleKey: "chapter_philosophy_title",
    image: ScrollStoryPhotos.chapter5_mastery,
    bodyKey: "chapter_philosophy_body_1",
  },
] as const;

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="bg-background">
      <section className="relative min-h-[82svh] overflow-hidden bg-secondary text-white">
        <img
          src={HeroPhotos.main}
          alt="Trosheen family workshop"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,16,13,.78)_0%,rgba(18,16,13,.48)_48%,rgba(18,16,13,.10)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="site-container relative flex min-h-[82svh] items-end pb-12 pt-24 sm:pb-16 md:items-center md:py-24">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/15 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              <Heart className="h-3.5 w-3.5" />
              {t("hero_location")}
            </div>

            <h1 className="font-serif text-[clamp(3.2rem,9vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.055em] text-white">
              {t("hero_title_1")}
              <span className="block italic text-[#d9cdbb]">{t("hero_title_2")}</span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg md:text-xl">
              {t("hero_subtitle")}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-white text-black border-white hover:bg-white/92">
                <Link href="/shop">
                  {t("hero_cta_secondary")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/35 bg-black/10 text-white hover:bg-white/10 hover:text-white"
              >
                <a href="#story">{t("hero_cta_primary")}</a>
              </Button>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 border-t border-white/20 pt-6">
              {[
                { value: "30+", label: t("hero.stats.years") },
                { value: "3", label: t("hero.stats.generations") },
                { value: "2K+", label: t("hero.stats.pieces") },
              ].map((stat) => (
                <div key={stat.label} className="pr-4">
                  <div className="font-serif text-2xl font-semibold sm:text-3xl">{stat.value}</div>
                  <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/75">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PromotionalGallery />

      <section id="story" className="section-space">
        <div className="site-container">
          <div className="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow">{t("story.narrative")}</p>
              <h2 className="section-title mt-4">{t("story.headline")}</h2>
              <p className="lead mt-6 max-w-xl">{t("story.intro")}</p>
              <Button asChild variant="outline" className="mt-7">
                <Link href="/about">
                  {t("nav_story")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              {chapters.map((chapter, index) => {
                const body = t(chapter.bodyKey).split("\n").filter(Boolean)[0] || "";
                return (
                  <article key={chapter.id} className={index % 2 === 1 ? "sm:mt-12" : ""}>
                    <div className="aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                      <img
                        src={chapter.image}
                        alt={t(chapter.titleKey)}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="eyebrow mt-5">{t(chapter.eyebrowKey)}</p>
                    <h3 className="mt-2 font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                      {t(chapter.titleKey)}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                      {body}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="site-container section-space grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="aspect-[5/4] overflow-hidden rounded-3xl bg-muted">
            <img
              src={WorkshopTourPhotos.materialsArea}
              alt="Materials in the Trosheen workshop"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="eyebrow">{t("material.precision")}</p>
            <h2 className="section-title mt-4">{t("material.microscopic")}</h2>
            <p className="lead mt-6">{t("material.desc")}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {[
                t("about.materials.concrete.name"),
                t("about.materials.gypsum.name"),
                t("about.materials.acrylics.name"),
                t("about.materials.resins.name"),
              ].map((material) => (
                <span
                  key={material}
                  className="rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold"
                >
                  {material}
                </span>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-7">
              <Link href="/guide">
                {t("guide_care_eyebrow")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-secondary text-secondary-foreground">
        <div className="site-container section-space grid gap-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary-foreground/75">
              {t("chapter_philosophy_eyebrow")}
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5.8rem)] font-semibold leading-[.94] tracking-[-.045em]">
              {t("phil_title")}
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-8 text-secondary-foreground/82 sm:text-lg">
              {t("phil_desc")}
            </p>
            <div className="mt-8 grid max-w-lg grid-cols-2 gap-4">
              <div className="border-t border-white/20 pt-4">
                <ShieldCheck className="h-5 w-5 text-[#d9cdbb]" />
                <div className="mt-3 font-serif text-2xl font-semibold">{t("phil_decades")}</div>
                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/70">{t("phil_durability")}</p>
              </div>
              <div className="border-t border-white/20 pt-4">
                <Recycle className="h-5 w-5 text-[#d9cdbb]" />
                <div className="mt-3 font-serif text-2xl font-semibold">{t("phil_zero")}</div>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/45">{t("phil_waste")}</p>
              </div>
            </div>
          </div>
          <div className="aspect-square overflow-hidden rounded-3xl">
            <img
              src={WorkshopTourPhotos.castingStation}
              alt="Hand casting in the workshop"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container grid gap-6 lg:grid-cols-2">
          <article className="surface overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={WorkshopTourPhotos.completedPieces}
                alt="Finished Trosheen pieces"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-7 sm:p-9">
              <p className="eyebrow">{t("curated_selection")}</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("shop_teaser_title")}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{t("shop_teaser_desc")}</p>
              <Button asChild className="mt-6">
                <Link href="/shop">
                  {t("shop_view_all")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </article>

          <article className="surface overflow-hidden">
            <div className="aspect-[16/10] overflow-hidden bg-muted">
              <img
                src={BrandAssets.teamPortrait}
                alt="Trosheen family"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-7 sm:p-9">
              <p className="eyebrow">{t("workshop_journal")}</p>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                {t("journal.follow")}
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">{t("journal.desc")}</p>
              <Button asChild variant="outline" className="mt-6">
                <Link href="/blog">
                  {t("read_notes")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section className="pb-16 sm:pb-24">
        <div className="site-container">
          <NewsletterSubscribe variant="hero" source="homepage" />
        </div>
      </section>
    </div>
  );
}
