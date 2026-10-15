import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMotion } from "@/components/shared/BrandMotion";
import { useLanguage } from "@/lib/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div className="site-container page-shell flex min-h-[70vh] items-center justify-center">
      <div className="max-w-2xl text-center">
        <BrandMotion name="notFound" mode="view" className="mx-auto h-44 w-44" poster="/brand/icons/planter.svg" />
        <p className="eyebrow mt-5">404</p>
        <h1 className="display-title mt-4">{t("brand.not_found_title")}</h1>
        <p className="lead mx-auto mt-6 max-w-xl">
          {t("brand.not_found_desc")}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              {t("brand.back_home")}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              {t("brand.shop")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
