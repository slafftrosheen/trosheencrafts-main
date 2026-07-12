import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid3x3, Images, Eye, Heart, Search, Filter, X, Plus, Loader2, LayoutGrid, StretchHorizontal, Trello, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/LanguageContext';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

interface GalleryItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  type: '3d' | 'photo' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  featured: boolean;
  viewCount: number;
  likes: number;
  metadata?: any;
}

interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: '3d' | 'photo';
}

function GalleryItemCard({ item, variant = 'grid' }: { item: GalleryItem, variant?: 'grid' | 'masonry' | 'cinematic' }) {
  const [isHovered, setIsHovered] = useState(false);
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (item.type === 'video' && videoRef.current) {
      if (isHovered) videoRef.current.play().catch(() => {});
      else {
        if (variant !== 'cinematic') {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }
  }, [isHovered, item.type, variant]);

  if (variant === 'cinematic') {
    return (
      <Link href={`/gallery/${item.slug}`}>
        <motion.div
          className="group relative rounded-[2.5rem] overflow-hidden bg-card border-2 border-border/40 cursor-pointer mb-12 bg-black"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.4 }}
        >
          <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden bg-muted/20">
            {item.type === 'video' ? (
              <video 
                src={item.mediaUrl} 
                poster={item.thumbnailUrl}
                autoPlay 
                muted 
                loop 
                playsInline 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <Badge className="bg-primary/90 text-primary-foreground font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest text-[10px]">
                    {item.type === '3d' ? '3D Interactive' : item.type === 'video' ? 'Workshop Video' : 'Workshop Photography'}
                  </Badge>
                  <h3 className="text-white font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-none tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-white/70 text-lg md:text-xl line-clamp-2 font-medium">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-6 text-white/60">
                  <span className="flex items-center gap-2 text-lg font-bold">
                    <Eye className="w-6 h-6 text-primary" />
                    {item.viewCount}
                  </span>
                  <span className="flex items-center gap-2 text-lg font-bold">
                    <Heart className="w-6 h-6 text-primary" />
                    {item.likes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/gallery/${item.slug}`}>
      <motion.div
        className={cn(
          "group relative rounded-3xl overflow-hidden bg-card border-2 border-border/40 cursor-pointer",
          variant === 'masonry' ? "mb-6" : ""
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -8, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className={cn(
          "relative overflow-hidden bg-muted/20",
          variant === 'grid' ? "aspect-square" : "h-auto"
        )}>
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-primary/90 text-primary-foreground font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
              {item.type === '3d' ? (
                <><Grid3x3 className="w-3 h-3 mr-1" /> 3D Model</>
              ) : item.type === 'video' ? (
                <><Play className="w-3 h-3 mr-1 fill-current" /> Video</>
              ) : (
                <><Images className="w-3 h-3 mr-1" /> Photo</>
              )}
            </Badge>
          </div>

          {item.type === 'video' ? (
            <video 
              ref={videoRef}
              src={item.mediaUrl} 
              poster={item.thumbnailUrl}
              muted 
              loop 
              playsInline 
              className={cn(
                "w-full h-full object-cover transition-all duration-700",
                isHovered && "scale-110 blur-sm"
              )}
            />
          ) : (
            <img
              src={item.thumbnailUrl || item.mediaUrl}
              alt={item.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-700",
                isHovered && "scale-110 blur-sm"
              )}
            />
          )}
          
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 z-20"
              >
                <motion.h3
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-white font-serif text-xl font-bold mb-2"
                >
                  {item.title}
                </motion.h3>
                {item.description && (
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-white/80 text-sm line-clamp-2 mb-3"
                  >
                    {item.description}
                  </motion.p>
                )}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-4 text-white/70 text-sm"
                >
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {item.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {item.likes}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {item.tags && item.tags.length > 0 && variant === 'grid' && (
          <div className="p-4 flex flex-wrap gap-2">
            {item.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

export default function GalleryPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | '3d' | 'photo' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'cinematic'>('grid');
  const [page, setPage] = useState(1);
  const itemsPerPage = viewMode === 'cinematic' ? 6 : 12;

  const { data: categories } = useQuery<GalleryCategory[]> ({
    queryKey: ['galleryCategories'],
    queryFn: () => apiClient.get('/gallery/categories'),
  });

  const { data: galleryData, isLoading, isFetching } = useQuery({
    queryKey: ['galleryItems', activeTab, searchQuery, selectedCategory, page, viewMode],
    queryFn: () => {
      const params: any = {
        limit: page * itemsPerPage,
      };
      if (activeTab !== 'all') params.type = activeTab;
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory) params.categoryId = selectedCategory;
      
      return apiClient.get<any>('/gallery/items', { params });
    },
  });

  const filteredCategories = categories?.filter(
    cat => activeTab === 'all' || cat.type === activeTab || (activeTab === 'video' && cat.type === 'photo')
  );

  return (
    <>
      <section className="relative min-h-[40vh] flex items-center justify-center bg-gradient-to-b from-muted/30 to-background pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block mb-4 text-sm font-black uppercase tracking-[0.3em] text-primary">
              {t('gallery.eyebrow')}
            </span>
            <h1 className="font-serif text-5xl md:text-7xl font-bold mb-6 leading-tight">
              {t('gallery.title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('gallery.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12 space-y-8">
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
            <Tabs value={activeTab} onValueChange={(v: any) => { setActiveTab(v); setPage(1); }} className="w-full lg:w-auto">
              <TabsList className="grid w-full max-w-xl grid-cols-4 h-12 rounded-full bg-muted/50 p-1">
                <TabsTrigger value="all" className="rounded-full font-bold">{t('gallery.all')}</TabsTrigger>
                <TabsTrigger value="3d" className="rounded-full font-bold">3D</TabsTrigger>
                <TabsTrigger value="photo" className="rounded-full font-bold">Photos</TabsTrigger>
                <TabsTrigger value="video" className="rounded-full font-bold">Videos</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-2xl border-2 border-border/40">
              {[
                { id: 'grid', icon: LayoutGrid, label: 'Grid' },
                { id: 'masonry', icon: Trello, label: 'Flow' },
                { id: 'cinematic', icon: StretchHorizontal, label: 'Cinematic' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => { setViewMode(mode.id as any); setPage(1); }}
                  className={cn(
                    "flex items-center rounded-xl px-4 h-9 font-bold transition-all text-sm",
                    viewMode === mode.id ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  <mode.icon className="w-4 h-4 mr-2" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('gallery.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full border-2 border-border/40 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition" />
                </button>
              )}
            </div>

            {filteredCategories && filteredCategories.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full font-medium"
                >
                  {t('gallery.all_categories')}
                </Button>
                {filteredCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className="rounded-full font-medium"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>

        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-square rounded-3xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : galleryData?.items?.length > 0 ? (
          <>
            <motion.div
              layout
              className={cn(
                "w-full",
                viewMode === 'grid' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8",
                viewMode === 'masonry' && "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6",
                viewMode === 'cinematic' && "flex flex-col"
              )}
            >
              {galleryData.items.map((item: GalleryItem, idx: number) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.5) }}
                  className={viewMode === 'masonry' ? "break-inside-avoid" : ""}
                >
                  <GalleryItemCard item={item} variant={viewMode} />
                </motion.div>
              ))}
            </motion.div>

            {galleryData.total > galleryData.items.length && (
              <div className="mt-16 text-center">
                <Button 
                  onClick={() => setPage(prev => prev + 1)} 
                  disabled={isFetching}
                  size="lg"
                  className="rounded-full px-12 h-14 text-lg shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  {isFetching ? <Loader2 className="animate-spin mr-2" /> : <Plus className="mr-2" />}
                  {t('common.load_more') || 'Load More'}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-serif text-2xl font-bold mb-2">{t('gallery.no_items')}</h3>
            <p className="text-muted-foreground">{t('gallery.try_different_filter')}</p>
          </div>
        )}
      </section>
    </>
  );
}
