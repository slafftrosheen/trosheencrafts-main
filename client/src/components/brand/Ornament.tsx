import { ORNAMENTS } from "@/lib/ornaments";

interface OrnamentProps {
  /** Key from the kit's Latvian ornament set: auseklis, saule, jumis, … */
  name: keyof typeof ORNAMENTS | string;
  size?: "sm" | "md" | "lg";
  /** Draws the ornament with the kit's ink animation when it scrolls into view. */
  draw?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Inlines a Latvian ornament SVG (currentColor stroke) from the v4 kit.
 * `[data-draw]` is picked up by useBrandMotion, which adds `.is-in` on scroll.
 */
export function Ornament({ name, size = "md", draw = false, className, style }: OrnamentProps) {
  const markup = ORNAMENTS[name];
  if (!markup) return null;

  const sizeClass = size === "sm" ? " ornament--sm" : size === "lg" ? " ornament--lg" : "";

  return (
    <span
      className={"ornament" + sizeClass + (className ? " " + className : "")}
      style={style}
      data-ornament={name}
      data-draw={draw ? true : undefined}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}
