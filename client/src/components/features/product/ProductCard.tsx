import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  isHandmade?: boolean;
}

export function ProductCard({ id, name, price, image, category, isHandmade }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link href={`/shop/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="h-full"
      >
        <div className="relative group cursor-pointer concrete-shadow rounded-3xl overflow-hidden h-full flex flex-col bg-card border border-white/10 aspect-[4/5]">
          {/* Image Container with Noise Texture */}
          <div className="absolute inset-0 z-0 bg-muted">
            <motion.img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
            />
            {/* Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none noise mix-blend-overlay" />
            
            {/* Top Gradient for Badge readability */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            {isHandmade && (
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-md text-foreground shadow-sm font-medium tracking-wide">
                Handmade by Oleg
              </Badge>
            )}
          </div>

          {/* Quick Action Overlay (Add to Cart) */}
          <motion.div
            className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
             {/* Note: In a real implementation this might be a stopPropagation button to add to cart directly */}
             <div className="translate-y-4 group-hover:translate-y-0 transition-all duration-300">
               <span className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl shadow-black/20">
                 View Piece
               </span>
             </div>
          </motion.div>

          {/* Bottom Glass Panel Info */}
          <div className="absolute inset-x-0 bottom-0 z-20 p-4 pt-12 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
             <div className="glass p-5 rounded-2xl border border-white/10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
               <p className="text-xs uppercase tracking-[0.15em] text-white/70 font-bold mb-1">
                 {category}
               </p>
               <h3 className="font-serif text-xl sm:text-2xl font-bold text-white mb-2 line-clamp-1 drop-shadow-sm">
                 {name}
               </h3>
               <div className="flex items-end justify-between mt-4">
                 <p className="text-lg sm:text-xl font-bold text-primary">
                   €{price.toFixed(2)}
                 </p>
               </div>
             </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
