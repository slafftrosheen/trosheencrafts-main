import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MapPin, Sparkles, Instagram, Recycle, Heart, ShieldCheck, ChevronDown, Play, Users, Home as HomeIcon, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { HeroPhotos, ScrollStoryPhotos, ProductPhotos, WorkshopTourPhotos, BrandAssets } from "@/lib/imageAssets";
import { haptics } from '@/lib/haptics';

import { NewsletterSubscribe } from '@/components/NewsletterSubscribe';
import { PromotionalGallery } from '@/components/PromotionalGallery';

const chapters = [
  {
    id: "heritage",
    eyebrowKey: "chapter_heritage_eyebrow",
    titleKey: "chapter_heritage_title",
    image: ScrollStoryPhotos.chapter1_heritage,
    bodyKey: "chapter_heritage_body_1",
    icon: HomeIcon,
  },
  {
    id: "makers",
    eyebrowKey: "chapter_makers_eyebrow",
    titleKey: "chapter_makers_title",
    image: ScrollStoryPhotos.chapter3_crafting,
    bodyKey: "chapter_makers_body_1",
    icon: Sparkles,
  },
  {
    id: "legacy",
    eyebrowKey: "chapter_legacy_eyebrow",
    titleKey: "chapter_legacy_title",
    image: ScrollStoryPhotos.chapter4_family,
    bodyKey: "chapter_legacy_body_1",
    icon: Users,
  },
  {
    id: "philosophy",
    eyebrowKey: "chapter_philosophy_eyebrow",
    titleKey: "chapter_philosophy_title",
    image: ScrollStoryPhotos.chapter5_mastery,
    bodyKey: "chapter_philosophy_body_1",
    icon: Leaf,
  },
] as const;

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div className="flex gap-1.5 sm:gap-2">
      {(["en", "lv", "ru"] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => setLanguage(lang)}
          className={cn(
            "text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-1 rounded border transition-all",
            language === lang ? "bg-primary text-white border-primary" : "border-border/40 hover:border-primary/40 text-muted-foreground"
          )}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const [active, setActive] = useState<typeof chapters[number]["id"]>("heritage");
  const reduceMotion = useReducedMotion();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const activeChapter = useMemo(
    () => chapters.find((c) => c.id === active) ?? chapters[0],
    [active],
  );

  return (
    <div className="min-h-dvh bg-background text-foreground selection:bg-primary/20 overflow-x-hidden">
      {/* Dynamic Halo Flow Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full" 
        />
        <motion.div 
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.1, 0.2],
            x: [0, -40, 0],
            y: [0, -60, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[30%] -right-[10%] w-[50%] h-[50%] bg-accent/20 blur-[150px] rounded-full" 
        />
        <div className="absolute inset-0 opacity-40 noise" />
      </div>

      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative min-h-[100dvh] flex items-center pt-16 sm:pt-20 overflow-hidden">
        <motion.div style={{ scale, y }} className="absolute inset-0 z-0">
          <img src={HeroPhotos.main} alt="Workshop" className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full text-center md:text-left py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="inline-block origin-left"
            >
              <span className="inline-flex items-center gap-2 py-2 px-4 sm:px-6 rounded-full bg-accent/20 text-accent text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-6 sm:mb-8 border border-accent/30 backdrop-blur-md">
                <Heart className="w-3 h-3 fill-current" />
                {t("hero_location")}
              </span>
            </motion.div>
            
            <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[9rem] font-bold leading-[0.9] tracking-tighter mb-6 sm:mb-10 overflow-hidden">
              <motion.span 
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="block"
              >
                {t("hero_title_1")}
              </motion.span>
              <motion.span 
                initial={{ y: "100%" }} 
                animate={{ y: 0 }} 
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-primary italic block pb-2 sm:pb-4"
              >
                {t("hero_title_2")}
              </motion.span>
            </h1>
            
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 1, delay: 0.8 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-foreground/80 leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto md:mx-0 font-medium text-balance"
            >
              {t("hero_subtitle")}
            </motion.p>

            {/* Family badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mb-8 sm:mb-10 flex justify-center md:justify-start"
            >
              <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold border border-primary/20">
                <Users className="w-4 h-4" />
                {t("hero.family_badge")}
              </span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center md:justify-start"
            >
              <Button size="lg" particles particleCount={20} className="rounded-full px-8 sm:px-12 text-base sm:text-lg h-14 sm:h-16 shadow-2xl shadow-primary/30 group/hero-btn w-full sm:w-auto" asChild>
                <a href="#story">
                  {t("hero_cta_primary")}
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/hero-btn:translate-x-1" />
                </a>
              </Button>
              <Button size="lg" variant="outline" particles particleCount={15} className="rounded-full px-8 sm:px-12 text-base sm:text-lg h-14 sm:h-16 bg-background/20 backdrop-blur-xl border-white/20 hover:bg-white/10 transition-all w-full sm:w-auto" asChild>
                <Link href="/shop">{t("hero_cta_secondary")}</Link>
              </Button>
            </motion.div>

            {/* Family stats on mobile */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="grid grid-cols-3 gap-4 sm:gap-8 mt-10 sm:mt-16 pt-8 sm:pt-10 border-t border-white/10 max-w-lg mx-auto md:mx-0"
            >
              {[ 
                { value: "30+", label: t("hero.stats.years") },
                { value: "3", label: t("hero.stats.generations") },
                { value: "2K+", label: t("hero.stats.pieces") },
              ].map((stat, i) => (
                <div key={i} className="text-center md:text-left">
                  <div className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-foreground/60 uppercase tracking-wider font-bold mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        <motion.div 
          style={{ opacity }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/40"
        >
          <ChevronDown size={28} strokeWidth={1} className="sm:w-8 sm:h-8" />
        </motion.div>
      </section>

      {/* Promotional Gallery */}
      <PromotionalGallery />

      {/* Detailed Story Section with Interactivity - REDESIGNED FOR MOBILE */}
      <section id="story" className="py-16 sm:py-24 md:py-40 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <motion.span 
              initial={{ width: 0 }} 
              whileInView={{ width: 48 }} 
              className="h-px bg-primary" 
            />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-primary">{t("story.narrative")}</span>
            <motion.span 
              initial={{ width: 0 }} 
              whileInView={{ width: 48 }} 
              className="h-px bg-primary" 
            />
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-[1.1] tracking-tighter">
            {t("story.headline")}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            {t("story.intro")}
          </p>
        </motion.div>

        {/* MOBILE: Vertical Stacked Cards (shown on mobile/tablet) */}
        <div className="lg:hidden space-y-6">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <button
                onClick={() => {
                  setActive(chapter.id);
                  haptics.playInteraction('tap');
                }}
                className="w-full text-left"
              >
                {/* Chapter Card with Image Background */}
                <div className={cn(
                  "relative rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500",
                  active === chapter.id 
                    ? "concrete-shadow ring-2 ring-primary/30" 
                    : "opacity-80 hover:opacity-100"
                )}>
                  {/* Image Background */}
                  <div className="aspect-[16/10] relative">
                    <img 
                      src={chapter.image} 
                      alt={t(chapter.titleKey)} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                    
                    {/* Chapter Number Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 backdrop-blur-md",
                        active === chapter.id 
                          ? "bg-primary text-white shadow-lg shadow-primary/30" 
                          : "bg-white/20 text-white"
                      )}>
                        <chapter.icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Chapter Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary/90 mb-1 block">
                        {t(chapter.eyebrowKey)}
                      </span>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                        {t(chapter.titleKey)}
                      </h3>
                    </div>
                  </div>
                </div>
              </button>

              {/* Expandable Content */}
              <AnimatePresence>
                {active === chapter.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 space-y-5">
                      {/* Quote */}
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <div className="w-1 h-full min-h-[40px] bg-primary/40 rounded-full flex-shrink-0" />
                        <p className="text-sm sm:text-base font-serif italic text-foreground/80 leading-relaxed">
                          {chapter.id === 'makers' ? t("story.makers.quote") : t("story.default.quote")}
                        </p>
                      </div>

                      {/* Story Body */}
                      <div className="space-y-4 text-sm sm:text-base leading-[1.8] text-muted-foreground">
                        {t(chapter.bodyKey).split("\n").filter(Boolean).map((p, i) => (
                          <p key={`${chapter.id}-mobile-para-${i}`}>{p}</p>
                        ))}
                      </div>

                      {/* CTA */}
                      <Link href="/shop">
                        <Button variant="outline" className="w-full rounded-xl h-12 text-sm font-bold uppercase tracking-wide border-primary/30 hover:bg-primary hover:text-white transition-all group/cta">
                          {t("explore_collections")} 
                          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/cta:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* DESKTOP: Two-column layout (hidden on mobile) */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-24 xl:gap-32 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="sticky top-32"
          >
            {/* Desktop Chapter Navigation */}
            <div className="grid gap-3">
              {chapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => setActive(chapter.id)}
                  className={cn(
                    "group text-left p-6 rounded-[2rem] transition-all duration-500 border-2 relative overflow-hidden",
                    active === chapter.id 
                      ? "bg-card border-primary/30 concrete-shadow scale-[1.02]" 
                      : "border-transparent opacity-60 hover:opacity-100 hover:bg-card/40"
                  )}
                >
                  {active === chapter.id && (
                    <motion.div 
                      layoutId="active-bg-desktop"
                      className="absolute inset-0 bg-primary/5 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="flex items-center gap-5">
                    <motion.div 
                      animate={active === chapter.id ? { scale: [1, 1.1, 1] } : {}}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md flex-shrink-0",
                        active === chapter.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <chapter.icon className="w-7 h-7" strokeWidth={1.5} />
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1 block">{t(chapter.eyebrowKey)}</span>
                      <h3 className="font-serif text-2xl font-bold tracking-tight">{t(chapter.titleKey)}</h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Desktop Story Content Panel */}
          <div className="space-y-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-12"
              >
                {/* Image with quote overlay */}
                <div className="aspect-[4/5] rounded-[3rem] overflow-hidden concrete-shadow group relative">
                  <motion.img 
                    src={activeChapter.image} 
                    alt={activeChapter.id} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-10 left-10 right-10"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-px bg-primary" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">{t("workshop_insight")}</span>
                    </div>
                    <p className="text-white text-lg lg:text-xl font-serif italic font-medium leading-relaxed">
                      {activeChapter.id === 'makers' ? t("story.makers.quote") : t("story.default.quote")}
                    </p>
                  </motion.div>
                </div>
                
                {/* Story body text */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-8 text-xl leading-[1.7] text-muted-foreground font-medium"
                >
                  {t(activeChapter.bodyKey).split("\n").filter(Boolean).map((p, i) => <p key={`${activeChapter.id}-desktop-para-${i}`}>{p}</p>)}
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-8 border-t border-border/40"
                >
                  <Link href="/shop">
                    <Button variant="link" className="text-primary p-0 font-black h-auto text-xl group/btn uppercase tracking-tight">
                      {t("explore_collections")} <ArrowRight className="ml-3 w-6 h-6 transition-transform group-hover/btn:translate-x-2" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Materials Section - Highlighting multi-material approach */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 px-4 sm:px-6 relative overflow-hidden bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 sm:gap-16 md:gap-20 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8 md:space-y-10">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-primary">{t("material.precision")}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95]">
              {t("material.microscopic")}
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">
              {t("material.desc")}
            </p>
            
            {/* Material badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[ 
                t("about.materials.concrete.name"),
                t("about.materials.gypsum.name"),
                t("about.materials.acrylics.name"),
                t("about.materials.resins.name")
              ].map((material) => (
                <span key={material} className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold border border-primary/20">
                  {material}
                </span>
              ))}
            </div>
            
            <div className="flex gap-6 sm:gap-8 pt-4">
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary">30+</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">{t("material.layer")}</span>
              </div>
              <div className="w-px h-10 sm:h-12 bg-border/40" />
              <div className="flex flex-col">
                <span className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary">Baltic</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">{t("material.compressive")}</span>
              </div>
            </div>
          </motion.div>

          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="aspect-square rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden concrete-shadow relative border-2 sm:border-4 border-white/10"
            >
              <motion.img 
                src={WorkshopTourPhotos.materialsArea} 
                alt="Materials Texture" 
                className="w-full h-full object-cover transition-transform duration-700"
                whileHover={{ scale: 1.1 }}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Artisan Workshop - Family & Passion Theme */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 relative overflow-hidden bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10 sm:gap-12 md:gap-16 lg:gap-20">
            <div className="w-full lg:w-1/2 relative">
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 className="rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden concrete-shadow relative group aspect-[4/5] sm:aspect-square"
               >
                  <img src={WorkshopTourPhotos.finishingStudio} alt="Family Workshop" className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8 md:bottom-10 md:left-10">
                     <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-white/80 mb-2 sm:mb-3 block">{t("artisan.hands")}</span>
                     <h3 className="text-white font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold italic">{t("artisan.soul")}</h3>
                  </div>
               </motion.div>
               {/* Decorative glow */}
               <motion.div 
                 animate={{ rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
                 transition={{ duration: 10, repeat: Infinity }}
                 className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 w-32 h-32 sm:w-48 sm:h-48 bg-accent/10 blur-[60px] sm:blur-[80px] rounded-full pointer-events-none"
               />
            </div>
            <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8 md:space-y-10">
               <div className="space-y-4 sm:space-y-6">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-primary">{t("chapter_legacy_eyebrow")}</span>
                  <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95]">
                    {t("artisan.passion")}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">
                    {t("artisan.desc")}
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-8 md:gap-12 pt-4 md:pt-8">
                  <div className="space-y-2 md:space-y-4">
                     <div className="text-4xl md:text-5xl font-serif font-bold tracking-tighter text-primary">3 Gen</div>
                     <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-60">{t("artisan.lineage")}</p>
                  </div>
                  <div className="space-y-2 md:space-y-4">
                     <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold tracking-tighter text-primary">100%</div>
                     <p className="text-[9px] sm:text-[10px] uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] opacity-60">{t("artisan.handcast")}</p>
                  </div>
               </div>
               <Link href="/about">
                 <Button particles particleCount={18} className="rounded-full px-8 sm:px-10 md:px-12 h-12 sm:h-14 md:h-16 shadow-xl shadow-primary/20 transition-all group w-full sm:w-auto text-sm sm:text-base">
                    {t("artisan.hear_story")} <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section - Warm & Comfy */}
      <section className="bg-primary py-16 sm:py-24 md:py-32 lg:py-40 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 noise" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 sm:gap-16 md:gap-20 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6 sm:space-y-8 md:space-y-10">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[0.95] tracking-tighter">
              {t("phil_title")}
            </h2>
            <div className="h-1 w-24 sm:w-32 md:w-40 bg-accent rounded-full" />
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl opacity-95 leading-relaxed font-medium">
              {t("phil_desc")}
            </p>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 md:gap-12 pt-4 sm:pt-6 md:pt-8">
              <div className="flex gap-3 sm:gap-4 md:gap-6 items-start">
                 <div className="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-accent/20 text-accent flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                 </div>
                 <div>
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tighter">{t("phil_decades")}</div>
                    <div className="text-[8px] sm:text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] opacity-60 mt-0.5 sm:mt-1">{t("phil_durability")}</div>
                 </div>
              </div>
              <div className="flex gap-3 sm:gap-4 md:gap-6 items-start">
                 <div className="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-accent/20 text-accent flex-shrink-0">
                    <Recycle className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                 </div>
                 <div>
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold tracking-tighter">{t("phil_zero")}</div>
                    <div className="text-[8px] sm:text-[9px] md:text-[10px] uppercase font-black tracking-[0.2em] sm:tracking-[0.3em] opacity-60 mt-0.5 sm:mt-1">{t("phil_waste")}</div>
                 </div>
              </div>
            </div>
          </motion.div>
          
          <div className="relative group">
             <motion.div 
               whileHover={{ scale: 1.02 }}
               className="aspect-square rounded-2xl sm:rounded-3xl md:rounded-[3rem] overflow-hidden concrete-shadow"
             >
                <img src={WorkshopTourPhotos.castingStation} alt="Family at work" className="w-full h-full object-cover brightness-90 contrast-110 transition-all duration-700 group-hover:brightness-100" />
             </motion.div>
             <motion.div 
               initial={{ rotate: -6 }}
               whileHover={{ rotate: 0, scale: 1.05 }}
               className="absolute -bottom-6 -left-4 sm:-bottom-10 sm:-left-6 md:-bottom-16 md:-left-10 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-accent rounded-xl sm:rounded-2xl md:rounded-3xl flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 text-accent-foreground concrete-shadow z-20"
             >
                <Heart className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mb-2 sm:mb-3 md:mb-4" fill="currentColor" />
                <p className="font-serif text-xs sm:text-base md:text-xl font-bold italic leading-tight text-center tracking-tight">{t("home.family_made") || "Family Made"}</p>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Webshop Teaser */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 px-4 sm:px-6 max-w-7xl mx-auto relative overflow-hidden">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 sm:gap-10 md:gap-12 mb-12 sm:mb-16 md:mb-20 border-b border-border/40 pb-8 sm:pb-12 md:pb-16">
            <div className="max-w-2xl text-center md:text-left">
               <motion.span 
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary mb-4 sm:mb-6 block"
               >
                 {t("curated_selection")}
               </motion.span>
               <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 tracking-tighter leading-[0.95] italic">{t("shop_teaser_title")}</h2>
               <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-medium">{t("shop_teaser_desc")}</p>
            </div>
            <Link href="/shop">
               <Button size="lg" particles particleCount={15} className="rounded-full px-8 sm:px-10 md:px-12 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-black uppercase tracking-wider shadow-2xl shadow-primary/40 transition-all w-full md:w-auto">
                  {t("shop_view_all")} <ArrowRight className="ml-2 sm:ml-3 md:ml-4 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
               </Button>
            </Link>
         </div>

         {/* Product grid removed for maintenance */}

      </section>

      {/* Workshop Journal Teaser */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 bg-secondary/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 sm:gap-16 md:gap-20 lg:gap-24 items-center">
            <div className="order-2 md:order-1 relative">
               <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="aspect-[3/4] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden concrete-shadow -rotate-3 sm:-rotate-6 border-2 sm:border-4 border-white/10"
                  >
                    <img src={WorkshopTourPhotos.completedPieces} alt="Completed pieces" className="h-full w-full object-cover" />
                  </motion.div>
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="aspect-[3/4] rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden concrete-shadow rotate-3 sm:rotate-6 mt-8 sm:mt-12 md:mt-16 border-2 sm:border-4 border-white/10"
                  >
                    <img src={BrandAssets.teamPortrait} alt="Team portrait" className="h-full w-full object-cover" />
                  </motion.div>
               </div>
            </div>
            <div className="order-1 md:order-2 space-y-6 sm:space-y-8 md:space-y-10">
               <div className="flex items-center gap-3 sm:gap-4">
                 <span className="w-8 sm:w-10 md:w-12 h-px bg-primary" />
                 <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary">{t("workshop_journal")}</span>
               </div>
               <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter leading-[0.95]">
                  {t("journal.follow")}
               </h2>
               <p className="text-muted-foreground text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed font-medium text-balance">
                  {t("journal.desc")}
               </p>
               <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-5 md:gap-6">
                  <Link href="/blog">
                    <Button size="lg" className="rounded-full px-6 sm:px-8 md:px-10 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg font-bold w-full sm:w-auto">{t("read_notes")}</Button>
                  </Link>
                  <Button variant="outline" size="lg" className="rounded-full h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 border-2 font-bold text-sm sm:text-base w-full sm:w-auto" asChild>
                    <a href="https://instagram.com/trosheen.crafts" target="_blank" rel="noopener noreferrer"><Instagram className="mr-2 sm:mr-3 w-4 h-4 sm:w-5 sm:h-5" /> @trosheen.crafts</a>
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="py-16 sm:py-24 md:py-32 lg:py-40 px-4 sm:px-6 max-w-7xl mx-auto">
        <NewsletterSubscribe variant="hero" source="homepage" />
      </section>
    </div>
  );
}
