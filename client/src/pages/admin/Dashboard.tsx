import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Euro,
  Inbox,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/apiClient";
import { useCurrentUser } from "@/hooks/useApi";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  unreadMessages: number;
  recentOrders: number;
}

interface ActivityItem {
  id: string;
  entityId: number;
  type: "order" | "message";
  description: string;
  amount?: number;
  status?: string;
  createdAt: string;
}

const euro = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "EUR",
});

export default function AdminDashboard() {
  const { data: user } = useCurrentUser();

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: async () => {
      const [stats, activity] = await Promise.all([
        apiClient.get<DashboardStats>("/analytics/dashboard"),
        apiClient.get<ActivityItem[]>("/analytics/recent-activity"),
      ]);
      return { stats, activity };
    },
    retry: 1,
  });

  const stats = data?.stats;

  const attention = [
    {
      label: "Pending orders",
      count: stats?.pendingOrders || 0,
      href: "/admin/orders",
      note: "Orders waiting for review or payment confirmation",
    },
    {
      label: "Low / out of stock",
      count: (stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0),
      href: "/admin/inventory",
      note: "Catalogue items that need stock attention",
    },
    {
      label: "Unread messages",
      count: stats?.unreadMessages || 0,
      href: "/admin/messages",
      note: "Customer and withdrawal requests waiting for review",
    },
  ];

  const quickActions = [
    { label: "Manage orders", href: "/admin/orders" },
    { label: "Add or edit products", href: "/admin/products" },
    { label: "Update homepage promotions", href: "/admin/promotions" },
    { label: "Edit site settings", href: "/admin/settings" },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {user?.username ? `Signed in as ${user.username}` : "Workshop operations"}
          </p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Admin overview
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Orders, stock, messages and content that need attention right now.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </header>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div>
              <p className="font-semibold">Could not load admin overview</p>
              <p className="text-sm text-muted-foreground">
                {(error as any)?.message || "The admin API did not respond."}
              </p>
            </div>
            <Button onClick={() => refetch()}>Try again</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Recognized revenue",
                value: stats ? euro.format(stats.totalRevenue) : "—",
                note: "Processing, shipped and delivered",
                icon: Euro,
              },
              {
                label: "All orders",
                value: stats?.totalOrders ?? "—",
                note: `${stats?.recentOrders || 0} created in the last 7 days`,
                icon: ShoppingCart,
              },
              {
                label: "Products",
                value: stats?.totalProducts ?? "—",
                note: `${stats?.outOfStockProducts || 0} currently out of stock`,
                icon: Package,
              },
              {
                label: "Open customer work",
                value: (stats?.pendingOrders || 0) + (stats?.unreadMessages || 0),
                note: "Pending orders + unread messages",
                icon: TrendingUp,
              },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="font-serif text-3xl font-semibold">
                      {isLoading ? "…" : metric.value}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Needs attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {attention.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-semibold">
                      {item.count}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.label}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.note}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {quickActions.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted/50"
                  >
                    {action.label}
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-serif text-2xl">Recent activity</CardTitle>
              <Badge variant="secondary">{data?.activity?.length || 0} events</Badge>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-sm text-muted-foreground">Loading recent activity…</div>
              ) : data?.activity?.length ? (
                <div className="divide-y divide-border">
                  {data.activity.map((item) => (
                    <Link
                      key={item.id}
                      href={item.type === "order" ? "/admin/orders" : "/admin/messages"}
                      className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="rounded-lg bg-muted p-2">
                        {item.type === "order" ? (
                          <ShoppingCart className="h-4 w-4" />
                        ) : (
                          <Inbox className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.description}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {typeof item.amount === "number" && (
                        <span className="text-sm font-semibold">{euro.format(item.amount)}</span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No recent activity yet.
                </p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
