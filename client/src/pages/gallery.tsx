import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Grid3X3, LayoutGrid, List, Loader2, RefreshCw, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { localizedText } from "@/lib/localizedContent";
import { apiClient } from "@/lib/apiClient";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import {
  GalleryMediaCard,
  type GalleryViewMode,
  type PublicGalleryResponse,
} from "@/components/gallery/GalleryMediaCard";

interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  nameTranslations?: Record<string, string>;
  type: "3d" | "photo" | "video";
}

function getSavedView(): GalleryViewMode {
  if (typeof window === "undefined") return "masonry";
  try {
    const saved = window.localStorage.getItem("trosheen-gallery-view");
    if (saved === "masonry" || saved === "grid" || saved === "list") return saved;
  } catch {
    // The gallery remains usable when storage is unavailable.
  }
  return "masonry";
}

export default function GalleryPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "3d" | "photo" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [view, setView] = useState<GalleryViewMode>(getSavedView);
  const itemsPerPage = 12;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const changeView = (next: GalleryViewMode) => {
    setView(next);
    try { window.localStorage.setItem("trosheen-gallery-view", next); } catch { /* optional */ }
  };

  const { data: categories = [] } = useQuery<GalleryCategory[]>({
    queryKey: ["galleryCategories"],
    queryFn: () => apiClient.get("/gallery/categories"),
  });

  const {
    data: galleryData,
    isPending,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery<PublicGalleryResponse>({
    queryKey: ["galleryItems", activeTab, debouncedSearch, selectedCategory],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const params: Record<string, string | number> = { limit: itemsPerPage, offset: Number(pageParam) };
      if (activeTab !== "all") params.type = activeTab;
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory !== null) params.categoryId = selectedCategory;
      return apiClient.get<PublicGalleryResponse>("/gallery/items", { params });
    },
    getNextPageParam: (lastPage) => {
      const next = Number(lastPage.offset) + lastPage.items.length;
      return lastPage.items.length > 0 && next < Number(lastPage.total) ? next : undefined;
    },
  });

  const items = galleryData?.pages.flatMap((page) => page.items) ?? [];
  const total = Number(galleryData?.pages[0]?.total ?? 0);
  const filteredCategories = categories.filter(
    (category) => activeTab === "all" || category.type === activeTab,
  );
  const filtered = Boolean(searchQuery.trim() || selectedCategory !== null || activeTab !== "all");

  const resetFilters = () => {
    setActiveTab("all");
    setSelectedCategory(null);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  const tabs = [
    { id: "all", label: t("v4.gallery.filter.all") },
    { id: "photo", label: t("v4.gallery.filter.photo") },
    { id: "3d", label: t("gallery.model_label") },
    { id: "video", label: t("v4.gallery.filter.video") },
  ] as const;

  const views = [
    { id: "masonry", icon: LayoutGrid, label: t("v4.gallery.view.masonry") },
    { id: "grid", icon: Grid3X3, label: t("v4.gallery.view.grid") },
    { id: "list", icon: List, label: t("v4.gallery.view.list") },
  ] as const;

  return (
    <section className="section section--tight gallery-page">
      <div className="wrap">
        <p className="eyebrow"><Ornament name="maras-zime" size="sm" draw /> {t("v4.gallery.eyebrow")}</p>
        <h1>{t("v4.gallery.title")}</h1>
        <p className="lead">{t("v4.gallery.lead")}</p>

        <div className="toolbar gallery-toolbar">
          <div className="chips gallery-filters" role="group" aria-label={t("gallery.media_filter")}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="chip"
                aria-pressed={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedCategory(null); }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="gallery-toolbar__right">
            <div className="gallery-search">
              <label className="sr-only" htmlFor="gallery-search">{t("gallery.search_placeholder")}</label>
              <input
                id="gallery-search"
                type="search"
                className="input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t("gallery.search_placeholder")}
              />
              {searchQuery && (
                <button className="gallery-search__clear" type="button" onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }} aria-label={t("shop.clear_filters")}>
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="gallery-views" role="group" aria-label={t("v4.gallery.view.label")}>
              {views.map(({ id, icon: Icon, label }) => (
                <button type="button" key={id} className="gallery-views__button" aria-pressed={view === id} aria-label={label} title={label} onClick={() => changeView(id)}>
                  <Icon size={19} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredCategories.length > 0 && (
          <div className="chips gallery-categories" role="group" aria-label={t("gallery.all_categories")}>
            <button className="chip" type="button" aria-pressed={selectedCategory === null} onClick={() => setSelectedCategory(null)}>
              {t("gallery.all_categories")}
            </button>
            {filteredCategories.map((category) => (
              <button
                className="chip"
                key={category.id}
                type="button"
                aria-pressed={selectedCategory === category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {localizedText(category.name, category.nameTranslations, language)}
              </button>
            ))}
          </div>
        )}

        {isPending ? (
          <div className="empty" role="status">
            <Lottie file="trosheen-28-loader-seal.json" mode="loop" className="empty__art" />
            <p className="note">{t("common.loading")}</p>
          </div>
        ) : isError ? (
          <div className="empty" role="alert">
            <h3>{t("gallery.load_error")}</h3>
            <button className="btn" type="button" onClick={() => void refetch()}>
              <RefreshCw size={17} aria-hidden="true" /> {t("v4.shop.retry")}
            </button>
          </div>
        ) : items.length ? (
          <>
            <div className="gallery-result-count" role="status">
              {t("v4.gallery.shown")} {items.length} / {total}
            </div>
            <div className={"gallery-results gallery-results--" + view}>
              {items.map((item) => <GalleryMediaCard key={item.id} item={item} />)}
            </div>
            {hasNextPage && (
              <div className="center gallery-load-more">
                <button
                  className="btn"
                  type="button"
                  onClick={() => void fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage && <Loader2 size={17} className="animate-spin" aria-hidden="true" />}
                  {t("common.load_more")}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty gallery-empty">
            <h3>{filtered ? t("gallery.no_items") : t("v4.gallery.empty.title")}</h3>
            <p>{filtered ? t("gallery.try_different_filter") : t("v4.gallery.empty.desc")}</p>
            {filtered ? (
              <button className="btn" type="button" onClick={resetFilters}>{t("shop.clear_filters")}</button>
            ) : (
              <Link className="btn btn--ghost" href="/contact">{t("v4.gallery.empty.contact")}</Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
