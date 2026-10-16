import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "lv", label: "Latviešu" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
] as const;
type Language = (typeof LANGUAGES)[number]["code"];

const localizedFields = z.record(z.string()).default({});
const schema = z.object({
  title: z.string().trim().min(1, "Укажите заголовок"),
  slug: z.string().trim().min(1, "Укажите URL-идентификатор"),
  content: z.string().min(1, "Введите текст"),
  excerpt: z.string().min(1, "Введите краткое описание"),
  titleTranslations: localizedFields,
  excerptTranslations: localizedFields,
  contentTranslations: localizedFields,
  image: z.string().optional(),
  author: z.string().min(1, "Укажите автора"),
  published: z.boolean().default(false),
});
type BlogForm = z.infer<typeof schema>;
type ExistingPost = Partial<BlogForm> & { id: number; publishedAt?: string | null };
const blank = (): BlogForm => ({
  title: "", slug: "", excerpt: "", content: "", image: "",
  author: "Администратор", published: false,
  titleTranslations: {}, excerptTranslations: {}, contentTranslations: {},
});

export function BlogPostDialog({
  open, onOpenChange, post,
}: { open: boolean; onOpenChange: (open: boolean) => void; post?: ExistingPost | null }) {
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Language>("lv");
  const [slugEdited, setSlugEdited] = useState(false);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } =
    useForm<BlogForm>({ resolver: zodResolver(schema), defaultValues: blank() });

  useEffect(() => {
    if (!open) return;
    reset(post ? {
      ...blank(), ...post,
      titleTranslations: post.titleTranslations ?? {},
      excerptTranslations: post.excerptTranslations ?? {},
      contentTranslations: post.contentTranslations ?? {},
      published: Boolean(post.publishedAt),
    } : blank());
    setLocale("lv");
    setSlugEdited(Boolean(post));
  }, [open, post, reset]);

  const title = watch("title");
  useEffect(() => {
    if (post || slugEdited) return;
    setValue("slug", title.normalize("NFKC").toLowerCase().trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, ""));
  }, [title, post, setValue, slugEdited]);

  const save = useMutation({
    mutationFn: async (form: BlogForm) => {
      const { published, ...data } = form;
      const payload = {
        ...data,
        publishedAt: published ? post?.publishedAt || new Date().toISOString() : null,
      };
      return post ? apiClient.put(`/blog/${post.id}`, payload) : apiClient.post("/blog", payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["blog-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["blogPost"] }),
      ]);
      toast.success("Запись сохранена");
      onOpenChange(false);
    },
    onError: (error: Error) => toast.error(error.message || "Не удалось сохранить запись"),
  });

  const changeDialog = (next: boolean) => {
    if (!next && isDirty && !save.isSuccess && !window.confirm("Закрыть без сохранения?")) return;
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={changeDialog}>
      <DialogContent className="max-h-[92dvh] max-w-5xl overflow-y-auto rounded-3xl p-5 sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl">{post ? "Редактирование записи" : "Новая запись журнала"}</DialogTitle>
          <DialogDescription>
            Сначала заполните основную версию, затем при необходимости переводы.
            Пустой перевод автоматически заменяется основным текстом. Изображение загружается в R2.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(data => save.mutate(data))} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <div className="space-y-4">
              <div>
                <Label htmlFor="journal-title">Основной заголовок *</Label>
                <Input id="journal-title" {...register("title")} className="mt-2" aria-invalid={Boolean(errors.title)} />
                {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="journal-excerpt">Краткое описание *</Label>
                <Textarea id="journal-excerpt" {...register("excerpt")} className="mt-2 min-h-24" aria-invalid={Boolean(errors.excerpt)} />
                {errors.excerpt && <p className="mt-1 text-xs text-destructive">{errors.excerpt.message}</p>}
              </div>
            </div>
            <div>
              <Label>Обложка статьи</Label>
              <div className="mt-2">
                <ImageUpload value={watch("image")} onChange={url => setValue("image", url, { shouldDirty: true })}
                  onRemove={() => setValue("image", "", { shouldDirty: true })} />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="journal-content">Основной текст (Markdown или HTML) *</Label>
            <Textarea id="journal-content" {...register("content")} className="mt-2 min-h-56 font-mono text-sm"
              aria-invalid={Boolean(errors.content)} />
            {errors.content && <p className="mt-1 text-xs text-destructive">{errors.content.message}</p>}
          </div>
          <section className="space-y-4 rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
            <h3 className="font-serif text-xl font-semibold">Переводы записи</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Язык перевода">
              {LANGUAGES.map(({ code, label }) => (
                <Button key={code} type="button" variant={locale === code ? "default" : "outline"}
                  size="sm" onClick={() => setLocale(code)} aria-pressed={locale === code}>
                  {label}
                </Button>
              ))}
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Поля необязательные. Пустая версия отображает основной заголовок, описание или текст.
            </p>
            <div>
              <Label htmlFor="journal-translated-title">Заголовок · {locale.toUpperCase()}</Label>
              <Input id="journal-translated-title" className="mt-2"
                {...register(`titleTranslations.${locale}`)} placeholder={title || "Перевод заголовка"} />
            </div>
            <div>
              <Label htmlFor="journal-translated-excerpt">Описание · {locale.toUpperCase()}</Label>
              <Textarea id="journal-translated-excerpt" className="mt-2 min-h-20"
                {...register(`excerptTranslations.${locale}`)} />
            </div>
            <div>
              <Label htmlFor="journal-translated-content">Статья · {locale.toUpperCase()}</Label>
              <Textarea id="journal-translated-content" className="mt-2 min-h-36 font-mono text-sm"
                {...register(`contentTranslations.${locale}`)} />
            </div>
          </section>
          <div className="grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="journal-slug">URL-идентификатор *</Label>
              <Input id="journal-slug" className="mt-2 font-mono text-xs" {...register("slug", {
                onChange: () => setSlugEdited(true),
              })} aria-invalid={Boolean(errors.slug)} />
              {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
            </div>
            <div>
              <Label htmlFor="journal-author">Автор *</Label>
              <Input id="journal-author" className="mt-2" {...register("author")} />
              {errors.author && <p className="mt-1 text-xs text-destructive">{errors.author.message}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Switch id="journal-published" checked={watch("published")}
                onCheckedChange={v => setValue("published", v, { shouldDirty: true })} />
              <Label htmlFor="journal-published">Опубликовать статью</Label>
            </div>
            <Button type="submit" disabled={save.isPending} className="min-h-11 min-w-40">
              {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {post ? "Сохранить изменения" : "Создать запись"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
