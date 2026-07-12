import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

import { useLanguage } from '@/lib/LanguageContext';

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().positive(),
  category: z.string().min(1, 'Category is required'),
  image: z.string().optional(),
  inStock: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductDialog({ open, onOpenChange, product }: { open: boolean, onOpenChange: (open: boolean) => void, product?: any }) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const isEditing = !!product;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { inStock: true }
  });

  useEffect(() => {
    if (product) reset({ ...product, price: product.price / 100 });
    else reset({ name: '', description: '', price: 0, category: '', image: '', inStock: true });
  }, [product, reset]);

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = { ...data, price: Math.round(data.price * 100) };
      return isEditing ? apiClient.put(`/products/${product.id}`, payload) : apiClient.post('/products', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(isEditing ? t("admin.artefact_updated") : t("admin.artefact_added"));
      onOpenChange(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[2.5rem] p-10 border-2 border-border/40 bg-card">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif font-bold">{isEditing ? t("admin.edit_artefact") : t("admin.add_artefact")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? 'Update the details of this masterpiece.' : 'Fill in the information to create a new artefact.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("admin.name")}</Label>
                <Input {...register('name')} className="rounded-xl border-2 focus:border-primary/40 h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("admin.price")} (€)</Label>
                <Input type="number" step="0.01" {...register('price')} className="rounded-xl border-2 focus:border-primary/40 h-12" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("admin.category")}</Label>
                <Input {...register('category')} className="rounded-xl border-2 focus:border-primary/40 h-12" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("admin.image")}</Label>
              <ImageUpload value={watch('image')} onChange={url => setValue('image', url)} onRemove={() => setValue('image', '')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">{t("admin.description")}</Label>
            <Textarea {...register('description')} className="rounded-2xl border-2 focus:border-primary/40 min-h-[120px] p-4" />
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border-2 border-border/40">
            <Label className="font-bold">{t("admin.stock")}</Label>
            <Switch checked={watch('inStock')} onCheckedChange={v => setValue('inStock', v)} />
          </div>
          <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="animate-spin" /> : (isEditing ? t("admin.update_artefact") : t("admin.create_artefact"))}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}