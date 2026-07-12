import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, CheckCircle, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useCurrentUser } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

interface Product {
  id: number;
  name: string;
  stock: number;
  category: string;
  price: number | string;
}

export default function Inventory() {
  const [stockUpdates, setStockUpdates] = useState<Record<number, number>>({});
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
    }
  }, [user, userLoading, navigate]);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-products'],
    queryFn: async () => {
      return apiClient.get<Product[]>('/products');
    },
    enabled: !!user && user.role === 'admin',
    retry: 2,
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: number; stock: number }) => {
      return apiClient.put(`/products/${id}`, { stock });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockUpdates({});
      toast.success('Stock updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update stock');
    },
  });

  const handleStockChange = (id: number, value: string) => {
    const parsed = parseInt(value, 10);
    const stock = isNaN(parsed) ? 0 : parsed;
    setStockUpdates(prev => ({ ...prev, [id]: stock }));
  };

  const handleUpdateStock = (id: number) => {
    const newStock = stockUpdates[id];
    if (newStock !== undefined) {
      updateStockMutation.mutate({ id, stock: newStock });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { label: 'Out of Stock', variant: 'destructive' as const, icon: AlertCircle };
    } else if (stock < 5) {
      return { label: 'Low Stock', variant: 'secondary' as const, icon: AlertCircle };
    }
    return { label: 'In Stock', variant: 'default' as const, icon: CheckCircle };
  };

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

  const productsList = products || [];
  const lowStockProducts = productsList.filter(p => p.stock < 5 && p.stock > 0);
  const outOfStockProducts = productsList.filter(p => p.stock === 0);

  if (error) {
    return (
      <div className="min-h-screen bg-muted/40 p-8">
        <Card className="p-8 text-center rounded-[2.5rem] border-2 border-border/40">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Inventory</h2>
          <p className="text-muted-foreground mb-4">
            {(error as any)?.message || 'Failed to load inventory data'}
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
            Inventory <span className="text-primary italic">Management</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Monitor and update product stock levels
          </p>
        </header>

        {/* Stock Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-5 w-5 text-primary opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif">{productsList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">In catalog</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Low Stock
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-yellow-500 opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-yellow-600">
                {lowStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Need attention</p>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-2 border-border/40 bg-card/40 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Out of Stock
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-red-500 opacity-60" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-serif text-red-600">
                {outOfStockProducts.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Unavailable</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card className="rounded-[2.5rem] border-2 border-border/40 overflow-hidden bg-card/40 shadow-xl">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6">Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Update Stock</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  productsList.map((product) => {
                    const status = getStockStatus(product.stock);
                    const StatusIcon = status.icon;
                    const currentStock = stockUpdates[product.id] ?? product.stock;

                    return (
                      <TableRow key={product.id} className="hover:bg-muted/30">
                        <TableCell className="px-6 font-medium">{product.name}</TableCell>
                        <TableCell>{product.category || '-'}</TableCell>
                        <TableCell>€{(Number(product.price) / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className="font-semibold">{product.stock}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={status.variant}
                            className={cn(
                              "flex items-center gap-1 w-fit",
                              status.variant === 'secondary' && "bg-yellow-100 text-yellow-700 border-yellow-200"
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => handleStockChange(product.id, e.target.value)}
                            className="w-20 h-9 rounded-xl"
                          />
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button
                            size="sm"
                            className="rounded-xl"
                            onClick={() => handleUpdateStock(product.id)}
                            disabled={
                              stockUpdates[product.id] === undefined ||
                              stockUpdates[product.id] === product.stock ||
                              updateStockMutation.isPending
                            }
                          >
                            {updateStockMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Update'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
