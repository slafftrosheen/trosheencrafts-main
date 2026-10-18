import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { localizedText } from "@/lib/localizedContent";
import { useWishlist } from "@/lib/wishlist";
import { useProducts, type Product } from "@/hooks/useApi";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import { ProductCardV4, productTitle } from "@/components/brand/ProductCardV4";

type SortOrder = "featured" | "newest" | "price-asc" | "price-desc";

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
  const wishedIds = useWishlist(state => state.ids);

  const [chip, setChip] = useState(0);
  const [sort, setSort] = useState<SortOrder>("featured");
  const [search, setSearch] = useState("");
  const [savedOnly, setSavedOnly] = useState(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "saved"
  );

  // Legacy ?view=custom was never an approved storefront route.
  // Keep saved-item deep links, but normalize the retired URL to the catalogue.
  useEffect(() => {
    const syncView = () => {
      const url = new URL(window.location.href);
      if (url.searchParams.get("view") === "custom") {
        url.searchParams.delete("view");
        window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      }
      setSavedOnly(url.searchParams.get("view") === "saved");
    };
    syncView();
    window.addEventListener("popstate", syncView);
    return () => window.removeEventListener("popstate", syncView);
  }, [location]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("focus") !== "search") return;
    const frame = requestAnimationFrame(() => document.getElementById("shop-search")?.focus());
    return () => cancelAnimationFrame(frame);
  }, [location]);

  const toggleSaved = () => {
    const next = !savedOnly;
    setSavedOnly(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("view", "saved");
    else url.searchParams.delete("view");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  };

  const published = useMemo(
    () => (products || []).filter((product) => product.published),
    [products],
  );

  const visible = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const matcher = COLLECTIONS[chip]?.match ?? (() => true);
    return published
      .filter((product) => !savedOnly || wishedIds.includes(product.id))
      .filter((product) => matcher(product))
      .filter((product) => {
        if (!term) return true;
        const description = localizedText(
          typeof product.description === "string" ? product.description : "",
          product.descriptionTranslations ||
            (typeof product.description === "object" ? product.description : undefined),
          language,
        );
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
  }, [published, chip, sort, search, language, savedOnly, wishedIds]);

  // Only show collection chips that actually match something in the catalogue.
  const chips = useMemo(
    () => COLLECTIONS.map((entry, index) => ({ ...entry, index }))
      .filter((entry) => entry.index === 0 || published.some(entry.match)),
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


        </div>
      </section>

      <section className="section" style={{ paddingTop: "1rem" }}>
        <div className="wrap">
            <div className="toolbar">
              <div className="chips">
                {chips.map((entry, index) => (
                  <button
                    key={entry.chip}
                    className="chip"
                    aria-pressed={chip === entry.index}
                    data-filter={entry.index}
                    onClick={() => setChip(entry.index)}
                  >
                    {t(entry.chip)}
                  </button>
                ))}
                <button type="button" className="chip" aria-pressed={savedOnly} onClick={toggleSaved}>
                  {t("v4.shop.saved")}
                </button>
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
                    {savedOnly ? t("v4.shop.savedEmpty") : published.length ? t("v4.shop.noResults") : t("v4.shop.empty.title")}
                  </h3>
                  <p>
                    {savedOnly ? t("v4.shop.savedEmptyDesc") : published.length ? t("v4.shop.noResultsDesc") : t("v4.shop.empty.desc")}
                  </p>
                  <div className="btn-row" style={{ justifyContent: "center" }}>
                    {published.length ? (
                      <button
                        className="btn"
                        onClick={() => {
                          setChip(0);
                          setSearch("");
                          if (savedOnly) toggleSaved();
                        }}
                      >
                        {t("v4.shop.filter.all")}
                      </button>
                    ) : (
                      <>
                        <Link className="btn" href="/contact">{t("v4.shop.empty.cta1")}</Link>
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
      </section>
    </div>
  );
}
