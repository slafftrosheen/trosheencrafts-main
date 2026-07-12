import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { VideoUpload } from '@/components/shared/VideoUpload';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().min(1, 'Image is required'),
  videoUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

type FormData = z.infer<typeof schema>;

export function PromotionDialog({ open, onOpenChange, promotion }: { open: boolean, onOpenChange: (open: boolean) => void, promotion?: any }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { active: true, sortOrder: 0 }
  });

  useEffect(() => {
    if (promotion) {
      reset({
        title: promotion.title,
        description: promotion.description || '',
        imageUrl: promotion.imageUrl,
        videoUrl: promotion.videoUrl || '',
        linkUrl: promotion.linkUrl || '',
        linkText: promotion.linkText || '',
        active: promotion.active,
        sortOrder: promotion.sortOrder || 0
      });
    } else {
      reset({ active: true, sortOrder: 0, title: '', description: '', imageUrl: '', videoUrl: '', linkUrl: '', linkText: '' });
    }
  }, [promotion, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (promotion) {
        return apiClient.put(`/promotions/${promotion.id}`, data);
      }
      return apiClient.post('/promotions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success(promotion ? 'Promotion updated' : 'Promotion created');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save promotion');
    }
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{promotion ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {promotion ? 'Update this promotional banner.' : 'Create a new promotional banner for the home page.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" {...register('sortOrder')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Thumbnail Image</Label>
              <ImageUpload 
                value={watch('imageUrl')} 
                onChange={url => setValue('imageUrl', url)} 
                onRemove={() => setValue('imageUrl', '')} 
              />
               {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Background Video (Optional)</Label>
              <VideoUpload 
                value={watch('videoUrl')} 
                onChange={url => setValue('videoUrl', url)} 
                onRemove={() => setValue('videoUrl', '')} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="linkUrl">Link URL</Label>
              <Input id="linkUrl" {...register('linkUrl')} placeholder="/shop/category" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="linkText">Button Text</Label>
              <Input id="linkText" {...register('linkText')} placeholder="Explore" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              id="active" 
              checked={watch('active')} 
              onCheckedChange={(c) => setValue('active', c)} 
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="rounded-xl">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
