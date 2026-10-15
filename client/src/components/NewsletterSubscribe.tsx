import { useHomepageImages } from "@/hooks/useHomepageImages";
import { DEFAULT_HOMEPAGE_IMAGES } from "@/lib/homepageImages";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { haptics } from "@/lib/haptics";
import { apiClient } from "@/lib/apiClient";
import { BrandMotion } from "@/components/shared/BrandMotion";

interface NewsletterSubscribeProps {
  variant?: "default" | "compact" | "hero" | "footer";
  className?: string;
  source?: string;
}

export function NewsletterSubscribe({
  variant = "default",
  className,
  source = "website",
}: NewsletterSubscribeProps) {
  const { t } = useLanguage();
  const { image } = useHomepageImages();
  const [email, setEmail] = useState("");
  const [preferences] = useState({
    marketing: true,
    productUpdates: true,
    blogUpdates: true,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage(t("newsletter.invalid"));
      haptics.playError();
      return;
    }

    setStatus("loading");
    haptics.playInteraction("tap");

    try {
      const data = await apiClient.post<{ success: boolean; message: string }>(
        "/newsletter/subscribe",
        { email, source, preferences }
      );

      setStatus("success");
      setMessage(t("newsletter.success"));
      setEmail("");
      haptics.playSuccess();
      window.setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error: any) {
      setStatus("error");
      setMessage(t("newsletter.error"));
      haptics.playError();
    }
  };

  const renderForm = ({ compact = false }: { compact?: boolean } = {}) => (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn("flex gap-2", compact ? "flex-col" : "flex-col sm:flex-row")}
      >
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            aria-label={t("newsletter.email_label")}
            placeholder={t("newsletter.email_placeholder") || "your@email.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="h-12 rounded-[2px] border-border bg-background pl-11"
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className={cn("h-12", compact && "w-full")}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status === "success" ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {t("newsletter.subscribed") || "Subscribed"}
            </>
          ) : (
            <>
              {t("newsletter.subscribe_button") || "Subscribe"}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            role={status === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              "mt-3 flex items-center gap-1.5 text-xs",
              status === "error" ? "text-destructive" : "text-primary"
            )}
          >
            {status === "error" ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {message}
          </motion.p>
        )}
      </AnimatePresence>
    </>
  );

  if (variant === "compact") {
    return (
      <div className={cn("w-full", className)}>
        {renderForm({ compact: true })}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("surface overflow-hidden", className)}>
        <div className="brand-panel">
          <div><img src={image("shopFeature")} onError={(event) => { event.currentTarget.src = DEFAULT_HOMEPAGE_IMAGES.shopFeature; }} alt={t("brand.newsletter_alt")} width="600" height="600" loading="lazy" className="brand-panel-image" /></div>
          <div className="brand-panel-copy">
            <div className="mb-4 flex items-center gap-3"><BrandMotion name="candle" mode="loop" className="h-16 w-16 shrink-0" poster="/brand/icons/candle.svg" /><p className="eyebrow">{t("newsletter.exclusive_updates")}</p></div>
            <h2>{t("newsletter.hero_title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">{t("newsletter.hero_subtitle")}</p>
            <div className="mt-7">{renderForm()}</div>
            {status === "idle" && <p className="mt-3 text-xs text-muted-foreground">{t("newsletter.privacy_note")}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {renderForm()}
    </div>
  );
}
