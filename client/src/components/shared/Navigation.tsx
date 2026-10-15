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
  useEffect(() => {
    const sync = () => setIsCustom(window.location.pathname === "/shop" &&
      new URLSearchParams(window.location.search).get("view") === "custom");
    sync();
    window.addEventListener("popstate", sync);
    window.addEventListener("trosheen:shop-view", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("trosheen:shop-view", sync);
    };
  }, [location]);

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
    <header className="sticky top-0 z-50 hidden xl:block border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="site-container flex h-24 items-center justify-between gap-3 transition-[height] duration-300">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <SiteLogo variant="lockup-horizontal" alt="Trosheen" className="h-11 w-40 shrink-0 object-contain" />
        </Link>

        <nav className="flex min-w-0 items-center gap-0.5" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
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
