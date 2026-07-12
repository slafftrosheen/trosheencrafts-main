import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';

interface PageLoaderProps {
  className?: string;
  text?: string;
}

export function PageLoader({ className, text }: PageLoaderProps) {
  const { t } = useLanguage();
  const loadingText = text || t("common.loading");

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center min-h-[60vh]',
        className
      )}
    >
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground animate-pulse font-serif italic">{loadingText}</p>
    </div>
  );
}

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeClasses[size], className)}
    />
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      aria-hidden="true"
    />
  );
}

// Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-4 p-8 border-2 border-border/40 rounded-[2.5rem] bg-card/40">
      <Skeleton className="aspect-square w-full rounded-2xl" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-3/4 rounded" />
          <Skeleton className="h-6 w-1/4 rounded" />
        </div>
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}

// Blog Card Skeleton
export function BlogCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3 p-4 border rounded-lg">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center space-x-4 p-4 border-b">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export function LoadingOverlay({ isLoading, children, text }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-inherit">
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            {text && <p className="text-sm text-muted-foreground font-serif">{text}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
