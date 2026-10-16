import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LocalizedFields } from "@/components/admin/LocalizedFields";
import { ArrowUp, Loader2, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().trim().min(1, "Укажите название"),
  slug: z.string().optional(),
  description: z.string().trim().min(1, "Введите описание"),
  price: z.coerce.number().positive("Цена должна быть больше нуля"),
  category: z.string().trim().min(1, "Укажите категорию"),
  images: z.array(z.string()).default([]),
  nameTranslations: z.record(z.string()).default({}),
  descriptionTranslations: z.record(z.string()).default({}),
  stock: z.coerce.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});
type FormData = z.infer<typeof schema>;
const defaults = (): FormData => ({
  name: "", slug: "", description: "", price: 0, category: "", images: [],
  nameTranslations: {}, descriptionTranslations: {}, stock: 1,
  inStock: true, featured: false, published: true,
});

export function ProductDialog({
  open, onOpenChange, product,
}: { open: boolean; onOpenChange: (open: boolean) => void; product?: any }) {
  const query = useQueryClient();
  const isEditing = Boolean(product);
  const { register, handleSubmit, reset, setValue, watch,
    formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema), defaultValues: defaults(),
  });
  useEffect(() => {
    if (!open) return;
    reset(product ? {
      ...defaults(),
      name: product.name || "", slug: product.slug || "",
      description: product.description || "", price: Number(product.price) || 0,
      category: product.category || "",
      images: (product.images?.length ? product.images : product.image ? [product.image] : []),
      nameTranslations: product.nameTranslations || {},
      descriptionTranslations: product.descriptionTranslations || {},
      stock: Number(product.stock ?? 0),
      inStock: Number(product.stock ?? 0) > 0,
      featured: product.featured === true,
      published: product.published !== false,
    } : defaults());
  }, [open, product, reset]);

  const images = watch("images") || [];
  const setImages = (items: string[]) => setValue("images", [...new Set(items.filter(Boolean))], {
    shouldDirty: true, shouldValidate: true,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const { inStock, ...fields } = data;
      const payload = {
        ...fields,
        ...(fields.slug?.trim() ? { slug: fields.slug.trim() } : {}),
        images: fields.images.filter(Boolean),
        stock: inStock ? fields.stock : 0,
        inStock,
      };
      if (!payload.slug) delete (payload as { slug?: string }).slug;
      return product
        ? apiClient.put("/products/" + product.id, payload)
        : apiClient.post("/products", payload);
    },
    onSuccess: async () => {
      await Promise.all([
        query.invalidateQueries({ queryKey: ["products"] }),
        query.invalidateQueries({ queryKey: ["inventory-products"] }),
      ]);
      toast.success(isEditing ? "Изменения товара сохранены" : "Товар создан");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message || "Не удалось сохранить товар"),
  });

  const close = (next: boolean) => {
    if (!next && isDirty && !mutation.isSuccess &&
      !window.confirm("Есть несохранённые изменения. Закрыть редактор?")) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[92dvh] max-w-4xl overflow-y-auto rounded-3xl p-5 sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">{isEditing ? "Редактирование товара" : "Новый товар"}</DialogTitle>
          <DialogDescription>Изменения появляются на сайте после сохранения. Изображения хранятся в R2.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="product-name">Название *</Label>
                <Input id="product-name" className="mt-2" {...register("name")} aria-invalid={Boolean(errors.name)} />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="product-price">Цена (€) *</Label>
                <Input id="product-price" className="mt-2" type="number" min="0.01" step="0.01"
                  {...register("price")} aria-invalid={Boolean(errors.price)} />
                {errors.price && <p className="mt-1 text-xs text-destructive">{errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="product-category">Категория *</Label>
                <Input id="product-category" className="mt-2" {...register("category")} />
                {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div>
                <Label htmlFor="product-slug">URL-идентификатор</Label>
                <Input id="product-slug" className="mt-2 font-mono text-xs" {...register("slug")}
                  placeholder="Оставьте пустым для автоматического создания" />
                <p className="mt-1 text-xs text-muted-foreground">
                  При редактировании адрес товара сохраняется. Не меняйте его без необходимости.
                </p>
              </div>
            </div>
            <div>
              <Label>Главная фотография</Label>
              <div className="mt-2">
                <ImageUpload value={images[0] || ""}
                  onChange={url => setImages([url, ...images.filter(existing => existing !== url)])}
                  onRemove={() => setImages(images.slice(1))} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Загрузка или выбор из R2. Удаление из карточки не удаляет файл из бакета.
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-muted/20 p-4">
            <h3 className="font-serif text-xl">Галерея фотографий товара</h3>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {images.map((url, index) => (
                  <div className="rounded-xl border border-border bg-card p-2" key={url}>
                    <img src={url} alt={"Фото " + (index + 1)} className="aspect-square w-full rounded-lg object-cover" />
                    <div className="mt-2 flex justify-between gap-1">
                      <Button type="button" variant="outline" size="sm" disabled={index === 0}
                        onClick={() => setImages([url, ...images.filter(existing => existing !== url)])}
                        aria-label="Сделать главным" title="Сделать главным"><ArrowUp className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setImages(images.filter(existing => existing !== url))}
                        aria-label="Убрать из товара" title="Убрать из товара"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <ImageUpload value=""
              onChange={url => setImages([...images, url])} />
            <p className="text-xs text-muted-foreground">Добавьте несколько фотографий. Первая показывается в каталоге.</p>
          </div>

          <div>
            <Label htmlFor="product-description">Основное описание *</Label>
            <Textarea id="product-description" className="mt-2 min-h-28" {...register("description")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <LocalizedFields names={watch("nameTranslations") || {}} descriptions={watch("descriptionTranslations") || {}}
            onNameChange={value => setValue("nameTranslations", value as Record<string, string>, { shouldDirty: true })}
            onDescriptionChange={value => setValue("descriptionTranslations", value as Record<string, string>, { shouldDirty: true })} />

          <div className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="product-stock">Остаток на складе</Label>
              <Input id="product-stock" type="number" min="0" step="1" className="mt-2"
                {...register("stock")} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch id="product-instock" checked={watch("inStock")}
                  onCheckedChange={value => setValue("inStock", value, { shouldDirty: true })} />
                <Label htmlFor="product-instock">Доступен к заказу</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="product-published" checked={watch("published")}
                  onCheckedChange={value => setValue("published", value, { shouldDirty: true })} />
                <Label htmlFor="product-published">Опубликован на сайте</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="product-featured" checked={watch("featured")}
                  onCheckedChange={value => setValue("featured", value, { shouldDirty: true })} />
                <Label htmlFor="product-featured">Избранный товар / первая полоса</Label>
              </div>
            </div>
          </div>
          <Button type="submit" className="min-h-12 w-full" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Сохранить товар" : "Создать товар"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
