import { useEffect, useRef, useState } from "react";
import { FolderOpen, Upload, Image as ImageIcon, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { R2MediaPicker } from "@/components/admin/R2MediaPicker";
import { cn } from "@/lib/utils";

interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}
interface MediaUploaderProps {
  onUploadComplete: (url: string, file: UploadedFile) => void;
  accept?: string;
  maxSizeMB?: number;
  showPreview?: boolean;
  value?: string;
  label?: string;
  multiple?: boolean;
  className?: string;
}

/** Legacy media editor; now uses the same authenticated R2 pipeline as all admin screens. */
export function MediaUploader({
  onUploadComplete, accept = ".jpg,.jpeg,.png,.webp,.gif,.mp4,.webm,.glb,.gltf",
  maxSizeMB = 100, showPreview = true, value, label = "Загрузить файл",
  multiple = false, className,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [preview, setPreview] = useState(value || "");
  const [progress, setProgress] = useState(0);

  useEffect(() => setPreview(value || ""), [value]);

  const uploadFiles = async (files: File[]) => {
    if (uploading || !files.length) return;
    setUploading(true);
    try {
      for (const file of (multiple ? files : files.slice(0, 1))) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`Превышен максимальный размер файла: ${maxSizeMB} МБ`);
          continue;
        }
        const photo = /\.(jpe?g|png|webp)$/i.test(file.name);
        const result = await apiClient.uploadFile(
          photo ? "/upload/image" : "/upload/gallery", file,
          percent => setProgress(Math.round(percent)),
        );
        setPreview(result.url);
        onUploadComplete(result.url, {
          filename: result.filename,
          originalName: file.name,
          mimetype: result.contentType,
          size: result.size,
          url: result.url,
        });
      }
      toast.success("Файлы загружены в R2.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки в R2.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <R2MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} kind="all"
        onSelect={url => {
          setPreview(url);
          onUploadComplete(url, {
            url, filename: url.split("/").pop() || "file",
            originalName: url.split("/").pop() || "file",
            mimetype: "application/octet-stream", size: 0,
          });
        }} />
      <input ref={fileInputRef} type="file" accept={accept} multiple={multiple}
        className="sr-only" disabled={uploading}
        onChange={event => void uploadFiles(Array.from(event.target.files || []))} />
      <div className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/60 p-4 text-center",
        dragging && "border-primary bg-primary/10",
      )}
        onDragEnter={event => { event.preventDefault(); setDragging(true); }}
        onDragOver={event => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          void uploadFiles(Array.from(event.dataTransfer.files || []));
        }}>
        {showPreview && preview && /\.(jpe?g|png|webp|gif)$/i.test(new URL(preview, window.location.origin).pathname)
          ? <img src={preview} alt="Предпросмотр" className="max-h-44 max-w-full rounded-xl object-contain" />
          : <ImageIcon className="h-10 w-10 text-muted-foreground" />}
        {uploading && <span role="status" className="text-xs text-muted-foreground">Загрузка: {progress}%</span>}
        {preview && <a href={preview} target="_blank" rel="noopener noreferrer"
          className="max-w-full break-all text-xs text-primary underline">Открыть текущий файл</a>}
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" size="sm" variant="outline" disabled={uploading}
            onClick={() => fileInputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {label}
          </Button>
          <Button type="button" size="sm" variant="outline" disabled={uploading}
            onClick={() => setPickerOpen(true)}>
            <FolderOpen className="mr-2 h-4 w-4" /> Выбрать из R2
          </Button>
          {preview && <Button type="button" size="sm" variant="ghost" disabled={uploading}
            onClick={() => setPreview("")} title="Убрать только предпросмотр, не удаляя объект R2">
            <X className="h-4 w-4" /> Закрыть
          </Button>}
        </div>
      </div>
    </div>
  );
}

export default MediaUploader;
