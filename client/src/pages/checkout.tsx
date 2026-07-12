import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/lib/stores/cartStore';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';
import { LazyImage } from '@/components/shared/LazyImage';

const checkoutSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().min(2, 'Full name is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  postalCode: z.string().min(3, 'Postal code is required'),
  country: z.string().min(2, 'Country is required'),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { items, totalPrice, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      setLoading(true);
      const response: any = await apiClient.post('/checkout/create-session', {
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        shippingAddress: data,
        email: data.email,
      });

      if (response.sessionUrl) {
        window.location.href = response.sessionUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
      
      clearCart();
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="bg-background min-h-screen selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-12 leading-[0.9]">
          {t("checkout.title").split(' ').map((word, i) => (
            <span key={i} className={i === 2 ? "text-primary italic" : ""}>{word} </span>
          ))}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <Card className="rounded-[3rem] border-2 border-border/40 bg-card/40 p-10 md:p-12 shadow-2xl">
            <CardHeader className="p-0 mb-10 text-center">
              <CardTitle className="text-3xl font-serif font-bold">{t("checkout.shipping.title")}</CardTitle>
              <CardDescription className="text-lg">{t("checkout.shipping.desc")}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("checkout.shipping.email")}</Label>
                  <Input {...register('email')} className="h-14 rounded-2xl border-2 focus:border-primary/40 text-lg" disabled={loading} />
                  {errors.email && <p className="text-xs text-destructive font-bold ml-1">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("checkout.shipping.name")}</Label>
                  <Input {...register('name')} className="h-14 rounded-2xl border-2 focus:border-primary/40 text-lg" disabled={loading} />
                  {errors.name && <p className="text-xs text-destructive font-bold ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("checkout.shipping.street")}</Label>
                  <Input {...register('street')} className="h-14 rounded-2xl border-2 focus:border-primary/40 text-lg" disabled={loading} />
                  {errors.street && <p className="text-xs text-destructive font-bold ml-1">{errors.street.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("checkout.shipping.city")}</Label>
                    <Input {...register('city')} className="h-14 rounded-2xl border-2 focus:border-primary/40 text-lg" disabled={loading} />
                    {errors.city && <p className="text-xs text-destructive font-bold ml-1">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("checkout.shipping.postal")}</Label>
                    <Input {...register('postalCode')} className="h-14 rounded-2xl border-2 focus:border-primary/40 text-lg" disabled={loading} />
                    {errors.postalCode && <p className="text-xs text-destructive font-bold ml-1">{errors.postalCode.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("checkout.shipping.country")}</Label>
                  <Input {...register('country')} className="h-14 rounded-2xl border-2 focus:border-primary/40 text-lg" disabled={loading} />
                  {errors.country && <p className="text-xs text-destructive font-bold ml-1">{errors.country.message}</p>}
                </div>

                <Button type="submit" className="w-full h-20 rounded-3xl font-bold text-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02]" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin h-8 w-8" /> : <><Lock className="mr-3" size={24} /> {t("cart.checkout")} €{(totalPrice / 100).toFixed(2)}</>}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium text-sm">
                  <ShieldCheck size={18} className="text-primary" />
                  {t("checkout.payment.secure")}
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-8 lg:sticky lg:top-8">
            <Card className="rounded-[3rem] border-2 border-border/40 bg-card/40 p-10 backdrop-blur-sm">
              <h3 className="font-serif text-3xl font-bold mb-8">{t("checkout.summary.title")}</h3>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-border/40 shrink-0">
                        <LazyImage src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{item.name}</p>
                        <p className="text-sm text-muted-foreground font-medium">{t("checkout.summary.qty")}: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-serif font-bold text-xl">€{(item.price * item.quantity / 100).toFixed(2)}</p>
                  </div>
                ))}
                <div className="border-t-2 border-border/40 pt-6 space-y-4">
                  <div className="flex justify-between text-muted-foreground font-medium uppercase tracking-widest text-[10px]">
                    <span>{t("checkout.summary.subtotal")}</span>
                    <span>€{(totalPrice / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-black uppercase tracking-[0.2em] text-sm pt-2">
                    <span>{t("checkout.summary.total")}</span>
                    <span className="text-3xl font-serif font-bold">€{(totalPrice / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
