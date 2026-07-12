import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { PageLoader } from '@/components/shared/LoadingStates';
import { Package, Truck, CheckCircle, Clock, ArrowLeft, Search } from 'lucide-react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/LanguageContext';

export default function OrderTracking() {
  const [, params] = useRoute('/order/:id');
  const id = params?.id;
  const { t } = useLanguage();

  const { data: order, isLoading, error } = useQuery({
    queryKey: [`/api/orders/track/${id}`],
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted/60 flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">{t("order.not_found")}</h1>
          <p className="text-muted-foreground text-lg mb-8">
            {t("order.not_found_desc")}
          </p>
          <Link href="/shop">
            <Button className="rounded-full px-8 h-14 font-bold text-lg shadow-xl shadow-primary/20">
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t("cart.continue_shopping")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-amber-500" />;
      case 'processing':
        return <Package className="h-6 w-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-6 w-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-6 w-6 text-primary" />;
      default:
        return <Clock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStatusIndex = statuses.indexOf(order.status);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <Link href="/shop">
          <Button variant="ghost" className="mb-8 rounded-full font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("product.back_to_shop")}
          </Button>
        </Link>

        <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight mb-12 leading-[0.9]">
          {t("order.track_title").split(' ').slice(0, -1).join(' ')} <span className="text-primary italic">{t("order.track_title").split(' ').slice(-1)}</span>
        </h1>

        <Card className="rounded-[3rem] border-2 border-border/40 bg-card/40 p-10 shadow-2xl">
          <CardHeader className="p-0 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("order.number")}</p>
                <p className="font-serif text-3xl font-bold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("order.date")}</p>
                <p className="text-lg font-bold">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 space-y-12">
            {/* Status Timeline */}
            <div>
              <h2 className="font-serif text-2xl font-bold mb-8">{t("order.status")}</h2>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border/60" />
                
                <div className="space-y-8">
                  {statuses.map((status, index) => (
                    <div key={status} className="relative flex items-center">
                      <div className={`
                        relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2
                        ${index <= currentStatusIndex ? 'bg-primary border-primary' : 'bg-background border-border/60'}
                      `}>
                        {index <= currentStatusIndex && (
                          <CheckCircle className="h-5 w-5 text-primary-foreground" />
                        )}
                      </div>
                      <div className="ml-6">
                        <p className={`font-bold text-lg capitalize ${
                          index <= currentStatusIndex ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {status}
                        </p>
                        {index === currentStatusIndex && (
                          <p className="text-sm font-bold text-primary uppercase tracking-widest">{t("order.current_status")}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {order.trackingNumber && (
              <div className="p-6 rounded-[2rem] bg-primary/5 border-2 border-primary/10">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                  {t("order.tracking_number")}
                </p>
                <p className="text-2xl font-mono font-bold text-primary">
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {/* Order Items */}
            <div className="border-t-2 border-border/40 pt-8">
              <h3 className="font-serif text-2xl font-bold mb-6">{t("order.items")}</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-6 p-4 rounded-2xl bg-muted/20 border border-border/40">
                    {item.productImage && (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-xl border-2 border-border/40"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-bold text-lg">{item.productName}</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        {t("order.qty")}: {item.quantity}
                      </p>
                    </div>
                    <p className="font-serif font-bold text-xl">€{(item.total / 100).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-border/40 mt-6 pt-6 flex justify-between items-center">
                <span className="font-black uppercase tracking-[0.2em] text-sm text-primary">{t("cart.total")}</span>
                <span className="font-serif text-4xl font-bold">€{(order.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="border-t-2 border-border/40 pt-8">
              <h3 className="font-serif text-2xl font-bold mb-4">{t("order.shipping_address")}</h3>
              <div className="p-6 rounded-[2rem] bg-muted/20 border border-border/40">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  <span className="font-bold text-foreground">{order.customerName}</span><br />
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}