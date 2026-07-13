import { motion } from "framer-motion";
import { Link } from 'wouter';
import { Instagram, Facebook, MapPin, ArrowRight, Mail, Youtube, Send } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { BrandAssets } from '@/lib/imageAssets';
import { useSiteConfig } from '@/hooks/useSiteConfig';

import { NewsletterSubscribe } from '@/components/NewsletterSubscribe';

export function Footer() {
  const { t } = useLanguage();
  const config = useSiteConfig();
  const currentYear = new Date().getFullYear();

  // Build social links from config
  const socialLinks = [
    { Icon: Instagram, href: config.social.instagram, label: "Instagram" },
    { Icon: Facebook, href: config.social.facebook, label: "Facebook" },
    { Icon: Youtube, href: config.social.youtube, label: "YouTube" },
    { Icon: Send, href: config.social.telegram, label: "Telegram" },
    { Icon: Mail, href: "/contact", label: t("nav_contact") }
  ].filter(link => link.href && link.href.trim()); // Only show links that have a non-empty URL

  return (
    <footer className="py-40 border-t border-border/40 relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-4 gap-24 relative z-10">
        <div className="col-span-2 space-y-12">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex items-center justify-center">
              <img 
                src={BrandAssets.logo} 
                alt="Trosheen Crafts Logo" 
                className="w-full h-full object-contain grayscale brightness-0 opacity-80 group-hover:grayscale-0 group-hover:brightness-100 transition-all"
              />
            </div>
          </div>
          <p className="text-muted-foreground max-w-sm leading-relaxed text-2xl font-medium tracking-tight">
            {t("footer_desc")}
          </p>
          <div className="flex gap-6 pt-4 flex-wrap">
            {socialLinks.map(({ Icon, href, label }) => (
              <motion.a 
                key={label}
                href={href}
                target={href.startsWith('http') ? "_blank" : undefined}
                rel={href.startsWith('http') ? "noopener noreferrer" : undefined}
                whileHover={{ y: -5, scale: 1.1 }}
                className="w-16 h-16 rounded-[2rem] bg-card border-2 border-border/40 flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-xl"
                aria-label={label}
              >
                <Icon size={28} strokeWidth={1.5} />
              </motion.a>
            ))}
          </div>

          <div className="pt-6 max-w-sm">
            <h5 className="font-black uppercase tracking-[0.4em] text-[10px] text-primary/60 mb-4">{t("footer.newsletter_title") || "Newsletter"}</h5>
            <p className="text-sm text-muted-foreground mb-4">{t("footer.newsletter_desc") || "Get updates on new collections and workshop stories"}</p>
            <NewsletterSubscribe variant="compact" source="footer" />
          </div>
        </div>
        
        <div className="space-y-12">
          <h5 className="font-black uppercase tracking-[0.4em] text-[10px] text-primary/60">{t("footer_explore")}</h5>
          <ul className="space-y-8 text-xl font-bold text-muted-foreground">
            <li><Link href="/#story" className="hover:text-primary transition-all flex items-center group/foot">{t("nav_story")} <ArrowRight className="ml-2 w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover/foot:opacity-100 group-hover/foot:translate-x-0" /></Link></li>
            <li><Link href="/shop" className="hover:text-primary transition-all flex items-center group/foot">{t("nav_shop")} <ArrowRight className="ml-2 w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover/foot:opacity-100 group-hover/foot:translate-x-0" /></Link></li>
            <li><Link href="/gallery" className="hover:text-primary transition-all flex items-center group/foot">{t("gallery.title")} <ArrowRight className="ml-2 w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover/foot:opacity-100 group-hover/foot:translate-x-0" /></Link></li>
            <li><Link href="/guide" className="hover:text-primary transition-all flex items-center group/foot">{t("guide_care_eyebrow")} <ArrowRight className="ml-2 w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover/foot:opacity-100 group-hover/foot:translate-x-0" /></Link></li>
            <li><Link href="/blog" className="hover:text-primary transition-all flex items-center group/foot">{t("nav_blog")} <ArrowRight className="ml-2 w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover/foot:opacity-100 group-hover/foot:translate-x-0" /></Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-all flex items-center group/foot">{t("nav_contact")} <ArrowRight className="ml-2 w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover/foot:opacity-100 group-hover/foot:translate-x-0" /></Link></li>
            <li><Link href="/admin/login" className="hover:text-primary transition-all flex items-center group/foot">{t("common.studio")} <ArrowRight className="ml-2 w-5 h-5 opacity-0 -translate-x-2 transition-all group-hover/foot:opacity-100 group-hover/foot:translate-x-0" /></Link></li>
          </ul>
        </div>
        
        <div className="space-y-12">
          <h5 className="font-black uppercase tracking-[0.4em] text-[10px] text-primary/60">{t("footer_location")}</h5>
          <div className="space-y-6">
            <p className="text-xl text-muted-foreground leading-loose font-bold">
              {config.contact.address} <br />
              {t("footer.location_heart")} <br /><br />
              {t("footer.hours_mon_fri")}: {config.businessHours?.monFri || '09:00 - 18:00'} <br />
              {t("footer.hours_sat_sun")}: {config.businessHours?.satSun || t("footer.family_time")}
            </p>
            <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-[10px]">
              <MapPin size={16} /> {t("footer.open_visits")}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 pt-24 mt-24 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
        <p>© {currentYear} {t("footer.rights")}</p>
        <div className="flex gap-16">
           <Link href="/privacy"><a className="hover:text-primary transition-colors">{t("common.privacy")}</a></Link>
           <Link href="/terms"><a className="hover:text-primary transition-colors">{t("common.terms")}</a></Link>
           <Link href="/cookies"><a className="hover:text-primary transition-colors">{t("common.cookies")}</a></Link>
        </div>
      </div>
    </footer>
  );
}