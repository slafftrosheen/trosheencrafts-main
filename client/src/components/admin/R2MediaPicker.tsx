import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import { Image as ImageIcon, File, Loader2 } from "lucide-react";

interface MediaFile { key: string; url: string; size: number; modifiedAt: string | null }
interface MediaPage { files: MediaFile[]; nextToken: string | null }
const imageExt = /\.(jpg|jpeg|png|webp|gif)$/i;
type MediaKind = "image" | "all" | "3d" | "video";

export function R2MediaPicker({
  open, onOpenChange, onSelect, kind = "image",
}: {
  open: boolean; onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void; kind?: MediaKind;
}) {
  const [pages, setPages] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const token = pages.length ? pages[pages.length - 1] : "";
  const query = useQuery<MediaPage>({
    queryKey: ["r2-library", "", token],
    queryFn: () => apiClient.get("/media-library/files", { params: token ? { token } : {} }),
    enabled: open,
    retry: 1,
  });
  const matching = useMemo(() => (query.data?.files || []).filter(entry =>
    (kind === "all" ||
      (kind === "image" && imageExt.test(entry.key)) ||
      (kind === "3d" && /\.(glb|gltf)$/i.test(entry.key)) ||
      (kind === "video" && /\.(mp4|webm)$/i.test(entry.key))) &&
    entry.key.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase())
  ), [kind, query.data, filter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] max-w-4xl flex-col overflow-hidden rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Выбрать файл из Cloudflare R2</DialogTitle>
          <DialogDescription>Выберите уже загруженный файл. Повторная загрузка не требуется.</DialogDescription>
        </DialogHeader>
        <Input type="search" value={filter} onChange={event => setFilter(event.target.value)}
          placeholder="Поиск по имени в текущей странице…" aria-label="Поиск по имени файла" />
        <div className="min-h-32 flex-1 overflow-y-auto">
          {query.isLoading ? (
            <p role="status" className="flex items-center gap-2 p-5">
              <Loader2 className="h-4 w-4 animate-spin" /> Получаем список R2…
            </p>
          ) : query.isError ? (
            <p role="alert" className="p-5 text-destructive">Не удалось получить файлы из R2.</p>
          ) : matching.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">Подходящих файлов на этой странице нет.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 md:grid-cols-4">
              {matching.map(file => (
                <button type="button" key={file.key}
                  onClick={() => { onSelect(file.url); onOpenChange(false); }}
                  className="overflow-hidden rounded-xl border border-border bg-card text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-primary">
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted/30">
                    {imageExt.test(file.key)
                      ? <img src={file.url} alt="" className="h-full w-full object-contain" loading="lazy" />
                      : <File className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
                  </div>
                  <div className="truncate p-2 text-xs" title={file.key}>{file.key.split("/").pop()}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => setPages(stack => stack.slice(0, -1))}
            disabled={!pages.length || query.isFetching}>Назад</Button>
          <span className="self-center text-sm text-muted-foreground">Страница {pages.length + 1}</span>
          <Button type="button" variant="outline" onClick={() => {
            if (query.data?.nextToken) setPages(stack => [...stack, query.data!.nextToken!]);
          }} disabled={!query.data?.nextToken || query.isFetching}>Дальше</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
