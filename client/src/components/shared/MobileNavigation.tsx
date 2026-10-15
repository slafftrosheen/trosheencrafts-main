import { BrandIcon } from "./BrandIcon";
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/lib/LanguageContext";
import { ShoppingCartComponent } from "@/components/features/ShoppingCart";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNavigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const [isCustom, setIsCustom] = useState(false);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const sync = (event?: Event) => {
      const view = (event as CustomEvent<"collections" | "custom"> | undefined)?.detail;
      if (view === "custom" || view === "collections") {
        setIsCustom(view === "custom");
      } else {
        setIsCustom(window.location.pathname === "/shop" &&
          new URLSearchParams(window.location.search).get("view") === "custom");
      }
    };
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("trosheen:shop-view", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("trosheen:shop-view", sync);
    };
  }, [location]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const links = [
    { href: "/about", label: t("nav_story") },
    { href: "/shop", label: t("nav_shop") },
    { href: "/constructor", label: t("shop_custom_builder") },
    { href: "/gallery", label: t("nav_gallery") },
    { href: "/blog", label: t("nav_blog") },
    { href: "/guide", label: t("guide_care_eyebrow") },
    { href: "/contact", label: t("nav_contact") || "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/constructor" ? isCustom : href === "/shop" ? location === "/shop" && !isCustom : location === href || location.startsWith(href + "/");

  return (
    <header data-compact={compact} className="brand-mobile-header sticky top-0 z-50 border-b border-border/80 bg-background/95 backdrop-blur-xl xl:hidden">
      <div className="flex h-16 items-center justify-between px-4 transition-[height] duration-300">
        <Link href="/" className="flex items-center gap-2">
          <SiteLogo variant="lockup-horizontal" alt="Trosheen" className="h-12 w-36 min-[390px]:w-44 shrink-0 object-contain" />
        </Link>

        <div className="flex items-center gap-0.5">
          <LanguageSwitcher className="h-10 w-10" />
          <ShoppingCartComponent />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t("brand.menu")}>
                <BrandIcon name="menu" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm border-l border-border bg-background p-0">
              <div className="flex h-full flex-col">
                <SheetHeader className="border-b border-border px-6 py-6 text-left">
                  <SheetTitle className="font-serif text-2xl font-semibold">
                    {t("common.menu") || "Menu"}
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-1 flex-col px-4 py-5" aria-label="Mobile navigation">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setOpen(false);
                        if (link.href === "/shop" || link.href === "/constructor")
                          window.dispatchEvent(new CustomEvent("trosheen:shop-view", { detail: link.href === "/constructor" ? "custom" : "collections" }));
                      }}
                      aria-current={isActive(link.href) ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3.5 text-lg font-semibold transition-colors",
                        isActive(link.href)
                          ? "bg-muted text-foreground"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      {link.label}
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </nav>

                <div className="border-t border-border p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("footer_desc")}
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
