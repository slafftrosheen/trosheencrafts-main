import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Heart, Users, Leaf, Sparkles, MapPin, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { HeroPhotos, ScrollStoryPhotos, WorkshopTourPhotos, BrandAssets } from "@/lib/imageAssets";

export default function AboutPage() {
  const { t } = useLanguage();

  const timeline = [
    {
      year: "1995",
      titleKey: "timeline.1995.title",
      descKey: "timeline.1995.desc",
    },
    {
      year: "2005",
      titleKey: "timeline.2005.title",
      descKey: "timeline.2005.desc",
    },
    {
      year: "2018",
      titleKey: "timeline.2018.title",
      descKey: "timeline.2018.desc",
    },
    {
      year: "2019",
      titleKey: "timeline.2019_nikola.title",
      descKey: "timeline.2019_nikola.desc",
    },
    {
      year: "2019",
      titleKey: "timeline.2019.title",
      descKey: "timeline.2019.desc",
    },
    {
      year: "2023",
      titleKey: "timeline.2023.title",
      descKey: "timeline.2023.desc",
    },
    {
      year: "2026",
      titleKey: "timeline.2026.title",
      descKey: "timeline.2026.desc",
    },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={HeroPhotos.main} 
            alt={t("about.our_family_story")} 
            className="w-full h-full object-cover brightness-[0.6]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
          <Link href="/">
            <Button variant="ghost" className="mb-8 rounded-xl group font-bold text-white hover:text-white hover:bg-white/10">
              <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> {t("about.back_home")}
            </Button>
          </Link>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-accent/20 text-accent text-xs font-black uppercase tracking-widest mb-6 border border-accent/30">
              <Heart className="w-3 h-3 fill-current" />
              {t("about.our_family_story")}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[0.95]">
              {t("about.three_generations")}<br />
              <span className="text-primary italic">{t("about.one_workshop")}</span>
            </h1>
            <p className="text-xl text-white/80 max-w-2xl font-medium">
              {t("hero_subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Family Introduction */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex items-center gap-3">
              <span className="w-12 h-px bg-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">{t("chapter_heritage_eyebrow")}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[0.95]">
              {t("chapter_heritage_title")}
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              {t("chapter_heritage_body_1").split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden concrete-shadow">
              <img 
                src={ScrollStoryPhotos.chapter1_heritage} 
                alt={t("chapter_heritage_title")} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary rounded-2xl flex flex-col items-center justify-center text-primary-foreground shadow-xl">
              <span className="text-3xl font-serif font-bold">30+</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">{t("about.years")}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Makers */}
      <section className="py-16 sm:py-24 md:py-32 bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="aspect-square rounded-3xl overflow-hidden concrete-shadow">
                <img 
                  src={WorkshopTourPhotos.finishingStudio} 
                  alt="Crafting Process" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 md:space-y-8 order-1 lg:order-2"
            >
              <div className="flex items-center gap-3">
                <span className="w-12 h-px bg-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">{t("chapter_makers_eyebrow")}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[0.95]">
                {t("chapter_makers_title")}
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                {t("chapter_makers_body_1").split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Kids */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 md:space-y-8"
          >
            <div className="flex items-center gap-3">
              <span className="w-12 h-px bg-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-primary">{t("chapter_legacy_eyebrow")}</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[0.95]">
              {t("chapter_legacy_title")}
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              {t("chapter_legacy_body_1").split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden concrete-shadow">
              <img 
                src={ScrollStoryPhotos.chapter4_family} 
                alt={t("chapter_legacy_title")} 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Materials Section */}
      <section id="materials" className="py-16 sm:py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 noise" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-black uppercase tracking-widest text-accent mb-4 block">{t("material.precision")}</span>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("material.microscopic")}
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t("material.desc")}
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[ 
              { nameKey: "about.materials.concrete.name", descKey: "about.materials.concrete.desc", icon: "🧱" },
              { nameKey: "about.materials.gypsum.name", descKey: "about.materials.gypsum.desc", icon: "🎨" },
              { nameKey: "about.materials.acrylics.name", descKey: "about.materials.acrylics.desc", icon: "✨" },
              { nameKey: "about.materials.resins.name", descKey: "about.materials.resins.desc", icon: "🌿" },
            ].map((material, i) => (
              <motion.div
                key={material.nameKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-all"
              >
                <div className="text-4xl mb-4">{material.icon}</div>
                <h3 className="font-serif text-xl font-bold mb-2">{t(material.nameKey)}</h3>
                <p className="text-sm opacity-80">{t(material.descKey)}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link href="/guide">
              <Button size="lg" variant="secondary" className="rounded-full px-8 hover-elevate">
                {t("guide_care_eyebrow")} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-xs font-black uppercase tracking-widest text-primary mb-4 block">{t("timeline.tag")}</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
            {t("timeline.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("timeline.description")}
          </p>
        </motion.div>

        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/60 -translate-x-1/2 hidden md:block" />
          
          <div className="space-y-12 md:space-y-0">
            {timeline.map((item, i) => (
              <motion.div
                key={item.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative md:flex md:items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`md:w-1/2 ${i % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <div className="bg-card/40 border-2 border-border/40 rounded-2xl p-6 md:p-8 concrete-shadow">
                    <span className="text-4xl font-serif font-bold text-primary">{item.year}</span>
                    <h3 className="font-serif text-xl font-bold mt-2 mb-2">{t(item.titleKey)}</h3>
                    <p className="text-muted-foreground">{t(item.descKey)}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block" />
                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 sm:py-24 md:py-32 bg-card/30 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 md:space-y-8"
            >
              <div className="flex items-center gap-3">
                <span className="w-12 h-px bg-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">{t("chapter_philosophy_eyebrow")}</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[0.95]">
                {t("chapter_philosophy_title")}
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                {t("chapter_philosophy_body_1").split("\n").filter(Boolean).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="aspect-square rounded-3xl overflow-hidden concrete-shadow">
                <img 
                  src={ScrollStoryPhotos.chapter5_mastery} 
                  alt={t("chapter_philosophy_title")} 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visit Us CTA */}
      <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20">
              <MapPin className="w-3 h-3" />
              {t("hero_location")}
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              {t("about.visit_title")} <span className="text-primary italic">{t("common.studio")}</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {t("about.visit_desc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl shadow-primary/20">
                  {t("nav_contact")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-lg border-2">
                  {t("about.browse_work")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}