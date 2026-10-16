import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  aspectRatio?: string;
  fallbackText?: string;
}

export function LazyImage({
  src, alt, aspectRatio, className, fallbackText, ...props
}: LazyImageProps) {
  const { t } = useLanguage();
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const placeholder = !src || src === "/placeholder.webp" || src.includes("placehold.co");
  const failed = placeholder || failedSrc === src;
  const loaded = !failed && loadedSrc === src;

  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-muted/20", className)}
      style={{ aspectRatio }}>
      {!failed && !loaded && <div className="absolute inset-0 animate-pulse bg-muted/40" aria-hidden="true" />}
      {failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/10 p-4 text-center text-muted-foreground/70">
          <ImageOff className="mb-2 h-10 w-10 opacity-60" aria-hidden="true" />
          <span className="text-xs font-medium">{fallbackText || t("v4.media.unavailable")}</span>
        </div>
      ) : (
        <img src={src ?? undefined} alt={alt} loading="lazy"
          onLoad={() => setLoadedSrc(src ?? null)}
          onError={() => setFailedSrc(src ?? null)}
          className={cn("h-full w-full object-cover transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
          {...props} />
      )}
    </div>
  );
}
