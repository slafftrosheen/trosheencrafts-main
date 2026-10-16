import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface UploadResult {
  url: string;
  filename: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File): Promise<UploadResult | null> => {
    try {
      setUploading(true);
      const result = await apiClient.uploadFile('/upload/image', file);
      toast.success('Изображение загружено в R2');
      return result as any;
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Не удалось загрузить изображение');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadImage,
    uploading,
  };
}
