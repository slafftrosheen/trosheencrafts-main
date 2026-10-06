import { ContactForm } from "@/components/features/ContactForm";
import { Mail, Phone, MapPin } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useLanguage } from "@/lib/LanguageContext";

export default function ContactPage() {
  const config = useSiteConfig();
  const { t } = useLanguage();

  const contactItems = [
    {
      icon: Mail,
      label: t("admin.email"),
      value: config.contact.email,
      href: "mailto:" + config.contact.email,
    },
    {
      icon: Phone,
      label: t("contact.phone"),
      value: config.contact.phone,
      href: "tel:" + config.contact.phone.replace(/\s+/g, ""),
    },
    {
      icon: MapPin,
      label: t("contact.location"),
      value: config.contact.address,
      href: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="page-shell border-b border-border">
        <div className="site-container">
          <p className="eyebrow">{t("contact.title")}</p>
          <div className="mt-4 grid gap-7 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <h1 className="display-title">
              {t("contact.let_start")} <span className="italic text-primary">{t("contact.conversation")}</span>
            </h1>
            <p className="lead lg:pb-2">{t("contact.desc")}</p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="site-container">
          <div className="grid gap-4 md:grid-cols-3">
            {contactItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 break-words font-serif text-xl font-semibold">{item.value}</p>
                </>
              );

              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="surface p-6 transition-colors hover:border-foreground/20"
                >
                  {content}
                </a>
              ) : (
                <div key={item.label} className="surface p-6">
                  {content}
                </div>
              );
            })}
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:gap-16">
            <div>
              <p className="eyebrow">From Daugavpils</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                Tell us what you want to make.
              </h2>
              <p className="mt-5 text-base leading-8 text-muted-foreground">
                Questions about a piece, a custom order or the workshop are all welcome. We answer as a family workshop, not a call centre.
              </p>
            </div>
            <div className="surface p-5 sm:p-7 md:p-9">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
