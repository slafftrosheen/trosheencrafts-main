import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { ShoppingCartComponent } from "@/components/features/ShoppingCart";
import { SiteLogo } from "@/components/shared/SiteLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LANGUAGES = [
  { code: "lv", label: "Latviešu" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
] as const;

const ICONS = {
  search: "/brand/icons/search.svg",
  wishlist: "/brand/icons/wishlist.svg",
  bag: "/brand/icons/bag.svg",
  menu: "/brand/icons/menu.svg",
  close: "/brand/icons/close.svg",
};

/** Trosheen v4 site header: season ribbon sits above it (see Layout), drawer below. */
export function Navigation() {
  const [location] = useLocation();
  const { t, language, setLanguage } = useLanguage();
  const [compact, setCompact] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const links = [
    { href: "/", label: t("v4.nav.home") },
    { href: "/shop", label: t("v4.nav.shop") },
    { href: "/about", label: t("v4.nav.story") },
    { href: "/gallery", label: t("v4.nav.gallery") },
    { href: "/blog", label: t("v4.nav.journal") },
    { href: "/guide", label: t("v4.nav.care") },
    { href: "/contact", label: t("v4.nav.contact") },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location === href || location.startsWith(href + "/");

  return (
    <>
      <header className={cn("site-header", compact && "is-compact")}>
        <div className="wrap">
          <Link className="brand" href="/" aria-label={t("v4.nav.home")}>
            <SiteLogo variant="lockup-horizontal" tone="spruce"
              alt="Trosheen" width={190} height={42} />
          </Link>

          <nav className="nav" aria-label={t("v4.nav.aria")}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="header-tools">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="lang hide-sm" aria-label={t("v4.nav.lang")}>
                  {language.toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[170px]">
                {LANGUAGES.map((item) => (
                  <DropdownMenuItem
                    key={item.code}
                    onClick={() => setLanguage(item.code)}
                    className={cn(language === item.code && "font-semibold")}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link className="icon-btn hide-sm" href="/shop?focus=search" aria-label={t("v4.nav.search")}>
              <img src={ICONS.search} alt="" />
            </Link>
            <Link className="icon-btn hide-sm" href="/shop?view=saved" aria-label={t("v4.nav.wishlist")}>
              <img src={ICONS.wishlist} alt="" />
            </Link>

            <ShoppingCartComponent />

            <button
              className="icon-btn menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-label={t("v4.nav.open")}
            >
              <img src={ICONS.menu} alt="" />
            </button>
          </div>
        </div>
      </header>

      <div className={cn("drawer", drawerOpen && "is-open")} aria-hidden={!drawerOpen}>
        <div className="drawer__scrim" onClick={() => setDrawerOpen(false)} />
        <nav className="drawer__panel" aria-label={t("v4.nav.menu")}>
          <button
            className="icon-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label={t("v4.nav.close")}
            style={{ alignSelf: "flex-end" }}
          >
            <img src={ICONS.close} alt="" />
          </button>
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <div style={{ display: "flex", gap: ".5rem", marginTop: "1rem" }}>
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                className="lang"
                onClick={() => setLanguage(item.code)}
                aria-pressed={language === item.code}
              >
                {item.code.toUpperCase()}
              </button>
            ))}
            <Link className="icon-btn" href="/shop?focus=search" aria-label={t("v4.nav.search")}>
              <img src={ICONS.search} alt="" />
            </Link>
            <Link className="icon-btn" href="/shop?view=saved" aria-label={t("v4.nav.wishlist")}>
              <img src={ICONS.wishlist} alt="" />
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
