import { Link, useLocation } from 'wouter';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cartStore';
import { LazyImage } from '@/components/shared/LazyImage';
import { useLanguage } from '@/lib/LanguageContext';

export default function CartPage() {
  const [, navigate] = useLocation();
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-6 py-32 relative">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
        <Card className="max-w-2xl mx-auto p-12 text-center rounded-[3rem] border-2 border-dashed relative z-10 bg-card/40 backdrop-blur-sm">
          <ShoppingBag className="h-20 w-20 mx-auto mb-6 text-muted-foreground opacity-20" />
          <h2 className="text-4xl font-serif font-bold mb-4">{t("cart.empty_title")}</h2>
          <p className="text-xl text-muted-foreground mb-10 font-medium">
            {t("cart.empty_desc")}
          </p>
          <Link href="/shop">
            <Button size="lg" className="rounded-2xl h-16 px-10 font-bold text-lg shadow-xl shadow-primary/20">
              {t("cart.start_exploring")} <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-12 leading-[0.9]">{t("cart.your")} <span className="text-primary italic">{t("cart.basket")}</span></h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <Card key={item.id} className="rounded-[2rem] border-2 border-border/40 bg-card/40 overflow-hidden shadow-lg">
                <CardContent className="p-8">
                  <div className="flex flex-col sm:flex-row gap-8">
                    <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden border-2 border-border/40">
                      <LazyImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <h3 className="font-serif text-2xl font-bold mb-1">{item.name}</h3>
                        <p className="font-serif text-xl font-bold text-primary">
                          €{(item.price / 100).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-1 bg-muted/60 rounded-xl p-1 border border-border/40">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="font-bold px-4">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="rounded-[2.5rem] border-2 border-primary/20 bg-primary/5 p-10 shadow-2xl">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-serif font-bold">{t("cart.summary")}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="flex justify-between items-end">
                  <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">{t("cart.subtotal")}</span>
                  <span className="text-2xl font-serif font-bold">€{(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs">{t("cart.delivery")}</span>
                  <span className="text-sm font-bold uppercase text-primary">{t("cart.free")}</span>
                </div>
                <div className="border-t-2 border-border/40 pt-6">
                  <div className="flex justify-between items-end text-primary">
                    <span className="font-black uppercase tracking-[0.2em] text-sm">{t("cart.total")}</span>
                    <span className="text-4xl font-serif font-bold">€{(totalPrice / 100).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-0 mt-10">
                <Button
                  className="w-full h-16 rounded-2xl font-bold text-xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
                  onClick={() => navigate('/checkout')}
                >
                  {t("cart.checkout")} <ArrowRight size={20} className="ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}