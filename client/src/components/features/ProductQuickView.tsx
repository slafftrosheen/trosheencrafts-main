import { X, ShoppingBag, Heart, Share2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { Link } from 'wouter';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
}

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: () => void;
}

export function ProductQuickView({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductQuickViewProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart();
    // Show success feedback
    setTimeout(onClose, 500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: `${window.location.origin}/shop/${product.id}`,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/shop/${product.id}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-background rounded-3xl shadow-2xl z-[101] overflow-hidden border-2 border-border/40 max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Image */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
                <OptimizedImage
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full"
                  objectFit="cover"
                  priority
                />
              </div>

              {/* Details */}
              <div className="flex flex-col">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4">
                    {product.category}
                  </span>

                  <h2 className="font-serif text-4xl font-bold mb-4">
                    {product.name}
                  </h2>

                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="font-serif text-3xl font-bold text-primary">
                      €{product.price}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Free shipping
                    </span>
                  </div>

                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Handcrafted in Daugavpils, Latvia</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Mixed media: concrete, pigments, botanicals</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Unique piece - slight variations expected</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAddToCart}
                      size="lg"
                      className="flex-1 rounded-2xl h-14 text-lg font-bold gap-2"
                    >
                      <ShoppingBag size={20} />
                      Add to Cart
                    </Button>

                    <Button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      variant="outline"
                      size="lg"
                      className={`rounded-2xl h-14 px-5 ${
                        isWishlisted ? 'bg-primary/10 border-primary text-primary' : ''
                      }`}
                    >
                      <Heart
                        size={20}
                        fill={isWishlisted ? 'currentColor' : 'none'}
                      />
                    </Button>

                    <Button
                      onClick={handleShare}
                      variant="outline"
                      size="lg"
                      className="rounded-2xl h-14 px-5"
                    >
                      <Share2 size={20} />
                    </Button>
                  </div>

                  <Link href={`/shop/${product.id}`} onClick={onClose}>
                    <Button
                      variant="ghost"
                      className="w-full rounded-2xl h-12 gap-2 group"
                    >
                      View Full Details
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
