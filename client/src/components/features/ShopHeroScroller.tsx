import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { ChevronLeft, ChevronRight, Sparkles, Gift, Percent, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductPhotos } from '@/lib/imageAssets';
import { productLinks } from '@/data/navigationLinks';
import { OptimizedImage } from '@/components/shared/OptimizedImage';

interface Promotion {
  id: string;
  type: 'sale' | 'new' | 'limited' | 'gift';
  title: string;
  subtitle: string;
  description: string;
  discount?: string;
  image: string;
  link: string;
  bgGradient: string;
  textColor: string;
  icon: typeof Sparkles;
}

const promotions: Promotion[] = [
  {
    id: '1',
    type: 'sale',
    title: "Valentine's Day Special",
    subtitle: '20% OFF Collection',
    description: 'Hand-crafted heart candles & decorative pieces. Limited time only.',
    discount: '-20%',
    image: ProductPhotos.candles.valentineCollection,
    link: productLinks.valentineCollection,
    bgGradient: 'from-rose-500/20 via-pink-500/20 to-red-500/20',
    textColor: 'text-rose-900',
    icon: Gift,
  },
  {
    id: '2',
    type: 'new',
    title: 'New Arrival',
    subtitle: 'Latvian Heritage Collection',
    description: 'Traditional folk patterns meet modern concrete craft. Celebrating our roots.',
    image: ProductPhotos.candles.latvianMotif,
    link: productLinks.latvianMotif,
    bgGradient: 'from-amber-500/20 via-orange-500/20 to-yellow-500/20',
    textColor: 'text-amber-900',
    icon: Sparkles,
  },
  {
    id: '3',
    type: 'limited',
    title: 'Limited Edition',
    subtitle: 'Woman Face Sculpture',
    description: 'Only 5 pieces available. Hand-carved details with bronze patina.',
    image: ProductPhotos.candles.womanFace,
    link: productLinks.womanFace,
    bgGradient: 'from-violet-500/20 via-purple-500/20 to-fuchsia-500/20',
    textColor: 'text-violet-900',
    icon: Clock,
  },
  {
    id: '4',
    type: 'sale',
    title: 'Spring Garden Sale',
    subtitle: '15% OFF Outdoor Pieces',
    description: 'Botanical stepping stones & planters. Weather-resistant concrete.',
    discount: '-15%',
    image: ProductPhotos.garden.leafStone,
    link: productLinks.leafStone,
    bgGradient: 'from-emerald-500/20 via-green-500/20 to-teal-500/20',
    textColor: 'text-emerald-900',
    icon: Percent,
  },
];

export function ShopHeroScroller() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Optimized Auto-scroll effect using requestAnimationFrame
  useEffect(() => {
    if (!isAutoPlaying) return;

    let lastTime = 0;
    const interval = 5000; // 5 seconds
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;

      if (currentTime - lastTime >= interval) {
        setActiveIndex((prev) => (prev + 1) % promotions.length);
        lastTime = currentTime;
      }
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isAutoPlaying]);

  // Scroll to active slide
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const slideWidth = container.offsetWidth;

    container.scrollTo({
      left: slideWidth * activeIndex,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % promotions.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setActiveIndex(index);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-background">
      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex h-full w-full overflow-x-hidden scroll-smooth"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {promotions.map((promo, index) => (
          <div
            key={promo.id}
            className="relative h-full w-full flex-shrink-0 flex items-center justify-center"
          >
            {/* Background Image with Parallax */}
            <motion.div
              className="absolute inset-0 z-0"
              initial={{ scale: 1.2 }}
              animate={{ scale: index === activeIndex ? 1 : 1.2 }}
              transition={{ duration: 0.8 }}
            >
              <OptimizedImage
                src={promo.image}
                alt={promo.title}
                className="h-full w-full"
                objectFit="cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
              <div className={`absolute inset-0 bg-gradient-to-br ${promo.bgGradient}`} />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{
                    opacity: index === activeIndex ? 1 : 0,
                    x: index === activeIndex ? 0 : -100
                  }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-8"
                >
                  {/* Badge */}
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-background/80 backdrop-blur-xl border-2 border-border/40">
                    <promo.icon className="w-5 h-5 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-widest text-foreground">
                      {promo.type === 'sale' && 'Special Offer'}
                      {promo.type === 'new' && 'New Arrival'}
                      {promo.type === 'limited' && 'Limited Edition'}
                      {promo.type === 'gift' && 'Gift Set'}
                    </span>
                  </div>

                  {/* Main Title */}
                  <div>
                    <h2 className="font-serif text-6xl lg:text-8xl font-bold leading-[0.9] tracking-tighter mb-4">
                      {promo.title}
                    </h2>
                    <p className={`font-serif text-4xl lg:text-5xl font-bold italic ${promo.textColor}`}>
                      {promo.subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
                    {promo.description}
                  </p>

                  {/* Discount Badge (if applicable) */}
                  {promo.discount && (
                    <motion.div
                      animate={{ rotate: [0, -5, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block px-8 py-4 rounded-3xl bg-accent text-accent-foreground text-3xl font-black shadow-2xl"
                    >
                      {promo.discount}
                    </motion.div>
                  )}

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Link href={promo.link}>
                      <Button
                        size="lg"
                        className="rounded-full px-12 h-16 text-lg font-bold shadow-2xl shadow-primary/40 group"
                      >
                        Shop Now
                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="/shop">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full px-12 h-16 text-lg font-bold border-2 bg-background/60 backdrop-blur-xl"
                      >
                        View All Products
                      </Button>
                    </Link>
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-3 pt-8">
                    <span className="text-sm font-medium text-muted-foreground">
                      {String(activeIndex + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 h-1 bg-border/40 rounded-full overflow-hidden max-w-xs">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: '0%' }}
                        animate={{ width: index === activeIndex && isAutoPlaying ? '100%' : '0%' }}
                        transition={{ duration: 5, ease: 'linear' }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {String(promotions.length).padStart(2, '0')}
                    </span>
                  </div>
                </motion.div>

                {/* Product Image (Right Side) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: index === activeIndex ? 1 : 0,
                    scale: index === activeIndex ? 1 : 0.8
                  }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="hidden lg:block relative"
                >
                  <div className="aspect-square rounded-[4rem] overflow-hidden shadow-2xl border-4 border-white/20">
                    <OptimizedImage
                      src={promo.image}
                      alt={promo.title}
                      className="w-full h-full"
                      objectFit="cover"
                      priority={index === 0}
                    />
                  </div>

                  {/* Floating Price Tag */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-8 -right-8 px-8 py-6 rounded-3xl bg-primary text-primary-foreground shadow-2xl"
                  >
                    <p className="text-sm font-bold uppercase tracking-wider mb-1">From</p>
                    <p className="text-4xl font-black">€38</p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-background/80 backdrop-blur-xl border-2 border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-xl"
        aria-label="Previous promotion"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-background/80 backdrop-blur-xl border-2 border-border/40 flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all shadow-xl"
        aria-label="Next promotion"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dot Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {promotions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-2 rounded-full transition-all ${
              index === activeIndex
                ? 'w-12 bg-primary'
                : 'w-2 bg-border/60 hover:bg-border'
            }`}
            aria-label={`Go to promotion ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-xs uppercase tracking-wider font-medium">Scroll to explore</span>
        <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-2">
          <motion.div
            className="w-1 h-2 bg-current rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
