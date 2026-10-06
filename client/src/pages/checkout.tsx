import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/stores/cartStore";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";
import { LazyImage } from "@/components/shared/LazyImage";

const checkoutSchema = z.object({
  email: z.string().email("Valid email is required"),
  name: z.string().min(2, "Full name is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  postalCode: z.string().min(3, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, getTotalPrice } = useCartStore();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const totalPrice = getTotalPrice();

  useEffect(() => {
    if (items.length === 0) {
      navigate("/shop");
    }
  }, [items.length, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true);
      const response: any = await apiClient.post("/checkout/create-session", {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          variant: item.variant,
          customConfiguration: item.customConfiguration,
        })),
        shippingAddress: data,
        email: data.email,
      });

      if (!response.sessionUrl) {
        throw new Error("Failed to create checkout session");
      }

      window.location.assign(response.sessionUrl);
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  const fieldClass = "h-12 rounded-xl border-border bg-card px-4";

  return (
    <div className="page-shell">
      <div className="site-container">
        <Link
          href="/cart"
          className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("cart.basket")}
        </Link>
        <p className="eyebrow">{t("checkout.title")}</p>
        <h1 className="display-title mt-4">{t("checkout.title")}</h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14">
          <section className="surface p-6 sm:p-8 md:p-10">
            <h2 className="font-serif text-3xl font-semibold">{t("checkout.shipping.title")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t("checkout.shipping.desc")}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label>{t("checkout.shipping.email")}</Label>
                <Input {...register("email")} className={fieldClass} disabled={loading} autoComplete="email" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t("checkout.shipping.name")}</Label>
                <Input {...register("name")} className={fieldClass} disabled={loading} autoComplete="name" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t("checkout.shipping.street")}</Label>
                <Input {...register("street")} className={fieldClass} disabled={loading} autoComplete="street-address" />
                {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("checkout.shipping.city")}</Label>
                  <Input {...register("city")} className={fieldClass} disabled={loading} autoComplete="address-level2" />
                  {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{t("checkout.shipping.postal")}</Label>
                  <Input {...register("postalCode")} className={fieldClass} disabled={loading} autoComplete="postal-code" />
                  {errors.postalCode && <p className="text-xs text-destructive">{errors.postalCode.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("checkout.shipping.country")}</Label>
                <Input {...register("country")} className={fieldClass} disabled={loading} autoComplete="country-name" />
                {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    {t("cart.checkout")} · €{totalPrice.toFixed(2)}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {t("checkout.payment.secure")}
              </div>
            </form>
          </section>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="surface p-6 sm:p-7">
              <h2 className="font-serif text-2xl font-semibold">{t("checkout.summary.title")}</h2>
              <div className="mt-6 space-y-5">
                {items.map((item) => (
                  <div key={String(item.id) + (item.variant || "")} className="flex items-center gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <LazyImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("checkout.summary.qty")}: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <div className="flex items-end justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    {t("checkout.summary.total")}
                  </span>
                  <span className="font-serif text-3xl font-semibold">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
