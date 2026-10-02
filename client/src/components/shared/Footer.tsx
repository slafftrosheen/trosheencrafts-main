import { Link } from "wouter";
import { Instagram, Facebook, Youtube, Send, Mail, MapPin, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { BrandAssets } from "@/lib/imageAssets";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { NewsletterSubscribe } from "@/components/NewsletterSubscribe";

const withdrawalLabels: Record<string, string> = {
  en: "Withdraw from contract",
  lv: "Atteikties no līguma",
  ru: "Отказаться от договора",
  pl: "Odstąp od umowy",
  uk: "Відмовитися від договору",
};

export function Footer() {
  const { t, language } = useLanguage();
  const config = useSiteConfig();
  const currentYear = new Date().getFullYear();
  const withdrawalLabel = withdrawalLabels[language] || withdrawalLabels.en;

  const socialLinks = [
    { Icon: Instagram, href: config.social.instagram, label: "Instagram" },
    { Icon: Facebook, href: config.social.facebook, label: "Facebook" },
    { Icon: Youtube, href: config.social.youtube, label: "YouTube" },
    { Icon: Send, href: config.social.telegram, label: "Telegram" },
  ].filter((link) => link.href && link.href.trim());

  const exploreLinks = [
    { href: "/about", label: t("nav_story") },
    { href: "/shop", label: t("nav_shop") },
    { href: "/gallery", label: t("nav_gallery") },
    { href: "/blog", label: t("nav_blog") },
    { href: "/guide", label: t("guide_care_eyebrow") },
  ];

  return (
    <footer className="border-t border-border bg-card">
      <div className="site-container py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_.75fr_.9fr_1.25fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <img src={BrandAssets.logo} alt="Trosheen.Crafts" className="h-12 w-12 object-contain" />
              <span className="font-serif text-xl font-semibold">Trosheen.Crafts</span>
            </Link>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground">{t("footer_desc")}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-muted hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-5">{t("footer_explore") || "Explore"}</p>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow mb-5">{t("nav_contact") || "Contact"}</p>
            <div className="space-y-4 text-sm text-muted-foreground">
              <a href={"mailto:" + config.contact.email} className="flex items-start gap-3 transition-colors hover:text-foreground">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{config.contact.email}</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{config.contact.address}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow mb-5">{t("footer.newsletter_title") || "Newsletter"}</p>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
              {t("footer.newsletter_desc") || "New collections and occasional workshop notes."}
            </p>
            <NewsletterSubscribe variant="compact" source="footer" />
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Trosheen.Crafts · Daugavpils, Latvia</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/withdrawal" className="font-semibold text-foreground hover:text-primary">{withdrawalLabel}</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
