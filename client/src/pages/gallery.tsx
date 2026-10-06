import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid3x3, Images, Heart, Search, X, Plus, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/LanguageContext";
import { Link } from "wouter";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

interface GalleryItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
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
  type: "3d" | "photo";
}

function TypeIcon({ type }: { type: GalleryItem["type"] }) {
  if (type === "3d") return <Grid3x3 className="h-3.5 w-3.5" />;
  if (type === "video") return <Play className="h-3.5 w-3.5" />;
  return <Images className="h-3.5 w-3.5" />;
}

export default function GalleryPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"all" | "3d" | "photo" | "video">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const { data: categories = [] } = useQuery<GalleryCategory[]>({
    queryKey: ["galleryCategories"],
    queryFn: () => apiClient.get("/gallery/categories"),
  });

  const { data: galleryData, isLoading, isFetching } = useQuery({
    queryKey: ["galleryItems", activeTab, searchQuery, selectedCategory, page],
    queryFn: () => {
      const params: Record<string, string | number> = { limit: page * itemsPerPage };
      if (activeTab !== "all") params.type = activeTab;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory) params.categoryId = selectedCategory;
      return apiClient.get<any>("/gallery/items", { params });
    },
  });

  const filteredCategories = categories.filter(
    (category) => activeTab === "all" || category.type === activeTab || activeTab === "video"
  );

  const items: GalleryItem[] = galleryData?.items || [];

  return (
    <div className="min-h-screen bg-background">
      <section className="page-shell border-b border-border">
        <div className="site-container">
          <p className="eyebrow">{t("gallery.eyebrow")}</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <h1 className="display-title">{t("gallery.title")}</h1>
            <p className="lead lg:pb-2">{t("gallery.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="section-space pt-8 sm:pt-10">
        <div className="site-container">
          <div className="border-b border-border pb-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="inline-flex w-full rounded-full border border-border bg-card p-1 lg:w-auto">
                {[
                  { id: "all", label: t("gallery.all") },
                  { id: "3d", label: "3D" },
                  { id: "photo", label: "Photos" },
                  { id: "video", label: "Videos" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      setSelectedCategory(null);
                      setPage(1);
                    }}
                    className={cn(
                      "flex-1 rounded-full px-4 py-2 text-xs font-semibold transition-colors lg:flex-none",
                      activeTab === tab.id
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder={t("gallery.search_placeholder")}
                  className="h-11 rounded-full pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {filteredCategories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold",
                    selectedCategory === null
                      ? "border-primary bg-primary/8 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("gallery.all_categories")}
                </button>
                {filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setPage(1);
                    }}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold",
                      selectedCategory === category.id
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="aspect-[4/3] animate-pulse rounded-3xl bg-muted" />
              ))}
            </div>
          ) : items.length > 0 ? (
            <>
              <div className="grid gap-x-6 gap-y-10 py-10 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Link key={item.id} href={"/gallery/" + item.slug} className="group block">
                    <article>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted">
                        {item.type === "video" ? (
                          <video
                            src={item.mediaUrl}
                            poster={item.thumbnailUrl}
                            muted
                            playsInline
                            preload="metadata"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                          />
                        ) : (
                          <img
                            src={item.thumbnailUrl || item.mediaUrl}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
                          />
                        )}
                        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] backdrop-blur">
                          <TypeIcon type={item.type} />
                          {item.type === "3d" ? "Interactive 3D" : item.type}
                        </span>
                      </div>

                      <div className="pt-4">
                        <div className="flex items-start justify-between gap-5">
                          <div>
                            <h2 className="font-serif text-2xl font-semibold tracking-tight group-hover:text-primary">
                              {item.title}
                            </h2>
                            {item.description && (
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <Heart className="h-3.5 w-3.5" />
                            {item.likes}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              {galleryData?.total > items.length && (
                <div className="text-center">
                  <Button
                    onClick={() => setPage((current) => current + 1)}
                    disabled={isFetching}
                    variant="outline"
                    size="lg"
                  >
                    {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {t("common.load_more") || "Load more"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <Images className="mx-auto h-9 w-9 text-primary" />
              <h2 className="mt-5 font-serif text-3xl font-semibold">{t("gallery.no_items")}</h2>
              <p className="mt-2 text-muted-foreground">{t("gallery.try_different_filter")}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
