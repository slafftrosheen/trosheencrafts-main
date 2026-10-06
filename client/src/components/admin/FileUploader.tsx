import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image, Box, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';

interface FileUploaderProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  type?: '3d' | 'photo' | 'video';
  maxSizeMB?: number;
  currentUrl?: string;
}

export function FileUploader({
  onUploadComplete,
  accept = 'image/*,.glb,.gltf',
  type = 'photo',
  maxSizeMB = 100,
  currentUrl,
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Size validation
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast({
        title: 'Файл слишком большой',
        description: `Максимальный размер файла — ${maxSizeMB} МБ`,
        variant: 'destructive',
      });
      return;
    }

    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }

    // Upload to R2 via backend
    setUploading(true);
    setUploadProgress(0);

    try {
      const data = await apiClient.uploadFile('/upload/gallery', file, (progress) => {
        setUploadProgress(Math.round(progress));
      });

      onUploadComplete(data.url);
      toast({
        title: 'Файл загружен',
        description: `Загружен файл: ${file.name}`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'Ошибка загрузки',
        description: e.message || 'Не удалось загрузить файл',
        variant: 'destructive',
      });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const clearPreview = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all',
          dragActive ? 'border-primary bg-primary/5' : 'border-border/40',
          uploading && 'opacity-50 pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview && type === 'photo' ? (
          <div className="relative">
            <img
              src={preview}
              alt="Предпросмотр"
              className="max-h-64 mx-auto rounded-xl object-contain"
            />
            <button
              onClick={clearPreview}
              disabled={uploading}
              className="absolute top-2 right-2 bg-black/70 text-white p-2 rounded-full hover:bg-black/90 transition"
              type="button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {type === '3d' ? (
              <Box className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            ) : type === 'video' ? (
              <Video className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            ) : (
              <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            )}

            <p className="text-sm font-medium mb-2">
              {uploading ? 'Загрузка...' : 'Перетащите файл сюда или нажмите для выбора'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {type === '3d' ? 'Файлы GLB или GLTF' : type === 'video' ? 'Видео MP4 или WebM' : 'Изображения JPG, PNG, GIF или WEBP'}
              {' • '}Макс. {maxSizeMB} МБ
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
          id={`file-upload-input-${type}`}
        />

        {!preview && (
          <label htmlFor={`file-upload-input-${type}`}>
            <Button
              type="button"
              asChild
              disabled={uploading}
              className="rounded-full"
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файл
                  </>
                )}
              </span>
            </Button>
          </label>
        )}

        {uploading && (
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>

      {currentUrl && (!preview || type === '3d' || type === 'video') && (
        <div className="text-sm text-muted-foreground">
          Текущий файл:{' '}
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Открыть текущий файл →
          </a>
        </div>
      )}
    </div>
  );
}
