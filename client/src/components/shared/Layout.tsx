import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { useBrandMotion } from "@/lib/useBrandMotion";
import { SEO } from "./SEO";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { NetworkStatus } from "./NetworkStatus";
import { SeasonRibbon } from "@/components/brand/SeasonRibbon";
import { PageVeil } from "@/components/brand/PageVeil";

interface LayoutProps {
  children: React.ReactNode;
}

/** Trosheen v4 storefront shell: season ribbon, header + drawer, page, footer. */
export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(location);

  useBrandMotion(rootRef);

  useEffect(() => {
    if (previousPath.current === location) return;
    previousPath.current = location;
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "auto" });
    mainRef.current?.focus({ preventScroll: true });
  }, [location]);

  const seoTitles: Record<string, string> = {
    "/shop": "nav_shop",
    "/about": "nav_story",
    "/gallery": "nav_gallery",
    "/blog": "nav_blog",
    "/guide": "v4.nav.care",
    "/contact": "v4.nav.contact",
    "/cart": "cart.basket",
    "/checkout": "checkout.title",
    "/order-confirmation": "confirm.title",
  };
  const seoDescriptions: Record<string, string> = {
    "/shop": "v4.shop.lead",
    "/gallery": "v4.gallery.lead",
    "/blog": "v4.journal.lead",
    "/guide": "v4.care.hero.lead",
    "/contact": "v4.contact.lead",
    "/about": "v4.story.hero.lead",
  };
  const seoDescriptionKey = seoDescriptions[location] || "brand.intro";

  const seoKey = location.startsWith("/shop/")
    ? "nav_shop"
    : location.startsWith("/gallery/")
      ? "nav_gallery"
      : location.startsWith("/blog/")
        ? "nav_blog"
        : seoTitles[location];

  return (
    <div className="storefront min-h-screen flex flex-col" ref={rootRef}>
      <a className="skip" href="#saturs">
        {t("v4.nav.skip")}
      </a>

      <SEO
        title={location === "/" ? t("brand.seo_home") : t(seoKey || "brand.tagline")}
        description={t(seoDescriptionKey)}
      />

      <SeasonRibbon />
      <Navigation />

      <main
        id="saturs"
        key={location}
        ref={mainRef}
        tabIndex={-1}
        className="page-fade flex-1 w-full outline-none"
      >
        {children}
      </main>

      <Footer />
      <NetworkStatus />
      <PageVeil routeKey={location} />
    </div>
  );
}
