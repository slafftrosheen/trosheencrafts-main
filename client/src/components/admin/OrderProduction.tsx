import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/lib/apiClient";
import {
  availableProductionActions, productionActionLabels, productionLabels, productionQuestions,
  type ProductionAction, type ProductionSnapshot,
} from "../../../../shared/workshopProduction";

export function OrderProduction({ orderId }: { orderId: number }) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  // Freeze the version when opening confirmation; polling must never retarget it.
  const [confirmation, setConfirmation] = useState<{ action: ProductionAction; version: number } | null>(null);
  const endpoint = `/admin/telegram-workshop/orders/${orderId}/production`;
  const query = useQuery<ProductionSnapshot>({
    queryKey: ["order-production", orderId, page],
    queryFn: () => apiClient.get<ProductionSnapshot>(`${endpoint}?page=${page}`),
    refetchInterval: 10000, retry: 1, placeholderData: keepPreviousData,
  });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["order-production", orderId] });
  const change = useMutation({
    mutationFn: ({ action, version }: { action: ProductionAction; version: number }) =>
      apiClient.patch<ProductionSnapshot>(endpoint, { action, expectedVersion: version }),
    onSuccess: () => {
      setConfirmation(null); setPage(0); void refresh();
      toast.success("Изготовление обновлено. Изменение видно в Telegram.");
    },
    onError: (error: Error) => {
      setConfirmation(null); void refresh();
      toast.error(error.message || "Не удалось изменить состояние. Обновите карточку.");
    },
  });
  const state = query.data;
  const staleConfirmation = Boolean(confirmation && state && confirmation.version !== state.version);
  const formatTime = (value: string) => new Date(value).toLocaleString("ru-RU", { timeZone: "Europe/Riga" });

  return (
    <section className="mb-6 space-y-4 rounded-xl border border-border bg-background p-4 sm:p-5" aria-label="Изготовление заказа">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Изготовление · заказ № {orderId}</h3>
        <Button type="button" variant="outline" className="min-h-11" disabled={query.isFetching || change.isPending}
          onClick={() => void query.refetch()}>{query.isFetching ? "Обновление…" : "Обновить"}</Button>
      </div>
      {query.isLoading && <p role="status">Загружаем состояние изготовления…</p>}
      {query.isError && <p className="text-destructive" role="alert">Не удалось обновить данные. {query.error.message} Изменения временно недоступны.</p>}
      {state && <>
        <div aria-live="polite" className="space-y-2">
          <Badge className="px-3 py-1.5 text-base" variant={state.status === "ready_to_ship" ? "default" : "secondary"}>
            {productionLabels[state.status]}
          </Badge>
          <p className="text-sm text-muted-foreground">
            {state.updatedAt ? `Обновлено: ${formatTime(state.updatedAt)} · время Риги` : "Изготовление ещё не отмечено."}
          </p>
        </div>
        {!state.editable && <p className="text-sm">Только просмотр: заказ не подтверждён, требует проверки, отменён или уже отправлен.</p>}
        <div className="flex flex-wrap gap-3">
          {availableProductionActions(state.status, state.editable).map((action) => (
            <Button key={action} type="button" className="min-h-12 whitespace-normal px-5"
              variant={action === "reopen" ? "outline" : "default"}
              disabled={change.isPending || query.isError || query.isPlaceholderData}
              onClick={() => setConfirmation({ action, version: state.version })}>
              {productionActionLabels[action]}
            </Button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Готовность не означает отправку. Эти действия не изменяют оплату или остатки товара. Telegram и админка используют одно состояние.</p>
        <details>
          <summary className="cursor-pointer py-3 text-base font-semibold">История изготовления</summary>
          {!state.history.length ? <p className="py-2 text-sm">На этой странице нет записей.</p> : (
            <ol className="space-y-3 border-l-2 border-border pl-4">
              {state.history.map((event) => <li key={event.id} className="text-sm leading-relaxed">
                <p className="font-medium">{productionLabels[event.fromStatus]} → {productionLabels[event.toStatus]}</p>
                <p>{event.actorName} · {event.actorType === "telegram" ? "Telegram" : "Админка"}</p>
                <time dateTime={event.createdAt} className="text-muted-foreground">{formatTime(event.createdAt)}</time>
              </li>)}
            </ol>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" className="min-h-11" disabled={page === 0 || query.isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}>Более новые</Button>
            <span className="text-sm">Страница {page + 1}</span>
            <Button type="button" variant="outline" className="min-h-11" disabled={!state.historyHasMore || query.isFetching}
              onClick={() => setPage((p) => p + 1)}>Более ранние</Button>
          </div>
        </details>
      </>}
      <AlertDialog open={Boolean(confirmation)} onOpenChange={(open) => { if (!open && !change.isPending) setConfirmation(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Подтвердите действие · заказ № {orderId}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmation ? productionQuestions[confirmation.action] : ""} Оплата и доставка не изменятся.
              {staleConfirmation ? " Заказ уже изменён. Закройте окно и выберите актуальное действие." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={change.isPending}>Нет, вернуться</AlertDialogCancel>
            <AlertDialogAction disabled={change.isPending || staleConfirmation || query.isError || !state?.editable}
              onClick={(event) => { event.preventDefault(); if (confirmation) change.mutate(confirmation); }}>
              {change.isPending ? "Сохранение…" : "Да, подтвердить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
