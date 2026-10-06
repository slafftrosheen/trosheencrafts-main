import { useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, ArrowLeft, Check, Package, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cartStore";
import { PageLoader } from "@/components/shared/LoadingStates";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { useLanguage } from "@/lib/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/shop/:id");
  const id = params?.id;
  const { language, t } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["/api/products/" + id],
    queryFn: () => apiClient.get<any>("/products/" + id),
    enabled: !!id,
  });

  if (isLoading) return <PageLoader />;

  if (error || !product) {
    return (
      <div className="site-container page-shell flex min-h-[65vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="mt-6 font-serif text-4xl font-semibold">{t("product.not_found")}</h1>
          <p className="mt-3 text-muted-foreground">{t("product.not_found_desc")}</p>
          <Button asChild className="mt-7">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              {t("product.back_to_shop")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const name = product.nameTranslations?.[language] || product.name;
  const price = Number(product.price);
  const images: string[] = product.images?.length ? product.images : product.image ? [product.image] : [];
  const selectedImage = images[selectedImageIndex] || images[0] || "";

  const availableStock = Math.max(0, Number(product.stock ?? 0));

  const handleAddToCart = () => {
    const safeQuantity = Math.min(quantity, availableStock || quantity);
    for (let i = 0; i < safeQuantity; i += 1) {
      addItem({
        id: product.id,
        name,
        price,
        image: selectedImage || images[0],
      });
    }
    toast.success(t("product.added_to_cart"));
  };

  return (
    <div className="bg-background">
      <div className="site-container py-8 sm:py-10">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("product.back_to_shop")}
        </Link>
      </div>

      <section className="site-container pb-16 sm:pb-24">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
          <div>
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
              {selectedImage ? (
                <OptimizedImage
                  src={selectedImage}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Trosheen.Crafts
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                {images.slice(0, 5).map((image, index) => (
                  <button
                    key={image + index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "aspect-square overflow-hidden rounded-xl border bg-muted transition-colors",
                      selectedImageIndex === index ? "border-primary" : "border-transparent hover:border-border"
                    )}
                    aria-label={"View image " + (index + 1)}
                  >
                    <OptimizedImage src={image} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            {product.category && <p className="eyebrow">{product.category}</p>}
            <h1 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5.6rem)] font-semibold leading-[.94] tracking-[-.045em]">
              {name}
            </h1>

            <div className="mt-7 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-semibold text-primary sm:text-4xl">
                €{price.toFixed(2)}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > price && (
                <span className="text-lg text-muted-foreground line-through">
                  €{Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-5">
              {product.inStock !== false ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Check className="h-4 w-4" />
                  {t("product.in_stock")}
                </span>
              ) : (
                <span className="text-sm font-semibold text-destructive">{t("product.out_of_stock")}</span>
              )}
            </div>

            {product.description && (
              <p className="mt-7 text-base leading-8 text-muted-foreground sm:text-lg">{product.description}</p>
            )}

            <div className="mt-8 flex gap-3">
              <div className="flex h-12 items-center rounded-full border border-border bg-card">
                <button
                  type="button"
                  className="px-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  className="px-4 text-muted-foreground hover:text-foreground"
                  onClick={() => setQuantity((value) => Math.min(value + 1, availableStock || value + 1))}
                  disabled={availableStock > 0 && quantity >= availableStock}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={product.inStock === false || availableStock === 0}
                className="flex-1"
              >
                <ShoppingCart className="h-4 w-4" />
                {t("product.add_to_cart")}
              </Button>
            </div>

            {availableStock > 0 && availableStock <= 4 && (
              <p className="mt-3 text-sm font-semibold text-accent">
                Only {availableStock} left in stock
              </p>
            )}

            <div className="surface-muted mt-8 p-5">
              <p className="text-sm leading-6 text-muted-foreground">
                {t("product.handcrafted_note")}
              </p>
            </div>

            {product.metadata && Object.keys(product.metadata).length > 0 && (
              <div className="mt-9 border-t border-border pt-7">
                <h2 className="font-serif text-2xl font-semibold">{t("product.details")}</h2>
                <dl className="mt-5">
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-6 border-b border-border py-3 text-sm">
                      <dt className="capitalize text-muted-foreground">{key}</dt>
                      <dd className="text-right font-semibold">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
