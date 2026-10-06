import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Clock3,
  Euro,
  Package,
  ОбновитьCw,
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

const euro = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "EUR",
});

const periods = [
  { value: "7d", label: "7 дней" },
  { value: "30d", label: "30 дней" },
  { value: "90d", label: "90 дней" },
  { value: "365d", label: "1 год" },
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
          <p className="text-sm font-medium text-muted-foreground">Показатели магазина</p>
          <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">Аналитика</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            В выручку входят только заказы в обработке, отправленные и доставленные. Ожидающие и отменённые заказы не учитываются.
          </p>
        </div>
        <Button variant="outline" onClick={refreshAll}>
          <ОбновитьCw className="mr-2 h-4 w-4" />
          Обновить
        </Button>
      </header>

      {error ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="font-semibold">Не удалось загрузить аналитику</p>
            <p className="text-sm text-muted-foreground">{(error as any)?.message || "Неизвестная ошибка аналитики"}</p>
            <Button onClick={refreshAll}>Повторить</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Учтённая выручка",
                value: stats ? euro.format(stats.totalRevenue) : "—",
                note: "Все оплаченные заказы на активных этапах",
                icon: Euro,
              },
              {
                label: "Заказы",
                value: stats?.totalOrders ?? "—",
                note: `${stats?.pendingOrders || 0} ожидают`,
                icon: ShoppingCart,
              },
              {
                label: "Товары",
                value: stats?.totalProducts ?? "—",
                note: `${(stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0)} требуют проверки остатков`,
                icon: Package,
              },
              {
                label: "Последние 7 дней",
                value: stats?.recentOrders ?? "—",
                note: "Создано заказов",
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
                <CardTitle className="font-serif text-2xl">Динамика продаж</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {euro.format(periodRevenue)} по {periodOrders} учтённым заказам за выбранный период.
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
                  Загрузка данных о продажах…
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
                        formatter={(value: any) => [euro.format(Number(value)), "Выручка"]}
                        labelFormatter={(label) => new Date(label).toLocaleDateString("ru-RU")}
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
                  За этот период учтённых продаж нет.
                </div>
              )}
            </CardContent>
          </Card>

          <section className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif text-2xl">Лидеры продаж</CardTitle>
                <Badge variant="secondary">{topProducts.length} показано</Badge>
              </CardHeader>
              <CardContent>
                {topProducts.length ? (
                  <div className="divide-y divide-border">
                    {topProducts.map((product, index) => (
                      <div key={product.productId} className="grid grid-cols-[32px_1fr_auto] items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <span className="text-sm font-semibold text-muted-foreground">{index + 1}</span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{product.productName}</p>
                          <p className="text-xs text-muted-foreground">{product.totalQuantity} продано</p>
                        </div>
                        <span className="text-sm font-semibold">{euro.format(product.totalRevenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-muted-foreground">Продаж товаров пока нет.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Операции</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href="/admin/orders"
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-sm font-semibold">Ожидающие заказы</span>
                    <span className="text-xs text-muted-foreground">Проверить очередь выполнения</span>
                  </span>
                  <strong>{stats?.pendingOrders || 0}</strong>
                </Link>
                <Link
                  href="/admin/inventory"
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-sm font-semibold">Предупреждения по остаткам</span>
                    <span className="text-xs text-muted-foreground">Мало на складе + отсутствующие товары</span>
                  </span>
                  <strong>{(stats?.lowStockProducts || 0) + (stats?.outOfStockProducts || 0)}</strong>
                </Link>
                <Link
                  href="/admin/messages"
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:bg-muted/50"
                >
                  <span>
                    <span className="block text-sm font-semibold">Непрочитанные сообщения</span>
                    <span className="text-xs text-muted-foreground">Обращения клиентов, ожидающие проверки</span>
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
