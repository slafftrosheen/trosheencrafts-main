import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { deliveryFilters, deliveryLabels, type DeliveryEntry, type DeliveryFilter,
  type DeliveryReport } from "../../../../shared/workshopDelivery";

const filterLabels: Record<DeliveryFilter, string> = {
  attention: "Ошибки и повторные попытки", pending: "Ожидают отправки", sent: "Доставленные", all: "Все уведомления",
};
const formatTime = (value: string) => new Date(value).toLocaleString("ru-RU", { timeZone: "Europe/Riga" });
const endpoint = "/admin/telegram-workshop/deliveries";

export function TelegramDeliveryStatus() {
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<DeliveryFilter>("attention");
  const [confirmation, setConfirmation] = useState<DeliveryEntry | null>(null);
  const query = useQuery<DeliveryReport>({
    queryKey: ["telegram-deliveries", filter, page],
    queryFn: () => apiClient.get<DeliveryReport>(endpoint, { params: { filter, page } }),
    refetchInterval: 10000, retry: 1, placeholderData: keepPreviousData,
  });
  const retry = useMutation({
    mutationFn: (id: string) => apiClient.post(endpoint + "/" + id + "/retry", { confirm: true }),
    onSuccess: () => {
      setConfirmation(null);
      void client.invalidateQueries({ queryKey: ["telegram-deliveries"] });
      void client.invalidateQueries({ queryKey: ["telegram-workshop"] });
      toast.success("Повтор поставлен в очередь. Заказ и оплата не изменены.");
    },
    onError: () => {
      setConfirmation(null);
      void client.invalidateQueries({ queryKey: ["telegram-deliveries"] });
    },
  });
  const data = query.data;
  const current = data?.entries.find(entry => entry.id === confirmation?.id);
  const canConfirm = Boolean(current?.canRetry && current.attempts === confirmation?.attempts && data?.enabled);
  const unavailable = retry.isPending || query.isError || query.isPlaceholderData;

  return (
    <section className="space-y-4 rounded-xl border border-border p-5" aria-label="Доставка уведомлений Telegram">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">4. Доставка уведомлений</h3>
        <Button type="button" variant="outline" className="min-h-11" disabled={query.isFetching || retry.isPending}
          onClick={() => void query.refetch()}>{query.isFetching ? "Обновление…" : "Обновить"}</Button>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Здесь видно, какие уведомления Telegram принял, а каким нужна помощь.
        Это не отметка о прочтении сотрудником. Время указано для Риги.
      </p>
      {query.isLoading && <p role="status">Загружаем журнал доставки…</p>}
      {query.isError && <p role="alert" className="text-destructive">Не удалось обновить журнал. Повторные отправки временно недоступны.</p>}
      {data && <>
        <div className="rounded-lg bg-muted/30 p-4 text-base leading-relaxed" aria-live="polite">
          <p>В очереди: <strong>{data.summary.pending}</strong> · Нужна помощь: <strong>{data.summary.failed}</strong></p>
          <p>Доставлено: <strong>{data.summary.sent}</strong> · Остановлено: <strong>{data.summary.skipped}</strong></p>
          {data.summary.lastSentAt && <p className="mt-2 text-sm">Последняя доставка: {formatTime(data.summary.lastSentAt)}</p>}
        </div>
        {!data.enabled && <p role="status">Бот выключен или ещё не настроен. Очередь не отправляется. Включите бота в разделе выше.</p>}
        {data.cooldownUntil && <p role="status" className="rounded-lg border border-border p-3">
          Telegram попросил сделать паузу до {formatTime(data.cooldownUntil)}. Отправка продолжится автоматически;
          кнопка повтора не сокращает эту паузу.
        </p>}
      </>}
      <div className="space-y-2">
        <Label htmlFor="telegram-delivery-filter">Показать уведомления</Label>
        <select id="telegram-delivery-filter" className="min-h-12 w-full rounded-lg border border-border bg-background px-3 text-base"
          value={filter} disabled={retry.isPending || Boolean(confirmation)}
          onChange={event => { setFilter(event.target.value as DeliveryFilter); setPage(0); }}>
          {deliveryFilters.map(value => <option key={value} value={value}>{filterLabels[value]}</option>)}
        </select>
      </div>
      {data && <>
        {!data.entries.length ? <p className="py-3 text-sm">В этом разделе пока нет уведомлений.</p> : (
          <ol className="space-y-3" aria-label="Журнал отправки">
            {data.entries.map(entry => <li key={entry.id} className="space-y-2 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-base font-semibold">Заказ № {entry.orderId} · {entry.recipientName}</p>
                <Badge variant={entry.state === "failed" ? "destructive" : entry.state === "sent" ? "default" : "secondary"}
                  className="whitespace-normal px-3 py-1 text-sm">{deliveryLabels[entry.state]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Попыток обработки: {entry.attempts}</p>
              {entry.lastError && <p className="text-sm leading-relaxed">{entry.lastError}</p>}
              {!entry.recipientEnabled && <p className="text-sm">Сотрудник отключён. Сначала включите его доступ выше.</p>}
              {entry.sentAt && <p className="text-sm">Доставлено: {formatTime(entry.sentAt)}</p>}
              {["queued", "retrying"].includes(entry.state) && entry.nextAttemptAt &&
                new Date(entry.nextAttemptAt).getTime() > Date.now() && <p className="text-sm">Следующая попытка не раньше {formatTime(entry.nextAttemptAt)}</p>}
              {entry.retryRequestedAt && <p className="text-sm text-muted-foreground">Последний ручной повтор: {formatTime(entry.retryRequestedAt)}</p>}
              {entry.state === "failed" && <Button type="button" variant="outline" className="min-h-12 whitespace-normal"
                disabled={unavailable || !entry.canRetry} onClick={() => setConfirmation(entry)}>
                Повторить отправку уведомления
              </Button>}
              {entry.state === "failed" && !entry.canRetry && entry.recipientEnabled && data?.enabled &&
                <p className="text-sm">Повтор недоступен: заказ изменён или сообщение уже обрабатывается. Обновите журнал.</p>}
            </li>)}
          </ol>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="min-h-11"
            disabled={!page || query.isFetching || retry.isPending || Boolean(confirmation)} onClick={() => setPage(p => p - 1)}>Назад</Button>
          <span>Страница {page + 1}</span>
          <Button type="button" variant="outline" className="min-h-11"
            disabled={!data.hasNext || query.isFetching || retry.isPending || Boolean(confirmation)} onClick={() => setPage(p => p + 1)}>Далее</Button>
        </div>
      </>}
      <p className="text-sm leading-relaxed text-muted-foreground">
        Временные ошибки повторяются автоматически. После исправления ошибки запустите ручной повтор только для записей «Нужна помощь».
        Уже доставленные сообщения повторно не ставятся в очередь. При обрыве связи после отправки возможен дубль уведомления — сверяйте номер заказа.
      </p>
      <AlertDialog open={Boolean(confirmation)} onOpenChange={open => { if (!open && !retry.isPending) setConfirmation(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Повторить уведомление по заказу № {confirmation?.orderId}?</AlertDialogTitle>
            <AlertDialogDescription>
              Получатель: {confirmation?.recipientName}. В очередь будет возвращено только это уведомление.
              Оплата, изготовление и сам заказ не изменятся. Сначала устраните указанную в журнале причину ошибки.
              {!canConfirm ? " Состояние уже изменилось. Закройте окно и обновите журнал." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={retry.isPending}>Нет, вернуться</AlertDialogCancel>
            <AlertDialogAction disabled={unavailable || !canConfirm}
              onClick={event => { event.preventDefault(); if (confirmation && canConfirm) retry.mutate(confirmation.id); }}>
              {retry.isPending ? "Сохранение…" : "Да, повторить уведомление"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
