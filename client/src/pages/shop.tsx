import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { useProducts, useContactForm, type Product } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import { ProductCardV4, productTitle } from "@/components/brand/ProductCardV4";
import { CandleConstructor } from "@/components/shop/CandleConstructor";

type ShopTab = "collections" | "custom";
type SortOrder = "featured" | "newest" | "price-asc" | "price-desc";

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

const SHAPES = [
  { key: "v4.wiz.shape1", image: "/photos/piece-16.webp" },
  { key: "v4.wiz.shape2", image: "/photos/piece-02.webp" },
  { key: "v4.wiz.shape3", image: "/photos/piece-06.webp" },
  { key: "v4.wiz.shape4", image: "/photos/piece-07.webp" },
];

const COLOURS = [
  { key: "Dabīgs akmens", hex: "#EDE6DA" },
  { key: "Egle", hex: "#24412F" },
  { key: "Māls", hex: "#8E5636" },
  { key: "Ķērpis", hex: "#8C9A7B" },
  { key: "Zelts", hex: "#B89150" },
  { key: "Bazalts", hex: "#1F1D1A" },
];

const COLLECTIONS = [
  { chip: "v4.shop.filter.all", match: () => true },
  { chip: "v4.cat1.title", match: (product: Product) => /candle|svec/i.test(product.category || "") },
  { chip: "v4.cat2.title", match: (product: Product) => /design|dizain/i.test(product.category || "") },
  { chip: "v4.cat3.title", match: (product: Product) => /garden|dārz|darz/i.test(product.category || "") },
];

