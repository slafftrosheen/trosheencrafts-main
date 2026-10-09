import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { useCartStore } from '@/lib/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Check, ShoppingBag, Info, Loader2, RefreshCw, Package } from 'lucide-react';
import { toast } from 'sonner';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

const CandlePreview3D = lazy(() => import('./CandlePreview3D').then((module) => ({ default: module.CandlePreview3D })));

export interface ConstructorOption {
  id: number;
  type: string;
  key: string;
  nameTranslations: Record<string, string>;
  descTranslations: Record<string, string>;
  price: string;
  color: string | null;
  border: string | null;
  imageUrl?: string | null;
}

export function CandleConstructor() {
  const { t, language } = useLanguage();
  const addItem = useCartStore((state) => state.addItem);
  const [show3D, setShow3D] = useState(false);

  const { data: optionsData, isLoading, isError, refetch } = useQuery<Record<string, ConstructorOption[]>>({
    queryKey: ['constructorOptions'],
    queryFn: () => apiClient.get('/constructor-options'),
  });

  const [shape, setShape] = useState<ConstructorOption | null>(null);
  const [finish, setFinish] = useState<ConstructorOption | null>(null);
  const [wax, setWax] = useState<ConstructorOption | null>(null);
  const [aroma, setAroma] = useState<ConstructorOption | null>(null);
  const [customDescription, setCustomDescription] = useState('');

  useEffect(() => {
    if (!optionsData) return;
    if (!shape || !optionsData.vessel?.some((item) => item.id === shape.id)) setShape(optionsData.vessel?.[0] || null);
    if (!finish || !optionsData.finish?.some((item) => item.id === finish.id)) setFinish(optionsData.finish?.[0] || null);
    if (!wax || !optionsData.wax?.some((item) => item.id === wax.id)) setWax(optionsData.wax?.[0] || null);
    if (!aroma || !optionsData.aroma?.some((item) => item.id === aroma.id)) setAroma(optionsData.aroma?.[0] || null);
  }, [optionsData, shape, finish, wax, aroma]);

  const missingOptions = Boolean(optionsData && ['vessel', 'finish', 'wax', 'aroma'].some(
    (type) => !optionsData[type]?.length
  ));

  if (isError || missingOptions) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-border bg-card px-6 py-12 text-center" role="alert">
        <Package className="mb-4 h-10 w-10 text-primary" />
        <h3 className="font-serif text-2xl font-semibold">{t('constructor.unavailable_title')}</h3>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{t('constructor.unavailable_desc')}</p>
        <Button onClick={() => void refetch()} className="mt-6 min-h-11">
          <RefreshCw className="mr-2 h-4 w-4" />{t('shop.retry')}
        </Button>
      </div>
    );
  }

  if (isLoading || !optionsData || !shape || !finish || !wax || !aroma) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-border bg-card" role="status">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('constructor.loading')}</p>
      </div>
    );
  }

  const getTranslatedName = (opt: ConstructorOption) => opt.nameTranslations?.[language] || opt.nameTranslations?.en || opt.key;
  const getTranslatedDesc = (opt: ConstructorOption) => opt.descTranslations?.[language] || opt.descTranslations?.en || '';

  const shapePrice = parseFloat(shape.price || '0');
  const finishPrice = parseFloat(finish.price || '0');
  const waxPrice = parseFloat(wax.price || '0');
  const aromaPrice = parseFloat(aroma.price || '0');
  const totalPrice = shapePrice + finishPrice + waxPrice + aromaPrice;

  const handleAddToCart = () => {
    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      toast.error(t('constructor.unavailable_desc'));
      return;
    }
    if (finish.key === 'custom' && !customDescription.trim()) {
      toast.error(t('constructor.custom_required'));
      return;
    }
    if (customDescription.trim().length > 500) {
      toast.error(t('constructor.custom_too_long'));
      return;
    }
    const customId = `custom-${Date.now()}`;
    const finishName = getTranslatedName(finish);
    const shapeName = getTranslatedName(shape);
    const finishStr = finish.key === 'custom' && customDescription 
      ? `${finishName} (${customDescription})`
      : finishName;
    const variantStr = `${shapeName} / ${finishStr} / ${getTranslatedName(wax)} / ${getTranslatedName(aroma)}`;

    addItem({
      id: customId,
      name: t('constructor.custom_product_name'),
      price: totalPrice,
      image: shape.imageUrl || '',
      variant: variantStr,
      customConfiguration: {
        vesselId: shape.id,
        finishId: finish.id,
        waxId: wax.id,
        aromaId: aroma.id,
        customDescription: finish.key === 'custom' ? customDescription.trim() : undefined,
      },
    });
    
    toast.success(t('constructor.added'), {
      action: { label: t('constructor.view_cart'), onClick: () => window.location.assign('/cart') },
    });
    setCustomDescription('');
  };

  return (
    <div className="w-full min-h-[720px] relative flex flex-col md:flex-row rounded-3xl overflow-visible md:overflow-hidden border border-border bg-background shadow-sm">
      
      {/* LEFT: Sticky Immersive Visualizer */}
      <div className="md:w-1/2 md:sticky md:top-0 md:h-[calc(100vh-8rem)] min-h-[460px] relative bg-muted/30 overflow-hidden flex flex-col items-center justify-center px-5 pb-6 pt-16 md:p-8 border-b md:border-b-0 md:border-r border-border/40">
        <div className="absolute inset-0 noise opacity-30 pointer-events-none" />
        
        {/* Soft radial background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-3/4 bg-primary/5 rounded-full blur-[100px]" />
        </div>

        <div className="absolute top-6 right-6 z-20">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-background/90 backdrop-blur"
            onClick={() => setShow3D(!show3D)}
          >
            {show3D ? t('constructor.photo') : t('constructor.illustration')}
          </Button>
        </div>

        <motion.div 
          className="relative z-10 w-full max-w-[400px] aspect-square flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={show3D ? '3d-' + shape.id : shape.id}
              initial={{ opacity: 0, y: 20, rotate: show3D ? 0 : -5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, y: -20, rotate: show3D ? 0 : 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full h-full drop-shadow-2xl transition-transform duration-700"
            >
              {show3D ? (
                <Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />}>
                  <CandlePreview3D shapeKey={shape.key} colorHex={finish.color?.startsWith('#') ? finish.color : '#e0d8cc'} />
                </Suspense>
              ) : shape.imageUrl ? (
                <OptimizedImage
                  src={shape.imageUrl}
                  alt={getTranslatedName(shape)}
                  className="w-full h-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.2)]"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <Package className="h-12 w-12 text-muted-foreground" />
                  <p className="font-serif text-xl">{getTranslatedName(shape)}</p>
                  <span className="text-sm text-muted-foreground">{t('constructor.preview_missing')}</span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {show3D && <p className="relative z-10 mb-3 max-w-sm text-center text-xs leading-relaxed text-muted-foreground">{t('constructor.illustration_note')}</p>}

        {/* Live Summary Floating Pill */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 mt-4 w-full max-w-sm rounded-2xl border border-border bg-background/95 px-5 py-4 shadow-lg backdrop-blur flex flex-col items-center md:absolute md:bottom-6 md:left-1/2 md:mt-0 md:w-[calc(100%_-_3rem)] md:-translate-x-1/2"
        >
          <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-2">{t('constructor.review_design')}</div>
          <div className="w-full space-y-1.5 text-sm font-medium">
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t("constructor.vessel")}</span><span className="text-right text-foreground">{getTranslatedName(shape)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t("constructor.finish")}</span><span className="text-right text-foreground">{getTranslatedName(finish)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t("constructor.material")}</span><span className="text-right text-foreground">{getTranslatedName(wax)} · {getTranslatedName(aroma)}</span></div>
          </div>
          <div className="w-full h-px bg-border/50 my-3" />
          <div className="w-full flex justify-between items-center text-lg font-serif">
            <span className="text-muted-foreground">{t("constructor.total")}</span>
            <span className="text-primary font-bold">€{totalPrice.toFixed(2)}</span>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Scrollable Configurator Options */}
      <div className="md:w-1/2 relative min-w-0 bg-background/50 md:h-[calc(100vh-8rem)] md:overflow-y-auto custom-scrollbar pb-6 md:pb-32">
        <div className="max-w-2xl mx-auto p-5 sm:p-7 md:p-10 space-y-12 md:space-y-16">
          
          {/* Section 1: Vessel */}
          <section>
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground">{t('constructor.step1')}</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(optionsData.vessel || []).map((s) => {
                const isActive = shape.id === s.id;
                const sPrice = parseFloat(s.price);
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={shape.id === s.id}
                    onClick={() => setShape(s)}
                    className={cn(
                      "relative group p-4 rounded-2xl border transition-colors duration-200 flex flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isActive ? "border-transparent" : "border-border/40 hover:border-border hover:bg-muted/10"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeShape"
                        className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary/5 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div className="w-20 h-20 mb-3 relative flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                      {s.imageUrl && (
                        <OptimizedImage src={s.imageUrl} alt={getTranslatedName(s)} className="w-full h-full object-contain filter drop-shadow-sm" />
                      )}
                    </div>
                    <span className="font-medium text-sm leading-tight text-foreground">{getTranslatedName(s)}</span>
                    <span className="text-muted-foreground text-xs mt-1 font-bold">
                      {sPrice > 0 ? `+€${sPrice.toFixed(2)}` : t('constructor.included')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 2: Finish */}
          <section>
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground">{t('constructor.step2')}</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(optionsData.finish || []).map((f) => {
                const isActive = finish.id === f.id;
                const fPrice = parseFloat(f.price);
                return (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={finish.id === f.id}
                    onClick={() => setFinish(f)}
                    className={cn(
                      "relative group p-4 rounded-2xl border transition-colors duration-200 flex flex-col items-center text-center outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isActive ? "border-transparent" : "border-border/40 hover:border-border hover:bg-muted/10"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeFinish"
                        className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary/5 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Material Swatch */}
                    <div 
                      className="w-14 h-14 rounded-full mb-3 shadow-inner transition-transform duration-500 group-hover:scale-110 relative overflow-hidden"
                      style={{ 
                        background: f.color || '#ccc',
                        boxShadow: `inset 0 4px 10px rgba(0,0,0,0.1), inset 0 0 0 1px ${f.border || '#ccc'}` 
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/40 mix-blend-overlay" />
                    </div>
                    
                    <span className="font-medium text-sm leading-tight text-foreground">{getTranslatedName(f)}</span>
                    <span className="text-muted-foreground text-xs mt-1 font-bold">
                      {fPrice > 0 ? `+€${fPrice.toFixed(2)}` : t('constructor.included')}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {finish.key === 'custom' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="bg-primary/5 p-5 rounded-2xl border border-primary/20 relative">
                    <Info className="w-5 h-5 text-primary absolute top-5 right-5 opacity-50" />
                    <label className="text-sm font-bold text-primary block mb-2">{t('constructor.custom_request')}:</label>
                    <Textarea 
                      placeholder={t('constructor.custom_placeholder')}
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      maxLength={500}
                      aria-label={t('constructor.custom_request')}
                      className="resize-none bg-background/80 focus-visible:ring-primary/50 border-border/50 h-24"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Section 3: Wax */}
          <section>
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground">{t('constructor.step3')}</h3>
            </div>
            <div className="space-y-3">
              {(optionsData.wax || []).map((w) => {
                const isActive = wax.id === w.id;
                const wPrice = parseFloat(w.price);
                return (
                  <button
                    key={w.id}
                    type="button"
                    aria-pressed={wax.id === w.id}
                    onClick={() => setWax(w)}
                    className={cn(
                      "w-full relative group p-5 rounded-2xl border transition-colors duration-200 flex justify-between items-center text-left outline-none",
                      isActive ? "border-transparent" : "border-border/40 hover:border-border hover:bg-muted/10"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeWax"
                        className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary/5 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <div>
                      <div className="font-bold text-foreground flex items-center gap-2">
                        {getTranslatedName(w)}
                        {isActive && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{getTranslatedDesc(w)}</div>
                    </div>
                    <span className="font-bold text-sm bg-background px-3 py-1 rounded-full border border-border/50">
                      {wPrice > 0 ? `+€${wPrice.toFixed(2)}` : t('constructor.free')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 4: Aroma */}
          <section>
            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground">{t('constructor.step4')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(optionsData.aroma || []).map((a) => {
                const isActive = aroma.id === a.id;
                const aPrice = parseFloat(a.price);
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={aroma.id === a.id}
                    onClick={() => setAroma(a)}
                    className={cn(
                      "relative group p-4 rounded-2xl border transition-colors duration-200 flex flex-col sm:flex-row justify-between items-center text-left outline-none gap-2",
                      isActive ? "border-transparent" : "border-border/40 hover:border-border hover:bg-muted/10"
                    )}
                  >
                    {isActive && (
                      <motion.div 
                        layoutId="activeAroma"
                        className="absolute inset-0 rounded-2xl border-2 border-primary bg-primary/5 -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="font-bold text-sm flex items-center gap-2">
                      {getTranslatedName(a)}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {aPrice > 0 ? `+€${aPrice.toFixed(2)}` : t('constructor.free')}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

        </div>
      </div>

      {/* Floating Checkout Bar (Mobile & Desktop) */}
      <div className="sticky bottom-0 left-0 right-0 z-20 flex justify-stretch border-t border-border bg-background/95 p-4 shadow-lg backdrop-blur md:absolute md:justify-end md:border-0 md:bg-transparent md:p-6 md:shadow-none">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="w-full md:w-auto"
        >
          <Button 
            size="lg" 
            className="h-14 w-full px-5 shadow-lg group md:w-auto" 
            onClick={handleAddToCart}
          >
            <span className="flex items-center gap-3 text-lg font-bold">
              {t('constructor.add_to_cart')}
              <span className="w-1 h-1 rounded-full bg-primary-foreground/30" /> 
              €{totalPrice.toFixed(2)}
            </span>
            <div className="ml-4 bg-primary-foreground/20 p-2 rounded-full group-hover:bg-primary-foreground/30 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </Button>
        </motion.div>
      </div>

    </div>
  );
}
