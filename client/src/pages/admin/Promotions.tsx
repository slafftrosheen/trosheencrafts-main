import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { Spinner } from '@/components/shared/LoadingStates';
import { PromotionDialog } from '@/components/admin/PromotionDialog';
import { cn } from '@/lib/utils';
import { OptimizedImage } from '@/components/shared/OptimizedImage';

export default function AdminPromotions() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [heading, setHeading] = useState('');
  const queryClient = useQueryClient();

  const { data: config } = useQuery({
    queryKey: ['site-config-gallery'],
    queryFn: () => apiClient.get<{ value: { heading: string } }>('/site-config/promotionalGallery'),
  });

  useEffect(() => {
    if (config?.value?.heading) {
      setHeading(config.value.heading);
    } else {
      setHeading('Избранные коллекции');
    }
  }, [config]);

  const updateConfigMutation = useMutation({
    mutationFn: (newHeading: string) => apiClient.put('/site-config/admin/promotional-gallery', { heading: newHeading }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-config-gallery'] });
      toast.success('Настройки блока обновлены');
    },
    onError: () => toast.error('Не удалось обновить настройки'),
  });

  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: () => apiClient.get<any[]>('/promotions/all'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/promotions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success('Промо-блок удалён');
    },
    onError: () => toast.error('Не удалось удалить промо-блок'),
  });

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить этот промо-блок?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (promo: any) => {
    setEditingPromo(promo);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold">Промо-блоки</h1>
          <p className="text-muted-foreground">Управление промо-контентом главной страницы</p>
        </div>
        <Button onClick={() => { setEditingPromo(null); setDialogOpen(true); }} className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
          <Plus size={20} className="mr-2" /> Добавить промо
        </Button>
      </header>

      <Card className="p-6 mb-8 rounded-xl border-border bg-card shadow-sm">
        <h3 className="font-serif text-lg font-bold mb-4">Настройки промо-раздела</h3>
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="galleryHeading">Заголовок раздела</Label>
            <Input 
              id="galleryHeading" 
              value={heading} 
              onChange={(e) => setHeading(e.target.value)} 
              placeholder="Избранные коллекции"
              className="rounded-xl"
            />
          </div>
          <Button 
            onClick={() => updateConfigMutation.mutate(heading)}
            disabled={updateConfigMutation.isPending}
            className="rounded-xl"
          >
            {updateConfigMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Сохранить настройки
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-8">Заголовок</TableHead>
                <TableHead>Ссылка</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Порядок</TableHead>
                <TableHead className="text-right px-8">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    Промо-блоков пока нет. Создайте первый для главной страницы.
                  </TableCell>
                </TableRow>
              ) : (
                promotions.map((promo) => (
                  <TableRow key={promo.id} className="hover:bg-muted/30">
                    <TableCell className="px-8 font-medium">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 rounded-xl bg-muted overflow-hidden">
                           <OptimizedImage src={promo.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        {promo.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{promo.linkUrl || '-'}</TableCell>
                    <TableCell>
                      <span className={cn("px-2 py-1 rounded-full text-xs font-bold", promo.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                        {promo.active ? 'Активен' : 'Скрыт'}
                      </span>
                    </TableCell>
                    <TableCell>{promo.sortOrder}</TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => handleEdit(promo)}><Edit size={18} /></Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(promo.id)}
                        >
                          {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}

      <PromotionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        promotion={editingPromo} 
      />
    </div>
  );
}
