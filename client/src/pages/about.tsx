import { Link } from "wouter";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { ScrollStoryPhotos, WorkshopTourPhotos } from "@/lib/imageAssets";
import { BrandMotion } from "@/components/shared/BrandMotion";

export default function AboutPage() {
  const { t } = useLanguage();

  const timeline = [
    { year: "1995", titleKey: "timeline.1995.title", descKey: "timeline.1995.desc" },
    { year: "2005", titleKey: "timeline.2005.title", descKey: "timeline.2005.desc" },
    { year: "2018", titleKey: "timeline.2018.title", descKey: "timeline.2018.desc" },
    { year: "2019", titleKey: "timeline.2019_nikola.title", descKey: "timeline.2019_nikola.desc" },
    { year: "2019", titleKey: "timeline.2019.title", descKey: "timeline.2019.desc" },
    { year: "2023", titleKey: "timeline.2023.title", descKey: "timeline.2023.desc" },
    { year: "2026", titleKey: "timeline.2026.title", descKey: "timeline.2026.desc" },
  ];

  const storySections = [
    {
      eyebrow: t("chapter_heritage_eyebrow"),
      title: t("chapter_heritage_title"),
      body: t("chapter_heritage_body_1"),
      image: ScrollStoryPhotos.chapter1_heritage,
    },
    {
      eyebrow: t("chapter_makers_eyebrow"),
      title: t("chapter_makers_title"),
      body: t("chapter_makers_body_1"),
      image: WorkshopTourPhotos.finishingStudio,
    },
    {
      eyebrow: t("chapter_legacy_eyebrow"),
      title: t("chapter_legacy_title"),
      body: t("chapter_legacy_body_1"),
      image: ScrollStoryPhotos.chapter4_family,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="brand-panel brand-panel-dark">
        <div className="brand-panel-copy">
          <p className="eyebrow mb-5">{t("nav_story")}</p>
          <h1 className="text-[clamp(2.8rem,5vw,4.8rem)]">{t("brand.story_title")}</h1>
          <p className="mt-6 max-w-prose leading-relaxed">{t("brand.story_desc")}</p>
        </div>
        <div><img src="/brand/about.webp" alt={t("brand.newsletter_alt")} width="960" height="900" className="brand-panel-image" /></div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <div className="grid gap-16">
            {storySections.map((section, index) => (
              <article
                key={section.title}
                className="grid gap-9 lg:grid-cols-2 lg:items-center lg:gap-16"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <p className="eyebrow">{section.eyebrow}</p>
                  <h2 className="section-title mt-4">{section.title}</h2>
                  <div className="mt-6 space-y-4 text-base leading-8 text-muted-foreground sm:text-lg">
                    {section.body
                      .split("\n")
                      .filter(Boolean)
                      .map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="aspect-[5/4] overflow-hidden rounded-3xl bg-muted">
                    <img
                      src={section.image}
                      alt={section.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="site-container section-space">
          <div className="max-w-3xl">
            <p className="eyebrow">{t("material.precision")}</p>
            <h2 className="section-title mt-4">{t("material.microscopic")}</h2>
            <p className="lead mt-5">{t("material.desc")}</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["about.materials.concrete.name", "about.materials.concrete.desc"],
              ["about.materials.gypsum.name", "about.materials.gypsum.desc"],
              ["about.materials.acrylics.name", "about.materials.acrylics.desc"],
              ["about.materials.resins.name", "about.materials.resins.desc"],
            ].map(([nameKey, descKey]) => (
              <div key={nameKey} className="surface-muted p-6">
                <h3 className="font-serif text-2xl font-semibold">{t(nameKey)}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{t(descKey)}</p>
              </div>
            ))}
          </div>

          <Button asChild variant="outline" className="mt-8">
            <Link href="/guide">
              {t("guide_care_eyebrow")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">{t("timeline.tag")}</p>
            <h2 className="section-title mt-4">{t("timeline.title")}</h2>
            <p className="lead mt-5">{t("timeline.description")}</p>
          </div>

          <div className="mx-auto mt-12 max-w-5xl divide-y divide-border border-y border-border">
            {timeline.map((item) => (
              <div key={item.year + item.titleKey} className="grid gap-3 py-6 sm:grid-cols-[110px_1fr] sm:gap-8">
                <div className="font-serif text-3xl font-semibold text-primary">{item.year}</div>
                <div>
                  <h3 className="font-serif text-2xl font-semibold">{t(item.titleKey)}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground sm:text-base">{t(item.descKey)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary text-secondary-foreground">
        <div className="site-container section-space grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
              {t("chapter_philosophy_eyebrow")}
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5.6rem)] font-semibold leading-[.94] tracking-[-.045em]">
              {t("chapter_philosophy_title")}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-8 text-white/70 sm:text-lg">
              {t("chapter_philosophy_body_1")
                .split("\n")
                .filter(Boolean)
                .map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
          <div className="aspect-square overflow-hidden rounded-3xl">
            <img
              src={ScrollStoryPhotos.chapter5_mastery}
              alt={t("chapter_philosophy_title")}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="section-space border-b border-border">
        <div className="site-container flex flex-col items-center text-center">
          <img src="/brand/botanical/trosheen-fern.svg" alt="" loading="lazy" className="mb-6 h-24 w-24" />
          <BrandMotion name="signature" mode="view" className="h-28 w-72 max-w-full" label="Ar siltām rokām, Oļegs" poster="/brand/signature-olegs.svg" />
        </div>
      </section>

      <section className="section-space">
        <div className="site-container max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
            <MapPin className="h-3.5 w-3.5" />
            {t("hero_location")}
          </div>
          <h2 className="section-title mt-5">
            {t("about.visit_title")} <span className="italic text-primary">{t("common.studio")}</span>
          </h2>
          <p className="lead mx-auto mt-5 max-w-2xl">{t("about.visit_desc")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/contact">
                {t("nav_contact")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/shop">{t("about.browse_work")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
