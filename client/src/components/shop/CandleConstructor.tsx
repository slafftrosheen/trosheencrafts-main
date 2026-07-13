import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { OptimizedImage } from '@/components/shared/OptimizedImage';

// Configuration Options
const SHAPES = [
  { id: 'heart', name: 'Heart Vessel', price: 15, image: '/assets/heart shaped mug candle.webp' },
  { id: 'cylinder', name: 'Classic Cylinder', price: 12, image: '/assets/sea shell shaped candle.webp' },
  { id: 'sphere', name: 'Minimalist Sphere', price: 18, image: '/assets/Latvian Motiff candle.webp' },
];

const FINISHES = [
  { id: 'concrete', name: 'Raw Concrete', price: 0, color: '#9CA3AF' },
  { id: 'marble', name: 'Marble Effect', price: 5, color: '#E5E7EB' },
  { id: 'bronze', name: 'Painted Bronze', price: 8, color: '#b08d57' },
  { id: 'gold', name: 'Gold Leaf Detail', price: 10, color: '#D4AF37' },
];

const WAX_TYPES = [
  { id: 'soy', name: 'Soy Wax (Eco)', price: 0 },
  { id: 'gel', name: 'Clear Gel Wax', price: 3 },
  { id: 'beeswax', name: 'Natural Beeswax', price: 5 },
];

const AROMAS = [
  { id: 'none', name: 'Unscented', price: 0 },
  { id: 'lavender', name: 'Lavender Breeze', price: 2 },
  { id: 'vanilla', name: 'Warm Vanilla', price: 2 },
  { id: 'pine', name: 'Baltic Pine', price: 2 },
  { id: 'citrus', name: 'Citrus Zest', price: 2 },
];

export function CandleConstructor() {
  const { t } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);

  const [step, setStep] = useState(1);
  const [shape, setShape] = useState(SHAPES[0]);
  const [finish, setFinish] = useState(FINISHES[0]);
  const [wax, setWax] = useState(WAX_TYPES[0]);
  const [aroma, setAroma] = useState(AROMAS[0]);

  const totalPrice = shape.price + finish.price + wax.price + aroma.price;

  const handleAddToCart = () => {
    // We use a pseudo-random ID for custom items
    const customId = `custom-${Date.now()}`;
    const variantStr = `${shape.name} / ${finish.name} / ${wax.name} / ${aroma.name}`;

    addItem({
      id: customId,
      name: 'Custom Crafted Candle',
      price: totalPrice,
      image: shape.image,
      variant: variantStr,
    });
    
    toast.success("Custom candle added to cart!");
    setStep(1); // Reset
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-4">Build Your Candle</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Mix and match materials to create a unique piece that fits your home perfectly.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-1 bg-muted -z-10" />
        <div 
          className="absolute left-0 top-1/2 h-1 bg-primary transition-all duration-300 -z-10"
          style={{ width: `${((step - 1) / 4) * 100}%` }}
        />
        {[1, 2, 3, 4, 5].map((s) => (
          <div 
            key={s} 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-4 border-background ${step >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {s}
          </div>
        ))}
      </div>

      <Card className="border-border/40 shadow-2xl overflow-hidden rounded-[2rem]">
        <div className="flex flex-col md:flex-row">
          
          {/* Visualizer Panel */}
          <div className="md:w-1/2 bg-muted/30 p-8 flex flex-col items-center justify-center min-h-[300px] md:min-h-[500px] relative border-b md:border-b-0 md:border-r border-border/40">
            <AnimatePresence mode="wait">
              <motion.div
                key={shape.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[280px] aspect-square rounded-[2rem] overflow-hidden shadow-2xl"
              >
                <OptimizedImage
                  src={shape.image}
                  alt={shape.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            
            <div className="mt-8 w-full max-w-[280px] space-y-2 text-sm text-center">
              <p className="font-bold text-lg">{t('common.total') || 'Total'}: €{totalPrice.toFixed(2)}</p>
              <div className="text-muted-foreground space-y-1">
                <p>Vessel: {shape.name}</p>
                {step > 1 && <p>Finish: {finish.name}</p>}
                {step > 2 && <p>Wax: {wax.name}</p>}
                {step > 3 && <p>Aroma: {aroma.name}</p>}
              </div>
            </div>
          </div>

          {/* Options Panel */}
          <div className="md:w-1/2 p-8 flex flex-col">
            <div className="flex-1">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="text-2xl font-serif font-bold mb-6">1. Choose Vessel Shape</h3>
                    <div className="grid gap-4">
                      {SHAPES.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => setShape(s)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${shape.id === s.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}
                        >
                          <span className="font-medium text-lg">{s.name}</span>
                          <span className="text-muted-foreground">+€{s.price}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="text-2xl font-serif font-bold mb-6">2. Choose Finish</h3>
                    <div className="grid gap-4">
                      {FINISHES.map(f => (
                        <div 
                          key={f.id}
                          onClick={() => setFinish(f)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${finish.id === f.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}
                        >
                          <div className="w-8 h-8 rounded-full border shadow-inner" style={{ backgroundColor: f.color }} />
                          <span className="font-medium text-lg flex-1">{f.name}</span>
                          <span className="text-muted-foreground">+{f.price > 0 ? `€${f.price}` : 'Free'}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="text-2xl font-serif font-bold mb-6">3. Choose Wax</h3>
                    <div className="grid gap-4">
                      {WAX_TYPES.map(w => (
                        <div 
                          key={w.id}
                          onClick={() => setWax(w)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${wax.id === w.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}
                        >
                          <span className="font-medium text-lg">{w.name}</span>
                          <span className="text-muted-foreground">+{w.price > 0 ? `€${w.price}` : 'Free'}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h3 className="text-2xl font-serif font-bold mb-6">4. Choose Aroma</h3>
                    <div className="grid gap-4">
                      {AROMAS.map(a => (
                        <div 
                          key={a.id}
                          onClick={() => setAroma(a)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${aroma.id === a.id ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/50'}`}
                        >
                          <span className="font-medium text-lg">{a.name}</span>
                          <span className="text-muted-foreground">+{a.price > 0 ? `€${a.price}` : 'Free'}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-full flex flex-col justify-center items-center text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                      <Check className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold mb-4">Masterpiece Ready!</h3>
                    <p className="text-muted-foreground text-lg mb-8">
                      Your custom candle configuration is complete. We will hand-pour it specifically for you in our Daugavpils workshop.
                    </p>
                    <Button size="lg" className="rounded-full w-full py-6 text-lg font-bold shadow-xl shadow-primary/20" onClick={handleAddToCart}>
                      <ShoppingBag className="mr-2 w-5 h-5" /> Add to Cart — €{totalPrice.toFixed(2)}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            {step < 5 && (
              <div className="flex justify-between mt-12 pt-6 border-t border-border/40">
                <Button 
                  variant="ghost" 
                  onClick={prevStep} 
                  disabled={step === 1}
                  className="rounded-xl px-6"
                >
                  <ChevronLeft className="mr-2 w-4 h-4" /> Back
                </Button>
                <Button 
                  onClick={nextStep}
                  className="rounded-xl px-8 shadow-md"
                >
                  Next Step <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
