import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Package, Sparkles, X, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { CandleConstructor } from "@/components/shop/CandleConstructor";
import { useProducts } from "@/hooks/useApi";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Spinner } from "@/components/shared/LoadingStates";
import { cn } from "@/lib/utils";

type ShopTab = "collections" | "custom";
type SortOrder = "featured" | "newest" | "price-asc" | "price-desc" | "name";

export default function ShopPage() {
  const { t, language } = useLanguage();
  const { data: products, isLoading, isError, refetch } = useProducts();
  const [activeTab, setActiveTab] = useState<ShopTab>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("view") === "custom"
      ? "custom"
      : "collections"
  );
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortOrder>("featured");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const publishedProducts = useMemo(() => (products || []).filter((product) => product.published), [products]);
  const categories = useMemo(() =>
    [...new Set(publishedProducts.map((p) => p.category).filter((value): value is string => Boolean(value)))].sort(),
    [publishedProducts]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return publishedProducts
      .filter((product) => {
        const name = product.nameTranslations?.[language] || product.name;
        const description = typeof product.description === "string"
          ? product.description
          : (product.description?.[language] || product.description?.en || "");
        return (!term || (name + " " + description + " " + (product.category || "")).toLocaleLowerCase().includes(term))
          && (category === "all" || product.category === category)
          && (!onlyAvailable || (product.inStock && Number(product.stock ?? 0) > 0));
      })
      .sort((a, b) => {
        if (sort === "price-asc") return Number(a.price) - Number(b.price);
        if (sort === "price-desc") return Number(b.price) - Number(a.price);
        if (sort === "name") return (a.nameTranslations?.[language] || a.name).localeCompare(b.nameTranslations?.[language] || b.name, language);
        if (sort === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        return Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || Date.parse(b.createdAt) - Date.parse(a.createdAt);
      });
  }, [publishedProducts, search, category, sort, onlyAvailable, language]);

  const changeTab = (tab: ShopTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    if (tab === "custom") url.searchParams.set("view", "custom");
    else url.searchParams.delete("view");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setOnlyAvailable(false);
    setSort("featured");
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="page-shell border-b border-border">
        <div className="site-container">
          <p className="eyebrow">{t("curated_selection")}</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <h1 className="display-title">{t("nav_shop")}</h1>
            <p className="lead lg:pb-2">{t("shop_teaser_desc")}</p>
          </div>
          <div className="mt-9 inline-flex w-full rounded-full border border-border bg-card p-1 sm:w-auto" role="tablist" aria-label={t("shop.sections")}>
            <button type="button" id="shop-collections-tab" role="tab" aria-controls="shop-collections-panel" aria-selected={activeTab === "collections"} onClick={() => changeTab("collections")}
              className={cn("flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-none", activeTab === "collections" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
              <Package className="h-4 w-4" />{t("curated_selection")}
            </button>
            <button type="button" id="shop-custom-tab" role="tab" aria-controls="shop-custom-panel" aria-selected={activeTab === "custom"} onClick={() => changeTab("custom")}
              className={cn("flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:flex-none", activeTab === "custom" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>
              <Sparkles className="h-4 w-4" />{t("shop_custom_builder")}
            </button>
          </div>
        </div>
      </section>

      <section className="section-space pt-8 sm:pt-12">
        <div className="site-container">
          {activeTab === "collections" ? (
            <div id="shop-collections-panel" role="tabpanel" aria-labelledby="shop-collections-tab">
              <div className="mb-8 rounded-2xl border border-border bg-card/70 p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                  <label className="block flex-1">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("shop.search_label")}</span>
                    <span className="relative block">
                      <Search aria-hidden="true" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
                        placeholder={t("shop.search_placeholder")}
                        className="min-h-12 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary" />
                    </span>
                  </label>
                  <label className="block lg:min-w-48">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("shop.category")}</span>
                    <select value={category} onChange={(event) => setCategory(event.target.value)}
                      className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary">
                      <option value="all">{t("shop.all_categories")}</option>
                      {categories.map((value) => <option key={value} value={value}>{value}</option>)}
                    </select>
                  </label>
                  <label className="block lg:min-w-48">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("shop.sort")}</span>
                    <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}
                      className="min-h-12 w-full rounded-xl border border-border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-primary">
                      <option value="featured">{t("shop.sort_featured")}</option>
                      <option value="newest">{t("shop.sort_newest")}</option>
                      <option value="price-asc">{t("shop.sort_price_asc")}</option>
                      <option value="price-desc">{t("shop.sort_price_desc")}</option>
                      <option value="name">{t("shop.sort_name")}</option>
                    </select>
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                    <input type="checkbox" checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)}
                      className="h-4 w-4 accent-primary" />
                    {t("shop.in_stock_only")}
                  </label>
                  {(search || category !== "all" || onlyAvailable || sort !== "featured") && (
                    <button type="button" onClick={resetFilters} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline">
                      <X className="h-4 w-4" />{t("shop.clear_filters")}
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-7 flex items-center justify-between border-b border-border pb-4">
                <p className="text-sm font-semibold" aria-live="polite">
                  {filteredProducts.length} {filteredProducts.length === 1 ? t("shop.piece") : t("shop.pieces")}
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">{t("shop.handcast_location")}</p>
              </div>

              {isLoading ? (
                <div className="flex min-h-72 items-center justify-center" role="status">
                  <Spinner size="lg" className="text-primary" />
                  <span className="sr-only">{t("shop.loading")}</span>
                </div>
              ) : isError ? (
                <div className="surface mx-auto max-w-xl px-7 py-12 text-center" role="alert">
                  <Package className="mx-auto h-9 w-9 text-muted-foreground" />
                  <h2 className="mt-4 font-serif text-3xl font-semibold">{t("shop.error_title")}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{t("shop.error_desc")}</p>
                  <button type="button" onClick={() => void refetch()} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground">
                    <RefreshCw className="h-4 w-4" />{t("shop.retry")}
                  </button>
                </div>
              ) : filteredProducts.length ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} id={product.id} name={product.nameTranslations?.[language] || product.name}
                      price={Number(product.price)} image={product.image || product.images?.[0] || ""}
                      category={product.category || t("shop.piece")}
                      inStock={product.inStock && Number(product.stock ?? 0) > 0} isHandmade />
                  ))}
                </div>
              ) : (
                <div className="surface mx-auto max-w-2xl px-7 py-14 text-center sm:px-12">
                  <SlidersHorizontal className="mx-auto h-9 w-9 text-primary" />
                  <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight">
                    {publishedProducts.length ? t("shop.no_results") : t("shop_empty_title")}
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground">
                    {publishedProducts.length ? t("shop.try_other_filters") : t("shop_empty_desc")}
                  </p>
                  {publishedProducts.length ? (
                    <button type="button" onClick={resetFilters} className="mt-7 min-h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">{t("shop.clear_filters")}</button>
                  ) : (
                    <button type="button" onClick={() => changeTab("custom")} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">
                      {t("shop_enter_workshop")}<Sparkles className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div id="shop-custom-panel" role="tabpanel" aria-labelledby="shop-custom-tab">
              <div className="mb-8 max-w-2xl">
                <p className="eyebrow">{t("shop_custom_builder")}</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{t("shop.builder_intro")}</h2>
              </div>
              <CandleConstructor />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
