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
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const LANGUAGES = [
  { code: "lv", label: "Latviešu" }, { code: "en", label: "English" },
  { code: "ru", label: "Русский" }, { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
] as const;
type Lang = (typeof LANGUAGES)[number]["code"];

const schema = z.object({
  title: z.string().min(1, 'Укажите заголовок'),
  description: z.string().optional(),
  titleTranslations: z.record(z.string()).default({}),
  descriptionTranslations: z.record(z.string()).default({}),
  linkTextTranslations: z.record(z.string()).default({}),
  imageUrl: z.string().min(1, 'Добавьте изображение'),
  videoUrl: z.string().optional(),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().default(0),
});

type FormData = z.infer<typeof schema>;

export function PromotionDialog({ open, onOpenChange, promotion }: { open: boolean, onOpenChange: (open: boolean) => void, promotion?: any }) {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<Lang>("lv");
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { active: true, sortOrder: 0 }
  });

  useEffect(() => {
    if (!open) return;
    setLanguage("lv");
    if (promotion) {
      reset({
        title: promotion.title,
        description: promotion.description || '',
        titleTranslations: promotion.titleTranslations || {},
        descriptionTranslations: promotion.descriptionTranslations || {},
        linkTextTranslations: promotion.linkTextTranslations || {},
        imageUrl: promotion.imageUrl,
        videoUrl: promotion.videoUrl || '',
        linkUrl: promotion.linkUrl || '',
        linkText: promotion.linkText || '',
        active: promotion.active,
        sortOrder: promotion.sortOrder || 0
      });
    } else {
      reset({
        active: true, sortOrder: 0, title: '', description: '',
        titleTranslations: {}, descriptionTranslations: {}, linkTextTranslations: {},
        imageUrl: '', videoUrl: '', linkUrl: '', linkText: '',
      });
    }
  }, [open, promotion, reset]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      if (promotion) {
        return apiClient.put(`/promotions/${promotion.id}`, data);
      }
      return apiClient.post('/promotions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
      toast.success(promotion ? 'Промо-блок обновлён' : 'Промо-блок создан');
      onOpenChange(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Не удалось сохранить промо-блок');
    }
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{promotion ? 'Редактировать промо-блок' : 'Добавить промо-блок'}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {promotion ? 'Измените параметры промо-блока.' : 'Создайте новый промо-блок для главной страницы.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Заголовок</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-destructive text-sm">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Порядок</Label>
              <Input id="sortOrder" type="number" {...register('sortOrder')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <section className="space-y-4 rounded-2xl border border-border bg-muted/30 p-4">
            <h3 className="font-serif text-xl">Переводы промо-карточки</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Язык перевода">
              {LANGUAGES.map(({ code, label }) => (
                <Button key={code} type="button" size="sm"
                  variant={language === code ? "default" : "outline"}
                  aria-pressed={language === code} onClick={() => setLanguage(code)}>{label}</Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Пустые поля используют основной текст карточки.</p>
            <div>
              <Label htmlFor="promotion-translated-title">Заголовок · {language.toUpperCase()}</Label>
              <Input id="promotion-translated-title" className="mt-2"
                {...register(`titleTranslations.${language}`)} />
            </div>
            <div>
              <Label htmlFor="promotion-translated-description">Описание · {language.toUpperCase()}</Label>
              <Textarea id="promotion-translated-description" className="mt-2"
                {...register(`descriptionTranslations.${language}`)} />
            </div>
            <div>
              <Label htmlFor="promotion-translated-button">Текст кнопки · {language.toUpperCase()}</Label>
              <Input id="promotion-translated-button" className="mt-2"
                {...register(`linkTextTranslations.${language}`)} />
            </div>
          </section>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Изображение-превью</Label>
              <p className="text-xs leading-5 text-muted-foreground">
                Для новых фотографий рекомендуем изображения без встроенных надписей.
                Фирменные баннеры из набора v4.3 отображаются целиком, без обрезки.
              </p>
              <ImageUpload 
                value={watch('imageUrl')} 
                onChange={url => setValue('imageUrl', url, { shouldDirty: true })} 
                onRemove={() => setValue('imageUrl', '', { shouldDirty: true })} 
              />
               {errors.imageUrl && <p className="text-destructive text-sm">{errors.imageUrl.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoUrl">Фоновое видео (необязательно)</Label>
              <VideoUpload 
                value={watch('videoUrl')} 
                onChange={url => setValue('videoUrl', url, { shouldDirty: true })} 
                onRemove={() => setValue('videoUrl', '', { shouldDirty: true })} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="linkUrl">URL ссылки</Label>
              <Input id="linkUrl" {...register('linkUrl')} placeholder="/shop/category" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="linkText">Текст кнопки</Label>
              <Input id="linkText" {...register('linkText')} placeholder="Подробнее" />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              id="active" 
              checked={watch('active')} 
              onCheckedChange={(c) => setValue('active', c, { shouldDirty: true })} 
            />
            <Label htmlFor="active">Активен</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Отмена</Button>
            <Button type="submit" disabled={mutation.isPending} className="rounded-xl">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
