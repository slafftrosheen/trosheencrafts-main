import { useEffect } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { useCartStore } from "@/lib/stores/cartStore";

export default function OrderConfirmation() {
  const { t } = useLanguage();
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order_id")) {
      clearCart();
    }
  }, [clearCart]);

  return (
    <div className="site-container page-shell flex min-h-[70vh] items-center justify-center">
      <div className="max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-7 font-serif text-5xl font-semibold tracking-tight sm:text-6xl">
          {t("confirm.title")}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {t("confirm.subtitle")}
        </p>
        <div className="surface-muted mx-auto mt-8 max-w-xl p-6">
          <p className="text-sm leading-7 text-muted-foreground">{t("confirm.desc")}</p>
        </div>
        <Button asChild size="lg" className="mt-8">
          <Link href="/shop">
            <ShoppingBag className="h-4 w-4" />
            {t("confirm.continue")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
