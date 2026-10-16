import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/lib/LanguageContext";
import { BrandMotion } from "@/components/shared/BrandMotion";

export function ShoppingCartComponent() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const hasStockIssue = items.some(item => item.maxStock !== undefined && item.quantity > item.maxStock);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="icon-btn" aria-label={t("v4.nav.cart")}>
          <img src="/brand/icons/bag.svg" alt="" />
          <span className={cn("badge", totalItems > 0 && "is-on")} data-cart-count>
            {totalItems}
          </span>
        </button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col border-l border-border bg-background p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-6 py-5">
          <SheetTitle className="flex items-center gap-2 font-serif text-2xl font-semibold">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {t("cart.basket") || "Your basket"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
              <BrandMotion name="empty" mode="loop" className="mb-5 h-28 w-28" poster="/brand/icons/bag.svg" />
              <h3 className="font-serif text-2xl font-semibold">{t("cart.empty_title")}</h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t("cart.empty_desc")}
              </p>
              <Button className="mt-7" asChild onClick={() => setOpen(false)}>
                <Link href="/shop">{t("cart.start_exploring")}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={String(item.id) + (item.variant || "")} className="flex gap-4 border-b border-border pb-6 last:border-0">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-muted">
                    {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> :
                      <img src="/brand/icons/candle.svg" alt="" className="h-10 w-10 opacity-60" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-2 text-sm font-semibold">{item.name}</h3>
                        {item.variant && (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.variant}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                        onClick={() => removeItem(item.id, item.variant)}
                        aria-label={t("cart.remove_item")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                          aria-label={t("product.decrease_quantity")}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                          disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
                          aria-label={t("product.increase_quantity")}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-serif text-lg font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border bg-card px-6 py-6">
            <div className="mb-5 flex items-end justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {t("cart.subtotal")}
              </span>
              <span className="font-serif text-3xl font-semibold">€{totalPrice.toFixed(2)}</span>
            </div>
            {hasStockIssue && <p className="mb-3 text-sm text-destructive" role="alert">{t("cart.stock_issue")}</p>}
            <Button className="w-full" size="lg" disabled={hasStockIssue} onClick={() => { setOpen(false); navigate("/checkout"); }}>
              {t("cart.checkout")}
            </Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={() => { setOpen(false); navigate("/shop"); }}>
              {t("cart.continue_shopping")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
