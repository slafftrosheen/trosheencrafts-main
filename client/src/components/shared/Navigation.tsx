import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { ShoppingCartComponent } from "@/components/features/ShoppingCart";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navigation() {
  const [location] = useLocation();
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
    const update = () => setCompact(window.scrollY > 40);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const links = [
    { href: "/shop", label: t("nav_shop") },
    { href: "/constructor", label: t("shop_custom_builder") },
    { href: "/about", label: t("nav_story") },
    { href: "/gallery", label: t("nav_gallery") },
    { href: "/blog", label: t("nav_blog") },
    { href: "/guide", label: t("guide_care_eyebrow") },
    { href: "/contact", label: t("nav_contact") || "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/constructor" ? isCustom : href === "/shop" ? location === "/shop" && !isCustom : href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <header data-compact={compact} className="brand-desktop-header sticky top-0 z-50 hidden xl:block border-b border-border/80 bg-background/95 backdrop-blur-xl">
      <div className="site-container flex h-24 items-center justify-between gap-3 transition-[height] duration-300">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <SiteLogo variant="lockup-horizontal" alt="Trosheen" className="h-11 w-40 shrink-0 object-contain" />
        </Link>

        <nav className="flex min-w-0 items-center gap-0.5" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                if (link.href === "/shop" || link.href === "/constructor")
                  window.dispatchEvent(new CustomEvent("trosheen:shop-view", { detail: link.href === "/constructor" ? "custom" : "collections" }));
              }}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "min-h-11 border-b-2 px-2.5 py-3 text-[12px] font-medium leading-tight transition-colors 2xl:text-[13px]",
                isActive(link.href)
                  ? "border-[#B89150] text-primary"
                  : "border-transparent text-primary hover:border-primary/30"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ShoppingCartComponent />
        </div>
      </div>
    </header>
  );
}
