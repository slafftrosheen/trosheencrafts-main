import { useState } from "react";
import { Package, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { CandleConstructor } from "@/components/shop/CandleConstructor";
import { useProducts } from "@/hooks/useApi";
import { ProductCard } from "@/components/features/product/ProductCard";
import { Spinner } from "@/components/shared/LoadingStates";
import { cn } from "@/lib/utils";

export default function ShopPage() {
  const { t, language } = useLanguage();
  const { data: products, isLoading } = useProducts();
  const [activeTab, setActiveTab] = useState<"collections" | "custom">("collections");

  const publishedProducts = products?.filter((product) => product.published) || [];

  return (
    <div className="min-h-screen bg-background">
      <section className="page-shell border-b border-border">
        <div className="site-container">
          <p className="eyebrow">{t("curated_selection")}</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <h1 className="display-title">{t("nav_shop")}</h1>
            <p className="lead lg:pb-2">{t("shop_teaser_desc")}</p>
          </div>

          <div
            className="mt-10 inline-flex w-full rounded-full border border-border bg-card p-1 sm:w-auto"
            role="tablist"
            aria-label="Shop sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "collections"}
              onClick={() => setActiveTab("collections")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                activeTab === "collections"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Package className="h-4 w-4" />
              {t("curated_selection")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "custom"}
              onClick={() => setActiveTab("custom")}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                activeTab === "custom"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-4 w-4" />
              {t("shop_custom_builder")}
            </button>
          </div>
        </div>
      </section>

      <section className="section-space pt-10 sm:pt-14">
        <div className="site-container">
          {activeTab === "collections" ? (
            <>
              <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
                <p className="text-sm font-semibold">
                  {publishedProducts.length} {publishedProducts.length === 1 ? t("shop.piece") : t("shop.pieces")}
                </p>
                <p className="hidden text-xs text-muted-foreground sm:block">
                  {t("shop.handcast_location")}
                </p>
              </div>

              {isLoading ? (
                <div className="flex min-h-72 items-center justify-center">
                  <Spinner size="lg" className="text-primary" />
                </div>
              ) : publishedProducts.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {publishedProducts.map((product) => {
                    const translatedName = product.nameTranslations?.[language] || product.name;
                    return (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        name={translatedName}
                        price={Number(product.price)}
                        image={product.image || ""}
                        category={product.category || "Collection"}
                        isHandmade
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="surface mx-auto max-w-2xl px-7 py-14 text-center sm:px-12">
                  <Package className="mx-auto h-9 w-9 text-primary" />
                  <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight">
                    {t("shop_empty_title")}
                  </h2>
                  <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted-foreground">
                    {t("shop_empty_desc")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab("custom")}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
                  >
                    {t("shop_enter_workshop")}
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="mb-8 max-w-2xl">
                <p className="eyebrow">{t("shop_custom_builder")}</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  {t("shop.builder_intro")}
                </h2>
              </div>
              <CandleConstructor />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
