import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { CloudUpload, ExternalLink, Image as ImageIcon, Loader2, RefreshCw, RotateCcw, Save, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import { DEFAULT_HOMEPAGE_IMAGES } from "@/lib/homepageImages";
import { HOMEPAGE_IMAGES_QUERY_KEY } from "@/hooks/useHomepageImages";
import { HOMEPAGE_IMAGE_SLOTS, type HomepageImageSlot, type HomepageImages } from "../../../../shared/homepageMedia";

type BusyAction = "upload" | "save" | "reset";

interface PromotionMedia {
  id: number;
  imageUrl: string;
}

function isLocalUploadUrl(value: string): boolean {
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin && url.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
}

interface SlotCardProps {
  slot: (typeof HOMEPAGE_IMAGE_SLOTS)[number];
  assigned: string | null;
  busy: BusyAction | undefined;
  disabled: boolean;
  onSave: (slot: HomepageImageSlot, url: string | null) => Promise<void>;
  onUpload: (slot: HomepageImageSlot, file: File) => Promise<string | undefined>;
}

function SlotCard({ slot, assigned, busy, disabled, onSave, onUpload }: SlotCardProps) {
  const [draft, setDraft] = useState(assigned || "");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setDraft(assigned || ""), [assigned]);
  const fallback = DEFAULT_HOMEPAGE_IMAGES[slot.key];
  const preview = draft || fallback;
  const dirty = draft.trim() !== (assigned || "");
  const isBusy = Boolean(busy) || disabled;
  const shape = slot.aspect === "wide" ? "aspect-[16/8]" : slot.aspect === "square" ? "aspect-square" : "aspect-[4/3]";

  const handleFile = async (file?: File) => {
    if (!file || isBusy) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 12 * 1024 * 1024) {
      toast.error("Допустимы JPG, PNG и WebP до 12 МБ.");
      return;
    }
    const url = await onUpload(slot.key, file);
    if (url) setDraft(url);
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-xl font-semibold">{slot.title}</h2>
          <span className={"rounded-full px-3 py-1 text-xs font-semibold " +
            (assigned ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground")}>
            {assigned ? "Cloudflare R2" : "Стандартное фото"}
          </span>
        </div>
        <p className="mb-4 min-h-10 text-sm leading-relaxed text-muted-foreground">{slot.description}</p>
        <div className="relative overflow-hidden rounded-2xl bg-muted"
          onDragOver={(event) => { event.preventDefault(); if (!isBusy) setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void handleFile(event.dataTransfer.files?.[0]);
          }}>
          <img src={preview} alt={"Предпросмотр: " + slot.title}
            className={"w-full object-cover " + shape} loading="lazy" />
          {dragging && <div className="absolute inset-0 flex items-center justify-center bg-background/80 text-sm font-semibold">Отпустите для загрузки в R2</div>}
          {busy && <div className="absolute inset-0 flex items-center justify-center bg-background/70" role="status">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <span className="sr-only">{busy === "upload" ? "Загрузка в R2" : "Сохранение"}</span>
          </div>}
        </div>

        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only"
          aria-label={"Выбрать изображение для " + slot.title}
          disabled={isBusy} onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }} />

        <div className="mt-4 space-y-2">
          <label htmlFor={"slot-url-" + slot.key} className="block text-xs font-semibold text-muted-foreground">
            URL изображения в R2 (или загрузите с компьютера)
          </label>
          <Input id={"slot-url-" + slot.key} type="url" value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={isBusy} placeholder="https://media.example.com/homepage/photo.webp"
            className="h-11 text-sm" />
          <p className="text-xs text-muted-foreground">Пустое поле означает стандартное фото. Можно указать ссылку на изображение из галереи в том же R2-бакете.</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-11" disabled={isBusy}
            onClick={() => inputRef.current?.click()}>
            <UploadCloud className="mr-2 h-4 w-4" /> Загрузить / заменить
          </Button>
          <Button type="button" className="min-h-11" disabled={isBusy || !dirty}
            onClick={() => void onSave(slot.key, draft.trim() || null)}>
            <Save className="mr-2 h-4 w-4" /> Сохранить
          </Button>
          <Button type="button" variant="ghost" className="min-h-11" disabled={isBusy || (!assigned && !dirty)}
            onClick={() => {
              if (!assigned) setDraft("");
              else void onSave(slot.key, null);
            }}>
            <RotateCcw className="mr-2 h-4 w-4" /> По умолчанию
          </Button>
        </div>
        {dirty && <p className="mt-3 text-xs font-semibold text-amber-600">Есть несохранённые изменения.</p>}
      </div>
    </article>
  );
}

