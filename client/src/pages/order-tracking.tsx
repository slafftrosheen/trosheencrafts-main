import { Link, useRoute } from "wouter";
import { ArrowLeft, Mail, PackageSearch, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export default function OrderTracking() {
  const [, params] = useRoute("/order/:id");
  const id = params?.id;
  const { t } = useLanguage();

  return (
    <div className="page-shell">
      <div className="site-container max-w-4xl">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("product.back_to_shop")}
        </Link>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_.72fr] lg:items-start">
          <div>
            <p className="eyebrow">{t("order.support")}</p>
            <h1 className="display-title mt-4">{t("order.track_title")}</h1>
            <p className="lead mt-6 max-w-2xl">
              {t("order.privacy_note")}
            </p>
          </div>

          <aside className="surface p-6 sm:p-7">
            <PackageSearch className="h-6 w-6 text-primary" />
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t("order.number")}
            </p>
            <p className="mt-2 font-serif text-3xl font-semibold">#{id || "—"}</p>

            <div className="mt-6 space-y-4 border-t border-border pt-5 text-sm leading-6 text-muted-foreground">
              <div className="flex gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{t("order.check_email")}</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{t("order.help_desc")}</p>
              </div>
            </div>

            <Button asChild className="mt-6 w-full">
              <Link href="/contact">{t("nav_contact")}</Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/withdrawal">{t("order.withdrawal")}</Link>
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
}
