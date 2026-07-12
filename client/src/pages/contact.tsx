import { ContactForm } from '@/components/features/ContactForm';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useLanguage } from '@/lib/LanguageContext';

export default function ContactPage() {
  const config = useSiteConfig();
  const { t } = useLanguage();

  return (
    <div className="bg-background min-h-screen selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4 block">{t("contact.title")}</span>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[0.9]">
            {t("contact.let_start")} <span className="text-primary italic">{t("contact.conversation")}</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium">
            {t("contact.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <Card className="rounded-[2.5rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">{t("admin.email")}</h3>
              <p className="text-muted-foreground font-medium">
                {config.contact.email}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">{t("contact.phone")}</h3>
              <p className="text-muted-foreground font-medium">
                {config.contact.phone}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden group hover:border-primary/20 transition-all">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 border border-primary/20 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">{t("contact.location")}</h3>
              <p className="text-muted-foreground font-medium">
                {config.contact.address}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