export default function HomepageMedia() {
  const queryClient = useQueryClient();
  const { data: images = {}, isLoading, isError, refetch } = useQuery<HomepageImages>({
    queryKey: HOMEPAGE_IMAGES_QUERY_KEY,
    queryFn: () => apiClient.get<HomepageImages>("/site-config/homepage-images"),
    retry: 1,
  });
  const [busySlots, setBusySlots] = useState<Partial<Record<HomepageImageSlot, BusyAction>>>({});
  const [migrating, setMigrating] = useState(false);
  const [migrationStep, setMigrationStep] = useState(0);
  const [migratingPromotions, setMigratingPromotions] = useState(false);
  const { data: promotions = [] } = useQuery<PromotionMedia[]>({
    queryKey: ["homepage-promotion-assets"],
    queryFn: () => apiClient.get<PromotionMedia[]>("/promotions/all"),
    retry: 1,
  });
  const localPromotions = promotions.filter((promotion) => isLocalUploadUrl(promotion.imageUrl));

  const save = async (slot: HomepageImageSlot, url: string | null) => {
    setBusySlots((current) => ({ ...current, [slot]: "save" }));
    try {
      await apiClient.put("/site-config/admin/homepage-images", { slot, url });
      queryClient.setQueryData<HomepageImages>(HOMEPAGE_IMAGES_QUERY_KEY, (current) => ({ ...current, [slot]: url }));
      toast.success("Изображение опубликовано: " + HOMEPAGE_IMAGE_SLOTS.find((item) => item.key === slot)?.title);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось сохранить изображение.");
    } finally {
      setBusySlots((current) => ({ ...current, [slot]: undefined }));
    }
  };

  const upload = async (slot: HomepageImageSlot, file: File): Promise<string | undefined> => {
    setBusySlots((current) => ({ ...current, [slot]: "upload" }));
    try {
      const result = await apiClient.uploadFile("/upload/homepage-image", file);
      toast.success("Фото в R2 загружено. Нажмите «Сохранить», чтобы опубликовать.");
      return result.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки в Cloudflare R2.");
    } finally {
      setBusySlots((current) => ({ ...current, [slot]: undefined }));
    }
  };

  const migrateBundled = async () => {
    if (migrating || Object.values(busySlots).some(Boolean)) return;
    const missing = HOMEPAGE_IMAGE_SLOTS.filter(({ key }) => !images[key]);
    if (!missing.length) {
      toast.info("Все изображения уже используют R2.");
      return;
    }

    setMigrating(true);
    setMigrationStep(0);
    let finished = 0;
    try {
      for (const slot of missing) {
        const response = await fetch(DEFAULT_HOMEPAGE_IMAGES[slot.key]);
        if (!response.ok) throw new Error("Не удалось прочитать стандартное фото: " + slot.title);
        const blob = await response.blob();
        const file = new File([blob], slot.key + ".webp", { type: blob.type || "image/webp" });
        if (file.size > 12 * 1024 * 1024) throw new Error("Слишком большой файл: " + slot.title);
        const result = await apiClient.uploadFile("/upload/homepage-image", file);
        await apiClient.put("/site-config/admin/homepage-images", { slot: slot.key, url: result.url });
        queryClient.setQueryData<HomepageImages>(HOMEPAGE_IMAGES_QUERY_KEY,
          (current) => ({ ...current, [slot.key]: result.url }));
        finished += 1;
        setMigrationStep(finished);
      }
      toast.success("Перенесено в Cloudflare R2: " + finished + " изображений.");
    } catch (error) {
      toast.error("Миграция остановлена после " + finished + " изображений: " +
        (error instanceof Error ? error.message : "Ошибка сети"));
    } finally {
      setMigrating(false);
      await queryClient.invalidateQueries({ queryKey: HOMEPAGE_IMAGES_QUERY_KEY });
    }
  };

  const migratePromotions = async () => {
    if (migrating || migratingPromotions || Object.values(busySlots).some(Boolean)) return;
    setMigratingPromotions(true);
    let finished = 0;
    try {
      for (const promotion of localPromotions) {
        const response = await fetch(promotion.imageUrl, { credentials: "same-origin" });
        if (!response.ok) throw new Error("Нет доступа к промо-фото #" + promotion.id);
        const blob = await response.blob();
        const file = new File([blob], "promotion-" + promotion.id + ".webp",
          { type: blob.type || "image/webp" });
        const result = await apiClient.uploadFile("/upload/image", file);
        await apiClient.put("/promotions/" + promotion.id, { imageUrl: result.url });
        finished++;
      }
      toast.success("Перенесено промо-фотографий: " + finished);
    } catch (error) {
      toast.error("Перенос промо остановлен после " + finished + " фото: " +
        (error instanceof Error ? error.message : "Ошибка"));
    } finally {
      setMigratingPromotions(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["homepage-promotion-assets"] }),
        queryClient.invalidateQueries({ queryKey: ["promotions"] }),
      ]);
    }
  };

  const migratedCount = HOMEPAGE_IMAGE_SLOTS.filter((slot) => Boolean(images[slot.key])).length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-primary">Контент сайта</p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">Изображения главной</h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Заменяйте фотографии без правки кода. Новые изображения конвертируются в WebP и хранятся в том же Cloudflare R2, что и медиа галереи.
          </p>
        </div>
        <Button asChild variant="outline"><Link href="/" target="_blank"><ExternalLink className="mr-2 h-4 w-4" /> Открыть главную</Link></Button>
      </header>

      {isError ? (
        <div className="rounded-2xl border border-destructive p-6" role="alert">
          <p>Не удалось загрузить настройки изображений. Изменения пока недоступны.</p>
          <Button className="mt-4" onClick={() => void refetch()}><RefreshCw className="mr-2 h-4 w-4" /> Повторить</Button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-20" role="status"><Loader2 className="h-8 w-8 animate-spin text-primary" /> <span className="sr-only">Загрузка</span></div>
      ) : (
        <>
          <section className="rounded-3xl border border-border bg-muted/40 p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CloudUpload className="h-5 w-5 text-primary" />
                  {migratedCount} из {HOMEPAGE_IMAGE_SLOTS.length} фотографий на R2
                </div>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Перенести текущие стандартные фото из сборки сайта в облачный бакет одним действием. Уже заменённые фотографии не будут перезаписаны.
                </p>
                {migrating && <p className="mt-2 text-sm font-semibold" role="status">Перенос: {migrationStep} / {HOMEPAGE_IMAGE_SLOTS.length - migratedCount + migrationStep}</p>}
              </div>
              <Button type="button" onClick={() => void migrateBundled()}
                disabled={migrating || migratingPromotions || migratedCount === HOMEPAGE_IMAGE_SLOTS.length || Object.values(busySlots).some(Boolean)}
                className="min-h-11">
                {migrating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
                Перенести стандартные фото в R2
              </Button>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            {HOMEPAGE_IMAGE_SLOTS.map((slot) => (
              <SlotCard key={slot.key} slot={slot} assigned={images[slot.key] || null}
                busy={busySlots[slot.key]} disabled={migrating || migratingPromotions}
                onSave={save} onUpload={upload} />
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground"><ImageIcon className="h-4 w-4 text-primary" /> Промо-фотографии</div>
            <p className="mt-2">Блок рекламных карточек на главной странице управляется отдельно. Все новые фото загружаются в Cloudflare R2. Старые фото из папки /uploads можно перенести без потери подписей и ссылок.</p>
            <p className="mt-3 text-sm font-semibold text-foreground">Локальных промо-фото: {localPromotions.length}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="outline"><Link href="/admin/promotions">Управление промо-блоками</Link></Button>
              <Button type="button" onClick={() => void migratePromotions()}
                disabled={migrating || migratingPromotions || !localPromotions.length || Object.values(busySlots).some(Boolean)}>
                {migratingPromotions ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CloudUpload className="mr-2 h-4 w-4" />}
                Перенести локальные промо-фото
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
