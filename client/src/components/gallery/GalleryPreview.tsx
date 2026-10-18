import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import { GalleryMediaCard, type PublicGalleryResponse } from "@/components/gallery/GalleryMediaCard";

/** Only real, admin-published gallery entries. Prefer explicitly featured work. */
export function GalleryPreview({ editorialImage }: { editorialImage?: string }) {
  const { t } = useLanguage();
  const featured = useQuery<PublicGalleryResponse>({
    queryKey: ["galleryPreview", "featured"],
    queryFn: () => apiClient.get("/gallery/items", { params: { featured: true, limit: 6 } }),
    staleTime: 60_000,
  });
  const fallback = useQuery<PublicGalleryResponse>({
    queryKey: ["galleryPreview", "recent"],
    queryFn: () => apiClient.get("/gallery/items", { params: { limit: 6 } }),
    enabled: !featured.isPending && !(featured.data?.items?.length),
    staleTime: 60_000,
  });

  const selected = featured.data?.items?.length ? featured.data.items : fallback.data?.items ?? [];
  if (!selected.length) return null;

  return (
    <section className="section section--tight gallery-preview" aria-labelledby="home-gallery-heading">
      <div className="wrap">
        <div className="gallery-preview__heading">
          <div>
            <p className="eyebrow">{t("v4.gallery.preview.eyebrow")}</p>
            <h2 id="home-gallery-heading">{t("v4.gallery.preview.title")}</h2>
            <p className="lead">{t("v4.gallery.preview.lead")}</p>
          </div>
          {editorialImage && <img className="gallery-preview__editorial" src={editorialImage} alt="" loading="lazy" decoding="async" />}
          <Link href="/gallery" className="link-arrow">
            {t("v4.gallery.preview.cta")} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="gallery-preview__rail" aria-label={t("v4.gallery.preview.title")}>
          {selected.slice(0, 6).map((item) => (
            <GalleryMediaCard item={item} key={item.id} compact />
          ))}
        </div>
      </div>
    </section>
  );
}
