import { useRef, useState } from 'react';
import { Upload, X, Loader2, FolderOpen } from 'lucide-react';
import { R2MediaPicker } from '@/components/admin/R2MediaPicker';
import { Button } from '@/components/ui/button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
}

export function ImageUpload({ value, onChange, onRemove, className }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { uploadImage, uploading } = useImageUpload();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadImage(file);
    if (result) onChange(result.url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('relative', className)}>
      <R2MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={onChange} kind="image" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {value ? (
        <div className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-border/40">
          <img
            src={value}
            alt="Загруженное изображение"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={handleClick}
              disabled={uploading}
              className="rounded-xl"
            >
              <Upload className="h-4 w-4 mr-2" />
              Заменить
            </Button>
            {onRemove && (
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                disabled={uploading}
                className="rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Удалить
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          disabled={uploading}
          className={cn(
            'w-full aspect-square border-2 border-dashed rounded-2xl',
            'flex flex-col items-center justify-center gap-2',
            'hover:border-primary/40 hover:bg-muted/40 transition-all',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Загрузить изображение</span>
            </>
          )}
        </button>
      )}
      <Button type="button" variant="outline" size="sm" className="mt-3 w-full"
        disabled={uploading} onClick={() => setPickerOpen(true)}>
        <FolderOpen className="mr-2 h-4 w-4" /> Выбрать из медиатеки R2
      </Button>
    </div>
  );
}
