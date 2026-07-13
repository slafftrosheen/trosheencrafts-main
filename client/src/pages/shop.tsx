import { useLanguage } from '@/lib/LanguageContext';
import { CandleConstructor } from '@/components/shop/CandleConstructor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProducts } from '@/hooks/useApi';
import { ProductCard } from '@/components/features/product/ProductCard';
import { Spinner } from '@/components/shared/LoadingStates';
import { motion } from 'framer-motion';
import { Sparkles, Package } from 'lucide-react';

export default function ShopPage() {
  const { t, language } = useLanguage();
  const { data: products, isLoading } = useProducts();

  return (
    <div className="min-h-screen bg-background pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-primary mb-6"
          >
            {t("nav_shop")}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-muted-foreground font-medium max-w-3xl mx-auto leading-relaxed"
          >
            {t("shop_teaser_desc") || "Every piece tells a story—explore our ready-made collections or enter the workshop to build your own custom candle."}
          </motion.p>
        </header>

        <Tabs defaultValue="collections" className="w-full">
          <div className="flex justify-center mb-16">
            <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 h-auto">
              <TabsTrigger value="collections" className="rounded-xl px-6 py-4 text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all flex items-center gap-3">
                <Package className="w-5 h-5" />
                {t("curated_selection")}
              </TabsTrigger>
              <TabsTrigger value="custom" className="rounded-xl px-6 py-4 text-lg font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all flex items-center gap-3">
                <Sparkles className="w-5 h-5" />
                {t("shop_custom_builder") || "Custom Workshop"}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="collections" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            {isLoading ? (
              <div className="py-32 flex justify-center">
                <Spinner size="lg" className="text-primary" />
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.filter(p => p.published).map((product) => {
                  const translatedName = product.nameTranslations?.[language] || product.name;
                  return (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={translatedName}
                      price={Number(product.price)}
                      image={product.image || ''}
                      category={product.category || 'Collection'}
                      isHandmade={true}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-32 bg-card rounded-3xl border border-border/50 shadow-sm">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <h3 className="text-2xl font-serif text-primary mb-2">The shelves are empty</h3>
                <p className="text-muted-foreground font-medium">Check back soon for new pieces, or visit the Custom Workshop to build your own.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="bg-card rounded-[3rem] p-4 sm:p-8 border border-border/50 shadow-2xl concrete-shadow relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 pointer-events-none noise" />
              <div className="relative z-10">
                <CandleConstructor />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}