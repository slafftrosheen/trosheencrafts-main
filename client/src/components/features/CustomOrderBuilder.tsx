import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingCart, Paintbrush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

// Dynamically import all casing images
const casingAssets = import.meta.glob('@/assets/candle constructor/*.png', { eager: true, import: 'default' });

interface Option {
  id: string;
  name: string;
  image?: string;
  color?: string;
}

const finishOptions: Option[] = [
  { id: 'white-stone', name: 'White Stone', color: '#F0F0F0' },
  { id: 'grey-stone', name: 'Grey Stone', color: '#A0A0A0' },
  { id: 'white-marble', name: 'White Marble', color: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' },
  { id: 'bronze', name: 'Bronze', color: 'linear-gradient(135deg, #b08d57, #805a2b)' },
  { id: 'copper', name: 'Copper', color: 'linear-gradient(135deg, #b87333, #7a3a1f)' },
  { id: 'gold', name: 'Gold', color: 'linear-gradient(135deg, #ffd700, #b8860b)' },
  { id: 'white-stone-goldflakes', name: 'White Stone + Gold Flakes', color: 'radial-gradient(circle, #f0f0f0 70%, #ffd700 100%)' },
  { id: 'black-gold-cracking', name: 'Black + Gold Cracking', color: 'linear-gradient(45deg, #111 75%, #b8860b 100%)' },
  { id: 'marbling', name: 'Marbling', color: 'linear-gradient(45deg, #e0e0e0 25%, #ffffff 50%, #e0e0e0 75%)' },
  { id: 'custom', name: 'Custom Coloring', color: 'conic-gradient(from 90deg, #ff9a9e, #fecfef, #a1c4fd, #c2e9fb, #d4fc79, #96e6a1)' },
];

export function CustomOrderBuilder() {
  const casingOptions = useMemo(() => {
    return Object.entries(casingAssets).map(([path, module]) => {
      const filename = path.split('/').pop() || '';
      const name = filename.replace(/^\d+-/, '').replace(/-/g, ' ').replace('.png', '');
      const id = filename.replace('.png', '');
      return {
        id,
        name,
        image: module as string
      };
    });
  }, []);

  const [selections, setSelections] = useState({
    casing: casingOptions.length > 0 ? casingOptions[0].id : '',
    finish: 'white-stone',
    customDescription: ''
  });

  const handleSelect = (category: 'casing' | 'finish', value: string) => {
    setSelections(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const currentPreviewImage = () => {
    const selectedCasing = casingOptions.find(c => c.id === selections.casing);
    return selectedCasing?.image || '';
  };
  
  const selectedFinishOption = finishOptions.find(f => f.id === selections.finish);

  return (
    <div className="bg-card rounded-3xl overflow-hidden shadow-2xl border border-border/40 flex flex-col lg:flex-row min-h-[700px] lg:h-[800px]">
      {/* Preview Section */}
      <div className="lg:w-5/12 bg-muted/20 relative p-8 flex flex-col items-center justify-center border-r border-border/20">
        <AnimatePresence mode="wait">
          <motion.div
            key={selections.casing}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative w-full aspect-square max-w-sm mb-6"
          >
            <img
              src={currentPreviewImage()}
              alt="Custom Preview"
              className="w-full h-full object-contain filter drop-shadow-2xl"
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-2">Selected Finish</p>
          <div className="inline-flex items-center gap-3 bg-background/80 backdrop-blur-md px-6 py-3 rounded-full border border-border/50 shadow-sm">
            <div 
              className="w-6 h-6 rounded-full shadow-inner border border-black/10" 
              style={{ background: selectedFinishOption?.color }} 
            />
            <span className="font-serif font-medium">{selectedFinishOption?.name}</span>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col h-full overflow-hidden">
        <h3 className="font-serif text-3xl lg:text-4xl font-bold mb-2">Design Your Piece</h3>
        <p className="text-muted-foreground mb-8">Personalize the casing and finish to perfectly match your space.</p>

        <div className="flex-1 overflow-y-auto pr-4 space-y-10 custom-scrollbar">
          
          {/* Casing Selection */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/80 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span> 
              Choose Casing
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {casingOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect('casing', option.id)}
                  className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all group ${
                    selections.casing === option.id
                      ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                      : 'border-border/40 hover:border-primary/40 hover:bg-muted/30'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative">
                     <img src={option.image} alt={option.name} className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">{option.name}</span>
                  {selections.casing === option.id && (
                    <div className="absolute top-2 right-2 text-primary bg-background rounded-full p-0.5 shadow-sm">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Finish Selection */}
          <div className="space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-widest text-foreground/80 flex items-center gap-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span> 
              Select Finish
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {finishOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect('finish', option.id)}
                  className={`relative flex flex-col items-center p-2 rounded-xl border-2 transition-all group ${
                    selections.finish === option.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-border'
                  }`}
                >
                  <div 
                    className="w-12 h-12 rounded-full mb-2 shadow-inner border border-black/10 group-hover:scale-110 transition-transform duration-300" 
                    style={{ background: option.color }} 
                  />
                  <span className="text-[10px] font-medium text-center leading-tight px-1">{option.name}</span>
                  {selections.finish === option.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5 shadow-md">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Description (Conditional) */}
          <AnimatePresence>
            {selections.finish === 'custom' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                  <h4 className="font-bold text-sm flex items-center gap-2 mb-3">
                    <Paintbrush size={16} className="text-primary" /> Describe Your Vision
                  </h4>
                  <Textarea 
                    placeholder="E.g., Pastel pink base with soft white marbling and a few gold flakes..."
                    value={selections.customDescription}
                    onChange={(e) => setSelections(prev => ({ ...prev, customDescription: e.target.value }))}
                    className="min-h-[100px] resize-none bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-border/40 flex justify-between items-center bg-card">
          <div>
            <span className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Estimated Base Price</span>
            <span className="text-3xl font-serif font-bold text-foreground">€45.00</span>
          </div>
          <Button size="lg" className="rounded-full px-8 gap-2 shadow-lg hover:shadow-xl transition-shadow text-base">
            <ShoppingCart size={18} /> Add to Order
          </Button>
        </div>
      </div>
    </div>
  );
}
