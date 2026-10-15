import { useLanguage } from "@/lib/LanguageContext";
import { AnimatePresence } from "framer-motion";
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

  return (
    <div className="storefront min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        {t("brand.skip")}
      </a>

      <SEO title={location === "/" ? t("brand.tagline") : t(({ "/shop": "nav_shop", "/about": "nav_story", "/gallery": "nav_gallery", "/blog": "nav_blog", "/guide": "guide_care_eyebrow", "/contact": "nav_contact" } as Record<string, string>)[location] || "brand.tagline")} description={t("brand.intro")} />
      <Navigation />
      <MobileNavigation />

      <main id="main-content" className="flex-1 w-full">
        <AnimatePresence mode="wait" initial={false}>
          <PageTransition key={location}>{children}</PageTransition>
        </AnimatePresence>
      </main>

      <Footer />
      <NetworkStatus />
    </div>
  );
}
