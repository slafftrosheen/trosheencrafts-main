import type { ImgHTMLAttributes } from "react";
import { useHomepageImages } from "@/hooks/useHomepageImages";
import { DEFAULT_HOMEPAGE_IMAGES } from "@/lib/homepageImages";

export function SiteLogo({ tone = "spruce", variant = "seal", ...props }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { tone?: "spruce" | "linen"; variant?: "seal" | "lockup-horizontal" }) {
  const { image } = useHomepageImages();
  const configured = image("siteLogo");
  const fallback = `/brand/${variant}-${tone}.svg`;
  return <img {...props} src={configured === DEFAULT_HOMEPAGE_IMAGES.siteLogo ? fallback : configured}
    onError={(event) => { if (!event.currentTarget.src.endsWith(fallback)) event.currentTarget.src = fallback; }} />;
}
