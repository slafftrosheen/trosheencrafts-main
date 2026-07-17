import { useLanguage } from '@/lib/LanguageContext';
import { CandleConstructor } from '@/components/shop/CandleConstructor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/hooks/useApi';
import { ProductCard } from '@/components/features/product/ProductCard';
import { Spinner } from '@/components/shared/LoadingStates';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Package, MoveRight } from 'lucide-react';
import { useState } from 'react';
import { MagneticButton } from '@/components/shared/MagneticButton';

export default function ShopPage() {
  const { t, language } = useLanguage();
  const { data: products, isLoading } = useProducts();
  const [activeTab, setActiveTab] = useState('collections');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 relative overflow-hidden">
      {/* Premium ambient background elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-secondary/15 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto px-6 pt-32 pb-32 relative z-10">
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl md:text-7xl font-serif mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground via-foreground to-muted-foreground drop-shadow-sm">
              {t("nav_shop")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              {t("shop_teaser_desc")}
            </p>
          </motion.div>
        </header>

        <div className="flex justify-center mb-20">
          <div className="glass p-2.5 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-primary/5 inline-flex relative bg-background/60 backdrop-blur-xl">
            <AnimatePresence>
              <motion.div
                className="absolute inset-y-2.5 rounded-[2rem] bg-primary shadow-lg shadow-primary/20"
                initial={false}
                animate={{
                  left: activeTab === 'collections' ? '0.625rem' : 'calc(50% + 0.3125rem)',
                  width: 'calc(50% - 0.9375rem)',
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </AnimatePresence>
            <button
              onClick={() => setActiveTab('collections')}
              className={`relative z-10 px-10 py-4 text-lg font-bold rounded-[2rem] transition-colors flex items-center gap-3 w-[220px] justify-center ${
                activeTab === 'collections' ? 'text-primary-foreground' : 'text-foreground hover:text-primary'
              }`}
            >
              <Package className="w-5 h-5" />
              {t("curated_selection")}
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`relative z-10 px-10 py-4 text-lg font-bold rounded-[2rem] transition-colors flex items-center gap-3 w-[220px] justify-center ${
                activeTab === 'custom' ? 'text-primary-foreground' : 'text-foreground hover:text-primary'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              {t("shop_custom_builder")}
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'collections' ? (
            <motion.div
              key="collections"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {isLoading ? (
                <div className="py-32 flex justify-center">
                  <Spinner size="lg" className="text-primary" />
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
                  {products.filter(p => p.published).map((product, index) => {
                    const translatedName = product.nameTranslations?.[language] || product.name;
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                      >
                        <ProductCard
                          id={product.id}
                          name={translatedName}
                          price={Number(product.price)}
                          image={product.image || ''}
                          category={product.category || 'Collection'}
                          isHandmade={true}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-32 bg-card/60 backdrop-blur-2xl rounded-[3rem] border border-border/50 shadow-2xl max-w-2xl mx-auto relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  <div className="w-28 h-28 bg-muted rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/5 relative z-10">
                    <Package className="w-14 h-14 text-muted-foreground opacity-60" />
                  </div>
                  <h3 className="text-4xl font-serif text-foreground mb-4 relative z-10">{t("shop_empty_title")}</h3>
                  <p className="text-xl text-muted-foreground font-medium mb-10 max-w-md mx-auto leading-relaxed relative z-10">
                    {t("shop_empty_desc")}
                  </p>
                  <MagneticButton strength={25}>
                    <button onClick={() => setActiveTab('custom')} className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-bold hover:gap-5 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 relative z-10">
                      {t("shop_enter_workshop")} <MoveRight className="w-5 h-5" />
                    </button>
                  </MagneticButton>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="custom"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <CandleConstructor />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}