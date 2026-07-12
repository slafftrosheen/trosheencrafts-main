import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, ShoppingCart, Search, User } from 'lucide-react';
import { navigationConfig } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useLanguage } from '@/lib/LanguageContext';
import { ShoppingCartComponent } from '@/components/features/ShoppingCart';
import { BrandAssets } from '@/lib/imageAssets';
import { LanguageSwitcher } from './LanguageSwitcher';

export function MobileNavigation() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  // Close menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between px-4 h-16">
          <Link href="/" className="group flex items-center">
            <div className="w-16 h-16 flex items-center justify-center">
              <img 
                src={BrandAssets.logo} 
                alt="Trosheen Crafts Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </Link>

          <div className="flex items-center gap-1">
            <LanguageSwitcher className="w-9 h-9 text-lg" />
            <ShoppingCartComponent />

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] sm:w-[400px] rounded-l-[3rem] border-l-2 border-primary/10">
                <SheetHeader>
                  <SheetTitle className="text-left font-serif text-3xl font-bold">{t("common.menu")}</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-4 mt-12">
                  <Link href="/#story" className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg",
                    location === "/#story" ? "bg-primary text-white" : "hover:bg-accent"
                  )}>
                    {t("nav_story")}
                  </Link>
                  <Link href="/shop" className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg",
                    location === "/shop" ? "bg-primary text-white" : "hover:bg-accent"
                  )}>
                    {t("nav_shop")}
                  </Link>
                  <Link href="/blog" className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg",
                    location === "/blog" ? "bg-primary text-white" : "hover:bg-accent"
                  )}>
                    {t("nav_blog")}
                  </Link>
                  <Link href="/gallery" className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg",
                    location === "/gallery" ? "bg-primary text-white" : "hover:bg-accent"
                  )}>
                    {t("nav_gallery")}
                  </Link>
                  <Link href="/contact" className={cn(
                    "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-lg",
                    location === "/contact" ? "bg-primary text-white" : "hover:bg-accent"
                  )}>
                    {t("nav_contact") || "Contact"}
                  </Link>
                </nav>

                <div className="mt-12 pt-8 border-t border-border/40">
                  <Link href="/admin/login">
                    <Button className="w-full rounded-2xl h-14 font-bold text-lg shadow-xl shadow-primary/20">
                      {t("admin.login_button")}
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="lg:hidden h-16" />
    </>
  );
}