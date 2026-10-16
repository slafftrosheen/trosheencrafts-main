import { useLanguage } from "@/lib/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { useReducedMotion } from "framer-motion";
import { localizedText } from "@/lib/localizedContent";

interface Promotion {
  id: number;
  title: string;
  description?: string;
  titleTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
  linkTextTranslations?: Record<string, string>;
  imageUrl: string;
  videoUrl?: string;
  linkUrl?: string;
  linkText?: string;
  active: boolean;
}

/** Keep the full kit artwork, including its intentionally typeset colour panels.
 * R2 photos remain editorial images with ordinary cover behaviour. */
export function isKitBanner(src: string): boolean {
  return /trosheen-collection-banner-0[1-5](?:-|\.)/i.test(src);
}

export function PromotionalGallery({ embedded = false }: { embedded?: boolean }) {
  const { t, language } = useLanguage();
  const reduceMotion = useReducedMotion();
  const { data: promotions = [] } = useQuery({
    queryKey: ["promotions"],
    queryFn: () => apiClient.get<Promotion[]>("/promotions"),
  });
  const { data: config } = useQuery({
    queryKey: ["site-config-gallery"],
    queryFn: () => apiClient.get<{ value: { heading: string; headingTranslations?: Record<string, string> } }>("/site-config/promotionalGallery"),
  });
  const activePromotions = promotions.filter(promo => promo.active !== false);
  const heading = localizedText(
    config?.value?.heading || t("brand.collections"),
    config?.value?.headingTranslations,
    language,
  );

  if (!activePromotions.length) return null;
  return (
    <section className={embedded ? "mb-10" : "section-space border-b border-border"} aria-label={heading}>
      <div className={embedded ? "" : "site-container"}>
        {!embedded && (
          <div className="mb-9">
            <p className="eyebrow mb-3">{t("brand.season")}</p>
            <h2 className="section-title">{heading}</h2>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {activePromotions.map(promo => {
            const kitBanner = !promo.videoUrl && isKitBanner(promo.imageUrl);
            const href = promo.linkUrl?.trim() || "";
            const title = localizedText(promo.title, promo.titleTranslations, language);
            const description = localizedText(promo.description, promo.descriptionTranslations, language);
            const linkText = localizedText(promo.linkText || t("brand.explore"), promo.linkTextTranslations, language);
            const safeLink = /^(https?:\/\/|\/(?!\/)|#)/i.test(href);
            return (
              <article key={promo.id} className="brand-promo-card group flex min-w-0 flex-col overflow-hidden border border-border bg-card">
                <div className={"brand-promo-media" + (kitBanner ? " brand-promo-media--kit" : "")}>
                  {promo.videoUrl ? (
                    <video src={promo.videoUrl} poster={promo.imageUrl}
                      autoPlay={!reduceMotion} muted loop playsInline preload="metadata"
                      aria-label={title} className="h-full w-full object-cover" />
                  ) : (
                    <OptimizedImage src={promo.imageUrl} alt={title} className="h-full w-full" />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 px-6 py-7 sm:px-8 sm:py-8">
                  <h3 className="font-serif text-[clamp(1.7rem,2.5vw,2.5rem)] leading-tight text-foreground">{title}</h3>
                  {description && <p className="max-w-prose text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>}
                  {safeLink && (
                    <div className="mt-auto pt-4">
                      <Button asChild variant="outline" className="max-w-full">
                        {/^https?:\/\//i.test(href) ? (
                          <a href={href} target="_blank" rel="noopener noreferrer">
                            {linkText}<ArrowRight className="h-4 w-4" />
                          </a>
                        ) : (
                          <Link href={href}>
                            {promo.linkText || t("brand.explore")}<ArrowRight className="h-4 w-4" />
                          </Link>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
