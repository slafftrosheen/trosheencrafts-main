import { useState } from 'react';
import { Link } from 'wouter';
import { ShoppingCart, X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cartStore';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export function ShoppingCartComponent() {
  const { items, updateQuantity, removeItem, totalPrice } = useCartStore();
  const [open, setOpen] = useState(false);
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-12 w-12 rounded-2xl hover:bg-primary/5 transition-all group"
        >
          <ShoppingCart className="h-6 w-6 transition-transform group-hover:scale-110" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-lg border-2 border-background">
              {totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md rounded-l-[3rem] border-l-2 border-border/40 p-0 overflow-hidden flex flex-col">
        <SheetHeader className="p-8 border-b border-border/40 bg-muted/20">
          <SheetTitle className="font-serif text-3xl font-bold flex items-center gap-3">
            <ShoppingBag className="text-primary" /> Your Basket
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-serif font-bold mb-2">Basket is empty</h3>
              <p className="text-muted-foreground mb-8">Discover our latest handcrafted artefacts.</p>
              <Button onClick={() => setOpen(false)} className="rounded-xl px-8" asChild>
                <Link href="/shop">Start Exploring</Link>
              </Button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-center gap-6 group">
                <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden border-2 border-border/40 shrink-0">
                  <img
                    src={item.image || '/placeholder.webp'}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate mb-1">{item.name}</h3>
                  <p className="font-serif font-bold text-primary">
                    €{(item.price / 100).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 border border-border/40">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md"
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.variant)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md"
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.variant)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id, item.variant)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-8 border-t border-border/40 bg-muted/20 space-y-6">
            <div className="flex justify-between items-end">
              <span className="font-black uppercase tracking-[0.2em] text-xs text-muted-foreground">Subtotal</span>
              <span className="font-serif text-3xl font-bold">€{(totalPrice / 100).toFixed(2)}</span>
            </div>
            
            <div className="grid gap-3">
              <Button className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20" asChild onClick={() => setOpen(false)}>
                <Link href="/checkout">Checkout Now</Link>
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-xl border-2" onClick={() => setOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
