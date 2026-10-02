import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Euro, Package, Clock3, AlertCircle, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useCurrentUser } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";

interface AnalyticsStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function Analytics() {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const { data: stats, isLoading, error, refetch } = useQuery<AnalyticsStats>({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        apiClient.get<any[]>("/products"),
        apiClient.get<any[]>("/orders").catch(() => []),
      ]);

      const ordersList = Array.isArray(orders) ? orders : [];
      const revenueStatuses = new Set(["processing", "shipped", "delivered"]);
      const totalRevenue = ordersList
        .filter((order: any) => revenueStatuses.has(order.status))
        .reduce((sum: number, order: any) => sum + Number(order.totalAmount || 0), 0);

      return {
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: ordersList.length,
        totalRevenue,
        pendingOrders: ordersList.filter((order: any) => order.status === "pending").length,
      };
    },
    enabled: !!user && user.role === "admin",
    retry: 2,
    retryDelay: 1000,
  });

  if (userLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Error loading analytics</h2>
        <p className="mt-2 text-muted-foreground">
          {(error as any)?.message || "Failed to load analytics data"}
        </p>
        <Button onClick={() => refetch()} className="mt-5">
          Try again
        </Button>
      </Card>
    );
  }

  const metrics = [
    { label: "Paid revenue", value: "€" + (stats?.totalRevenue ?? 0).toFixed(2), note: "Processing + fulfilled", Icon: Euro },
    { label: "Total orders", value: String(stats?.totalOrders ?? 0), note: "All orders", Icon: ShoppingCart },
    { label: "Products", value: String(stats?.totalProducts ?? 0), note: "Catalogue entries", Icon: Package },
    { label: "Pending", value: String(stats?.pendingOrders ?? 0), note: "Awaiting payment/update", Icon: Clock3 },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          Analytics <span className="italic text-primary">overview</span>
        </h1>
        <p className="mt-2 text-muted-foreground">A concise operational view of the shop.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, note, Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="font-serif text-3xl font-semibold">{value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{note}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
