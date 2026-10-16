import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import { Lottie } from "./Lottie";

interface NewsletterFormProps {
  /** Where the sign-up happened, forwarded to the API. */
  source: string;
  /** "section" = the home-page newsletter panel, "footer" = the footer inline row. */
  variant?: "section" | "footer";
}

/**
 * Letters from the workshop — v4 markup with the kit's friendly inline validation
 * and the sealed-letter Lottie on success, wired to /api/newsletter/subscribe.
 */
export function NewsletterForm({ source, variant = "section" }: NewsletterFormProps) {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!value || !/^\S+@\S+\.\S+$/.test(value)) {
      setInvalid(true);
      setStatus("idle");
      return;
    }
    setInvalid(false);
    setStatus("loading");
    try {
      await apiClient.post("/newsletter/subscribe", {
        email: value,
        source,
        preferences: { marketing: true, productUpdates: true, blogUpdates: true },
      });
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const ok = status === "success";

  if (variant === "footer") {
    return (
      <div>
        <form className="inline-form" onSubmit={submit} noValidate>
          <label className="sr-only" htmlFor="footer-newsletter">
            {t("v4.news.label")}
          </label>
          <input
            id="footer-newsletter"
            className="input"
            type="email"
            required
            autoComplete="email"
            placeholder={t("v4.news.placeholder")}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setInvalid(false);
            }}
            aria-invalid={invalid}
            disabled={status === "loading" || ok}
          />
          <button className="btn btn--linen" type="submit" disabled={status === "loading" || ok}>
            {t("v4.news.button")}
          </button>
        </form>
        {invalid && (
          <p className="field-error" role="alert" style={{ marginTop: ".5rem" }}>
            {t("v4.news.error")}
          </p>
        )}
        {status === "error" && (
          <p className="field-error" role="alert" style={{ marginTop: ".5rem" }}>
            {t("newsletter.error")}
          </p>
        )}
        {ok && (
          <p className="field-hint" role="status" style={{ marginTop: ".5rem" }}>
            {t("newsletter.success")}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor="home-newsletter">{t("v4.news.label")}</label>
        <input
          id="home-newsletter"
          className="input"
          type="email"
          required
          autoComplete="email"
          placeholder={t("v4.news.placeholder")}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setInvalid(false);
          }}
          aria-invalid={invalid}
          disabled={status === "loading" || ok}
        />
        {invalid && (
          <span className="field-error" role="alert">
            {t("v4.news.error")}
          </span>
        )}
        {status === "error" && (
          <span className="field-error" role="alert">
            {t("newsletter.error")}
          </span>
        )}
      </div>
      <button className="btn" type="submit" disabled={status === "loading" || ok}>
        {t("v4.news.button")}
      </button>
      <p className="field-hint" style={{ marginTop: ".8rem" }}>
        {t("v4.news.hint")}
      </p>
      <div className={"form-ok" + (ok ? " is-on" : "")} role="status">
        <Lottie
          file="trosheen-26-letter-sealed.json"
          mode="manual"
          trigger={ok ? 1 : 0}
          style={{ width: 44, height: 44 }}
        />
        {t("v4.news.thanks")}
      </div>
    </form>
  );
}
