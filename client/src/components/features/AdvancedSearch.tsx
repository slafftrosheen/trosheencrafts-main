import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { useLanguage } from '@/lib/LanguageContext';
import { useDebounce } from '@/hooks/usePerformance';
import { OptimizedImage } from '@/components/shared/OptimizedImage';
import { useProducts } from '@/hooks/useApi';

interface SearchResult {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export function AdvancedSearch() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: products = [] } = useProducts();

  const debouncedQuery = useDebounce(query, 200);

  // Enable shortcut
  useSearchShortcut(() => setIsOpen(true));

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load recent searches from localStorage', e);
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Search results
  const results: SearchResult[] = debouncedQuery.length > 0
    ? products
        .filter(p => {
          const name = p.nameTranslations?.[language] || p.name;
          const description = typeof p.description === 'object' ? p.description?.[language] || '' : p.description || '';
          return name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(debouncedQuery.toLowerCase());
        })
        .slice(0, 6)
        .map(p => ({
          id: p.id,
          name: p.nameTranslations?.[language] || p.name,
          description: typeof p.description === 'object' ? p.description?.[language] || '' : p.description || '',
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
          image: p.image || '/placeholder.jpg',
          category: p.category || '',
        }))
    : [];

  const saveSearch = useCallback((searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save search to localStorage', e);
    }
  }, [recentSearches]);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('recentSearches');
    } catch (e) {
      console.warn('Failed to clear recent searches from localStorage', e);
    }
  };

  const handleResultClick = (name: string) => {
    saveSearch(query);
    setIsOpen(false);
    setQuery('');
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
  };

  const popularSearches = ['candles', 'garden', 'valentine', 'concrete', 'planters'];

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/60 hover:bg-muted transition-colors border border-border/40"
      >
        <Search size={18} />
        <span className="hidden md:inline text-sm text-muted-foreground">
          {t('shop.search')}
        </span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background border border-border text-[10px] font-mono">
          ⌘K
        </kbd>
      </button>

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-background rounded-3xl shadow-2xl z-[101] overflow-hidden border-2 border-border/40"
            >
              {/* Search Input */}
              <div className="p-6 border-b border-border/40 flex items-center gap-4">
                <Search className="text-muted-foreground shrink-0" size={24} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('shop.search')}
                  className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1.5 hover:bg-muted rounded-full transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Results / Suggestions */}
              <div className="max-h-[500px] overflow-y-auto">
                {query.length > 0 ? (
                  results.length > 0 ? (
                    <div className="p-4 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-2 mb-3">
                        {results.length} Results
                      </p>
                      {results.map((product) => (
                        <Link
                          key={product.id}
                          href={`/shop/${product.id}`}
                          onClick={() => handleResultClick(product.name)}
                        >
                          <motion.div
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/60 transition-colors cursor-pointer group"
                          >
                            <OptimizedImage
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 rounded-xl shrink-0"
                              objectFit="cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold group-hover:text-primary transition-colors truncate">
                                {product.name}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                              <span className="text-xs text-primary font-medium">
                                {product.category}
                              </span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-primary">
                                €{(product.price / 100).toFixed(2)}
                              </span>
                              <ArrowRight className="ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                            </div>
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-4">
                        <Search className="text-muted-foreground" size={24} />
                      </div>
                      <p className="text-muted-foreground font-medium mb-2">
                        {t('shop.no_items')} "{query}"
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('shop.try_adjusting')}
                      </p>
                    </div>
                  )
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-muted-foreground" />
                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                              Recent Searches
                            </p>
                          </div>
                          <button
                            onClick={clearRecentSearches}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search, i) => (
                            <button
                              key={i}
                              onClick={() => handleRecentSearchClick(search)}
                              className="px-4 py-2 rounded-full bg-muted/60 hover:bg-muted text-sm transition-colors"
                            >
                              {search}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Popular Searches */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp size={16} className="text-muted-foreground" />
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Popular Searches
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search, i) => (
                          <button
                            key={i}
                            onClick={() => setQuery(search)}
                            className="px-4 py-2 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors capitalize"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="p-4 border-t border-border/40 bg-muted/20 text-center">
                <p className="text-xs text-muted-foreground">
                  Press <kbd className="px-2 py-0.5 rounded bg-background border border-border font-mono">ESC</kbd> to close
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Keyboard shortcut (⌘K or Ctrl+K)
export function useSearchShortcut(callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callback]);
}
