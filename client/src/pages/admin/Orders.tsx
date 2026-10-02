import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Mail, MapPin, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
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
import { Spinner } from "@/components/shared/LoadingStates";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";

const statusColors = {
  pending: "secondary",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
} as const;

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"] as const;

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["admin-orders"],
    queryFn: () => apiClient.get<any[]>("/orders"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch("/orders/" + id + "/status", { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
      toast.success("Order status updated");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Unable to update order status");
    },
  });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl font-semibold tracking-tight">{t("admin.orders_title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("admin.orders_subtitle")}</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : orders.length > 0 ? (
        <Card className="overflow-hidden border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-6">{t("admin.order_id")}</TableHead>
                <TableHead>{t("admin.customer")}</TableHead>
                <TableHead>{t("admin.total")}</TableHead>
                <TableHead>{t("admin.status")}</TableHead>
                <TableHead className="px-6 text-right">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="px-6 font-mono text-xs font-semibold text-primary">
                    #{order.id}
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{order.shippingAddress?.name || "Guest"}</div>
                    <div className="mt-1 flex flex-col gap-1 text-xs text-muted-foreground">
                      {order.shippingAddress?.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          {order.shippingAddress.email}
                        </span>
                      )}
                      {order.shippingAddress?.country && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" />
                          {order.shippingAddress.country}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-serif text-lg font-semibold">
                    €{Number(order.totalAmount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusColors[order.status as keyof typeof statusColors] || "default"}
                      className="capitalize"
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <Select
                      value={order.status}
                      onValueChange={(status) => statusMutation.mutate({ id: order.id, status })}
                      disabled={statusMutation.isPending}
                    >
                      <SelectTrigger className="ml-auto w-[150px] rounded-full">
                        {statusMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <SelectValue />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="surface-muted py-20 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-5 font-serif text-2xl font-semibold text-muted-foreground">
            {t("admin.no_orders")}
          </h3>
        </div>
      )}
    </div>
  );
}
