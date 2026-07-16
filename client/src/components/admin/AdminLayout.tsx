import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FileText,
  Users,
  Settings,
  Image as ImageIcon,
  TrendingUp,
  Mail,
  Tag,
  Menu,
  X,
  LogOut,
  Palette,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';
import { BrandAssets } from '@/lib/imageAssets';
import { useCurrentUser } from '@/hooks/useApi';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    label: 'admin.dashboard',
    items: [
      { name: 'admin.dashboard', href: '/admin', icon: LayoutDashboard },
      { name: 'admin.analytics_title', href: '/admin/analytics', icon: TrendingUp },
    ]
  },
  {
    label: 'admin.orders',
    items: [
      { name: 'admin.orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'admin.products', href: '/admin/products', icon: Package },
      { name: 'admin.constructor', href: '/admin/constructor', icon: Palette },
      { name: 'admin.category', href: '/admin/categories', icon: Tag },
    ]
  },
  {
    label: 'admin.blog',
    items: [
      { name: 'admin.blog', href: '/admin/blog', icon: FileText },
      { name: 'admin.promotions', href: '/admin/promotions', icon: TrendingUp },
      { name: 'admin.gallery.title', href: '/admin/gallery', icon: ImageIcon },
    ]
  },
  {
    label: 'admin.messages',
    items: [
      { name: 'footer.newsletter_title', href: '/admin/subscribers', icon: Mail },
      { name: 'admin.messages', href: '/admin/messages', icon: Mail },
      { name: 'nav.settings', href: '/admin/settings', icon: Settings },
    ]
  }
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { t } = useLanguage();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      setSidebarOpen(desktop);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      
      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isDesktop && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <AnimatePresence>
        {(isDesktop || sidebarOpen) && (
          <motion.aside
            initial={!isDesktop ? { x: -280 } : false}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "bg-card/60 backdrop-blur-xl border-r border-border/40 z-50 overflow-hidden",
              isDesktop ? "fixed left-0 top-0 h-screen w-[280px]" : "fixed left-0 top-0 h-screen w-[280px]"
            )}
          >
            <div className="flex flex-col h-full relative z-10">
              {/* Header */}
              <div className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    <img 
                      src={BrandAssets.logo} 
                      alt="Trosheen Crafts Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-base sm:text-lg tracking-tight"></h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t("common.studio")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="ml-auto shrink-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="opacity-40" />

              {/* Navigation */}
              <ScrollArea className="flex-1 px-3 py-4 sm:py-6">
                {navigationItems.map((section, idx) => (
                  <div key={idx} className="mb-6 sm:mb-8">
                    <h3 className="px-4 mb-3 sm:mb-4 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] whitespace-nowrap">
                      {t(section.label)}
                    </h3>
                    <nav className="space-y-1.5">
                      {section.items.map((item) => {
                        const isActive = location === item.href;
                        const Icon = item.icon;

                        return (
                          <Link key={item.href} href={item.href}>
                            <motion.div
                              whileHover={{ x: 4 }}
                              onClick={() => !isDesktop && setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-2xl cursor-pointer transition-all relative whitespace-nowrap font-bold text-sm",
                                isActive
                                  ? "text-primary-foreground shadow-xl shadow-primary/20"
                                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                              )}
                            >
                              <Icon className="h-5 w-5 flex-shrink-0" />
                              <span className="tracking-tight">{t(item.name)}</span>
                              {isActive && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="absolute inset-0 bg-primary rounded-2xl -z-10"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                            </motion.div>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </ScrollArea>

              <Separator className="opacity-40" />

              {/* User Profile */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground font-black">
                      A
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="text-sm font-bold truncate tracking-tight">Artisan Admin</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase tracking-widest font-medium">{t("admin.login_title")}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 sm:mt-6 justify-center rounded-xl border-border/60 font-bold text-xs sm:text-sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("admin.logout")}
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Menu Button */}
      {!isDesktop && !sidebarOpen && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-card/80 backdrop-blur-xl border border-border/40 shadow-lg lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </motion.button>
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 min-h-screen bg-background/50 relative z-10 w-full",
          isDesktop && "ml-[280px]"
        )}
      >
        <div className="p-4 sm:p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}