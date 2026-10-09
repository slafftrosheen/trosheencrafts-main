import type { ImgHTMLAttributes } from "react";
import { useHomepageImages } from "@/hooks/useHomepageImages";
import { DEFAULT_HOMEPAGE_IMAGES } from "@/lib/homepageImages";

export function SiteLogo(props: Omit<ImgHTMLAttributes<HTMLImageElement>, "src">) {
  const { image } = useHomepageImages();
  const fallback = DEFAULT_HOMEPAGE_IMAGES.siteLogo;

  return (
    <img
      {...props}
      src={image("siteLogo")}
      onError={(event) => {
        if (event.currentTarget.src !== new URL(fallback, document.baseURI).href) {
          event.currentTarget.src = fallback;
        }
      }}
    />
  );
}
