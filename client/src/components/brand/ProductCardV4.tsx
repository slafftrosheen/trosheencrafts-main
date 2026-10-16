import { useState } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { Lottie } from "./Lottie";
import type { Product } from "@/hooks/useApi";

interface ProductCardV4Props {
  product: Product;
  /** Reveal delay in ms (the kit staggers cards 90ms apart). */
  delay?: number;
  /** Category label shown under the title instead of the product's own category. */
  kind?: string;
}

export function productTitle(product: Product, language: string): string {
  return product.nameTranslations?.[language] || product.name;
}

export function productImage(product: Product): string {
  return product.image || product.images?.[0] || "";
}

export function formatPrice(product: Product): string {
  const value = Number(product.price);
  return value > 0 ? `€${value.toFixed(2)}` : "€ —";
}

/** v4 `.product` card: media, one-of-a-kind tag, wishlist heart, title, meta. */
export function ProductCardV4({ product, delay = 0, kind }: ProductCardV4Props) {
  const { t, language } = useLanguage();
  const [wished, setWished] = useState(false);
  const image = productImage(product);

  return (
    <Link
      className="product"
      href={`/shop/${product.id}`}
      data-reveal
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      <div className="product__media">
        {image ? (
          <img src={image} alt={productTitle(product, language)} loading="lazy" />
        ) : (
          <img src="/brand/icons/candle.svg" alt="" style={{ opacity: 0.35, padding: "30%" }} />
        )}
        <span className="product__tag">{t("v4.tag.oneOfAKind")}</span>
        <button
          type="button"
          className="icon-btn product__wish"
          aria-pressed={wished}
          aria-label={t("v4.nav.wishlist")}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setWished((value) => !value);
          }}
        >
          <Lottie
            file="trosheen-03-wishlist-heart.json"
            mode="manual"
            trigger={wished ? 1 : 0}
            style={{ width: 30, height: 30 }}
          />
        </button>
      </div>
      <h3 className="product__title">{productTitle(product, language)}</h3>
      <div className="product__meta">
        <span>{kind || product.category || t("v4.tag.oneOfAKind")}</span>
        <span className="product__price">{formatPrice(product)}</span>
      </div>
    </Link>
  );
}
