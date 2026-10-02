import { AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
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

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>

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
