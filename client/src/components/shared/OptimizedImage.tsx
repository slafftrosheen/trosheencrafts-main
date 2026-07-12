import { LazyImage } from './LazyImage';

export function OptimizedImage(props: React.ComponentProps<typeof LazyImage>) {
  return <LazyImage {...props} />;
}