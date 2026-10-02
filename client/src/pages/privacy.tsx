import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteConfig } from "@/hooks/useSiteConfig";

export default function PrivacyPage() {
  const config = useSiteConfig();
  const contactEmail = config.contact.email || "info@trosheen.shop";

  return (
    <div className="page-shell">
      <div className="site-container max-w-4xl">
        <Button asChild variant="ghost" className="-ml-3 mb-8">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Button>

        <p className="eyebrow">Legal</p>
        <h1 className="display-title mt-4">Privacy policy</h1>
        <p className="lead mt-6 max-w-3xl">
          How Trosheen.Crafts uses the minimum personal information needed to run the shop, fulfil orders and answer you.
        </p>

        <div className="mt-12 space-y-10 text-base leading-8 text-muted-foreground">
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">1. Information we collect</h2>
            <p className="mt-3">
              We may collect your name, email address, shipping details, order information, messages you send us and technical information needed to keep the website secure and functional.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">2. Orders and payments</h2>
            <p className="mt-3">
              We use your order and delivery information to fulfil purchases, provide support and meet accounting or legal obligations. Online payment is handled by SumUp. Trosheen.Crafts does not store your full payment-card details.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">3. Messages and newsletter</h2>
            <p className="mt-3">
              Contact-form messages are used to reply to your request. Newsletter email is used only when you subscribe and can be unsubscribed from using the unsubscribe mechanism provided with those communications.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">4. Storage and security</h2>
            <p className="mt-3">
              We keep personal data only for as long as it is reasonably needed for the purpose it was collected for, or where retention is required by law. We use access controls, secure sessions and encrypted transport to reduce unauthorised access.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">5. Your data rights</h2>
            <p className="mt-3">
              Depending on the applicable law, you may ask for access, correction, deletion, restriction or portability of your personal data, or object to certain processing. Contact us at {contactEmail}.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">6. Contact</h2>
            <p className="mt-3">
              Privacy questions can be sent to {contactEmail}. Trosheen.Crafts operates from Daugavpils, Latvia.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
