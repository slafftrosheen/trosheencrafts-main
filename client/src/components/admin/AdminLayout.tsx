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
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";
import { BrandAssets } from "@/lib/imageAssets";
import { useCurrentUser } from "@/hooks/useApi";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
      { name: "Products", href: "/admin/products", icon: Package },
      { name: "Inventory", href: "/admin/inventory", icon: Package },
      { name: "Constructor", href: "/admin/constructor", icon: Palette },
      { name: "Categories", href: "/admin/categories", icon: Tag },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Journal", href: "/admin/blog", icon: FileText },
      { name: "Promotions", href: "/admin/promotions", icon: BarChart3 },
      { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    ],
  },
  {
    label: "Audience",
    items: [
      { name: "Inbox", href: "/admin/messages", icon: Mail },
      { name: "Subscribers", href: "/admin/subscribers", icon: Mail },
      { name: "Site settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      navigate("/admin/login");
    }
  }, [user, userLoading, navigate]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

  const initials = useMemo(() => {
    const source = user?.username || user?.email || "Admin";
    return source
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";
  }, [user]);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout");
      window.location.assign("/admin/login");
    } catch (error: any) {
      toast.error(error?.message || "Unable to sign out");
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
          aria-label="Close admin navigation"
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
          <img
            src={BrandAssets.logo}
            alt="Trosheen Crafts"
            className="h-10 w-10 object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-semibold">Trosheen.Crafts</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Workshop admin
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
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
            View storefront
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
            {t("admin.logout") || "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="lg:pl-[264px]">
        <div className="sticky top-0 z-30 flex h-16 items-center border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-3 font-serif font-semibold">Workshop admin</span>
        </div>

        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8 xl:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
