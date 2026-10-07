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

import { adminT as t } from "@/lib/adminI18n";

const blogPostSchema = z.object({
  title: z.string().min(1, 'Укажите заголовок'),
  slug: z.string().min(1, 'Укажите slug'),
  content: z.string().min(1, 'Введите текст'),
  excerpt: z.string().min(1, 'Введите краткое описание'),
  image: z.string().optional(),
  author: z.string().min(1, 'Укажите автора'),
  published: z.boolean().default(false),
});

type BlogPostFormData = z.infer<typeof blogPostSchema>;

export function BlogPostDialog({ open, onOpenChange, post }: { open: boolean, onOpenChange: (open: boolean) => void, post?: any }) {
  const queryClient = useQueryClient();
  const isEditing = !!post;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: { published: false }
  });

  const title = watch('title');

  useEffect(() => {
    if (!isEditing && title) {
      const slug = title
        .normalize("NFKC")
        .toLowerCase()
        .trim()
        .replace(/[^\p{L}\p{N}]+/gu, "-")
        .replace(/^-+|-+$/g, "");
      setValue('slug', slug);
    }
  }, [title, isEditing, setValue]);

  useEffect(() => {
    if (post) reset({ ...post, published: !!post.publishedAt });
    else reset({ title: '', slug: '', content: '', excerpt: '', image: '', author: 'Администратор', published: false });
  }, [post, reset]);

  const mutation = useMutation({
    mutationFn: (data: BlogPostFormData) => {
      const payload = { ...data, publishedAt: data.published ? (post?.publishedAt || new Date().toISOString()) : null };
      return isEditing ? apiClient.put(`/blog/${post.id}`, payload) : apiClient.post('/blog', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success(isEditing ? t("admin.common.update") : t("admin.common.create"));
      onOpenChange(false);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl rounded-[2.5rem] p-10 border-2 border-border/40 overflow-y-auto max-h-[90vh] bg-card">
        <DialogHeader>
          <DialogTitle className="text-3xl font-serif font-bold">{isEditing ? t("admin.common.update") : t("admin.blog.write")}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? 'Обновите содержимое записи журнала.' : 'Создайте новую запись для журнала мастерской.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-8">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-6">
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">Заголовок</Label>
                <Input {...register('title')} className="rounded-xl border-2 h-12 text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">Краткое описание</Label>
                <Textarea {...register('excerpt')} className="rounded-xl border-2 min-h-[80px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">Изображение</Label>
              <ImageUpload value={watch('image')} onChange={url => setValue('image', url)} onRemove={() => setValue('image', '')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">Текст записи</Label>
            <Textarea {...register('content')} className="rounded-2xl border-2 font-mono text-sm min-h-[300px] p-6" />
          </div>

          <div className="flex items-center justify-between p-6 bg-muted/40 rounded-3xl border-2 border-border/40">
            <div className="flex gap-12">
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">Slug (URL)</Label>
                <Input {...register('slug')} className="bg-transparent border-0 border-b-2 rounded-none h-8 w-48 font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold uppercase tracking-widest text-[10px] ml-1">Автор</Label>
                <Input {...register('author')} className="bg-transparent border-0 border-b-2 rounded-none h-8 w-32 font-bold text-xs" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Label className="font-bold">Опубликовано</Label>
              <Switch checked={watch('published')} onCheckedChange={v => setValue('published', v)} />
            </div>
          </div>

          <Button type="submit" className="w-full h-16 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="animate-spin" /> : (isEditing ? t("admin.common.save") : t("admin.blog.write"))}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
