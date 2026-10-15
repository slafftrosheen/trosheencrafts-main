import type { CSSProperties } from "react";

/** Decorative icons from the supplied 1.5px brand set; inherit surrounding text colour. */
export function BrandIcon({ name, className = "" }: { name: "bag" | "menu"; className?: string }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 ${className}`} style={{
    width: "1.25rem", height: "1.25rem", backgroundColor: "currentColor",
    mask: `url('/brand/icons/${name}.svg') center / contain no-repeat`,
    WebkitMask: `url('/brand/icons/${name}.svg') center / contain no-repeat`,
  } as CSSProperties} />;
}
