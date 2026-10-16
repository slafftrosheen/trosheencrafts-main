import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, X } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { localizedText } from "@/lib/localizedContent";
import { apiClient } from "@/lib/apiClient";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";

interface GalleryItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  titleTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
  type: "3d" | "photo" | "video";
  mediaUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  featured: boolean;
  viewCount: number;
  likes: number;
}

interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  nameTranslations?: Record<string, string>;
  type: "3d" | "photo" | "video";
}

export default function GalleryPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "3d" | "photo" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchQuery.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const { data: categories = [] } = useQuery<GalleryCategory[]>({
    queryKey: ["galleryCategories"],
    queryFn: () => apiClient.get("/gallery/categories"),
  });

  const { data: galleryData, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["galleryItems", activeTab, debouncedSearch, selectedCategory, page],
    queryFn: () => {
      const params: Record<string, string | number> = { limit: page * itemsPerPage };
      if (activeTab !== "all") params.type = activeTab;
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.categoryId = selectedCategory;
      return apiClient.get<any>("/gallery/items", { params });
    },
  });

  const filteredCategories = categories.filter(
    (category) => activeTab === "all" || category.type === activeTab,
  );
  const items: GalleryItem[] = galleryData?.items || [];

  const tabs = [
    { id: "all", label: t("v4.gallery.filter.all") },
    { id: "photo", label: t("v4.gallery.filter.photo") },
    { id: "3d", label: t("gallery.model_label") },
    { id: "video", label: t("v4.gallery.filter.video") },
  ] as const;

  const typeLabel = (type: GalleryItem["type"]) =>
    type === "3d"
      ? t("gallery.model_label")
      : type === "photo"
        ? t("v4.gallery.filter.photo")
        : t("v4.gallery.filter.video");

  return (
    <section className="section section--tight">
      <div className="wrap">
        <p className="eyebrow">
          <Ornament name="maras-zime" size="sm" draw /> {t("v4.gallery.eyebrow")}
        </p>
        <h1>{t("v4.gallery.title")}</h1>
        <p className="lead">{t("v4.gallery.lead")}</p>

        <div className="toolbar">
          <div className="chips" role="group" aria-label={t("gallery.media_filter")}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className="chip"
                aria-pressed={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedCategory(null);
                  setPage(1);
                }}
              >
                {tab.label}
              </button>
            ))}
            {filteredCategories.length > 0 && (
              <button
                type="button"
                className="chip"
                aria-pressed={selectedCategory === null}
                onClick={() => {
                  setSelectedCategory(null);
                  setPage(1);
                }}
              >
                {t("gallery.all_categories")}
              </button>
            )}
            {filteredCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                className="chip"
                aria-pressed={selectedCategory === category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  setPage(1);
                }}
              >
                {localizedText(category.name, category.nameTranslations, language)}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <label className="sr-only" htmlFor="gallery-search">
              {t("gallery.search_placeholder")}
            </label>
            <input
              id="gallery-search"
              type="search"
              className="input"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setPage(1);
              }}
              placeholder={t("gallery.search_placeholder")}
              style={{ borderRadius: "var(--r-pill)", paddingRight: "2.4rem" }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                className="icon-btn"
                style={{ position: "absolute", right: 0, top: 0, width: 40, height: 40 }}
                aria-label={t("shop.clear_filters")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="empty" role="status">
            <Lottie file="trosheen-28-loader-seal.json" mode="loop" className="empty__art" />
            <p className="note" style={{ margin: 0 }}>
              {t("common.loading")}
            </p>
          </div>
        ) : isError ? (
          <div className="empty" role="alert">
            <Lottie file="trosheen-10-404-rolling-stone.json" mode="view" className="empty__art" />
            <h3>{t("gallery.load_error")}</h3>
            <button className="btn" onClick={() => void refetch()}>
              <RefreshCw className="h-4 w-4" />
              {t("v4.shop.retry")}
            </button>
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="masonry">
              {items.map((item, index) => (
                <figure key={item.id} data-reveal style={{ "--delay": `${(index % 3) * 80}ms` } as React.CSSProperties}>
                  <Link href={"/gallery/" + item.slug} aria-label={localizedText(item.title, item.titleTranslations, language)}>
                    {item.type === "video" ? (
                      <video
                        src={item.mediaUrl}
                        poster={item.thumbnailUrl}
                        muted
                        playsInline
                        preload="metadata"
                        style={{ width: "100%", height: "auto", display: "block" }}
                      />
                    ) : item.type === "3d" && !item.thumbnailUrl ? (
                      <span
                        style={{
                          display: "grid",
                          placeItems: "center",
                          gap: ".6rem",
                          aspectRatio: "4/3",
                          background: "var(--linen-deep)",
                          color: "var(--spruce)",
                        }}
                      >
                        <Lottie
                          file="trosheen-29-gallery-frame.json"
                          mode="view"
                          style={{ width: 96, height: 96 }}
                        />
                        <span className="note">{t("gallery.model_label")}</span>
                      </span>
                    ) : (
                      <img
                        src={item.thumbnailUrl || item.mediaUrl}
                        alt={localizedText(item.title, item.titleTranslations, language)}
                        loading="lazy"
                      />
                    )}
                    <span className="product__tag" style={{ left: ".8rem", top: ".8rem" }}>
                      {typeLabel(item.type)}
                    </span>
                  </Link>
                  <figcaption className="note" style={{ padding: ".7rem .2rem 0" }}>
                    {localizedText(item.title, item.titleTranslations, language)}
                  </figcaption>
                </figure>
              ))}
            </div>

            {galleryData?.total > items.length && (
              <div className="center" style={{ marginTop: "2rem" }}>
                <button
                  className="btn"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={isFetching}
                >
                  {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {t("common.load_more")}
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="divider" aria-hidden="true">
              <Ornament name="auseklis" size="sm" draw />
            </div>
            <p className="eyebrow center" style={{ display: "block" }}>
              {t("v4.gallery.empty.label")}
            </p>
            <div className="empty" data-reveal>
              <Lottie file="trosheen-29-gallery-frame.json" mode="view" className="empty__art" />
              <h3>
                {searchQuery || selectedCategory !== null || activeTab !== "all"
                  ? t("gallery.no_items")
                  : t("v4.gallery.empty.title")}
              </h3>
              <p>
                {searchQuery || selectedCategory !== null || activeTab !== "all"
                  ? t("gallery.try_different_filter")
                  : t("v4.gallery.empty.desc")}
              </p>
              <a
                className="btn btn--ghost"
                href="https://www.instagram.com/trosheencrafts"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("v4.gallery.empty.cta")}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
