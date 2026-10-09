import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  isHandmade?: boolean;
  inStock?: boolean;
}

export function ProductCard({ id, name, price, image, category, isHandmade, inStock = true }: ProductCardProps) {
  const { t } = useLanguage();

  return (
    <Link href={"/shop/" + id} className="group block rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4">
      <article>
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-muted">
          {image ? (
            <img src={image} alt={name} loading="lazy" decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.04]" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Trosheen.Crafts</div>
          )}
          {isHandmade && (
            <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
              {t("product_handmade_badge")}
            </span>
          )}
          {!inStock && (
            <span className="absolute bottom-4 left-4 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background">
              {t("product.out_of_stock")}
            </span>
          )}
        </div>
        <div className="pt-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{category}</p>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-muted-foreground transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h3 className="font-serif text-xl font-semibold leading-tight tracking-tight sm:text-2xl">{name}</h3>
            <p className="shrink-0 text-sm font-semibold text-primary">{Number.isFinite(price) ? "€" + price.toFixed(2) : "—"}</p>
          </div>
        </div>
      </article>
    </Link>
  );
}
