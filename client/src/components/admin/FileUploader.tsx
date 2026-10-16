import { useEffect, useRef, useState } from "react";
import { Upload, Box, Image as ImageIcon, Video, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { R2MediaPicker } from "@/components/admin/R2MediaPicker";

interface Props {
  onUploadComplete: (url: string) => void;
  accept?: string;
  type?: "3d" | "photo" | "video";
  maxSizeMB?: number;
  currentUrl?: string;
}

export function FileUploader({
  onUploadComplete, accept = ".jpg,.jpeg,.png,.webp,.glb,.gltf",
  type = "photo", maxSizeMB = 100, currentUrl,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState(currentUrl || "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  // Each item in the Gallery admin editor can change without remounting this uploader.
  useEffect(() => { setUrl(currentUrl || ""); }, [currentUrl]);

  const upload = async (file?: File) => {
    if (!file || uploading) return;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Файл слишком большой. Максимум ${maxSizeMB} МБ.`);
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (type === "3d" && ext !== "glb" && ext !== "gltf") {
      toast.error("Выберите модель GLB или GLTF.");
      return;
    }
    if (type === "video" && ext !== "mp4" && ext !== "webm") {
      toast.error("Выберите видео MP4 или WebM.");
      return;
    }
    if (type === "photo" && !["jpg", "jpeg", "png", "webp", "gif"].includes(ext || "")) {
      toast.error("Выберите изображение JPG, PNG, WebP или GIF.");
      return;
    }
    setUploading(true); setProgress(0);
    try {
      const result = await apiClient.uploadFile("/upload/gallery", file, value => setProgress(Math.round(value)));
      setUrl(result.url);
      onUploadComplete(result.url);
      toast.success("Файл загружен в Cloudflare R2.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Загрузка в R2 не удалась.");
    } finally {
      setUploading(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <R2MediaPicker open={pickerOpen} onOpenChange={setPickerOpen}
        kind={type === "photo" ? "image" : type}
        onSelect={chosen => { setUrl(chosen); onUploadComplete(chosen); }} />
      <input ref={ref} type="file" accept={accept} className="sr-only"
        disabled={uploading} onChange={event => void upload(event.target.files?.[0])} />
      <div className={"flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center " +
        (dragging ? "border-primary bg-primary/5" : "border-border/60")}
        onDragOver={event => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={event => {
          event.preventDefault(); setDragging(false);
          void upload(event.dataTransfer.files?.[0]);
        }}>
        {type === "photo" && url ? (
          <img src={url} alt="Предпросмотр" className="max-h-40 max-w-full rounded-xl object-contain" />
        ) : type === "3d" ? <Box className="h-9 w-9 text-muted-foreground" />
          : type === "video" ? <Video className="h-9 w-9 text-muted-foreground" />
          : <ImageIcon className="h-9 w-9 text-muted-foreground" />}
        {url && <a href={url} target="_blank" rel="noopener noreferrer"
          className="break-all text-xs text-primary underline">Открыть текущий файл</a>}
        {uploading && <p role="status" className="text-sm text-muted-foreground">Загрузка в R2: {progress}%</p>}
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => ref.current?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {url ? "Заменить файл" : "Загрузить файл"}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => setPickerOpen(true)}>
            <FolderOpen className="mr-2 h-4 w-4" /> Из медиатеки R2
          </Button>
        </div>
      </div>
    </div>
  );
}
