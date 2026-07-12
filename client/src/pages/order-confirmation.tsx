import { CheckCircle2, ShoppingBag } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/LanguageContext';

export default function OrderConfirmation() {
  const { t } = useLanguage();

  return (
    <div className="bg-background min-h-screen selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      <div className="relative z-10 container mx-auto px-6 py-32 flex flex-col items-center">
        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-12 border-2 border-primary/20">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight mb-6 text-center">
          {t("confirm.title").split(' ').map((word, i) => (
            <span key={i} className={i === 1 ? "text-primary italic" : ""}>{word} </span>
          ))}
        </h1>
        <p className="text-2xl text-muted-foreground font-medium text-center max-w-2xl mb-12">
          {t("confirm.subtitle")}
        </p>
        <div className="max-w-xl text-center bg-card/40 p-10 rounded-[2.5rem] border-2 border-border/40 backdrop-blur-sm mb-12 shadow-xl">
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t("confirm.desc")}
          </p>
        </div>
        <Link href="/shop">
          <Button size="lg" className="rounded-2xl h-16 px-10 font-bold text-lg shadow-xl shadow-primary/20">
            <ShoppingBag className="mr-3" size={20} /> {t("confirm.continue")}
          </Button>
        </Link>
      </div>
    </div>
  );
}