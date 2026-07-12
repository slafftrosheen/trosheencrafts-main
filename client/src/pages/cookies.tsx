import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export default function CookiesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background py-20 px-6 selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/">
          <Button variant="ghost" className="mb-12 rounded-xl group font-bold">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back
          </Button>
        </Link>

        <header className="mb-16">
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-8">
            Cookie <span className="text-primary italic">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            How we use cookies to improve your artisan experience.
          </p>
        </header>

        <div className="prose prose-stone prose-xl dark:prose-invert max-w-none text-muted-foreground space-y-12">
          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit our website.
              They help us provide you with a better experience by remembering your preferences.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">How We Use Cookies</h2>
            <p>
              We use cookies for:
            </p>
            <ul>
              <li>Remembering your language preference (EN/LV/RU)</li>
              <li>Keeping items in your shopping cart</li>
              <li>Understanding how you use our site (analytics)</li>
              <li>Improving website performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">Types of Cookies We Use</h2>
            <div className="grid md:grid-cols-2 gap-6 not-prose">
              <div className="p-6 rounded-2xl bg-card/40 border-2 border-border/40">
                <h3 className="font-bold text-xl mb-3">Essential Cookies</h3>
                <p className="text-muted-foreground text-sm">Required for basic website functionality. Cannot be disabled.</p>
              </div>
              <div className="p-6 rounded-2xl bg-card/40 border-2 border-border/40">
                <h3 className="font-bold text-xl mb-3">Preference Cookies</h3>
                <p className="text-muted-foreground text-sm">Remember your settings like language and region.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">Managing Cookies</h2>
            <p>
              You can control cookies through your browser settings. However, disabling certain
              cookies may affect website functionality.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
