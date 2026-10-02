import { Suspense, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, useGLTF, Html, useProgress } from "@react-three/drei";
import { ArrowLeft, Heart, Share2, Maximize2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-full border border-border bg-background/90 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur">
        {progress.toFixed(0)}% loading
      </div>
    </Html>
  );
}

function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function Model3D({ url }: { url: string }) {
  if (!url || (!url.endsWith(".glb") && !url.endsWith(".gltf"))) {
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="#746353" metalness={0.1} roughness={0.85} />
      </mesh>
    );
  }

  return <GltfModel url={url} />;
}

function ThreeViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="h-[55vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-border bg-muted/40">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 2, 5]} />
        <OrbitControls enablePan enableZoom enableRotate minDistance={2} maxDistance={10} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />
        <Suspense fallback={<CanvasLoader />}>
          <Model3D url={modelUrl} />
          <ContactShadows position={[0, -2, 0]} opacity={0.35} scale={10} blur={2} />
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}

function MediaViewer({ item }: { item: any }) {
  const [fullscreen, setFullscreen] = useState(false);

  if (item.type === "3d") {
    return <ThreeViewer modelUrl={item.mediaUrl} />;
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-border bg-muted">
        {item.type === "video" ? (
          <video src={item.mediaUrl} poster={item.thumbnailUrl} controls playsInline className="max-h-[75vh] w-full bg-black object-contain" />
        ) : (
          <img src={item.mediaUrl} alt={item.title} className="max-h-[75vh] w-full object-contain" />
        )}
        {item.type === "photo" && (
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute right-4 top-4 rounded-full bg-black/65 p-3 text-white backdrop-blur hover:bg-black/80"
            aria-label="View fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {fullscreen && (
        <button
          type="button"
          onClick={() => setFullscreen(false)}
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/95 p-4"
          aria-label="Close fullscreen"
        >
          <img src={item.mediaUrl} alt={item.title} className="max-h-full max-w-full object-contain" />
        </button>
      )}
    </>
  );
}

export default function GalleryDetailPage() {
  const { t } = useLanguage();
  const [, params] = useRoute("/gallery/:slug");
  const slug = params?.slug;
  const queryClient = useQueryClient();

  const { data: item, isLoading, isError } = useQuery({
    queryKey: ["galleryItem", slug],
    queryFn: () => apiClient.get<any>("/gallery/items/" + slug),
    enabled: !!slug,
  });

  const likeMutation = useMutation({
    mutationFn: (id: number) => apiClient.post("/gallery/items/" + id + "/like"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["galleryItem", slug] });
      toast.success(t("gallery.liked"));
    },
  });

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href,
      });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    toast.success(t("gallery.link_copied"));
  };

  if (isLoading) {
    return <div className="site-container page-shell min-h-[60vh] animate-pulse rounded-3xl bg-muted/40" />;
  }

  if (isError || !item) {
    return (
      <div className="site-container page-shell flex min-h-[60vh] items-center justify-center text-center">
        <div>
          <h1 className="font-serif text-4xl font-semibold">{t("gallery.item_not_found")}</h1>
          <Button asChild className="mt-6">
            <Link href="/gallery">{t("gallery.back_to_gallery")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell pt-8 sm:pt-10">
      <div className="site-container">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("gallery.back_to_gallery")}
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:gap-14">
          <div>
            <MediaViewer item={item} />
            {item.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.tags.map((tag: string) => (
                  <span key={tag} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow">{item.type === "3d" ? "Interactive 3D" : item.type}</p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {item.title}
            </h1>
            {item.description && (
              <p className="mt-5 text-base leading-8 text-muted-foreground">{item.description}</p>
            )}

            <div className="mt-7 flex items-center gap-5 border-y border-border py-4 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {item.viewCount}</span>
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {item.likes}</span>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={() => likeMutation.mutate(item.id)} disabled={likeMutation.isPending}>
                <Heart className="h-4 w-4" />
                {t("gallery.like")}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                {t("gallery.share")}
              </Button>
            </div>

            {item.type === "3d" && (
              <p className="surface-muted mt-7 p-5 text-sm leading-6 text-muted-foreground">
                Drag to rotate, scroll or pinch to zoom, and inspect the piece from every side.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
