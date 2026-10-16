import { useEffect, useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";
import { localizedText } from "@/lib/localizedContent";
import { apiClient } from "@/lib/apiClient";
import { useCartStore } from "@/lib/stores/cartStore";
import { useProducts, type Product } from "@/hooks/useApi";
import { PageLoader } from "@/components/shared/LoadingStates";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";
import { ProductCardV4, productTitle } from "@/components/brand/ProductCardV4";

export default function ProductDetail() {
  const [, params] = useRoute("/shop/:id");
  const id = params?.id;
  const { language, t } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(0);
  const [labelOverride, setLabelOverride] = useState(false);

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["/api/products/" + id],
    queryFn: () => apiClient.get<Product>("/products/" + id),
    enabled: !!id,
  });
  const { data: allProducts } = useProducts();

  useEffect(() => {
    setQuantity(1);
    setAdded(0);
    setLabelOverride(false);
  }, [id]);

  const related = useMemo(
    () =>
      (allProducts || [])
        .filter((item) => item.published && String(item.id) !== String(id))
        .slice(0, 4),
    [allProducts, id],
  );

  if (isLoading) return <PageLoader />;

  if (error || !product) {
    return (
      <div className="wrap" style={{ padding: "clamp(4rem,10vw,8rem) 0", textAlign: "center" }}>
        <Lottie file="trosheen-10-404-rolling-stone.json" mode="view" style={{ width: 160, height: 160, margin: "0 auto" }} />
        <h1>{t("product.not_found")}</h1>
        <p className="lead" style={{ marginInline: "auto" }}>
          {t("product.not_found_desc")}
        </p>
        <Link className="btn" href="/shop">
          {t("product.back_to_shop")}
        </Link>
      </div>
    );
  }

  const name = productTitle(product, language);
  const price = Number(product.price);
  const images: string[] = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const [heroImage, ...rest] = images;
  const availableStock = Math.max(0, Number(product.stock ?? 0));
  const description = localizedText(
    typeof product.description === "string" ? product.description : "",
    product.descriptionTranslations || (typeof product.description === "object" ? product.description : undefined),
    language,
  );
  const metadata = Object.entries(product.metadata || {});

  const handleAddToCart = () => {
    const cartQuantity = useCartStore
      .getState()
      .items.filter((item) => item.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    const safeQuantity = Math.max(0, Math.min(quantity, availableStock - cartQuantity));
    if (safeQuantity === 0) {
      toast.error(t("product.stock_limit"));
      return;
    }
    for (let index = 0; index < safeQuantity; index += 1) {
      addItem({
        id: product.id,
        name,
        price,
        image: heroImage || rest[0],
        maxStock: availableStock,
      });
    }
    setAdded((count) => count + 1);
    setLabelOverride(true);
    window.setTimeout(() => setLabelOverride(false), 2200);
    toast.success(t("product.added_to_cart"), {
      action: { label: t("constructor.view_cart"), onClick: () => window.location.assign("/cart") },
    });
  };

  return (
    <div>
      <section className="section section--tight">
        <div className="wrap">
          <p className="note">
            <Link href="/shop">{t("v4.pdp.crumb")}</Link>
            {product.category ? ` / ${product.category}` : ""}
          </p>

          <div className="pdp" style={{ marginTop: "1.5rem" }}>
            <div className="pdp__gallery">
              <div className="frame">
                {heroImage ? (
                  <img src={heroImage} alt={name} />
                ) : (
                  <img src="/brand/icons/candle.svg" alt="" style={{ opacity: 0.3, padding: "30%" }} />
                )}
              </div>
              {(rest.length ? rest : [heroImage, heroImage]).slice(0, 2).map((image, index) =>
                image ? (
                  <div className="frame" key={`${image}-${index}`}>
                    <img src={image} alt="" loading="lazy" />
                  </div>
                ) : (
                  <div className="frame" key={`empty-${index}`} aria-hidden="true" />
                ),
              )}
            </div>

            <div className="pdp__info">
              <p className="eyebrow">{t("v4.tag.oneOfAKind")}</p>
              <h1 style={{ fontSize: "var(--t-h2)" }}>{name}</h1>
              {description && <p className="lead">{description}</p>}
              <div className="price">{price > 0 ? `€${price.toFixed(2)}` : "€ —"}</div>

              <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", alignItems: "stretch" }}>
                <div className="tabs" role="group" aria-label={t("product.increase_quantity")}>
                  <button
                    type="button"
                    className="tab"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    disabled={quantity <= 1}
                    aria-label={t("product.decrease_quantity")}
                  >
                    −
                  </button>
                  <span style={{ padding: ".75rem 1rem", font: "500 1rem/1 var(--f-body)" }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    className="tab"
                    onClick={() => setQuantity((value) => Math.min(value + 1, Math.max(1, availableStock)))}
                    disabled={availableStock === 0 || quantity >= availableStock}
                    aria-label={t("product.increase_quantity")}
                  >
                    +
                  </button>
                </div>

                <button
                  className="btn cart-btn"
                  style={{ flex: "1 1 220px" }}
                  onClick={handleAddToCart}
                  disabled={availableStock === 0}
                >
                  <Lottie
                    file="trosheen-02-add-to-cart.json"
                    mode="manual"
                    trigger={added}
                    ariaHidden
                  />
                  <span>{labelOverride ? t("v4.pdp.added") : t("v4.pdp.addToCart")}</span>
                </button>
              </div>

              {availableStock > 0 ? (
                <p className="field-hint" style={{ marginTop: ".8rem" }}>
                  {t("product.in_stock")}
                </p>
              ) : (
                <p className="field-error" style={{ marginTop: ".8rem" }}>
                  {t("product.out_of_stock")}
                </p>
              )}

              <ul className="facts">
                <li>
                  <img src="/brand/icons/handmade.svg" alt="" />
                  {t("v4.pdp.fact1")}
                </li>
                <li>
                  <img src="/brand/icons/one-of-a-kind.svg" alt="" />
                  {t("v4.pdp.fact2")}
                </li>
                <li>
                  <img src="/brand/icons/parcel.svg" alt="" />
                  {t("v4.pdp.fact3")}
                </li>
              </ul>

              {metadata.length > 0 && (
                <details className="acc" open>
                  <summary>{t("v4.pdp.acc.materials")}</summary>
                  {metadata.map(([key, value]) => (
                    <p key={key}>
                      <strong style={{ textTransform: "capitalize" }}>{key}</strong>: {String(value)}
                    </p>
                  ))}
                </details>
              )}

              <details className="acc" open={metadata.length === 0}>
                <summary>{t("v4.pdp.acc.care")}</summary>
                <p>
                  {t("v4.pdp.acc.careBody")}{" "}
                  <Link href="/guide">{t("v4.pdp.acc.careLink")}</Link>
                </p>
              </details>

              <details className="acc">
                <summary>{t("v4.pdp.acc.shipping")}</summary>
                <p>{t("v4.pdp.acc.shipBody")}</p>
              </details>

              <div className="letter" style={{ marginTop: "1.5rem", padding: "1.4rem" }}>
                <p style={{ fontSize: "1rem", margin: 0 }}>{t("v4.pdp.quote")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--warm">
          <div className="wrap">
            <h2>{t("v4.pdp.related")}</h2>
            <div className="rail" style={{ marginTop: "1.5rem" }}>
              {related.map((item, index) => (
                <ProductCardV4 key={item.id} product={item} delay={index * 90} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="wrap" style={{ paddingBottom: "var(--s7)" }}>
        <div className="divider" aria-hidden="true">
          <Ornament name="auseklis" size="sm" draw />
        </div>
      </div>
    </div>
  );
}
