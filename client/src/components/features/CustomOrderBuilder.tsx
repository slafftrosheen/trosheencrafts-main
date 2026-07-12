import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CustomBuilderPhotos } from '@/lib/imageAssets';

// Types for the customization options
interface Option {
  id: string;
  name: string;
  priceMod?: number;
  image?: string;
}

interface Category {
  id: string;
  title: string;
  options: Option[];
}

export function CustomOrderBuilder() {
  const [selections, setSelections] = useState<Record<string, string>>({
    type: 'candle',
    finish: 'natural',
  });

  const categories: Category[] = [
    {
      id: 'type',
      title: 'Product Type',
      options: [
        { id: 'candle', name: 'Vessel Candle', image: CustomBuilderPhotos.candlePreview },
        { id: 'planter', name: 'Planter', image: CustomBuilderPhotos.planterPreview },
        { id: 'sculpture', name: 'Sculpture', image: CustomBuilderPhotos.sculpturePreview },
      ]
    },
    {
      id: 'finish',
      title: 'Finish & Color',
      options: [
        { id: 'natural', name: 'Natural Concrete', image: CustomBuilderPhotos.gardenStonePreview },
        { id: 'bronze', name: 'Bronze Patina' },
        { id: 'copper', name: 'Copper Patina' },
      ]
    }
  ];

  const handleSelect = (categoryId: string, optionId: string) => {
    setSelections(prev => ({
      ...prev,
      [categoryId]: optionId
    }));
  };

  const currentPreviewImage = () => {
    // Logic to select image based on selection
    if (selections.type === 'candle') return CustomBuilderPhotos.candlePreview;
    if (selections.type === 'planter') return CustomBuilderPhotos.planterPreview;
    if (selections.type === 'sculpture') return CustomBuilderPhotos.sculpturePreview;
    return CustomBuilderPhotos.collectionPreview;
  };

  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/40 flex flex-col lg:flex-row min-h-[600px]">
      {/* Preview Section */}
      <div className="lg:w-1/2 bg-muted/30 relative p-8 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={selections.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative w-full aspect-square max-w-md"
          >
            <img
              src={currentPreviewImage()}
              alt="Custom Preview"
              className="w-full h-full object-cover rounded-2xl shadow-lg"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Section */}
      <div className="lg:w-1/2 p-10 flex flex-col">
        <h3 className="font-serif text-4xl font-bold mb-8">Build Your Custom Piece</h3>

        <div className="flex-1 space-y-10">
          {categories.map((category) => (
            <div key={category.id} className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">{category.title}</h4>
              <div className="grid grid-cols-3 gap-4">
                {category.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelect(category.id, option.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left group overflow-hidden ${
                      selections[category.id] === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/40 hover:border-primary/40'
                    }`}
                  >
                    <span className="font-medium relative z-10">{option.name}</span>
                    {selections[category.id] === option.id && (
                      <div className="absolute top-2 right-2 text-primary">
                        <Check size={16} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-8 border-t border-border/40 flex justify-between items-center">
          <div>
            <span className="text-sm text-muted-foreground uppercase tracking-widest block mb-1">Estimated Price</span>
            <span className="text-3xl font-serif font-bold">€45.00</span>
          </div>
          <Button size="lg" className="rounded-full px-8 gap-2">
            <ShoppingCart size={20} /> Add Custom Order
          </Button>
        </div>
      </div>
    </div>
  );
}
