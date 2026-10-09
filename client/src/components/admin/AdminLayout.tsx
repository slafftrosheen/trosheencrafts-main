import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BarChart3,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Package,
  Palette,
  Settings,
  ShoppingCart,
  Tag,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { adminT as t } from "@/lib/adminI18n";
import { cn } from "@/lib/utils";
import { SiteLogo } from "@/components/shared/SiteLogo";
import { useCurrentUser } from "@/hooks/useApi";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    label: "Обзор",
    items: [
      { name: "Главная", href: "/admin", icon: LayoutDashboard },
      { name: "Аналитика", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Магазин",
    items: [
      { name: "Заказы", href: "/admin/orders", icon: ShoppingCart },
      { name: "Товары", href: "/admin/products", icon: Package },
      { name: "Остатки", href: "/admin/inventory", icon: Package },
      { name: "Конструктор", href: "/admin/constructor", icon: Palette },
      { name: "Категории", href: "/admin/categories", icon: Tag },
    ],
  },
  {
    label: "Контент",
    items: [
      { name: "Журнал", href: "/admin/blog", icon: FileText },
      { name: "Фото главной", href: "/admin/homepage-media", icon: ImageIcon },
      { name: "Промо-блоки", href: "/admin/promotions", icon: BarChart3 },
      { name: "Галерея", href: "/admin/gallery", icon: ImageIcon },
    ],
  },
  {
    label: "Клиенты",
    items: [
      { name: "Сообщения", href: "/admin/messages", icon: Mail },
      { name: "Подписчики", href: "/admin/subscribers", icon: Mail },
      { name: "Настройки сайта", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    document.documentElement.lang = "ru";
  }, []);

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      navigate("/admin/login");
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const initials = useMemo(() => {
    const source = user?.username || user?.email || "Администратор";
    return source
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "А";
  }, [user]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
      window.location.assign("/admin/login");
    } catch (error: any) {
      toast.error(error?.message || "Не удалось выйти из системы");
    }
  };

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {sidebarOpen && (
        <button
          aria-label="Закрыть навигацию администратора"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-border bg-card transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-20 items-center gap-3 px-5">
          <SiteLogo
            
            alt="Trosheen Crafts"
            className="h-10 w-10 object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-semibold">Trosheen.Crafts</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Админ-панель
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Закрыть навигацию"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 px-3 py-5">
          <nav className="space-y-6">
            {navigationItems.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {section.label}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active =
                      location === item.href ||
                      (item.href !== "/admin" && location.startsWith(item.href + "/"));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="space-y-3 p-4">
          <Link
            href="/"
            className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Открыть магазин
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </Link>

          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user.username}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {t("admin.logout") || "Выйти"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть навигацию"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 font-serif font-semibold">Админ-панель</span>
        </div>

        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
