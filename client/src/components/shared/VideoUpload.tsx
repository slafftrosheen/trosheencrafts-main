import { useRef, useState } from 'react';
import { Upload, X, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VideoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  maxSizeMB?: number;
}

export function VideoUpload({ value, onChange, onRemove, className, maxSizeMB = 50 }: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`Video too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      const result = await apiClient.uploadFile('/upload/gallery', file, (p) => {
        setProgress(Math.round(p));
      });
      onChange(result.url);
      toast.success('Video uploaded successfully');
    } catch (error: any) {
      console.error('Upload failed:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {value ? (
        <div className="relative group aspect-video rounded-2xl overflow-hidden border-2 border-border/40 bg-black">
          <video
            src={value}
            className="w-full h-full object-cover opacity-80"
            muted
            loop
            playsInline
            onMouseOver={e => e.currentTarget.play()}
            onMouseOut={e => e.currentTarget.pause()}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <Play className="w-12 h-12 text-white opacity-50 group-hover:opacity-0 transition-opacity" />
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClick}
              disabled={uploading}
              className="rounded-xl"
            >
              <Upload className="h-4 w-4 mr-2" />
              Change
            </Button>
            {onRemove && (
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                disabled={uploading}
                className="rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
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
            'w-full aspect-video border-2 border-dashed rounded-2xl',
            'flex flex-col items-center justify-center gap-2',
            'hover:border-primary/40 hover:bg-muted/40 transition-all',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">{progress}%</span>
            </div>
          ) : (
            <>
              <Play className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm font-medium">Upload Video (MP4/WebM)</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
