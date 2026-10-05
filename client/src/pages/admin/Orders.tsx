import { Fragment, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Clipboard,
  Loader2,
  Mail,
  MapPin,
  Search,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Spinner } from "@/components/shared/LoadingStates";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number | string;
  productName: string | null;
  productSlug: string | null;
}

interface AdminOrder {
  id: number;
  totalAmount: number | string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  paymentMethodId?: string | null;
  shippingAddress?: {
    name?: string;
    email?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  items?: OrderItem[];
}

const statusVariants: Record<OrderStatus, "secondary" | "default" | "destructive" | "outline"> = {
  pending: "secondary",
  processing: "default",
  shipped: "outline",
  delivered: "default",
  cancelled: "destructive",
};

const statuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];
const revenueStatuses = new Set<OrderStatus>(["processing", "shipped", "delivered"]);
const euro = new Intl.NumberFormat("en", { style: "currency", currency: "EUR" });

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const { data: orders = [], isLoading, error, refetch } = useQuery<AdminOrder[]>({
    queryKey: ["admin-orders"],
    queryFn: () => apiClient.get<AdminOrder[]>("/orders"),
    retry: 1,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      apiClient.patch("/orders/" + id + "/status", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-sales"] });
      toast.success("Order status updated");
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || "Unable to update order status");
    },
  });

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!term) return true;

      const haystack = [
        String(order.id),
        order.shippingAddress?.name,
        order.shippingAddress?.email,
        order.shippingAddress?.city,
        order.shippingAddress?.country,
        ...(order.items || []).map((item) => item.productName || ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [orders, search, statusFilter]);

  const recognizedRevenue = orders
    .filter((order) => revenueStatuses.has(order.status))
    .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

  const pendingCount = orders.filter((order) => order.status === "pending").length;
  const activeCount = orders.filter((order) => ["processing", "shipped"].includes(order.status)).length;
  const deliveredCount = orders.filter((order) => order.status === "delivered").length;

  const formatAddress = (order: AdminOrder) => {
    const address = order.shippingAddress;
    return [address?.street, [address?.postalCode, address?.city].filter(Boolean).join(" "), address?.country]
      .filter(Boolean)
      .join(", ");
  };

  const copyAddress = async (order: AdminOrder) => {
    const value = formatAddress(order);
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.success("Delivery address copied");
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-muted-foreground">Fulfillment queue</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">{t("admin.orders_title")}</h1>
        <p className="mt-2 text-muted-foreground">
          Review customer details, order contents and fulfillment state from one place.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Pending", value: pendingCount, note: "Needs review" },
          { label: "In fulfillment", value: activeCount, note: "Processing + shipped" },
          { label: "Delivered", value: deliveredCount, note: "Completed fulfillment" },
          { label: "Recognized revenue", value: euro.format(recognizedRevenue), note: "Excludes pending/cancelled" },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-semibold">{metric.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer, email, location or product"
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[190px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()}>Refresh</Button>
      </div>

      {error ? (
        <Card className="p-8 text-center">
          <p className="font-semibold">Unable to load orders</p>
          <p className="mt-1 text-sm text-muted-foreground">{(error as any)?.message}</p>
          <Button className="mt-4" onClick={() => refetch()}>Try again</Button>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : filteredOrders.length > 0 ? (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-6">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const rowPending = statusMutation.isPending && statusMutation.variables?.id === order.id;
                const expanded = expandedOrderId === order.id;

                return (
                  <Fragment key={order.id}>
                    <TableRow>
                      <TableCell className="px-6">
                        <div className="font-mono text-xs font-semibold text-primary">#{order.id}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {order.items?.length || 0} line item{order.items?.length === 1 ? "" : "s"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">{order.shippingAddress?.name || "Guest"}</div>
                        <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                          {order.shippingAddress?.email && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="h-3 w-3" />
                              {order.shippingAddress.email}
                            </span>
                          )}
                          {(order.shippingAddress?.city || order.shippingAddress?.country) && (
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />
                              {[order.shippingAddress.city, order.shippingAddress.country].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-serif text-lg font-semibold">
                        {euro.format(Number(order.totalAmount || 0))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[order.status]} className="capitalize">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <div className="flex justify-end gap-2">
                          <Select
                            value={order.status}
                            onValueChange={(status) =>
                              statusMutation.mutate({ id: order.id, status: status as OrderStatus })
                            }
                            disabled={rowPending}
                          >
                            <SelectTrigger className="w-[145px]">
                              {rowPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SelectValue />}
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((status) => (
                                <SelectItem key={status} value={status} className="capitalize">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setExpandedOrderId(expanded ? null : order.id)}
                            aria-label={expanded ? "Collapse order" : "Expand order"}
                          >
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expanded && (
                      <TableRow className="bg-muted/20">
                        <TableCell colSpan={6} className="px-6 py-5">
                          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div>
                              <h3 className="text-sm font-semibold">Order contents</h3>
                              <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-background">
                                {(order.items || []).length ? (
                                  order.items!.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between gap-4 p-3">
                                      <div>
                                        <p className="text-sm font-medium">{item.productName || "Product"}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Qty {item.quantity} × {euro.format(Number(item.price || 0))}
                                        </p>
                                      </div>
                                      <span className="text-sm font-semibold">
                                        {euro.format(Number(item.price || 0) * item.quantity)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="p-4 text-sm text-muted-foreground">No line items returned for this order.</p>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm font-semibold">Delivery</h3>
                              <div className="mt-3 rounded-xl border border-border bg-background p-4">
                                <p className="font-medium">{order.shippingAddress?.name || "Guest"}</p>
                                <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                                  {formatAddress(order) || "No delivery address stored"}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {formatAddress(order) && (
                                    <Button size="sm" variant="outline" onClick={() => copyAddress(order)}>
                                      <Clipboard className="mr-2 h-3.5 w-3.5" />
                                      Copy address
                                    </Button>
                                  )}
                                  {order.shippingAddress?.email && (
                                    <a href={`mailto:${order.shippingAddress.email}?subject=Order%20%23${order.id}%20%E2%80%94%20Trosheen.Crafts`}>
                                      <Button size="sm" variant="outline">
                                        <Mail className="mr-2 h-3.5 w-3.5" />
                                        Email customer
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-5 font-serif text-2xl font-semibold">No matching orders</h3>
          <p className="mt-1 text-sm text-muted-foreground">Try another search or status filter.</p>
        </div>
      )}
    </div>
  );
}
