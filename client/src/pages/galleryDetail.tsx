import { useState, Suspense } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useGLTF, Html, useProgress } from '@react-three/drei';
import { ArrowLeft, Heart, Eye, Share2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/LanguageContext';
import { useToast } from '@/hooks/use-toast';

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-foreground whitespace-nowrap bg-background/80 px-3 py-1 rounded-full backdrop-blur-sm border border-border/40 shadow-xl">
          {progress.toFixed(0)}% Loading
        </p>
      </div>
    </Html>
  );
}

function Model3D({ url }: { url: string }) {
  // Graceful fallback if the URL is not a valid 3D model path (e.g. placeholder data)
  if (!url || (!url.endsWith('.glb') && !url.endsWith('.gltf'))) {
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#8b7355" metalness={0.2} roughness={0.8} />
      </mesh>
    );
  }
  
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ThreeViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-border/40 relative cursor-grab active:cursor-grabbing">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={10}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <Suspense fallback={<CanvasLoader />}>
          <Model3D url={modelUrl} />
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={10}
            blur={2}
          />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}

function PhotoViewer({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="relative w-full rounded-3xl overflow-hidden border-2 border-border/40">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-auto object-contain max-h-[600px]"
        />
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/80 transition"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white p-3 rounded-full hover:bg-white/10 transition"
            onClick={() => setIsFullscreen(false)}
          >
            ✕
          </button>
          <img
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
}

export default function GalleryDetailPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, params] = useRoute('/gallery/:slug');
  const slug = params?.slug;

  const { data: item, isLoading } = useQuery({
    queryKey: ['galleryItem', slug],
    queryFn: async () => {
      const res = await fetch(`/api/gallery/items/${slug}`);
      if (!res.ok) throw new Error('Failed to fetch item');
      return res.json();
    },
    enabled: !!slug,
  });

  const likeMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/gallery/items/${id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to like');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('gallery.liked'),
        description: t('gallery.liked_desc'),
      });
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: t('gallery.link_copied'),
        description: t('gallery.link_copied_desc'),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold mb-4">{t('gallery.item_not_found')}</h2>
          <p className="text-muted-foreground mb-8">{t('gallery.item_not_found_desc')}</p>
          <Link href="/gallery">
            <Button className="rounded-full px-8">{t('gallery.back_to_gallery')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/gallery">
          <Button variant="ghost" className="mb-8 rounded-full -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('gallery.back_to_gallery')}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {item.type === '3d' ? (
                <ThreeViewer modelUrl={item.mediaUrl} />
              ) : (
                <PhotoViewer imageUrl={item.mediaUrl} alt={item.title} />
              )}
            </motion.div>

            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {item.tags.map((tag: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-muted text-sm font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge className="mb-4 rounded-full px-4 py-1.5 font-bold">
                {item.type === '3d' ? t('gallery.3d_model') : t('gallery.photograph')}
              </Badge>

              <h1 className="font-serif text-4xl font-bold mb-4 leading-tight">
                {item.title}
              </h1>

              {item.description && (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {item.description}
                </p>
              )}

              <div className="flex items-center gap-6 py-6 border-y border-border/40">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Eye className="w-5 h-5" />
                  <span className="font-medium">{item.viewCount}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">{item.likes}</span>
                </div>
              </div>

              {item.metadata && (
                <div className="space-y-4 py-6 border-b border-border/40">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                    {t('gallery.details')}
                  </h3>
                  {item.metadata.year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('gallery.year')}</span>
                      <span className="font-medium">{item.metadata.year}</span>
                    </div>
                  )}
                  {item.metadata.materials && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('gallery.materials')}</span>
                      <span className="font-medium">{item.metadata.materials.join(', ')}</span>
                    </div>
                  )}
                  {item.metadata.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('gallery.dimensions')}</span>
                      <span className="font-medium">
                        {item.metadata.dimensions.width} × {item.metadata.dimensions.height}
                        {item.metadata.dimensions.depth && ` × ${item.metadata.dimensions.depth}`} cm
                      </span>
                    </div>
                  )}
                  {item.metadata.location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('gallery.location')}</span>
                      <span className="font-medium">{item.metadata.location}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-6">
                <Button
                  onClick={() => likeMutation.mutate(item.id)}
                  variant="outline"
                  className="w-full rounded-full h-12 font-bold hover:bg-primary hover:text-primary-foreground"
                  disabled={likeMutation.isPending}
                >
                  <Heart className="w-5 h-5 mr-2" />
                  {t('gallery.like_this')}
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full rounded-full h-12 font-bold"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  {t('gallery.share')}
                </Button>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <h3 className="font-serif text-xl font-bold mb-2">
                  {t('gallery.cta_title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('gallery.cta_desc')}
                </p>
                <Link href="/contact">
                  <Button className="w-full rounded-full font-bold">
                    {t('contact.title')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
