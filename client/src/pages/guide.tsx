import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Beaker, Recycle, Droplets, Heart, ShieldCheck, Sun } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { ScrollStoryPhotos } from "@/lib/imageAssets";

export default function GuidePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 pb-24">
      {/* Back Button */}
      <div className="pt-24 md:pt-32 px-6 max-w-7xl mx-auto">
        <Link href="/">
          <a className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group">
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t("nav.home")}
          </a>
        </Link>
      </div>

      {/* Hero Header */}
      <header className="px-6 py-12 md:py-20 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 mb-4 block">
            {t("guide_material_eyebrow")}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-primary leading-[1.1] mb-6">
            {t("guide_material_title")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
            {t("guide_material_intro")}
          </p>
        </motion.div>
      </header>

      {/* Material Composition Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-serif text-primary">
                {t("guide_material_subtitle")}
              </h2>
              <p className="text-lg text-muted-foreground font-medium">
                {t("guide_material_base")}
              </p>
              
              <ul className="space-y-6">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg text-foreground font-medium leading-relaxed">
                      {t("guide_material_gypsum")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Beaker className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg text-foreground font-medium leading-relaxed">
                      {t("guide_material_silica")}
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-4 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg text-foreground font-medium leading-relaxed">
                      {t("guide_material_plasticizer")}
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl"
            >
              <img 
                src={ScrollStoryPhotos[1]} 
                alt="Material mixing process" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advantages Section */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-serif text-center mb-16 text-primary"
          >
            {t("guide_material_adv_title")}
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Droplets, text: t("guide_material_adv_water") },
              { icon: ShieldCheck, text: t("guide_material_adv_density") },
              { icon: Sun, text: t("guide_material_adv_aesthetics") },
              { icon: Heart, text: t("guide_material_adv_safety") },
            ].map((adv, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card border border-border p-8 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center mb-6">
                  <adv.icon className="w-6 h-6" />
                </div>
                <p className="text-muted-foreground leading-relaxed font-medium">
                  {adv.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Art Cast in Stone */}
      <section className="py-20 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-serif mb-8">{t("guide_art_title")}</h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium leading-relaxed mb-16">
            {t("guide_art_intro")}
          </p>
          
          <div className="text-left bg-background/10 backdrop-blur-sm border border-white/20 p-8 md:p-12 rounded-[2rem]">
            <h3 className="text-2xl font-bold mb-6">{t("guide_art_why_title")}</h3>
            <ul className="space-y-6">
              {[
                t("guide_art_scale"),
                t("guide_art_durability"),
                t("guide_art_aesthetics"),
                t("guide_art_handmade"),
                t("guide_art_eco")
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1 w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <p className="text-lg leading-relaxed font-medium text-white/90">{item}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 pt-10 border-t border-white/20 text-center">
              <p className="text-2xl font-serif italic text-accent">{t("guide_art_outro")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Care Guide */}
      <section className="py-20 md:py-32 max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-primary/60 mb-4 block">
            {t("guide_care_eyebrow")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif text-primary mb-6">
            {t("guide_care_title")}
          </h2>
          <p className="text-xl text-muted-foreground font-medium">
            {t("guide_care_intro")}
          </p>
        </div>

        <div className="space-y-16">
          {/* General Care */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
              <ShieldCheck className="text-accent" /> {t("guide_care_general_title")}
            </h3>
            <ul className="space-y-4">
              <li className="bg-card p-6 rounded-2xl border border-border/50 text-muted-foreground font-medium">{t("guide_care_cleaning")}</li>
              <li className="bg-card p-6 rounded-2xl border border-border/50 text-muted-foreground font-medium">{t("guide_care_protection")}</li>
              <li className="bg-card p-6 rounded-2xl border border-border/50 text-muted-foreground font-medium">{t("guide_care_caution")}</li>
            </ul>
          </div>

          {/* Zero Waste */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
              <Recycle className="text-accent" /> {t("guide_care_zero_title")}
            </h3>
            <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm">
              <p className="text-lg text-foreground font-medium mb-8">
                {t("guide_care_zero_intro")}
              </p>
              <ol className="space-y-6 pl-2">
                {[
                  t("guide_care_zero_step1"),
                  t("guide_care_zero_step2"),
                  t("guide_care_zero_step3"),
                  t("guide_care_zero_step4")
                ].map((step, idx) => (
                  <li key={idx} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-muted-foreground font-medium pt-1">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Planters & Fountains */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
              <Droplets className="text-accent" /> {t("guide_care_planters_title")}
            </h3>
            <ul className="space-y-4">
              <li className="bg-card p-6 rounded-2xl border border-border/50 text-muted-foreground font-medium">{t("guide_care_planters_planting")}</li>
              <li className="bg-card p-6 rounded-2xl border border-border/50 text-muted-foreground font-medium">{t("guide_care_planters_winter")}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
