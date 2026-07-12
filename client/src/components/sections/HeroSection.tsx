import { useRef, lazy, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Play } from 'lucide-react';
import { HeroPhotos } from '@/lib/imageAssets';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { useLanguage } from '@/lib/LanguageContext';
import { haptics } from '@/lib/haptics';

const DustParticles = lazy(() => import('@/components/effects/DustParticles').then(m => ({ default: m.DustParticles })));

export function HeroSection() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5"
    >
      <Suspense fallback={null}>
        {/* Dust Particle Effect */}
        <div className="absolute inset-0 pointer-events-none">
          <DustParticles density={60} color="rgba(139, 115, 85, 0.25)" interactive={false} />
        </div>
      </Suspense>

      {/* Background Image with Parallax */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y }}
      >
        <OptimizedImage
          src={HeroPhotos.main}
          alt="Trosheen Crafts Workshop"
          className="w-full h-full"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32"
        style={{ opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold uppercase tracking-wider"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t('hero.handcrafted')}
            </motion.div>

            {/* Main Heading */}
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight">
              {t('hero.title.line1')}
              <br />
              <span className="text-primary">{t('hero.title.line2')}</span>
              <br />
              {t('hero.title.line3')}
            </h1>

            {/* Subheading */}
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl">
              {t('hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop">
                <motion.button
                  className="group px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => haptics.playInteraction('tap')}
                >
                  {t('hero.cta.shop')}
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </motion.button>
              </Link>

              <motion.button
                className="group px-8 py-4 rounded-full border-2 border-foreground/20 bg-background/80 backdrop-blur-xl font-bold text-lg flex items-center justify-center gap-3 hover:border-primary hover:bg-primary/10 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play size={20} />
                {t('hero.cta.watch')}
              </motion.button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border/40">
              {[
                { number: '30+', label: t('hero.stats.years') },
                { number: '3', label: t('hero.stats.generations') },
                { number: '2K+', label: t('hero.stats.pieces') },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="font-serif text-3xl lg:text-4xl font-bold text-primary">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
              <OptimizedImage
                src={HeroPhotos.secondary}
                alt="Signature Heart Candle"
                className="w-full h-full"
                priority
              />

              {/* Floating Badge */}
              <motion.div
                className="absolute top-8 right-8 px-6 py-3 rounded-full bg-accent/90 backdrop-blur-xl border border-white/20 text-accent-foreground font-bold shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                ✨ Bestseller
              </motion.div>

              {/* Product Info Card */}
              <motion.div
                className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-background/95 backdrop-blur-xl border border-border shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <h3 className="font-serif text-2xl font-bold mb-2">
                  Heart in Hands Candle
                </h3>
                <p className="text-muted-foreground mb-3">
                  Burns away to reveal a hand-sculpted vessel
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-primary">€48</span>
                  <Link href="/shop/heart-hands-candle">
                    <motion.button
                      className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent/10 blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-sm uppercase tracking-wider font-medium">
            Scroll
          </span>
          <div className="w-6 h-10 rounded-full border-2 border-current flex items-start justify-center p-2">
            <motion.div
              className="w-1 h-2 bg-current rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
