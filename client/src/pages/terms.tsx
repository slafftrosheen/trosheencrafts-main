import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
        <h1 className="display-title mt-4">Terms of sale</h1>
        <p className="lead mt-6 max-w-3xl">
          The practical terms for ordering handmade Trosheen.Crafts pieces online.
        </p>

        <div className="mt-12 space-y-10 text-base leading-8 text-muted-foreground">
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">1. Handmade character</h2>
            <p className="mt-3">
              Our pieces are made by hand. Small variations in colour, surface, texture and form are part of the material and making process. Product descriptions and photographs are intended to represent the piece as accurately as practical.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">2. Orders and payment</h2>
            <p className="mt-3">
              The price shown at checkout is the order price. Payment is processed by SumUp. An order is accepted subject to successful payment and product availability.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">3. Making and delivery</h2>
            <p className="mt-3">
              Ready-made pieces are normally prepared for dispatch within the timeframe shown with the product or order communication. Custom work may take longer. Delivery timing depends on destination and carrier and will be communicated where available.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">4. Right of withdrawal</h2>
            <p className="mt-3">
              For standard goods bought online, consumers generally have a 14-day statutory withdrawal period under applicable EU and Latvian distance-selling rules. The period and any return obligations are governed by the law that applies to the transaction.
            </p>
            <p className="mt-3">
              Statutory exceptions can apply, including to goods made to the consumer&apos;s specifications or clearly personalised. A custom configuration is not automatically treated as exempt unless the legal conditions for the exception are met.
            </p>
            <Button asChild className="mt-6">
              <Link href="/withdrawal">
                Withdraw from contract
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">5. Damaged or non-conforming goods</h2>
            <p className="mt-3">
              Statutory rights relating to damaged, defective or non-conforming goods are separate from the withdrawal right. If a piece arrives damaged or there is a problem with the order, contact us promptly with the order reference and photographs where useful.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">6. Care</h2>
            <p className="mt-3">
              Concrete, gypsum, resin, wax and decorative finishes have different care requirements. Follow the care guidance supplied with the piece and the guidance published on this site.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
