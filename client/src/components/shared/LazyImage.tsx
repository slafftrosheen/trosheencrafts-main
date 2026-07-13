import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt: string;
  aspectRatio?: string;
  fallbackText?: string;
}

export function LazyImage({
  src,
  alt,
  aspectRatio,
  className,
  fallbackText = 'Image not available',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If src is obviously a placeholder string or empty, default to error state
  const isPlaceholder = !src || src === '/placeholder.webp' || src.includes('placehold.co');

  useEffect(() => {
    if (isPlaceholder) {
      setHasError(true);
      setIsLoaded(true);
      return;
    }

    if (!imgRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [src, isPlaceholder]);

  return (
    <div
      className={cn('relative overflow-hidden bg-muted/20 flex items-center justify-center', className)}
      style={{ aspectRatio }}
    >
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-muted/40" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 bg-muted/10 p-4 text-center">
          <ImageOff className="w-12 h-12 mb-2 opacity-50" />
          <span className="text-xs font-medium uppercase tracking-wider">{fallbackText}</span>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={isInView ? src! : undefined}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          className={cn(
            'w-full h-full object-cover transition-all duration-700',
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          )}
          {...props}
        />
      )}
    </div>
  );
}
