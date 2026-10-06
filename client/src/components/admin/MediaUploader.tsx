import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Film, Box, File, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MediaUploaderProps {
  /** Callback when file is successfully uploaded */
  onUploadComplete: (url: string, file: UploadedFile) => void;
  /** Accepted file types (mime types or extensions) */
  accept?: string;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Show preview of uploaded image */
  showPreview?: boolean;
  /** Current value (URL) if editing */
  value?: string;
  /** Label for the upload button */
  label?: string;
  /** Allow multiple file selection */
  multiple?: boolean;
  /** Class name for container */
  className?: string;
}

interface UploadedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
}

export function MediaUploader({
  onUploadComplete,
  accept = 'image/*,video/*,.glb,.gltf',
  maxSizeMB = 50,
  showPreview = true,
  value,
  label = 'Загрузить файл',
  multiple = false,
  className,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file size
      const maxSize = maxSizeMB * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: 'Файл слишком большой',
          description: `Максимальный размер файла — ${maxSizeMB} МБ`,
          variant: 'destructive',
        });
        return false;
      }
      return true;
    },
    [maxSizeMB, toast]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      if (!validateFile(file)) return;

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/media/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Не удалось загрузить файл');
        }

        const data = await response.json();
        const uploadedFile = data.file as UploadedFile;

        setUploadedFile(uploadedFile);

        // Generate preview for images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setPreview(uploadedFile.url);
        }

        onUploadComplete(uploadedFile.url, uploadedFile);

        toast({
          title: 'Файл загружен',
          description: `${file.name} загружен`,
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast({
          title: 'Ошибка загрузки',
          description: error instanceof Error ? error.message : 'Не удалось загрузить файл',
          variant: 'destructive',
        });
      } finally {
        setUploading(false);
      }
    },
    [validateFile, onUploadComplete, toast]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      if (multiple) {
        // Handle multiple files
        Array.from(files).forEach((file) => uploadFile(file));
      } else {
        uploadFile(files[0]);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [multiple, uploadFile]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      if (multiple) {
        Array.from(files).forEach((file) => uploadFile(file));
      } else {
        uploadFile(files[0]);
      }
    },
    [multiple, uploadFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleClear = useCallback(() => {
    setPreview(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getFileIcon = (mimetype?: string) => {
    if (!mimetype) return <File className="w-8 h-8" />;
    if (mimetype.startsWith('image/')) return <ImageIcon className="w-8 h-8" />;
    if (mimetype.startsWith('video/')) return <Film className="w-8 h-8" />;
    if (mimetype.includes('gltf') || mimetype.includes('glb')) return <Box className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
      />

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer',
          'hover:border-primary hover:bg-primary/5',
          dragActive ? 'border-primary bg-primary/10' : 'border-border/40',
          uploading && 'pointer-events-none opacity-50',
          preview && showPreview && 'hidden'
        )}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium mb-1">
              {dragActive ? 'Перетащите файл сюда' : `Нажмите, чтобы выбрать файл, или перетащите его сюда`}
            </p>
            <p className="text-xs text-muted-foreground">
              Макс. размер: {maxSizeMB} МБ
            </p>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium">Загрузка...</p>
            </div>
          </div>
        )}
      </div>

      {/* Preview Area */}
      {preview && showPreview && (
        <div className="relative rounded-2xl border-2 border-border/40 overflow-hidden bg-muted/30">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            variant="destructive"
            size="icon"
            className="absolute top-3 right-3 z-10 rounded-full w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>

          {uploadedFile?.mimetype?.startsWith('image/') || value?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
            <div className="aspect-video w-full">
              <img
                src={preview}
                alt="Предпросмотр"
                className="w-full h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex flex-col items-center justify-center p-8">
              <div className="p-6 rounded-full bg-primary/10 text-primary mb-4">
                {getFileIcon(uploadedFile?.mimetype)}
              </div>
              <p className="text-sm font-medium mb-1">
                {uploadedFile?.originalName || 'Файл загружен'}
              </p>
              {uploadedFile && (
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} МБ
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-green-600">
                <Check className="w-4 h-4" />
                Загрузка завершена
              </div>
            </div>
          )}

          <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border/40">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground truncate flex-1 mr-4">
                {uploadedFile?.url || preview}
              </div>
              <Button
                onClick={handleClick}
                variant="outline"
                size="sm"
                className="rounded-full flex-shrink-0"
              >
                Change
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaUploader;
