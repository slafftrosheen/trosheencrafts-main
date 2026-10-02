import { Link, useLocation } from "wouter";
import { BrandAssets } from "@/lib/imageAssets";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { ShoppingCartComponent } from "@/components/features/ShoppingCart";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Navigation() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const links = [
    { href: "/about", label: t("nav_story") },
    { href: "/shop", label: t("nav_shop") },
    { href: "/gallery", label: t("nav_gallery") },
    { href: "/blog", label: t("nav_blog") },
    { href: "/guide", label: t("guide_care_eyebrow") },
    { href: "/contact", label: t("nav_contact") || "Contact" },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 hidden md:block border-b border-border/80 bg-background/92 backdrop-blur-xl">
      <div className="site-container flex h-[72px] items-center justify-between gap-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <img
            src={BrandAssets.logo}
            alt="Trosheen.Crafts"
            className="h-11 w-11 object-contain"
          />
          <span className="hidden font-serif text-lg font-semibold tracking-tight text-foreground lg:block">
            Trosheen.Crafts
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-2 text-[13px] font-semibold transition-colors",
                isActive(link.href)
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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
