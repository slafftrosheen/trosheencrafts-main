import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { Zap, Lightbulb, Calendar, Microscope, Hammer, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlogPosts } from "@/hooks/useApi";
import { Spinner } from "@/components/shared/LoadingStates";
import { useLanguage } from "@/lib/LanguageContext";

const categoryIcons: Record<string, any> = {
  "Technique": Zap,
  "Science": Lightbulb,
  "Upcoming": Calendar,
  "Philosophy": Hammer,
};

export default function BlogPage() {
  const reduceMotion = useReducedMotion();
  const { data: posts = [], isLoading } = useBlogPosts();
  const { t, language } = useLanguage();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-50 opacity-40 noise" />
      
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 h-20">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            {t("blog.back_to_story")}
          </Link>
          <div className="flex gap-4">
             <Link href="/shop" className="text-sm font-medium py-2 hover:text-primary transition-colors">{t("blog.webshop")}</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-12 h-px bg-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">{t("blog.journal_title")}</span>
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight mb-8">
            {t("blog.notes_from")} <br /><span className="text-primary italic">{t("blog.location")}</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed mb-20">
            {t("blog.intro_text")}
          </p>

          <div className="grid gap-16 lg:gap-24">
            {posts.map((p, idx) => {
              const Icon = categoryIcons[p.author] || Hammer; 
              const title = p.titleTranslations?.[language] || p.title;
              const excerpt = p.excerptTranslations?.[language] || p.excerpt;

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group grid md:grid-cols-12 gap-12 items-start"
                >
                  <div className="md:col-span-4 sticky top-32">
                    {p.image ? (
                      <div className="aspect-square rounded-[3rem] overflow-hidden border-2 border-border/40 concrete-shadow relative group">
                        <img src={p.image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-card/60 rounded-[3rem] border-2 border-border/40 flex items-center justify-center text-primary/20 group-hover:text-primary/40 transition-colors concrete-shadow relative overflow-hidden">
                        <Icon size={120} strokeWidth={1} />
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black uppercase tracking-widest text-primary/60">{p.author}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-border" />
                        <span className="text-sm font-bold text-muted-foreground">{new Date(p.publishedAt || p.createdAt).toLocaleDateString(language)}</span>
                      </div>
                      <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight group-hover:text-primary transition-colors leading-[0.95]">
                        {title}
                      </h2>
                    </div>
                    
                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                      {excerpt}
                    </p>

                    <Link href={`/blog/${p.slug}`}>
                      <Button variant="ghost" className="rounded-full px-0 hover:bg-transparent text-primary font-black uppercase tracking-widest text-xs group/btn">
                        {t("blog.browse")} <Box className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </main>
    </div>
  );
}