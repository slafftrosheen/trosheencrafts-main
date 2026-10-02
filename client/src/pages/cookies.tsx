import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookiesPage() {
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
        <h1 className="display-title mt-4">Cookie policy</h1>
        <p className="lead mt-6 max-w-3xl">
          A plain-language overview of the browser storage used by the shop.
        </p>

        <div className="mt-12 space-y-10 text-base leading-8 text-muted-foreground">
          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Essential storage</h2>
            <p className="mt-3">
              The site uses session and security mechanisms needed for sign-in, CSRF protection and normal server operation. The shopping basket also needs browser storage so your selected items are not lost between pages.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Preferences</h2>
            <p className="mt-3">
              Browser storage may remember preferences such as your selected language. These settings make repeat visits more useful without requiring an account.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Analytics</h2>
            <p className="mt-3">
              Where analytics features are enabled, they are used to understand aggregate site usage and improve the shop. Any non-essential tracking that legally requires consent should only be activated after the required consent has been obtained.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-3xl font-semibold text-foreground">Controls</h2>
            <p className="mt-3">
              You can clear or block browser storage through your browser settings. Blocking essential storage can prevent checkout, language preferences or other site functions from working correctly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
