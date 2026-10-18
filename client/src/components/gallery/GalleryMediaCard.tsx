import { Link } from "wouter";
import { Box, Film } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { localizedText } from "@/lib/localizedContent";

export interface PublicGalleryItem {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  titleTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
  type: "3d" | "photo" | "video";
  mediaUrl: string;
  thumbnailUrl?: string | null;
  tags?: string[];
  featured?: boolean;
  viewCount?: number;
  likes?: number;
}

export interface PublicGalleryResponse {
  items: PublicGalleryItem[];
  total: number;
  limit: number;
  offset: number;
}

export type GalleryViewMode = "masonry" | "grid" | "list";

export function GalleryMediaCard({ item, compact = false }: { item: PublicGalleryItem; compact?: boolean }) {
  const { t, language } = useLanguage();
  const title = localizedText(item.title, item.titleTranslations, language);
  const description = localizedText(item.description, item.descriptionTranslations, language);
  const type = item.type === "photo" ? t("v4.gallery.filter.photo") :
    item.type === "video" ? t("v4.gallery.filter.video") : t("gallery.model_label");

  return (
    <article className={"gallery-piece" + (compact ? " gallery-piece--compact" : "")}>
      <Link className="gallery-piece__link" href={"/gallery/" + encodeURIComponent(item.slug)} aria-label={title}>
        <div className="gallery-piece__image">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt={title} loading="lazy" decoding="async" />
          ) : item.type === "3d" ? (
            <span className="gallery-piece__fallback" aria-hidden="true"><Box size={40} strokeWidth={1.3} /></span>
          ) : item.type === "video" ? (
            <span className="gallery-piece__fallback" aria-hidden="true"><Film size={40} strokeWidth={1.3} /></span>
          ) : (
            <img src={item.mediaUrl} alt={title} loading="lazy" decoding="async" />
          )}
          <span className="gallery-piece__type">
            {item.type === "video" && <Film size={14} aria-hidden="true" />}
            {type}
          </span>
        </div>
        <div className="gallery-piece__copy">
          <h3>{title}</h3>
          {description && <p className="note">{description}</p>}
        </div>
      </Link>
    </article>
  );
}
