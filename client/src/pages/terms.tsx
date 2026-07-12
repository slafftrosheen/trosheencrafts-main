import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";

export default function TermsPage() {
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
            Terms of <span className="text-primary italic">Service</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Agreement for using our workshop studio services.
          </p>
        </header>

        <div className="prose prose-stone prose-xl dark:prose-invert max-w-none text-muted-foreground space-y-12">
          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">1. Handcrafted Nature</h2>
            <p>
              Every piece at Trosheen Crafts is handmade by our family. Slight variations in color,
              texture, and form are natural characteristics that make each piece unique. These are
              not defects but proof of authentic handcraft.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">2. Orders & Processing</h2>
            <p>
              Orders are processed within 3-5 business days. Custom pieces may take 2-4 weeks
              depending on complexity. We'll keep you updated throughout the creation process.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">3. Shipping</h2>
            <p>
              We ship from Daugavpils, Latvia. Each piece is carefully packed by hand using
              sustainable materials. Shipping times vary by destination (EU: 5-10 days, International: 10-20 days).
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">4. Returns & Exchanges</h2>
            <p>
              Due to the handcrafted nature of our work, we cannot accept returns for change of mind.
              However, if your piece arrives damaged, contact us within 48 hours with photos and
              we'll make it right.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">5. Care Instructions</h2>
            <p>
              Concrete pieces are durable but require care. Keep indoor pieces away from excessive
              moisture. Outdoor pieces are weatherproof but may develop natural patina over time—
              this is intentional and adds character.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
