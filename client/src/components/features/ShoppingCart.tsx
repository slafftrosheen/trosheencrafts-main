import { useState } from "react";
import { Link } from "wouter";
import { ShoppingCart, X, Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cartStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLanguage } from "@/lib/LanguageContext";

export function ShoppingCartComponent() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCartStore();
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("cart.basket") || "Basket"}>
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </Button>
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
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
              </div>
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
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <img
                      src={item.image || "/placeholder.webp"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
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
                        className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"
                        onClick={() => removeItem(item.id, item.variant)}
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          className="p-2 text-muted-foreground hover:text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2 text-muted-foreground hover:text-foreground"
                          onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                          aria-label="Increase quantity"
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
            <Button className="w-full" size="lg" asChild onClick={() => setOpen(false)}>
              <Link href="/checkout">{t("cart.checkout")}</Link>
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => setOpen(false)}
            >
              {t("nav_shop")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
