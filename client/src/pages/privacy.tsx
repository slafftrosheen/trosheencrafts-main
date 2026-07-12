import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { useSiteConfig } from '@/hooks/useSiteConfig';

export default function PrivacyPage() {
  const { t } = useLanguage();
  const config = useSiteConfig();
  const contactEmail = config.contact.email || 'hello@trosheen.crafts';

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
            Privacy <span className="text-primary italic">Policy</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            How we protect your data at Trosheen Crafts.
          </p>
        </header>

        <div className="prose prose-stone prose-xl dark:prose-invert max-w-none text-muted-foreground space-y-12">
          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">1. Information We Collect</h2>
            <p>
              Trosheen Crafts collects minimal personal information necessary to process your orders
              and provide you with the best handcrafted experience. This includes your name, email,
              shipping address, and payment information (processed securely through Stripe).
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">2. How We Use Your Information</h2>
            <p>
              We use your information solely to fulfill orders, send order confirmations, provide
              customer support, and occasionally share updates about new pieces from our workshop.
              We never sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">3. Data Security</h2>
            <p>
              Your data is stored securely and encrypted. We use industry-standard security measures
              to protect your personal information from unauthorized access. Payment processing is
              handled entirely by Stripe — we never see or store your card details.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">4. Your Rights</h2>
            <p>
              You have the right to access, modify, or delete your personal data at any time.
              Contact us at {contactEmail} to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-foreground font-serif text-3xl font-bold">5. Contact Us</h2>
            <p>
              For privacy-related questions, contact us at {contactEmail} or visit our workshop
              in Daugavpils, Latvia.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
