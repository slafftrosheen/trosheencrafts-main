import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock3,
  Euro,
  Package,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/apiClient";

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

interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}

interface TopProduct {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

const euro = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "EUR",
});

const periods = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "365d", label: "1 year" },
];

export default function Analytics() {
  const [period, setPeriod] = useState("30d");

  const dashboardQuery = useQuery({
    queryKey: ["admin-analytics-dashboard"],
    queryFn: () => apiClient.get<DashboardStats>("/analytics/dashboard"),
    retry: 1,
  });

  const salesQuery = useQuery({
    queryKey: ["admin-analytics-sales", period],
    queryFn: () => apiClient.get<SalesPoint[]>("/analytics/sales", { params: { period } }),
    retry: 1,
  });

  const topProductsQuery = useQuery({
    queryKey: ["admin-analytics-top-products"],
    queryFn: () => apiClient.get<TopProduct[]>("/analytics/top-products", { params: { limit: 8 } }),
    retry: 1,
  });

  const stats = dashboardQuery.data;
  const sales = salesQuery.data || [];
  const topProducts = topProductsQuery.data || [];
  const loading = dashboardQuery.isLoading || salesQuery.isLoading || topProductsQuery.isLoading;
  const error = dashboardQuery.error || salesQuery.error || topProductsQuery.error;

  const periodRevenue = sales.reduce((sum, point) => sum + Number(point.revenue || 0), 0);
  const periodOrders = sales.reduce((sum, point) => sum + Number(point.orders || 0), 0);

  const refreshAll = () => {
    dashboardQuery.refetch();
    salesQuery.refetch();
    topProductsQuery.refetch();
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Commerce performance</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Revenue only includes processing, shipped and delivered orders. Pending and cancelled orders are excluded.
          </p>
        </div>
        <Button variant="outline" onClick={refreshAll}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </header>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="font-semibold">Analytics could not be loaded</p>
            <p className="text-sm text-muted-foreground">{(error as any)?.message || "Unknown analytics error"}</p>
            <Button onClick={refreshAll}>Try again</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Recognized revenue",
                value: stats ? euro.format(stats.totalRevenue) : "—",
                note: "All paid lifecycle orders",
                icon: Euro,
              },
              {
                label: "Orders",
                value: stats?.totalOrders ?? "—",
                note: `${stats?.pendingOrders || 0} pending`,
                icon: ShoppingCart,
              },
              {
                label: "Products",
                value: stats?.totalProducts ?? "—",
                note: `${(stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0)} need stock attention`,
                icon: Package,
              },
              {
                label: "Last 7 days",
                value: stats?.recentOrders ?? "—",
                note: "Orders created",
                icon: Clock3,
              },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.label}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                    <Icon className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="font-serif text-3xl font-semibold">{loading ? "…" : metric.value}</div>
                    <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
                  </CardContent>
                </Card>
              );
            })}
          </section>

          <Card>
            <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="font-serif text-2xl">Sales trend</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {euro.format(periodRevenue)} across {periodOrders} recognized orders in this period.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {periods.map((item) => (
                  <Button
                    key={item.value}
                    size="sm"
                    variant={period === item.value ? "default" : "outline"}
                    onClick={() => setPeriod(item.value)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {salesQuery.isLoading ? (
                <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                  Loading sales data…
                </div>
              ) : sales.length ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sales} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        minTickGap={24}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip
                        formatter={(value: number) => [euro.format(Number(value)), "Revenue"]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#adminRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                  No recognized sales in this period.
                </div>
              )}
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif text-2xl">Top products</CardTitle>
                <Badge variant="secondary">{topProducts.length} shown</Badge>
              </CardHeader>
              <CardContent>
                {topProducts.length ? (
                  <div className="divide-y divide-border">
                    {topProducts.map((product, index) => (
                      <div key={product.productId} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{product.productName}</p>
                          <p className="text-xs text-muted-foreground">{product.totalQuantity} units sold</p>
                        </div>
                        <span className="text-sm font-semibold">{euro.format(product.totalRevenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">No product sales yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Operations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-sm font-semibold">Pending orders</span>
                    <span className="text-xs text-muted-foreground">Review fulfillment queue</span>
                  </span>
                  <strong>{stats?.pendingOrders || 0}</strong>
                </Link>
                <Link
                  href="/admin/inventory"
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-sm font-semibold">Stock warnings</span>
                    <span className="text-xs text-muted-foreground">Low + unavailable products</span>
                  </span>
                  <strong>{(stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0)}</strong>
                </Link>
                <Link
                  href="/admin/messages"
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-sm font-semibold">Unread messages</span>
                    <span className="text-xs text-muted-foreground">Customer requests awaiting review</span>
                  </span>
                  <strong>{stats?.unreadMessages || 0}</strong>
                </Link>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
