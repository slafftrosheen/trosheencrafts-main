import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

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
        transition={{ duration: 0.3 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="overflow-hidden group cursor-pointer concrete-shadow">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <motion.img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            />

            {/* Overlay with handmade badge */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 flex items-end justify-start p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isHandmade && (
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  Handmade by Oleg
                </Badge>
              )}
            </motion.div>

            {/* Ripple effect overlay */}
            <motion.div
              className="absolute inset-0 bg-accent/20"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: isHovered ? 2 : 0,
                opacity: isHovered ? [0, 0.5, 0] : 0
              }}
              transition={{ duration: 0.6 }}
              style={{ borderRadius: '50%' }}
            />
          </div>

          <div className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{category}</p>
            <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-xl font-bold text-primary">€{price.toFixed(2)}</p>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
