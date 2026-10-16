import { Link } from "wouter";
import { useLanguage } from "@/lib/LanguageContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { NewsletterForm } from "@/components/brand/NewsletterForm";
import { SiteLogo } from "@/components/shared/SiteLogo";

/** Trosheen v4 site footer: band, four columns, legal base. */
export function Footer() {
  const { t } = useLanguage();
  const config = useSiteConfig();

  const email = config.contact.email || "slaff.trosheen@gmail.com";
  const phone = config.contact.phone && !/[xX]{2,}/.test(config.contact.phone)
    ? config.contact.phone
    : "+371 20 678 142";
  const instagram = config.social.instagram || "https://www.instagram.com/trosheencrafts";
  const facebook = config.social.facebook || "https://www.facebook.com/trosheencrafts";

  const explore = [
    { href: "/shop", label: t("v4.nav.shop") },
    { href: "/constructor", label: t("v4.nav.custom") },
    { href: "/about", label: t("v4.nav.story") },
    { href: "/gallery", label: t("v4.nav.gallery") },
    { href: "/blog", label: t("v4.nav.journal") },
    { href: "/guide", label: t("v4.nav.care") },
  ];

  const legal = [
    { href: "/withdrawal", label: t("v4.footer.withdrawal") },
    { href: "/privacy", label: t("v4.footer.privacy") },
    { href: "/terms", label: t("v4.footer.terms") },
    { href: "/cookies", label: t("v4.footer.cookies") },
  ];

  return (
    <footer className="site-footer">
      <div className="band band--linen" aria-hidden="true" />
      <div className="wrap footer-grid">
        <div>
          <SiteLogo variant="lockup-horizontal" tone="linen"
            alt="Trosheen" width={180} style={{ marginBottom: "1.2rem" }} />
          <p style={{ fontFamily: "var(--f-display)", fontSize: "1.15rem", color: "#F2EDE3" }}>
            {t("brand.tagline")}
          </p>
          <p className="note" style={{ color: "#D9D2C3" }}>
            {t("v4.footer.about")}
          </p>
        </div>

        <div>
          <h4>{t("v4.footer.explore")}</h4>
          <ul>
            {explore.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>{t("v4.footer.contact")}</h4>
          <ul>
            <li>
              <a href={`mailto:${email}`}>{email}</a>
            </li>
            <li>
              <a href={`tel:${phone.replace(/\s+/g, "")}`}>{phone}</a>
            </li>
            <li>{t("v4.footer.location")}</li>
            <li>
              <a href={instagram} target="_blank" rel="noopener noreferrer">
                Instagram
              </a>{" "}
              ·{" "}
              <a href={facebook} target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4>{t("v4.footer.news.title")}</h4>
          <p className="note" style={{ color: "#D9D2C3" }}>
            {t("v4.footer.news.desc")}
          </p>
          <NewsletterForm source="footer" variant="footer" />
        </div>
      </div>

      <div className="wrap footer-base">
        <span>{t("v4.footer.rights")}</span>
        <nav aria-label={t("v4.footer.legal")}>
          {legal.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
