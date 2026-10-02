import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="site-container page-shell flex min-h-[70vh] items-center justify-center">
      <div className="max-w-2xl text-center">
        <p className="eyebrow">404</p>
        <h1 className="display-title mt-4">This piece isn&apos;t here.</h1>
        <p className="lead mx-auto mt-6 max-w-xl">
          The page may have moved, or the link may be old. The workshop and shop are still right where they should be.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Shop
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
