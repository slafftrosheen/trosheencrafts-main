import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { haptics } from "@/lib/haptics";
import { apiClient } from "@/lib/apiClient";

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
      setMessage("Please enter a valid email address");
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
      setMessage(data.message);
      setEmail("");
      haptics.playSuccess();
      window.setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message || "Unable to subscribe. Please try again later.");
      haptics.playError();
    }
  };

  const Form = ({ compact = false }: { compact?: boolean }) => (
    <>
      <form
        onSubmit={handleSubmit}
        className={cn("flex gap-2", compact ? "flex-col" : "flex-col sm:flex-row")}
      >
        <div className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="email"
            aria-label="Email address"
            placeholder={t("newsletter.email_placeholder") || "your@email.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading" || status === "success"}
            className="h-12 rounded-full border-border bg-background pl-11"
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
        <Form compact />
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className={cn("surface overflow-hidden", className)}>
        <div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_.9fr] md:items-end md:p-12">
          <div>
            <p className="eyebrow mb-4">{t("newsletter.exclusive_updates") || "Workshop letters"}</p>
            <h3 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("newsletter.hero_title") || "Stay close to the workshop"}
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("newsletter.hero_subtitle") ||
                "New collections, workshop stories and occasional notes from Daugavpils."}
            </p>
          </div>
          <div>
            <Form />
            {status === "idle" && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("newsletter.privacy_note") || "Unsubscribe anytime."}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <Form />
    </div>
  );
}
