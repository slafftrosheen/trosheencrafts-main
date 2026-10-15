import { useLanguage } from "@/lib/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { useReducedMotion } from "framer-motion";

interface Promotion {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl?: string;
  linkText?: string;
  active: boolean;
}

export function PromotionalGallery({ embedded = false }: { embedded?: boolean }) {
  const { t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { data: promotions = [] } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => apiClient.get<Promotion[]>("/promotions"),
  });

  const { data: config } = useQuery({
    queryKey: ["site-config-gallery"],
    queryFn: () => apiClient.get<{ value: { heading: string } }>("/site-config/promotionalGallery"),
  });

  const activePromotions = promotions.filter((promo) => promo.active !== false);
  const heading = config?.value?.heading || t("brand.collections");

  if (!activePromotions.length) return null;

  return (
    <div className={embedded ? "mb-8" : "section-space border-b border-border"}>
      <div className={embedded ? "" : "site-container"}>
        {!embedded && <div className="mb-8 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">{t("brand.season")}</p>
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h2>
          </div>
        </div>}

        <div className="grid gap-5 md:grid-cols-2">
          {activePromotions.map((promo) => (
            <article
              key={promo.id}
              className="group relative aspect-[5/4] overflow-hidden rounded-3xl bg-secondary"
            >
              {promo.videoUrl ? (
                <video
                  src={promo.videoUrl}
                  poster={promo.imageUrl}
                  autoPlay={!reduceMotion}
                  muted
                  loop
                  preload="metadata"
                  aria-label={promo.title}
                  playsInline
                  className="h-full w-full object-cover"
                />
              ) : (
                <OptimizedImage
                  src={promo.imageUrl}
                  alt={promo.title}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                <h3 className="font-serif text-3xl font-semibold leading-none tracking-tight">{promo.title}</h3>
                {promo.description && (
                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">
                    {promo.description}
                  </p>
                )}
                {promo.linkUrl && (/^(https?:\/\/|\/|#)/i.test(promo.linkUrl)) && (
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="mt-5 bg-white text-black border-white hover:bg-white/90"
                  >
                    {/^https?:\/\//i.test(promo.linkUrl) ? (
                      <a href={promo.linkUrl} target="_blank" rel="noopener noreferrer">
                        {promo.linkText || t("brand.explore")}<ArrowRight className="h-4 w-4" />
                      </a>
                    ) : (
                      <Link href={promo.linkUrl}>
                        {promo.linkText || t("brand.explore")}<ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
