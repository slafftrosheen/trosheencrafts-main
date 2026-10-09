import { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Clock3, RefreshCw, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { useCartStore } from "@/lib/stores/cartStore";
import { apiClient } from "@/lib/apiClient";

interface OrderStatusResponse {
  status: string;
}

export default function OrderConfirmation() {
  const { t } = useLanguage();
  const clearCart = useCartStore((state) => state.clearCart);
  const params = new URLSearchParams(window.location.search);
  const orderId = Number(params.get("order_id"));
  const token = params.get("token") || "";
  const validRequest = Number.isSafeInteger(orderId) && orderId > 0 && /^[a-f0-9]{64}$/.test(token);

  const { data, isLoading, isError, refetch } = useQuery<OrderStatusResponse>({
    queryKey: ["checkout-status", orderId, token],
    queryFn: () => apiClient.get<OrderStatusResponse>("/checkout/status/" + orderId, { params: { token } }),
    enabled: validRequest,
    staleTime: 0,
    retry: 1,
    refetchInterval: (query) => query.state.data?.status === "pending" ? 5000 : false,
  });

  const paid = ["processing", "shipped", "delivered"].includes(data?.status || "");
  const needsReview = data?.status === "payment_review";
  const pending = validRequest && (isLoading || data?.status === "pending");

  useEffect(() => {
    // Never empty a real basket on an unverified URL or while payment is pending.
    if (paid) clearCart();
  }, [paid, clearCart]);

  const title = paid ? t("confirm.title")
    : pending ? t("confirm.pending_title")
    : needsReview ? t("confirm.review_title")
    : t("confirm.unverified_title");
  const description = paid ? t("confirm.subtitle")
    : pending ? t("confirm.pending_desc")
    : needsReview ? t("confirm.review_desc")
    : t("confirm.unverified_desc");

  return (
    <div className="site-container page-shell flex min-h-[70vh] items-center justify-center">
      <div className="max-w-2xl text-center" aria-live="polite">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
          {paid ? <CheckCircle2 className="h-8 w-8" /> : pending ? <Clock3 className="h-8 w-8" /> : <AlertTriangle className="h-8 w-8 text-destructive" />}
        </div>
        <h1 className="mt-7 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{description}</p>
        {validRequest && !isError && <p className="mt-3 text-sm text-muted-foreground">{t("confirm.order_number")} #{orderId}</p>}
        {paid && (
          <div className="surface-muted mx-auto mt-8 max-w-xl p-6">
            <p className="text-sm leading-7 text-muted-foreground">{t("confirm.desc")}</p>
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {validRequest && (!paid || isError) && (
            <Button size="lg" variant="outline" onClick={() => void refetch()}>
              <RefreshCw className="h-4 w-4" />{t("shop.retry")}
            </Button>
          )}
          <Button asChild size="lg">
            <Link href={paid ? "/shop" : "/cart"}>
              <ShoppingBag className="h-4 w-4" />
              {paid ? t("confirm.continue") : t("confirm.return_cart")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
