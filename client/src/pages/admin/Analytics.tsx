import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, DollarSign, Package, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useCurrentUser } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';

interface AnalyticsStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function Analytics() {
  const { data: user, isLoading: userLoading } = useCurrentUser();

  const { data: stats, isLoading, error, refetch } = useQuery<AnalyticsStats>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [products, orders] = await Promise.all([
        apiClient.get<any[]>('/products'),
        apiClient.get<any[]>('/orders').catch(() => []),
      ]);

      const ordersList = Array.isArray(orders) ? orders : [];
      // totalAmount is stored in cents, convert to euros for display
      const totalRevenue = ordersList.reduce(
        (sum: number, order: any) => sum + (parseFloat(order.totalAmount || '0') / 100),
        0
      );

      return {
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: ordersList.length,
        totalRevenue,
        pendingOrders: ordersList.filter((o: any) => o.status === 'pending').length,
      };
    },
    enabled: !!user && user.role === 'admin',
    retry: 2,
    retryDelay: 1000,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/40 p-8">
        <Card className="p-8 text-center rounded-[2.5rem] border-2 border-border/40">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Analytics</h2>
          <p className="text-muted-foreground mb-4">
            {(error as any)?.message || 'Failed to load analytics data'}
          </p>
          <Button onClick={() => refetch()} className="rounded-2xl">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">
            Analytics <span className="text-primary italic">Dashboard</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Monitor your store performance and key metrics
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-5 w-5 text-primary opacity-60" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-serif">
                  €{(stats?.totalRevenue ?? 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime revenue
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Orders
                </CardTitle>
                <ShoppingCart className="h-5 w-5 text-primary opacity-60" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-serif">
                  {stats?.totalOrders ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All time orders
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Products
                </CardTitle>
                <Package className="h-5 w-5 text-primary opacity-60" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-serif">
                  {stats?.totalProducts ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active products
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Orders
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-primary opacity-60" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-serif">
                  {stats?.pendingOrders ?? 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl p-8">
            <h3 className="font-serif text-2xl font-bold mb-4">Revenue Overview</h3>
            <p className="text-muted-foreground">
              Track your revenue trends and identify growth opportunities. 
              Detailed charts and graphs coming soon.
            </p>
          </Card>

          <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl p-8">
            <h3 className="font-serif text-2xl font-bold mb-4">Top Products</h3>
            <p className="text-muted-foreground">
              View your best-selling products and inventory insights.
              Product performance metrics coming soon.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
