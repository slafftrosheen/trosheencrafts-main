import { useState } from 'react';
import { FileUploader } from './FileUploader';
import { Label } from '@/components/ui/label';

interface DualFileUploaderProps {
  type: '3d' | 'photo' | 'video';
  onMediaUpload: (url: string) => void;
  onThumbnailUpload: (url: string) => void;
  currentMediaUrl?: string;
  currentThumbnailUrl?: string;
}

export function DualFileUploader({
  type,
  onMediaUpload,
  onThumbnailUpload,
  currentMediaUrl,
  currentThumbnailUrl,
}: DualFileUploaderProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label className="mb-2 block">
          {type === '3d' ? 'Файл 3D-модели' : type === 'video' ? 'Видео-файл' : 'Основное изображение'}
        </Label>
        <FileUploader
          type={type === '3d' ? '3d' : type === 'video' ? 'video' : 'photo'}
          accept={type === '3d' ? '.glb,.gltf' : type === 'video' ? 'video/mp4,video/webm' : 'image/*'}
          onUploadComplete={onMediaUpload}
          currentUrl={currentMediaUrl}
          maxSizeMB={type === 'video' ? 100 : 100}
        />
      </div>

      <div>
        <Label className="mb-2 block">
          Превью <span className="text-muted-foreground">(необязательно)</span>
        </Label>
        <FileUploader
          type="photo"
          accept="image/*"
          onUploadComplete={onThumbnailUpload}
          currentUrl={currentThumbnailUrl}
          maxSizeMB={10}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Рекомендуется: квадратное изображение не менее 800×800 px
        </p>
      </div>
    </div>
  );
}
