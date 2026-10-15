import { useLanguage } from "@/lib/LanguageContext";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { SEO } from "./SEO";
import { Navigation } from "./Navigation";
import { MobileNavigation } from "./MobileNavigation";
import { Footer } from "./Footer";
import { NetworkStatus } from "./NetworkStatus";
import { PageTransition } from "./PageTransition";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { t } = useLanguage();
  const mainRef = useRef<HTMLElement>(null);
  const previousPath = useRef(location);
  useEffect(() => {
    if (previousPath.current === location) return;
    previousPath.current = location;
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "auto" });
    mainRef.current?.focus({ preventScroll: true });
  }, [location]);

  return (
    <div className="storefront min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {t("brand.skip")}
      </a>

      <SEO title={location === "/" ? t("brand.seo_home") : t(({ "/shop": "nav_shop", "/about": "nav_story", "/gallery": "nav_gallery", "/blog": "nav_blog", "/guide": "guide_care_eyebrow", "/contact": "nav_contact", "/cart": "cart.basket", "/checkout": "checkout.title", "/order-confirmation": "confirm.title" } as Record<string, string>)[location] || (location.startsWith("/shop/") ? "nav_shop" : location.startsWith("/gallery/") ? "nav_gallery" : "brand.tagline"))} description={t("brand.intro")} />
      <Navigation />
      <MobileNavigation />

      <main id="main-content" ref={mainRef} tabIndex={-1} className="flex-1 w-full outline-none">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location}>{children}</PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
      <NetworkStatus />
    </div>
  );
}
