import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { Loader2, Settings2, RefreshCcw } from 'lucide-react';

interface BatchEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: number[];
  onSuccess: () => void;
}

export function BatchEditDialog({ open, onOpenChange, selectedIds, onSuccess }: BatchEditDialogProps) {
  const queryClient = useQueryClient();
  const [categoryId, setCategoryId] = useState<string>('keep');
  const [published, setОпубликовано] = useState<'keep' | 'true' | 'false'>('keep');
  const [featured, setИзбранное] = useState<'keep' | 'true' | 'false'>('keep');
  const [regenerateSlugs, setRegenerateSlugs] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['adminGalleryCategories'],
    queryFn: () => apiClient.get<any[]>('/gallery/admin/categories'),
  });

  const mutation = useMutation({
    mutationFn: (updates: any) => apiClient.patch('/gallery/admin/items/batch', {
      ids: selectedIds,
      updates
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryItems'] });
      toast.success(`Обновлено элементов: ${selectedIds.length}`);
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Не удалось массово обновить элементы');
    }
  });

  const handleSave = () => {
    const updates: any = {};
    if (categoryId !== 'keep') updates.categoryId = categoryId === 'none' ? null : parseInt(categoryId);
    if (published !== 'keep') updates.published = published === 'true';
    if (featured !== 'keep') updates.featured = featured === 'true';
    if (regenerateSlugs) updates.regenerateSlugs = true;

    if (Object.keys(updates).length === 0) {
      toast.error('Не выбраны изменения для применения');
      return;
    }

    mutation.mutate(updates);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl border-2 border-border/40 bg-card/95 backdrop-blur-xl p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif font-bold flex items-center gap-3">
            <Settings2 className="text-primary w-6 h-6" />
            Пакетное редактирование ({selectedIds.length})
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Примените изменения сразу ко всем выбранным элементам галереи.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Category */}
          <div className="space-y-3">
            <Label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-1">Категория</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="rounded-xl border-2 bg-background/50 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep">— Оставить как есть —</SelectItem>
                <SelectItem value="none">Без категории</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name} ({cat.type === 'photo' ? 'Фото' : cat.type === 'video' ? 'Видео' : '3D'})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Published */}
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-1">Видимость</Label>
              <Select value={published} onValueChange={(v: any) => setPublished(v)}>
                <SelectTrigger className="rounded-xl border-2 bg-background/50 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Оставить как есть</SelectItem>
                  <SelectItem value="true">Опубликовано</SelectItem>
                  <SelectItem value="false">Скрыто</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Featured */}
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-1">Избранное</Label>
              <Select value={featured} onValueChange={(v: any) => setFeatured(v)}>
                <SelectTrigger className="rounded-xl border-2 bg-background/50 h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Оставить как есть</SelectItem>
                  <SelectItem value="true">Избранное</SelectItem>
                  <SelectItem value="false">Обычное</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="opacity-40" />

          {/* Regenerate Slugs */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border-2 border-primary/10">
            <div className="space-y-0.5">
              <Label htmlFor="regen-slugs" className="font-bold flex items-center gap-2 cursor-pointer">
                <RefreshCcw className="w-4 h-4 text-primary" />
                Пересоздать slug
              </Label>
              <p className="text-[10px] text-muted-foreground font-medium">Синхронизировать URL с названиями</p>
            </div>
            <Switch 
              id="regen-slugs" 
              checked={regenerateSlugs} 
              onCheckedChange={setRegenerateSlugs} 
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl h-12 flex-1 border-2">
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={mutation.isPending} className="rounded-xl h-12 flex-1 font-bold shadow-lg shadow-primary/20">
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Применить изменения'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { Separator } from '@/components/ui/separator';
