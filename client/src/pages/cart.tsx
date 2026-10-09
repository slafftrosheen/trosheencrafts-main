import { Link, useLocation } from "wouter";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cartStore";
import { LazyImage } from "@/components/shared/LazyImage";
import { useLanguage } from "@/lib/LanguageContext";

export default function CartPage() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  const { t } = useLanguage();
  const totalPrice = getTotalPrice();
  const hasStockIssue = items.some((item) => item.maxStock !== undefined && item.quantity > item.maxStock);

  if (items.length === 0) {
    return (
      <div className="site-container page-shell flex min-h-[65vh] items-center justify-center">
        <div className="surface max-w-xl px-8 py-14 text-center sm:px-12">
          <ShoppingBag className="mx-auto h-9 w-9 text-primary" />
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight">{t("cart.empty_title")}</h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{t("cart.empty_desc")}</p>
          <Button asChild className="mt-7">
            <Link href="/shop">
              {t("cart.start_exploring")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <div className="site-container">
        <p className="eyebrow">{t("cart.basket")}</p>
        <h1 className="display-title mt-4">
          {t("cart.your")} <span className="italic text-primary">{t("cart.basket")}</span>
        </h1>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          <div className="space-y-3">
            {items.map((item) => (
              <article
                key={String(item.id) + (item.variant || "")}
                className="grid grid-cols-[88px_1fr] gap-4 border-b border-border py-5 first:pt-0 sm:grid-cols-[112px_1fr]"
              >
                <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
                  <LazyImage src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>

                <div className="flex min-w-0 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-xl font-semibold sm:text-2xl">{item.name}</h2>
                      {item.variant && <p className="mt-1 text-xs text-muted-foreground">{item.variant}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id, item.variant)}
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                      aria-label={t("cart.remove_item")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        className="min-h-11 min-w-11 p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                        aria-label={t("product.decrease_quantity")}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        className="min-h-11 min-w-11 p-2.5 text-muted-foreground hover:text-foreground disabled:opacity-40"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                        aria-label={t("product.increase_quantity")}
                        disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="font-serif text-xl font-semibold">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="surface p-6 sm:p-7">
              <h2 className="font-serif text-2xl font-semibold">{t("cart.summary")}</h2>
              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                  <span className="font-semibold">€{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("cart.delivery")}</span>
                  <span className="font-semibold text-primary">{t("cart.free")}</span>
                </div>
              </div>
              <div className="mt-6 flex items-end justify-between border-t border-border pt-5">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {t("cart.total")}
                </span>
                <span className="font-serif text-3xl font-semibold">€{totalPrice.toFixed(2)}</span>
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{t("cart.stock_confirm")}</p>
              {hasStockIssue && <p className="mt-3 text-sm font-semibold text-destructive" role="alert">{t("cart.stock_issue")}</p>}
              <Button size="lg" className="mt-7 w-full" disabled={hasStockIssue} onClick={() => navigate("/checkout")}>
                {t("cart.checkout")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
