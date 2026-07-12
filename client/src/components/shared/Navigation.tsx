import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Link, useLocation } from 'wouter';
import { ShoppingCart, Search, User, ArrowRight } from 'lucide-react';
import { navigationConfig } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';
import { ShoppingCartComponent } from '@/components/features/ShoppingCart';
import { BrandAssets } from '@/lib/imageAssets';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Navigation() {
  const [location] = useLocation();
  const { t } = useLanguage();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());

  return (
    <nav className="fixed top-0 w-full z-40 border-b border-border/40 bg-background/60 backdrop-blur-md hidden lg:block">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="group flex items-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="relative w-20 h-20 flex items-center justify-center"
          >
            <img 
              src={BrandAssets.logo} 
              alt="Trosheen Crafts Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
        </Link>
        <div className="flex items-center gap-8">
          <Link href="/#story" className="text-sm font-medium hover:text-primary transition-colors relative group/nav">
            {t("nav_story")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover/nav:w-full" />
          </Link>
          <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors relative group/nav">
            {t("nav_shop")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover/nav:w-full" />
          </Link>
          <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors relative group/nav">
            {t("nav_blog")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover/nav:w-full" />
          </Link>
          <Link href="/gallery" className="text-sm font-medium hover:text-primary transition-colors relative group/nav">
            {t("nav_gallery")}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover/nav:w-full" />
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors relative group/nav">
            {t("nav_contact") || "Contact"}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover/nav:w-full" />
          </Link>
          
          <div className="flex items-center gap-2 ml-4">
            <LanguageSwitcher />
            <ShoppingCartComponent />
            <Link href="/shop">
              <Button className="rounded-full px-6 hover-elevate shadow-xl shadow-primary/10 ml-2">{t("nav_cta")}</Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}