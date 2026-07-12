import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, Heart, TrendingUp } from 'lucide-react';
import { recommendationEngine } from '@/lib/recommendations';
import { haptics } from '@/lib/haptics';
import { ProductCatalog } from '@/lib/imageAssets';

interface ProductRecommendationsProps {
  currentProductId: string;
  type: 'similar' | 'complementary' | 'trending' | 'bought-together';
  onProductClick?: (productId: string) => void;
}

export function ProductRecommendations({
  currentProductId,
  type,
  onProductClick
}: ProductRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<typeof ProductCatalog>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [currentProductId, type]);

  const loadRecommendations = () => {
    setLoading(true);

    // Register products in recommendation engine
    ProductCatalog.forEach(p => {
      recommendationEngine.registerProduct({
        id: p.id,
        name: p.name,
        category: p.category,
        price: parseFloat(p.price.replace(/[^0-9.]/g, '')),
        materials: p.materials || [],
        tags: [],
        imageUrl: p.images[0],
      });
    });

    let recommendedIds: string[] = [];

    switch (type) {
      case 'similar':
        const similar = recommendationEngine.getRecommendations(currentProductId, 4);
        recommendedIds = similar.map(s => s.productId);
        break;

      case 'complementary':
        const complementary = recommendationEngine.getComplementaryProducts(currentProductId, 3);
        recommendedIds = complementary.map(c => c.productId);
        break;

      case 'trending':
        recommendedIds = recommendationEngine.getTrending(6);
        break;

      case 'bought-together':
        recommendedIds = recommendationEngine.getFrequentlyBoughtTogether(currentProductId, 3);
        break;
    }

    const recommended = ProductCatalog.filter(p => recommendedIds.includes(p.id));
    setRecommendations(recommended);
    setLoading(false);
  };

  if (loading || recommendations.length === 0) return null;

  const config = {
    similar: {
      title: 'You Might Also Love',
      subtitle: 'Crafted with similar techniques and materials',
      icon: Sparkles,
      color: 'text-primary',
    },
    complementary: {
      title: 'Complete the Look',
      subtitle: 'These pieces work beautifully together',
      icon: Heart,
      color: 'text-accent',
    },
    trending: {
      title: 'Trending in the Workshop',
      subtitle: 'Popular pieces this week',
      icon: TrendingUp,
      color: 'text-orange-500',
    },
    'bought-together': {
      title: 'Frequently Paired With',
      subtitle: 'Customers often purchase these together',
      icon: ShoppingBag,
      color: 'text-primary',
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
          <div className={`w-14 h-14 rounded-2xl bg-background flex items-center justify-center ${config.color}`}>
            <Icon size={28} />
          </div>
          <div>
            <h3 className="font-serif text-4xl font-bold tracking-tight">{config.title}</h3>
            <p className="text-muted-foreground text-lg mt-1">{config.subtitle}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {recommendations.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => {
                haptics.playProductCardTap();
                onProductClick?.(product.id);
              }}
              onMouseEnter={() => haptics.playInteraction('hover')}
            >
              <div className="relative rounded-[2rem] overflow-hidden aspect-square mb-4 bg-card shadow-lg group-hover:shadow-2xl transition-all">
                <img
                  src={product.images[0]} // ← UPDATED to use images array
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      haptics.playFavorite();
                    }}
                  >
                    <Heart size={18} />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-serif text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h4>
                <p className="text-lg font-semibold text-primary">{product.price}</p>
                <p className="text-sm text-muted-foreground capitalize mt-1">{product.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
