import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Upload, 
  X, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus,
  Images,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PendingItem {
  id: string;
  file: File;
  preview: string;
  title: string;
  slug: string;
  status: 'idle' | 'uploading' | 'success' | 'error';
  url?: string;
  progress: number;
}

export function BatchPhotoUploader({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [commonCategoryId, setCommonCategoryId] = useState<string>('none');
  const [autoName, setAutoName] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['adminGalleryCategories'],
    queryFn: () => apiClient.get<any[]>('/gallery/admin/categories'),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: PendingItem[] = files.map(file => {
      const title = file.name.split('.')[0].replace(/[-_]/g, ' ');
      return {
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
        title: title.charAt(0).toUpperCase() + title.slice(1),
        slug: title.normalize('NFKC').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, ''),
        status: 'idle',
        progress: 0
      };
    });

    setPendingItems(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeItem = (id: string) => {
    setPendingItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const uploadItem = async (id: string) => {
    const item = pendingItems.find(i => i.id === id);
    if (!item || item.status === 'success') return;

    setPendingItems(prev => prev.map(i => i.id === id ? { ...i, status: 'uploading', progress: 0 } : i));

    try {
      const result = await apiClient.uploadFile('/upload/gallery', item.file, (progress) => {
        setPendingItems(prev => prev.map(i => i.id === id ? { ...i, progress: Math.round(progress) } : i));
      });

      setPendingItems(prev => prev.map(i => i.id === id ? { 
        ...i, 
        status: 'success', 
        url: result.url,
        progress: 100 
      } : i));
    } catch (error) {
      setPendingItems(prev => prev.map(i => i.id === id ? { ...i, status: 'error', progress: 0 } : i));
      toast.error(`Не удалось загрузить ${item.file.name}`);
    }
  };

  const uploadAll = async () => {
    const idleItems = pendingItems.filter(i => i.status === 'idle' || i.status === 'error');
    for (const item of idleItems) {
      await uploadItem(item.id);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data: { items: any[], autoName: boolean }) => apiClient.post('/gallery/admin/items/batch', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryItems'] });
      toast.success(`Сохранено фотографий в галерею: ${pendingItems.length}`);
      onOpenChange(false);
      setPendingItems([]);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Не удалось сохранить элементы в галерею');
    }
  });

  const handleSaveAll = () => {
    const readyItems = pendingItems.filter(i => i.status === 'success' && i.url);
    if (readyItems.length === 0) {
      toast.error('Нет успешно загруженных фотографий для сохранения');
      return;
    }

    const items = readyItems.map(item => ({
      title: item.title,
      slug: `${item.slug}-${Math.random().toString(36).substring(7)}`, // Ensure uniqueness
      type: 'photo',
      mediaUrl: item.url,
      categoryId: commonCategoryId === 'none' ? null : parseInt(commonCategoryId),
      published: true,
      sortOrder: 0,
      tags: []
    }));

    saveMutation.mutate({ items, autoName });
  };

  const allUploaded = pendingItems.length > 0 && pendingItems.every(i => i.status === 'success');
  const someUploading = pendingItems.some(i => i.status === 'uploading');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl rounded-[2.5rem] max-h-[90vh] overflow-hidden flex flex-col p-0 border-2 border-border/40 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-serif font-bold flex items-center gap-3">
                <Images className="text-primary w-8 h-8" />
                Пакетная загрузка фото
              </DialogTitle>
              <DialogDescription className="text-muted-foreground mt-1">
                Загрузите несколько фотографий сразу и распределите их по галерее.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10">
                <Switch id="auto-name" checked={autoName} onCheckedChange={setAutoName} />
                <Label htmlFor="auto-name" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Автоназвание</Label>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Общая категория</Label>
                <Select value={commonCategoryId} onValueChange={setCommonCategoryId}>
                  <SelectTrigger className="w-48 h-10 rounded-xl bg-background/50 border-2">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без категории</SelectItem>
                    {categories.filter(c => c.type === 'photo').map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={someUploading}
                variant="outline"
                className="rounded-xl h-10 border-2 border-primary/20 hover:border-primary/40"
              >
                <Plus className="w-4 h-4 mr-2" /> Добавить ещё
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-8 pt-0">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />

          {pendingItems.length === 0 ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="h-64 border-2 border-dashed border-border/60 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/40 transition-all cursor-pointer group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">Перетащите фотографии сюда или нажмите для выбора</p>
                <p className="text-sm text-muted-foreground">JPEG, PNG и WebP до 10 МБ на файл</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {pendingItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-background/50 rounded-2xl border-2 border-border/40 overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] relative">
                      <img src={item.preview} className="w-full h-full object-cover" alt="Предпросмотр" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="rounded-full w-10 h-10" 
                          onClick={() => removeItem(item.id)}
                          disabled={item.status === 'uploading'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                          <p className="text-xs font-black uppercase tracking-widest">{item.progress}% Загружается</p>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-3 overflow-hidden">
                            <motion.div 
                              className="bg-primary h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {item.status === 'success' && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      )}

                      {item.status === 'error' && (
                        <div className="absolute top-3 right-3 bg-destructive text-white rounded-full p-1 shadow-lg">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <Input 
                        value={item.title} 
                        onChange={(e) => setPendingItems(prev => prev.map(i => i.id === item.id ? { ...i, title: e.target.value } : i))}
                        className="h-9 rounded-lg border-2 text-sm font-bold"
                        placeholder="Название фотографии"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 bg-muted/30 border-t border-border/40">
          <Button 
            variant="outline" 
            onClick={() => {
              pendingItems.forEach(i => URL.revokeObjectURL(i.preview));
              setPendingItems([]);
              onOpenChange(false);
            }}
            className="rounded-xl h-12 px-6"
          >
            Отмена
          </Button>
          
          <div className="flex gap-3">
            {pendingItems.some(i => i.status === 'idle' || i.status === 'error') && (
              <Button 
                onClick={uploadAll} 
                disabled={someUploading}
                className="rounded-xl h-12 px-8 font-bold bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary/20"
              >
                {someUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Загрузить файлы
              </Button>
            )}
            
            <Button 
              onClick={handleSaveAll}
              disabled={!allUploaded || saveMutation.isPending}
              className="rounded-xl h-12 px-10 font-bold shadow-xl shadow-primary/20"
            >
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Сохранить в галерею ({pendingItems.filter(i => i.status === 'success').length})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
