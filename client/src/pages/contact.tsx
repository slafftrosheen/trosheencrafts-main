import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { useContactForm } from "@/hooks/useApi";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Lottie } from "@/components/brand/Lottie";
import { Ornament } from "@/components/brand/Ornament";

export default function ContactPage() {
  const { t } = useLanguage();
  const config = useSiteConfig();
  const contactForm = useContactForm();

  const email = config.contact.email || "slaff.trosheen@gmail.com";
  const phone =
    config.contact.phone && !/[xX]{2,}/.test(config.contact.phone)
      ? config.contact.phone
      : "+371 20 678 142";

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({ name: false, email: false, message: false });
  const [sent, setSent] = useState(false);

  const subjects = [1, 2, 3, 4, 5].map((index) => t(`v4.contact.subject${index}`));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const nameBad = !form.name.trim();
    const emailBad = !/^\S+@\S+\.\S+$/.test(form.email.trim());
    const messageBad = !form.message.trim();
    setErrors({ name: nameBad, email: emailBad, message: messageBad });
    if (nameBad || emailBad || messageBad) return;

    contactForm.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject || subjects[0],
        message: form.message.trim(),
      },
      {
        onSuccess: () => {
          setSent(true);
          setForm({ name: "", email: "", subject: "", message: "" });
        },
      },
    );
  };

  return (
    <section className="section section--tight">
      <div className="wrap split" style={{ alignItems: "start" }}>
        <div data-reveal>
          <Lottie file="trosheen-25-courtyard-door.json" mode="view" className="chapter-art" />
          <p className="eyebrow">
            <Ornament name="auseklis" size="sm" draw /> {t("v4.contact.eyebrow")}
          </p>
          <h1>{t("v4.contact.title")}</h1>
          <p className="lead">{t("v4.contact.lead")}</p>

          <ul className="facts" style={{ fontSize: "1.05rem" }}>
            <li>
              <img src="/brand/icons/mail.svg" alt="" />
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>
              <img src="/brand/icons/phone.svg" alt="" />
              <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
            </li>
            <li>
              <Lottie
                file="trosheen-27-map-pin.json"
                mode="view"
                className="pin-lottie"
              />
              {t("v4.contact.visit")}
            </li>
          </ul>

          <figure
            className="drawing"
            data-ink
            style={{ marginTop: "2rem", "--ar": "4/3", maxWidth: 460 } as React.CSSProperties}
          >
            <img src="/photos/piece-07.webp" alt="" loading="lazy" />
          </figure>
        </div>

        <div className="card" data-reveal style={{ "--delay": "150ms", padding: "2rem" } as React.CSSProperties}>
          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="contact-name">{t("v4.contact.name")}</label>
              <input
                id="contact-name"
                className="input"
                required
                autoComplete="name"
                value={form.name}
                onChange={(event) => {
                  setForm({ ...form, name: event.target.value });
                  setErrors((value) => ({ ...value, name: false }));
                }}
                aria-invalid={errors.name}
              />
              {errors.name && (
                <span className="field-error" role="alert">
                  {t("v4.contact.errName")}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="contact-email">{t("v4.contact.email")}</label>
              <input
                id="contact-email"
                className="input"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(event) => {
                  setForm({ ...form, email: event.target.value });
                  setErrors((value) => ({ ...value, email: false }));
                }}
                aria-invalid={errors.email}
              />
              {errors.email && (
                <span className="field-error" role="alert">
                  {t("v4.contact.errEmail")}
                </span>
              )}
            </div>

            <div className="field">
              <label htmlFor="contact-subject">{t("v4.contact.subject")}</label>
              <select
                id="contact-subject"
                className="select"
                style={{ borderRadius: "var(--r-m)", width: "100%" }}
                value={form.subject || subjects[0]}
                onChange={(event) => setForm({ ...form, subject: event.target.value })}
              >
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="contact-message">{t("v4.contact.message")}</label>
              <textarea
                id="contact-message"
                className="textarea"
                required
                value={form.message}
                onChange={(event) => {
                  setForm({ ...form, message: event.target.value });
                  setErrors((value) => ({ ...value, message: false }));
                }}
                aria-invalid={errors.message}
              />
              {errors.message && (
                <span className="field-error" role="alert">
                  {t("v4.contact.errMessage")}
                </span>
              )}
            </div>

            <button className="btn" style={{ width: "100%" }} type="submit" disabled={contactForm.isPending}>
              {t("v4.contact.send")}
            </button>

            {contactForm.isError && (
              <p className="field-error" role="alert" style={{ marginTop: ".8rem" }}>
                {t("contact.form_error")}
              </p>
            )}

            <div className={"form-ok" + (sent ? " is-on" : "")} role="status" style={{ marginTop: "1rem" }}>
              <Lottie
                file="trosheen-08-wrapped-and-sealed.json"
                mode="manual"
                trigger={sent ? 1 : 0}
                style={{ width: 40, height: 40 }}
              />
              {t("v4.contact.thanks")}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
