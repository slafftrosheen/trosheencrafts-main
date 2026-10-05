import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2, Package, Search } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";

interface Product {
  id: number;
  name: string;
  stock: number;
  category: string;
  price: number | string;
  published?: boolean;
}

export default function Inventory() {
  const queryClient = useQueryClient();
  const [stockUpdates, setStockUpdates] = useState<Record<number, number>>({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["inventory-products"],
    queryFn: () => apiClient.get<Product[]>("/products", { params: { limit: 100 } }),
    retry: 1,
  });

  const updateStockMutation = useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      apiClient.put("/products/" + id, { stock }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-dashboard"] });
      setStockUpdates((current) => {
        const next = { ...current };
        delete next[variables.id];
        return next;
      });
      toast.success("Stock updated");
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || "Failed to update stock");
    },
  });

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      if (filter === "attention" && !(product.stock < 5)) return false;
      if (filter === "out" && product.stock !== 0) return false;
      if (filter === "low" && !(product.stock > 0 && product.stock < 5)) return false;

      if (!term) return true;
      return [product.name, product.category].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [products, search, filter]);

  const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock < 5);
  const outOfStockProducts = products.filter((product) => product.stock === 0);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of stock", variant: "destructive" as const, icon: AlertCircle };
    if (stock < 5) return { label: "Low stock", variant: "secondary" as const, icon: AlertCircle };
    return { label: "In stock", variant: "default" as const, icon: CheckCircle };
  };

  const updateDraft = (id: number, value: string) => {
    const parsed = Number.parseInt(value, 10);
    setStockUpdates((current) => ({
      ...current,
      [id]: Number.isFinite(parsed) ? Math.max(parsed, 0) : 0,
    }));
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-muted-foreground">Catalogue availability</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">Inventory</h1>
        <p className="mt-2 text-muted-foreground">Monitor stock warnings and make quick quantity corrections.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Products", value: products.length, note: "Loaded from catalogue", icon: Package },
          { label: "Low stock", value: lowStockProducts.length, note: "1–4 units remaining", icon: AlertCircle },
          { label: "Out of stock", value: outOfStockProducts.length, note: "Unavailable to fulfill", icon: AlertCircle },
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
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search product or category"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="attention">Needs attention</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      {error ? (
        <Card className="p-8 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-destructive" />
          <p className="mt-3 font-semibold">Unable to load inventory</p>
          <p className="mt-1 text-sm text-muted-foreground">{(error as any)?.message}</p>
          <Button className="mt-4" onClick={() => refetch()}>Try again</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6">Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Current</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>New stock</TableHead>
                  <TableHead className="px-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleProducts.length ? (
                  visibleProducts.map((product) => {
                    const status = getStockStatus(product.stock);
                    const StatusIcon = status.icon;
                    const draft = stockUpdates[product.id] ?? product.stock;
                    const rowPending =
                      updateStockMutation.isPending &&
                      updateStockMutation.variables?.id === product.id;

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="px-6 font-medium">
                          {product.name}
                          {product.published === false && (
                            <Badge variant="outline" className="ml-2">Hidden</Badge>
                          )}
                        </TableCell>
                        <TableCell>{product.category || "—"}</TableCell>
                        <TableCell>€{Number(product.price).toFixed(2)}</TableCell>
                        <TableCell className="font-semibold">{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={draft}
                            onChange={(event) => updateDraft(product.id, event.target.value)}
                            className="h-9 w-24"
                          />
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <Button
                            size="sm"
                            onClick={() =>
                              updateStockMutation.mutate({
                                id: product.id,
                                stock: stockUpdates[product.id],
                              })
                            }
                            disabled={
                              stockUpdates[product.id] === undefined ||
                              stockUpdates[product.id] === product.stock ||
                              rowPending
                            }
                          >
                            {rowPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                      No products match this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      )}
    </div>
  );
}
