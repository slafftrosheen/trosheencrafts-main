import { useLanguage } from "@/lib/LanguageContext";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import { SplitWords } from "@/components/brand/SplitWords";

const CARE_CARDS = [
  { lottie: "trosheen-07-botanical-imprint.json", mode: "view" as const, title: "v4.care.c1.title", note: "v4.care.c1.note" },
  { lottie: "trosheen-09-frost-to-drop.json", mode: "view" as const, title: "v4.care.c2.title", note: "v4.care.c2.note" },
  { lottie: "trosheen-04-sprouting-planter.json", mode: "view" as const, title: "v4.care.c3.title", note: "v4.care.c3.note" },
  { lottie: "trosheen-22-rain-on-stone.json", mode: "loop" as const, title: "v4.care.c4.title", note: "v4.care.c4.note" },
  { lottie: "trosheen-23-sun-and-shade.json", mode: "loop" as const, title: "v4.care.c5.title", note: "v4.care.c5.note" },
  { lottie: "trosheen-06-fountain-ripple.json", mode: "loop" as const, title: "v4.care.c6.title", note: "v4.care.c6.note" },
];

export default function GuidePage() {
  const { t } = useLanguage();

  return (
    <div>
      <section className="hero hero--page" style={{ "--focus": "50% 50%" } as React.CSSProperties}>
        <picture className="hero__media">
          <source
            media="(max-width:700px)"
            srcSet="/heroes/trosheen-hero-mobile-04-750.webp 750w, /heroes/trosheen-hero-mobile-04-1080.webp 1080w"
            type="image/webp"
          />
          <source
            srcSet="/heroes/trosheen-hero-desktop-02-1280.webp 1280w, /heroes/trosheen-hero-desktop-02-1920.webp 1920w, /heroes/trosheen-hero-desktop-02-2560.webp 2560w"
            type="image/webp"
          />
          <img src="/heroes/trosheen-hero-desktop-02-1920.jpg" alt="" fetchPriority="high" />
        </picture>
        <div className="wrap hero__content">
          <p className="eyebrow">{t("v4.care.hero.eyebrow")}</p>
          <SplitWords text={t("v4.care.hero.title")} />
          <p className="lead">{t("v4.care.hero.lead")}</p>
          <div className="btn-row" />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="grid grid-3" data-stagger>
            {CARE_CARDS.map((card) => (
              <article className="card" key={card.lottie}>
                <Lottie file={card.lottie} mode={card.mode} style={{ width: 88, height: 88 }} />
                <h3>{t(card.title)}</h3>
                <p className="note">{t(card.note)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--warm">
        <div className="wrap split">
          <div data-reveal>
            <p className="eyebrow">
              <Ornament name="saule" size="sm" draw /> {t("v4.care.candle.eyebrow")}
            </p>
            <h2>{t("v4.care.candle.title")}</h2>
            <ol className="stack" style={{ paddingLeft: "1.2rem", fontSize: "1.05rem" }}>
              <li>{t("v4.care.candle.s1")}</li>
              <li>{t("v4.care.candle.s2")}</li>
              <li>{t("v4.care.candle.s3")}</li>
              <li>{t("v4.care.candle.s4")}</li>
            </ol>
          </div>
          <div className="center" data-reveal>
            <Lottie
              file="trosheen-05-living-candle.json"
              mode="loop"
              style={{ width: 240, height: 240, margin: "auto" }}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap--narrow">
          <h2>{t("v4.care.dont.title")}</h2>
          {[1, 2, 3].map((index) => (
            <details className="acc" key={index} open={index === 1}>
              <summary>{t(`v4.care.d${index}.title`)}</summary>
              <p>{t(`v4.care.d${index}.desc`)}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
