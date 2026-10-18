import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";

const CARE_CARDS = [
  { lottie: "trosheen-07-botanical-imprint.json", title: "v4.care.c1.title", note: "v4.care.c1.note" },
  { lottie: "trosheen-09-frost-to-drop.json", title: "v4.care.c2.title", note: "v4.care.c2.note" },
  { lottie: "trosheen-04-sprouting-planter.json", title: "v4.care.c3.title", note: "v4.care.c3.note" },
  { lottie: "trosheen-22-rain-on-stone.json", title: "v4.care.c4.title", note: "v4.care.c4.note" },
  { lottie: "trosheen-23-sun-and-shade.json", title: "v4.care.c5.title", note: "v4.care.c5.note" },
  { lottie: "trosheen-06-fountain-ripple.json", title: "v4.care.c6.title", note: "v4.care.c6.note" },
];

export default function GuidePage() {
  const { t } = useLanguage();

  return (
    <div className="care-page">
      <section className="section section--tight care-intro">
        <div className="wrap--narrow">
          <p className="eyebrow"><Ornament name="auseklis" size="sm" draw /> {t("v4.care.hero.eyebrow")}</p>
          <h1>{t("v4.care.hero.title")}</h1>
          <p className="lead">{t("v4.care.hero.lead")}</p>
          <p className="care-disclaimer">{t("v4.care.materials.note")}</p>
        </div>
      </section>

      <section className="section section--tight" aria-labelledby="care-basics">
        <div className="wrap">
          <h2 id="care-basics">{t("v4.care.basics.title")}</h2>
          <div className="grid grid-3 care-grid">
            {CARE_CARDS.map((card) => (
              <article className="card care-card" key={card.title}>
                <div className="care-card__media" aria-hidden="true">
                  <Lottie file={card.lottie} mode="view" />
                </div>
                <div>
                  <h3>{t(card.title)}</h3>
                  <p>{t(card.note)}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="care-disclaimer care-disclaimer--bottom">{t("v4.care.outdoor.note")}</p>
        </div>
      </section>

      <section className="section section--warm">
        <div className="wrap split care-candle">
          <div>
            <p className="eyebrow"><Ornament name="saule" size="sm" draw /> {t("v4.care.candle.eyebrow")}</p>
            <h2>{t("v4.care.candle.title")}</h2>
            <ol className="care-steps">
              <li>{t("v4.care.candle.s1")}</li>
              <li>{t("v4.care.candle.s2")}</li>
              <li>{t("v4.care.candle.s3")}</li>
              <li>{t("v4.care.candle.s4")}</li>
            </ol>
            <p className="care-disclaimer">{t("v4.care.candle.warning")}</p>
          </div>
          <div className="care-candle__art" aria-hidden="true">
            <Lottie file="trosheen-05-living-candle.json" mode="view" />
          </div>
        </div>
      </section>

      <section className="section section--tight">
        <div className="wrap--narrow">
          <h2>{t("v4.care.dont.title")}</h2>
          {[1, 2, 3].map((index) => (
            <details className="acc" key={index}>
              <summary>{t(`v4.care.d${index}.title`)}</summary>
              <p>{t(`v4.care.d${index}.desc`)}</p>
            </details>
          ))}
          <p className="care-contact">{t("v4.care.question")} <Link href="/contact">{t("v4.nav.contact")}</Link></p>
        </div>
      </section>
    </div>
  );
}
