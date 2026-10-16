import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import { SplitWords } from "@/components/brand/SplitWords";
import { CountUp } from "@/components/brand/CountUp";

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

const CHAPTERS = [
  { id: "pagalms", key: "v4.story.ch1" },
  { id: "olegs", key: "v4.story.ch2" },
  { id: "recepte", key: "v4.story.ch3" },
  { id: "palig", key: "v4.story.ch4" },
  { id: "cels", key: "v4.story.ch5" },
  { id: "mantojums", key: "v4.story.ch6" },
  { id: "ciemos", key: "v4.story.ch7" },
];

const MAKING_STEPS = [
  { lottie: "trosheen-13-step-recipe.json", mode: "view" as const },
  { lottie: "trosheen-14-step-pour.json", mode: "view" as const },
  { lottie: "trosheen-15-step-sculpt.json", mode: "view" as const },
  { lottie: "trosheen-16-step-rest.json", mode: "loop" as const },
  { lottie: "trosheen-17-step-paint.json", mode: "view" as const },
  { lottie: "trosheen-18-step-wrap.json", mode: "view" as const },
];

const TIMELINE: { year?: number; label?: string; title: string; desc: string }[] = [
  { year: 1995, title: "v4.story.tl.1995.title", desc: "v4.story.tl.1995.desc" },
  { year: 2005, title: "v4.story.tl.2005.title", desc: "v4.story.tl.2005.desc" },
  { label: "2018–2019", title: "v4.story.tl.2018.title", desc: "v4.story.tl.2018.desc" },
  { year: 2019, title: "v4.story.tl.2019.title", desc: "v4.story.tl.2019.desc" },
  { year: 2023, title: "v4.story.tl.2023.title", desc: "v4.story.tl.2023.desc" },
  { year: 2026, title: "v4.story.tl.2026.title", desc: "v4.story.tl.2026.desc" },
];

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div>
      {/* ---------- hero ---------- */}
      <section className="hero hero--page" style={{ "--focus": "50% 50%" } as React.CSSProperties}>
        <picture className="hero__media">
          <source
            media="(max-width:700px)"
            srcSet="/heroes/trosheen-hero-mobile-05-750.webp 750w, /heroes/trosheen-hero-mobile-05-1080.webp 1080w"
            type="image/webp"
          />
          <source
            srcSet="/heroes/trosheen-hero-desktop-04-1280.webp 1280w, /heroes/trosheen-hero-desktop-04-1920.webp 1920w, /heroes/trosheen-hero-desktop-04-2560.webp 2560w"
            type="image/webp"
          />
          <img src="/heroes/trosheen-hero-desktop-04-1920.jpg" alt="" fetchPriority="high" />
        </picture>
        <div className="wrap hero__content">
          <p className="eyebrow">{t("v4.story.hero.eyebrow")}</p>
          <SplitWords text={t("v4.story.hero.title")} />
          <p className="lead">{t("v4.story.hero.lead")}</p>
          <div className="btn-row" />
        </div>
      </section>

      <nav className="chapter-nav" aria-label={t("v4.story.nav.aria")}>
        <div className="wrap">
          <ol>
            {CHAPTERS.map((chapter) => (
              <li key={chapter.id}>
                <a href={`#${chapter.id}`}>{t(chapter.key)}</a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* ---------- 1. courtyard ---------- */}
      <section className="section" id="pagalms">
        <div className="wrap split">
          <div data-reveal>
            <Lottie
              file="trosheen-25-courtyard-door.json"
              mode="view"
              className="chapter-art"
            />
            <p className="eyebrow">
              <Ornament name="maras-zime" size="sm" draw /> 1. {t("v4.story.chapter")} ·{" "}
              {t("v4.story.ch1")}
            </p>
            <h2>{t("v4.story.c1.title")}</h2>
            <p className="lead">{t("v4.story.c1.lead")}</p>
            <p>{t("v4.story.c1.body")}</p>
          </div>
          <figure
            className="frame frame--arch frame--3x4"
            data-reveal
            style={{ margin: 0, maxWidth: 480, justifySelf: "center" }}
          >
            <img src="/photos/photo-g06.webp" alt={t("v4.story.c1.title")} loading="lazy" />
          </figure>
        </div>
      </section>

      {/* ---------- 2. Olegs ---------- */}
      <section className="section section--warm" id="olegs">
        <div className="wrap split split--flip">
          <div data-reveal>
            <p className="eyebrow">
              <Ornament name="saule" size="sm" draw /> 2. {t("v4.story.chapter")} ·{" "}
              {t("v4.story.ch2")}
            </p>
            <h2>{t("v4.story.c2.title")}</h2>
            <p className="lead">{t("v4.story.c2.lead")}</p>
            <p>{t("v4.story.c2.body")}</p>
            <img
              src="/brand/trosheen-signature-ar-siltam-rokam-olegs-animated.svg"
              alt={t("v4.letter.signAlt")}
              style={{ width: 240, marginTop: "1rem" }}
            />
          </div>
          <figure
            className="drawing"
            data-ink
            style={{ margin: 0, "--ar": "3/4", maxWidth: 480, justifySelf: "center" } as React.CSSProperties}
          >
            <img src="/photos/piece-02.webp" alt="" loading="lazy" />
          </figure>
        </div>
      </section>

      {/* ---------- 3. the recipe ---------- */}
      <section className="section section--stone" id="recepte">
        <div className="wrap">
          <div className="center" data-reveal>
            <p className="eyebrow">
              <Ornament name="jumis" size="sm" draw /> 3. {t("v4.story.chapter")} ·{" "}
              {t("v4.story.ch3")}
            </p>
            <h2>
              {t("v4.story.c3.title")} <mark data-mark>{t("v4.story.c3.titleMark")}</mark>
            </h2>
            <p className="lead">{t("v4.story.c3.lead")}</p>
          </div>

          <div className="grid grid-4" style={{ marginTop: "2.5rem" }} data-stagger>
            {[1, 2, 3, 4].map((index) => (
              <article className="card" key={index}>
                <h3>{t(`v4.story.rec${index}.title`)}</h3>
                <p className="note">{t(`v4.story.rec${index}.desc`)}</p>
              </article>
            ))}
          </div>

          <div className="steps" style={{ marginTop: "3.5rem" }}>
            {MAKING_STEPS.map((step, index) => (
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

      {/* ---------- 4. the little helpers ---------- */}
      <section className="section" id="palig">
        <div className="wrap split">
          <div data-reveal>
            <Lottie
              file="trosheen-24-three-generations.json"
              mode="view"
              className="chapter-art"
            />
            <p className="eyebrow">
              <Ornament name="krustu-krusts" size="sm" draw /> 4. {t("v4.story.chapter")} ·{" "}
              {t("v4.story.ch4")}
            </p>
            <h2>{t("v4.story.c4.title")}</h2>
            <p className="lead">{t("v4.story.c4.lead")}</p>
            <p>{t("v4.story.c4.body")}</p>
          </div>
          <div className="photo-pair" data-reveal style={{ "--delay": "150ms" } as React.CSSProperties}>
            <figure
              className="polaroid"
              style={{ "--tilt": "2deg", margin: 0, width: "78%" } as React.CSSProperties}
            >
              <img src="/photos/photo-g05.webp" alt={t("v4.story.c4.cap1")} loading="lazy" />
              <figcaption>{t("v4.story.c4.cap1")}</figcaption>
            </figure>
            <figure className="polaroid" style={{ margin: 0 }}>
              <img src="/photos/photo-i03.webp" alt={t("v4.story.c4.cap2")} loading="lazy" />
              <figcaption>{t("v4.story.c4.cap2")}</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ---------- 5. our path ---------- */}
      <section className="section section--warm" id="cels">
        <div className="wrap--narrow">
          <div data-reveal>
            <p className="eyebrow">
              <Ornament name="austras-koks" size="sm" draw /> 5. {t("v4.story.chapter")} ·{" "}
              {t("v4.story.ch5")}
            </p>
            <h2>{t("v4.story.c5.title")}</h2>
          </div>
          <div className="timeline" style={{ marginTop: "2rem" }}>
            {TIMELINE.map((entry) => (
              <div className="tl-item" key={entry.title} data-reveal>
                <div className="tl-year">
                  {entry.year ? <CountUp value={entry.year} /> : entry.label}
                </div>
                <h3>{t(entry.title)}</h3>
                <p className="note" style={{ fontSize: "1rem" }}>
                  {t(entry.desc)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 6. heirlooms ---------- */}
      <section className="section section--spruce" id="mantojums">
        <div className="wrap split">
          <div data-reveal>
            <p className="eyebrow">
              <Ornament name="auseklis" size="sm" draw /> 6. {t("v4.story.chapter")} ·{" "}
              {t("v4.story.ch6")}
            </p>
            <h2>{t("v4.story.c6.title")}</h2>
            <p className="lead">{t("v4.story.c6.lead")}</p>
            <p>{t("v4.story.c6.body")}</p>
          </div>
          <div className="center" data-reveal>
            <Lottie
              file="trosheen-05-living-candle.json"
              mode="loop"
              style={{ width: 220, height: 220, margin: "auto" }}
            />
          </div>
        </div>
      </section>

      {/* ---------- 7. come and visit ---------- */}
      <section className="section" id="ciemos">
        <div className="wrap center" data-reveal>
          <Ornament name="saule" size="lg" draw />
          <p className="eyebrow" style={{ marginTop: "1rem" }}>
            7. {t("v4.story.chapter")} · {t("v4.story.ch7")}
          </p>
          <h2>{t("v4.story.c7.title")}</h2>
          <p className="lead">{t("v4.story.c7.lead")}</p>
          <div className="btn-row" style={{ justifyContent: "center" }}>
            <Link className="btn" href="/contact">
              {t("v4.story.c7.cta1")} <Arrow />
            </Link>
            <Link className="btn btn--ghost" href="/shop">
              {t("v4.story.c7.cta2")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
