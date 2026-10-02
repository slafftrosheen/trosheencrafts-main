import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle, Package, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { useCurrentUser } from "@/hooks/useApi";
import { cn } from "@/lib/utils";

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
    if (!userLoading && (!user || user.role !== "admin")) {
      navigate("/admin/login");
    }
  }, [user, userLoading, navigate]);

  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ["inventory-products"],
    queryFn: async () => apiClient.get<Product[]>("/products"),
    enabled: !!user && user.role === "admin",
    retry: 2,
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, stock }: { id: number; stock: number }) =>
      apiClient.put("/products/" + id, { stock }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setStockUpdates({});
      toast.success("Stock updated successfully");
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || "Failed to update stock");
    },
  });

  const handleStockChange = (id: number, value: string) => {
    const parsed = parseInt(value, 10);
    setStockUpdates((previous) => ({ ...previous, [id]: Number.isNaN(parsed) ? 0 : parsed }));
  };

  const handleUpdateStock = (id: number) => {
    const stock = stockUpdates[id];
    if (stock !== undefined) {
      updateStockMutation.mutate({ id, stock });
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const, icon: AlertCircle };
    if (stock < 5) return { label: "Low Stock", variant: "secondary" as const, icon: AlertCircle };
    return { label: "In Stock", variant: "default" as const, icon: CheckCircle };
  };

  if (userLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const productsList = products || [];
  const lowStockProducts = productsList.filter((product) => product.stock < 5 && product.stock > 0);
  const outOfStockProducts = productsList.filter((product) => product.stock === 0);

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Error loading inventory</h2>
        <p className="mt-2 text-muted-foreground">{(error as any)?.message || "Failed to load inventory data"}</p>
        <Button onClick={() => refetch()} className="mt-5">Try again</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          Inventory <span className="italic text-primary">Management</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Monitor and update product stock levels</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Products", value: productsList.length, note: "In catalogue", icon: Package },
          { label: "Low Stock", value: lowStockProducts.length, note: "Need attention", icon: AlertCircle },
          { label: "Out of Stock", value: outOfStockProducts.length, note: "Unavailable", icon: AlertCircle },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="font-serif text-3xl font-semibold">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
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
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No products found</TableCell>
                </TableRow>
              ) : (
                productsList.map((product) => {
                  const status = getStockStatus(product.stock);
                  const StatusIcon = status.icon;
                  const currentStock = stockUpdates[product.id] ?? product.stock;

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="px-6 font-medium">{product.name}</TableCell>
                      <TableCell>{product.category || "-"}</TableCell>
                      <TableCell>€{Number(product.price).toFixed(2)}</TableCell>
                      <TableCell className="font-semibold">{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant={status.variant}
                          className={cn(
                            "flex w-fit items-center gap-1",
                            status.variant === "secondary" && "bg-amber-100 text-amber-800"
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
                          onChange={(event) => handleStockChange(product.id, event.target.value)}
                          className="h-9 w-20 rounded-xl"
                        />
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        <Button
                          size="sm"
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
                            "Update"
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
  );
}
