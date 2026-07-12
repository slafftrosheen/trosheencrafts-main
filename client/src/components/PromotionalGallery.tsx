import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { cn } from '@/lib/utils';

interface Promotion {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  videoUrl?: string;
  linkUrl?: string;
  linkText?: string;
  active: boolean;
}

export function PromotionalGallery() {
  const { data: promotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => apiClient.get<Promotion[]>('/promotions'),
  });

  const { data: config } = useQuery({
    queryKey: ['site-config-gallery'],
    queryFn: () => apiClient.get<{ value: { heading: string } }>('/site-config/promotionalGallery'),
  });

  const heading = config?.value?.heading || 'Featured Collections';

  if (!promotions.length) return null;

  return (
    <section className="py-16 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <h2 className="font-serif text-3xl font-bold tracking-tight">{heading}</h2>
      </div>
      
      <div className="flex gap-6 px-6 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide -mx-6 sm:mx-0 sm:px-0 sm:pl-[max(1.5rem,calc((100vw-80rem)/2))]">
        {/* Spacer for left padding on mobile to allow full bleed but padded start */}
        <div className="w-px shrink-0 sm:hidden" /> 
        
        {promotions.map((promo, i) => (
          <motion.div
            key={promo.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative shrink-0 w-[85vw] sm:w-[400px] md:w-[500px] aspect-[4/5] sm:aspect-[3/4] rounded-[2rem] overflow-hidden snap-center group border-2 border-white/10 concrete-shadow bg-black"
          >
            {promo.videoUrl ? (
              <video 
                src={promo.videoUrl} 
                poster={promo.imageUrl}
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
            ) : (
              <OptimizedImage 
                src={promo.imageUrl} 
                alt={promo.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3 leading-none tracking-tight">
                  {promo.title}
                </h3>
                {promo.description && (
                  <p className="text-white/70 text-lg mb-6 line-clamp-2 font-medium">
                    {promo.description}
                  </p>
                )}
                {promo.linkUrl && (
                  <Link href={promo.linkUrl}>
                    <Button 
                      size="lg" 
                      className="rounded-full bg-white text-black hover:bg-white/90 font-bold px-8"
                    >
                      {promo.linkText || 'Explore'} 
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
        
        {/* Spacer for right padding */}
        <div className="w-6 shrink-0 sm:w-[max(1.5rem,calc((100vw-80rem)/2))]" />
      </div>
    </section>
  );
}
