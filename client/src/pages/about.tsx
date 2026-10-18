import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { useHomepageImages } from "@/hooks/useHomepageImages";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import { SplitWords } from "@/components/brand/SplitWords";

export default function AboutPage() {
  const { t } = useLanguage();
  const { image } = useHomepageImages();

  return (
    <div className="about-page">
      <section className="hero hero--page" style={{ "--focus": "50% 50%" } as React.CSSProperties}>
        <picture className="hero__media">
          <source media="(max-width:700px)" srcSet="/heroes/trosheen-hero-mobile-05-750.webp 750w, /heroes/trosheen-hero-mobile-05-1080.webp 1080w" type="image/webp" />
          <source srcSet="/heroes/trosheen-hero-desktop-04-1280.webp 1280w, /heroes/trosheen-hero-desktop-04-1920.webp 1920w, /heroes/trosheen-hero-desktop-04-2560.webp 2560w" type="image/webp" />
          <img src={image("familyFeature")} alt={t("v4.story.hero.title")} fetchPriority="high" />
        </picture>
        <div className="wrap hero__content">
          <p className="eyebrow">{t("v4.story.hero.eyebrow")}</p>
          <SplitWords text={t("v4.story.hero.title")} />
          <p className="lead">{t("v4.story.hero.lead")}</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div data-reveal>
            <p className="eyebrow"><Ornament name="maras-zime" size="sm" draw /> {t("v4.story.ch1")}</p>
            <h2>{t("v4.story.c1.title")}</h2>
            <p className="lead">{t("v4.story.c1.lead")}</p>
            <p>{t("v4.story.c1.body")}</p>
          </div>
          <figure className="frame frame--arch frame--3x4" data-reveal style={{ margin: 0, maxWidth: 480, justifySelf: "center" }}>
            <img src={image("storyLegacy")} alt={t("v4.story.c1.title")} loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="section section--warm">
        <div className="wrap split split--flip">
          <div data-reveal>
            <p className="eyebrow"><Ornament name="saule" size="sm" draw /> {t("v4.story.ch2")}</p>
            <h2>{t("v4.story.c2.title")}</h2>
            <p className="lead">{t("v4.story.c2.lead")}</p>
            <p>{t("v4.story.c2.body")}</p>
          </div>
          <figure className="drawing" data-ink style={{ margin: 0, "--ar": "3/4", maxWidth: 480, justifySelf: "center" } as React.CSSProperties}>
            <img src={image("storyPhilosophy")} alt={t("v4.story.c2.title")} loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div data-reveal>
            <Lottie file="trosheen-24-three-generations.json" mode="view" className="chapter-art" />
            <p className="eyebrow"><Ornament name="auseklis" size="sm" draw /> {t("v4.story.ch3")}</p>
            <h2>{t("v4.story.c3.title")}</h2>
            <p className="lead">{t("v4.story.c3.lead")}</p>
            <p>{t("v4.story.c3.body")}</p>
          </div>
          <figure className="frame frame--4x5" data-reveal style={{ margin: 0, maxWidth: 480, justifySelf: "center" }}>
            <img src={image("materials")} alt={t("v4.story.c3.title")} loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="section section--spruce">
        <div className="wrap center" data-reveal>
          <Ornament name="jumis" size="lg" draw />
          <p className="eyebrow" style={{ marginTop: "1rem" }}>{t("v4.story.ch7")}</p>
          <h2>{t("v4.story.c7.title")}</h2>
          <p className="lead">{t("v4.story.c7.lead")}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn btn--on-dark" href="/contact">{t("v4.story.c7.cta1")}</Link>
            <Link className="btn btn--on-dark" href="/shop">{t("v4.story.c7.cta2")}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
