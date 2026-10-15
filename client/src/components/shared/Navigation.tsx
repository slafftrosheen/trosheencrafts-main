import { Link, useLocation } from "wouter";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { ShoppingCartComponent } from "@/components/features/ShoppingCart";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navigation() {
  const [location] = useLocation();
  const { t } = useLanguage();

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
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 hidden lg:block border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="site-container flex h-24 items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <SiteLogo variant="lockup-horizontal" alt="Trosheen" className="h-12 w-44 shrink-0 object-contain" />
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-2 py-3 text-[13px] font-medium transition-colors",
                isActive(link.href)
                  ? "border-b-2 border-[#B89150] text-primary"
                  : "border-b-2 border-transparent text-primary hover:border-primary/30"
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
