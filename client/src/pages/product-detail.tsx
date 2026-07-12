import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cartStore';
import { PageLoader } from '@/components/shared/LoadingStates';
import { toast } from 'sonner';
import { ShoppingCart, ArrowLeft, Check, Package } from 'lucide-react';
import { Link } from 'wouter';
import { useLanguage } from '@/lib/LanguageContext';
import { OptimizedImage } from '@/components/shared/OptimizedImage';

export default function ProductDetail() {
  const [, params] = useRoute('/shop/:id');
  const id = params?.id;
  const { language, t } = useLanguage();
  const addItem = useCartStore(state => state.addItem);

  const { data: product, isLoading, error } = useQuery({
    queryKey: [`/api/products/${id}`],
    queryFn: () => apiClient.get<any>(`/products/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;
  
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-muted/60 flex items-center justify-center">
            <Package className="w-12 h-12 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4">{t("product.not_found")}</h1>
          <p className="text-muted-foreground text-lg mb-8">
            {t("product.not_found_desc")}
          </p>
          <Link href="/shop">
            <Button className="rounded-full px-8 h-14 font-bold text-lg shadow-xl shadow-primary/20">
              <ArrowLeft className="mr-2 h-5 w-5" />
              {t("product.back_to_shop")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const name = product.nameTranslations?.[language] || product.name;
  const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: name,
      price: price,
      image: product.images?.[0] || product.image,
    });
    toast.success(t("product.added_to_cart"));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Link href="/shop">
          <Button variant="ghost" className="mb-8 rounded-full font-bold">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("product.back_to_shop")}
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Images */}
          <div className="space-y-6">
            <div className="aspect-square rounded-[3rem] overflow-hidden border-2 border-border/40 bg-card/40 shadow-2xl">
              <OptimizedImage
                src={product.images?.[0] || product.image}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(1, 5).map((img: string, i: number) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-border/40 bg-card/40">
                    <OptimizedImage
                      src={img}
                      alt={`${name} ${i + 2}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="lg:sticky lg:top-32 space-y-8">
            <div className="space-y-4">
              {product.category && (
                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                  {product.category}
                </span>
              )}
              <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-[0.95]">
                {name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="font-serif text-5xl font-bold text-primary">
                €{(price / 100).toFixed(2)}
              </span>
              {product.compareAtPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  €{(product.compareAtPrice / 100).toFixed(2)}
                </span>
              )}
            </div>

            {product.inStock !== false ? (
              <div className="flex items-center gap-2 text-primary font-bold">
                <Check className="w-5 h-5" />
                {t("product.in_stock")}
              </div>
            ) : (
              <div className="text-destructive font-bold">{t("product.out_of_stock")}</div>
            )}

            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={product.inStock === false}
              className="w-full h-20 rounded-3xl font-bold text-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              <ShoppingCart className="mr-3 h-7 w-7" />
              {t("product.add_to_cart")}
            </Button>

            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <div className="pt-8 border-t-2 border-border/40">
                <h3 className="font-serif text-2xl font-bold mb-6">{t("product.details")}</h3>
                <dl className="space-y-4">
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-3 border-b border-border/20">
                      <dt className="text-muted-foreground font-medium capitalize">{key}</dt>
                      <dd className="font-bold">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="p-6 rounded-[2rem] bg-primary/5 border-2 border-primary/10">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="font-bold text-foreground">{t("product.handcrafted_note").split('.')[0]}.</span> {t("product.handcrafted_note").split('.').slice(1).join('.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
