import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Download, ExternalLink, File, Image as ImageIcon, Loader2, RefreshCw, Trash2, Upload } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface R2File { key: string; url: string; size: number; modifiedAt: string | null }
interface FilePage { files: R2File[]; nextToken: string | null }
type Folder = "" | "images" | "homepage" | "gallery" | "gallery/thumbnails";
const FOLDERS: { id: Folder; label: string }[] = [
  { id: "", label: "Все файлы" }, { id: "images", label: "Изображения товаров и статей" },
  { id: "homepage", label: "Фотографии страниц" }, { id: "gallery", label: "Галерея" },
  { id: "gallery/thumbnails", label: "Превью галереи" },
];
const looksLikeImage = (key: string) => /\.(webp|jpe?g|png|gif)$/i.test(key);
const formatSize = (size: number) => size < 1024 * 1024
  ? (size / 1024).toFixed(0) + " КБ" : (size / 1024 / 1024).toFixed(1) + " МБ";

export default function MediaLibrary() {
  const cache = useQueryClient();
  const [folder, setFolder] = useState<Folder>("");
  const [pages, setPages] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [uploading, setUploading] = useState(false);
  const token = pages.at(-1) || "";
  const listing = useQuery<FilePage>({
    queryKey: ["r2-library", folder, token],
    queryFn: () => apiClient.get("/media-library/files", {
      params: { ...(folder ? { folder } : {}), ...(token ? { token } : {}) },
    }),
    retry: 1,
  });
  const files = useMemo(() => (listing.data?.files || []).filter(file =>
    file.key.toLowerCase().includes(filter.toLowerCase().trim())
  ), [listing.data, filter]);
  const removal = useMutation({
    mutationFn: (file: R2File) => apiClient.delete("/media-library/file", {
      body: JSON.stringify({ key: file.key, confirmed: true }),
    }),
    onSuccess: async () => {
      await cache.invalidateQueries({ queryKey: ["r2-library"] });
      toast.success("Неиспользуемый файл удалён из R2.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const image = file.type.startsWith("image/") && /\.(jpe?g|png|webp)$/i.test(file.name);
      const endpoint = image ? "/upload/image" : "/upload/gallery";
      const result = await apiClient.uploadFile(endpoint, file);
      await cache.invalidateQueries({ queryKey: ["r2-library"] });
      setPages([]);
      toast.success("Загружено в R2: " + result.filename);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ошибка загрузки.");
    } finally { setUploading(false); }
  };
  const remove = async (file: R2File) => {
    try {
      const refs = await apiClient.get<{ referenced: boolean; references: string[] }>(
        "/media-library/references", { params: { key: file.key } },
      );
      if (refs.referenced) {
        toast.error("Файл используется: " + refs.references.join(", "));
        return;
      }
      if (!window.confirm(
        "Удалить файл из Cloudflare R2 без возможности восстановления?\n\n" + file.key +
        "\n\nСначала убедитесь, что он не используется вне сайта."
      )) return;
      removal.mutate(file);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось проверить использование файла.");
    }
  };

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.15em] text-primary">Хранилище · Cloudflare R2</p>
          <h1 className="mt-2 font-serif text-4xl">Медиатека</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Файлы хранятся в облачном бакете, а не на сервере. Можно открыть,
            скачать, скопировать ссылку или удалить неиспользуемый файл.
            Удаление файлов, привязанных к страницам, товарам и статьям, блокируется.
          </p>
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Загрузка…" : "Добавить файл"}
          <input type="file" className="sr-only" disabled={uploading}
            accept=".jpg,.jpeg,.png,.webp,.gif,.glb,.gltf,.mp4,.webm"
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }} />
        </label>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold" htmlFor="r2-folder">Папка</label>
        <select id="r2-folder" className="h-11 rounded-xl border border-border bg-card px-3 text-sm"
          value={folder} onChange={event => { setFolder(event.target.value as Folder); setPages([]); }}>
          {FOLDERS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
        </select>
        <label className="sr-only" htmlFor="r2-search">Фильтр по имени файла</label>
        <input id="r2-search" type="search" value={filter} onChange={event => setFilter(event.target.value)}
          placeholder="Фильтр по имени на этой странице"
          className="h-11 min-w-56 flex-1 rounded-xl border border-border bg-card px-3 text-sm" />
        <Button variant="outline" onClick={() => void listing.refetch()} disabled={listing.isFetching}
          aria-label="Обновить список"><RefreshCw className={listing.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} /></Button>
      </div>
      {listing.isError && <div role="alert" className="rounded-2xl border border-destructive p-5 text-sm">
        Не удалось получить файлы из R2. Проверьте конфигурацию бакета и доступ API.
        <Button className="ml-3" variant="outline" onClick={() => void listing.refetch()}>Повторить</Button>
      </div>}
      {listing.isLoading ? <div role="status" className="py-16 text-center text-muted-foreground">Загружаем файлы из R2…</div> :
        !listing.isError && files.length === 0 ? <div className="py-16 text-center text-muted-foreground">
          В этой папке или по выбранному фильтру нет файлов.
        </div> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {files.map(file => (
              <article key={file.key} className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex aspect-[16/9] items-center justify-center bg-muted/30">
                  {looksLikeImage(file.key) ? (
                    <img src={file.url} alt="" loading="lazy" className="h-full w-full object-contain" />
                  ) : <File className="h-12 w-12 text-muted-foreground" aria-hidden="true" />}
                </div>
                <div className="space-y-3 p-4">
                  <p className="break-all text-sm font-semibold" title={file.key}>{file.key}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(file.size)} · {file.modifiedAt
                      ? new Date(file.modifiedAt).toLocaleDateString("ru-RU")
                      : "Дата неизвестна"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      void navigator.clipboard.writeText(file.url).then(() => toast.success("Ссылка скопирована"))
                        .catch(() => toast.error("Не удалось скопировать ссылку."));
                    }}><Copy className="mr-1 h-4 w-4" /> Ссылка</Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" /> Открыть
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href={"/api/media-library/download?key=" + encodeURIComponent(file.key)}>
                        <Download className="mr-1 h-4 w-4" /> Скачать
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" disabled={removal.isPending}
                      onClick={() => void remove(file)} className="text-destructive">
                      <Trash2 className="mr-1 h-4 w-4" /> Удалить
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      <div className="flex justify-between gap-3 border-t border-border pt-5">
        <Button variant="outline" disabled={!pages.length || listing.isFetching}
          onClick={() => setPages(previous => previous.slice(0, -1))}>Назад</Button>
        <span className="self-center text-xs text-muted-foreground">Страница {pages.length + 1}</span>
        <Button variant="outline" disabled={!listing.data?.nextToken || listing.isFetching}
          onClick={() => { if (listing.data?.nextToken) setPages(previous => [...previous, listing.data!.nextToken!]); }}>
          Дальше
        </Button>
      </div>
    </main>
  );
}