export default function ShopPage() {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const { data: products, isLoading, isError, refetch } = useProducts();
  const contactForm = useContactForm();

  const [activeTab, setActiveTab] = useState<ShopTab>(() =>
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "custom"
      ? "custom"
      : "collections",
  );
  const [chip, setChip] = useState(0);
  const [sort, setSort] = useState<SortOrder>("featured");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const syncTab = (event?: Event) => {
      const requested = (event as CustomEvent<ShopTab> | undefined)?.detail;
      setActiveTab(
        requested === "custom" || requested === "collections"
          ? requested
          : new URLSearchParams(window.location.search).get("view") === "custom"
            ? "custom"
            : "collections",
      );
    };
    syncTab();
    window.addEventListener("popstate", syncTab);
    window.addEventListener("trosheen:shop-view", syncTab);
    return () => {
      window.removeEventListener("popstate", syncTab);
      window.removeEventListener("trosheen:shop-view", syncTab);
    };
  }, [location]);

  const changeTab = (tab: ShopTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "custom") url.searchParams.set("view", "custom");
    else url.searchParams.delete("view");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    window.dispatchEvent(new CustomEvent("trosheen:shop-view", { detail: tab }));
  };

  const published = useMemo(
    () => (products || []).filter((product) => product.published),
    [products],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const matcher = COLLECTIONS[chip]?.match ?? (() => true);
    return published
      .filter((product) => matcher(product))
      .filter((product) => {
        if (!term) return true;
        const description =
          typeof product.description === "string"
            ? product.description
            : product.description?.[language] || product.description?.en || "";
        return (productTitle(product, language) + " " + description + " " + (product.category || ""))
          .toLocaleLowerCase()
          .includes(term);
      })
      .sort((a, b) => {
        if (sort === "price-asc") return Number(a.price) - Number(b.price);
        if (sort === "price-desc") return Number(b.price) - Number(a.price);
        if (sort === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        return (
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          Date.parse(b.createdAt) - Date.parse(a.createdAt)
        );
      });
  }, [published, chip, sort, search, language]);

  // Only show collection chips that actually match something in the catalogue.
  const chips = useMemo(
    () => COLLECTIONS.filter((entry, index) => index === 0 || published.some(entry.match)),
    [published],
  );

  return (
    <div>
      <section className="section section--tight" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <p className="eyebrow">
            <Ornament name="jumis" size="sm" draw /> {t("v4.shop.eyebrow")}
          </p>
          <h1>{t("v4.shop.title")}</h1>
          <p className="lead">{t("v4.shop.lead")}</p>

          <div
            className="tabs"
            role="tablist"
            aria-label={t("v4.shop.tabs")}
            style={{ marginTop: "1.2rem" }}
          >
            <button
              className="tab"
              role="tab"
              id="t-ready"
              aria-controls="p-ready"
              aria-selected={activeTab === "collections"}
              onClick={() => changeTab("collections")}
            >
              {t("v4.shop.tab.ready")}
            </button>
            <button
              className="tab"
              role="tab"
              id="t-custom"
              aria-controls="p-custom"
              aria-selected={activeTab === "custom"}
              onClick={() => changeTab("custom")}
            >
              {t("v4.shop.tab.custom")}
            </button>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
          <div
            className="tab-panel"
            id="p-ready"
            role="tabpanel"
            aria-labelledby="t-ready"
            hidden={activeTab !== "collections"}
          >
            <div className="toolbar">
              <div className="chips">
                {chips.map((entry, index) => (
                  <button
                    key={entry.chip}
                    className="chip"
                    aria-pressed={chip === index}
                    data-filter={index}
                    onClick={() => setChip(index)}
                  >
                    {t(entry.chip)}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                <label className="sr-only" htmlFor="shop-search">
                  {t("v4.nav.search")}
                </label>
                <input
                  id="shop-search"
                  className="input"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("v4.nav.search")}
                  style={{ borderRadius: "var(--r-pill)", maxWidth: 220 }}
                />
                <label className="sr-only" htmlFor="sort">
                  {t("v4.shop.sort")}
                </label>
                <select
                  id="sort"
                  className="select"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as SortOrder)}
                >
                  <option value="featured">{t("v4.shop.sort.featured")}</option>
                  <option value="newest">{t("v4.shop.sort.newest")}</option>
                  <option value="price-asc">{t("v4.shop.sort.asc")}</option>
                  <option value="price-desc">{t("v4.shop.sort.desc")}</option>
                </select>
              </div>
            </div>

            {isLoading ? (
              <div className="empty" role="status">
                <Lottie file="trosheen-28-loader-seal.json" mode="loop" className="empty__art" />
                <p className="note" style={{ margin: 0 }}>
                  {t("v4.shop.loading")}
                </p>
              </div>
            ) : isError ? (
              <div className="empty" role="alert">
                <Lottie file="trosheen-10-404-rolling-stone.json" mode="view" className="empty__art" />
                <h3>{t("v4.shop.error.title")}</h3>
                <p>{t("v4.shop.error.desc")}</p>
                <button className="btn" onClick={() => void refetch()}>
                  {t("v4.shop.retry")}
                </button>
              </div>
            ) : visible.length ? (
              <div className="grid grid-4">
                {visible.map((product, index) => (
                  <ProductCardV4 key={product.id} product={product} delay={(index % 4) * 90} />
                ))}
              </div>
            ) : (
              <>
                <div className="divider" aria-hidden="true">
                  <Ornament name="auseklis" size="sm" draw />
                </div>
                <div className="empty" data-reveal>
                  <Lottie
                    file="trosheen-11-empty-shop-plant.json"
                    mode="view"
                    className="empty__art"
                  />
                  <h3>
                    {published.length ? t("v4.shop.noResults") : t("v4.shop.empty.title")}
                  </h3>
                  <p>
                    {published.length ? t("v4.shop.noResultsDesc") : t("v4.shop.empty.desc")}
                  </p>
                  <div className="btn-row" style={{ justifyContent: "center" }}>
                    {published.length ? (
                      <button
                        className="btn"
                        onClick={() => {
                          setChip(0);
                          setSearch("");
                        }}
                      >
                        {t("v4.shop.filter.all")}
                      </button>
                    ) : (
                      <>
                        <button className="btn" onClick={() => changeTab("custom")}>
                          {t("v4.shop.empty.cta1")}
                        </button>
                        <Link className="btn btn--ghost" href="/#nl">
                          {t("v4.shop.empty.cta2")}
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div
            className="tab-panel"
            id="p-custom"
            role="tabpanel"
            aria-labelledby="t-custom"
            hidden={activeTab !== "custom"}
          >
            <div className="split" style={{ marginBottom: "3rem" }}>
              <div>
                <h2>{t("v4.wiz.title")}</h2>
                <p className="lead">{t("v4.wiz.lead")}</p>
                <ul className="facts">
                  <li>
                    <img src="/brand/icons/clock.svg" alt="" />
                    {t("v4.wiz.fact1")}
                  </li>
                  <li>
                    <img src="/brand/icons/chat.svg" alt="" />
                    {t("v4.wiz.fact2")}
                  </li>
                  <li>
                    <img src="/brand/icons/gift-wrap.svg" alt="" />
                    {t("v4.wiz.fact3")}
                  </li>
                </ul>
                <a className="btn btn--ghost" href="/constructor">
                  {t("shop_custom_builder")} <Arrow />
                </a>
              </div>
              <figure className="drawing" data-ink style={{ margin: 0, "--ar": "4/3" } as React.CSSProperties}>
                <img src="/photos/piece-06.webp" alt="" loading="lazy" />
              </figure>
            </div>

            <CustomWorkshopWizard onSubmit={(payload) => contactForm.mutate(payload)} />

            {/* The detailed configurator stays reachable: it builds a priced,
                stock-aware custom candle and drops it straight into the basket. */}
            <div className="divider" aria-hidden="true">
              <Ornament name="jumis" size="sm" draw />
            </div>
            <div style={{ marginBottom: "1.5rem" }}>
              <p className="eyebrow">{t("v4.wiz.advanced")}</p>
              <h2 style={{ margin: 0 }}>{t("shop_custom_builder")}</h2>
            </div>
            <CandleConstructor />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Custom workshop wizard (kit: Forma · Krāsa · Nospiedums · Jūsu vēlme) */
/* ------------------------------------------------------------------ */

interface WizardProps {
  onSubmit: (payload: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) => void;
}

function CustomWorkshopWizard({ onSubmit }: WizardProps) {
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [shape, setShape] = useState(0);
  const [colour, setColour] = useState(0);
  const [imprint, setImprint] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [wish, setWish] = useState("");
  const [errors, setErrors] = useState({ name: false, email: false });
  const [sent, setSent] = useState(false);

  const steps = ["v4.wiz.step1", "v4.wiz.step2", "v4.wiz.step3", "v4.wiz.step4"];

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nameBad = !name.trim();
    const emailBad = !/^\S+@\S+\.\S+$/.test(email.trim());
    setErrors({ name: nameBad, email: emailBad });
    if (nameBad || emailBad) return;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      subject: t("v4.contact.subject2"),
      message: [
        `${t("v4.wiz.step1")}: ${t(SHAPES[shape].key)}`,
        `${t("v4.wiz.step2")}: ${COLOURS[colour].key}`,
        `${t("v4.wiz.step3")}: ${t(`v4.wiz.imprint${imprint + 1}`)}`,
        wish.trim() ? `${t("v4.wiz.wish")}: ${wish.trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
    setSent(true);
  };

  return (
    <div className="wizard">
      <ol className="wizard__steps">
        {steps.map((key, index) => (
          <li
            key={key}
            className={cn(index === step && "is-current", index < step && "is-done")}
          >
            <span>{index + 1}</span>
            {t(key)}
          </li>
        ))}
      </ol>

      <div className="card" style={{ padding: "2rem" }}>
        <div hidden={step !== 0}>
          <h3>{t("v4.wiz.shape.title")}</h3>
          <div className="options">
            {SHAPES.map((option, index) => (
              <label className="option" key={option.key}>
                <input
                  type="radio"
                  name="wizard-shape"
                  checked={shape === index}
                  onChange={() => setShape(index)}
                />
                <div className="frame frame--1x1" style={{ marginBottom: ".6rem" }}>
                  <img src={option.image} alt="" loading="lazy" />
                </div>
                {t(option.key)}
              </label>
            ))}
          </div>
        </div>

        <div hidden={step !== 1}>
          <h3>{t("v4.wiz.colour.title")}</h3>
          <div className="options">
            {COLOURS.map((option, index) => (
              <label className="option" key={option.hex}>
                <input
                  type="radio"
                  name="wizard-colour"
                  checked={colour === index}
                  onChange={() => setColour(index)}
                />
                <div className="swatch" style={{ background: option.hex }} />
                {option.key}
              </label>
            ))}
          </div>
          <p className="field-hint">{t("v4.wiz.colour.hint")}</p>
        </div>

        <div hidden={step !== 2}>
          <h3>{t("v4.wiz.imprint.title")}</h3>
          <div className="options">
            {["austras-koks", "auseklis", "saule", "jumis", "krustu-krusts"].map((ornament, index) => (
              <label className="option" key={ornament}>
                <input
                  type="radio"
                  name="wizard-imprint"
                  checked={imprint === index}
                  onChange={() => setImprint(index)}
                />
                <Ornament
                  name={ornament}
                  style={{ margin: ".4rem auto .6rem", display: "block" }}
                />
                {t(`v4.wiz.imprint${index + 1}`)}
              </label>
            ))}
          </div>
        </div>

        <div hidden={step !== 3}>
          <h3>{t("v4.wiz.wish.title")}</h3>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="wizard-name">{t("v4.wiz.name")}</label>
              <input
                id="wizard-name"
                className="input"
                required
                autoComplete="name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setErrors((value) => ({ ...value, name: false }));
                }}
                aria-invalid={errors.name}
              />
              {errors.name && (
                <span className="field-error" role="alert">
                  {t("v4.wiz.errName")}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="wizard-email">{t("v4.wiz.email")}</label>
              <input
                id="wizard-email"
                className="input"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((value) => ({ ...value, email: false }));
                }}
                aria-invalid={errors.email}
              />
              {errors.email && (
                <span className="field-error" role="alert">
                  {t("v4.wiz.errEmail")}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="wizard-wish">{t("v4.wiz.wish")}</label>
              <textarea
                id="wizard-wish"
                className="textarea"
                placeholder={t("v4.wiz.wishPlaceholder")}
                value={wish}
                onChange={(event) => setWish(event.target.value)}
              />
            </div>
            <button className="btn" type="submit" disabled={sent}>
              {t("v4.wiz.submit")}
            </button>
            <div className={"form-ok" + (sent ? " is-on" : "")} role="status" style={{ marginTop: "1rem" }}>
              <Lottie
                file="trosheen-08-wrapped-and-sealed.json"
                mode="manual"
                trigger={sent ? 1 : 0}
                style={{ width: 40, height: 40 }}
              />
              {t("v4.wiz.thanks")}
            </div>
          </form>
        </div>

        <div
          className="btn-row"
          style={{ marginTop: "1.8rem", justifyContent: "space-between" }}
        >
          <button className="btn btn--ghost" onClick={() => setStep((value) => Math.max(0, value - 1))} disabled={step === 0}>
            {t("v4.wiz.back")}
          </button>
          <button className="btn" onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))} disabled={step === steps.length - 1}>
            {t("v4.wiz.next")} <Arrow />
          </button>
        </div>
      </div>
    </div>
  );
}
