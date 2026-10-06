import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/lib/LanguageContext";
import { ShoppingCartComponent } from "@/components/features/ShoppingCart";
import { BrandAssets } from "@/lib/imageAssets";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function MobileNavigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setOpen(false);
  }, [location]);

  const links = [
    { href: "/about", label: t("nav_story") },
    { href: "/shop", label: t("nav_shop") },
    { href: "/gallery", label: t("nav_gallery") },
    { href: "/blog", label: t("nav_blog") },
    { href: "/guide", label: t("guide_care_eyebrow") },
    { href: "/contact", label: t("nav_contact") || "Contact" },
  ];

  const isActive = (href: string) =>
    location === href || location.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/94 backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src={BrandAssets.logo}
            alt="Trosheen.Crafts"
            className="h-10 w-10 object-contain"
          />
          <span className="hidden font-serif text-base font-semibold tracking-tight min-[390px]:inline">
            Trosheen.Crafts
          </span>
        </Link>

        <div className="flex items-center gap-0.5">
          <LanguageSwitcher className="h-10 w-10" />
          <ShoppingCartComponent />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
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
