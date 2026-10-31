import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2, Send, ShieldCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/apiClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Recipient = {
  id: number;
  displayName: string;
  telegramUsername: string | null;
  enabled: boolean;
};
type BotSettings = {
  configured: boolean;
  enabled: boolean;
  username: string | null;
  lastError: string | null;
  recipients: Recipient[];
};
type Invitation = { link: string; expiresInMinutes: number };

const url = "/admin/telegram-workshop";

export function TelegramOrdersSettings() {
  const client = useQueryClient();
  const [token, setToken] = useState("");
  const [displayName, setDisplayName] = useState("Папа");
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const { data, isLoading, error, refetch } = useQuery<BotSettings>({
    queryKey: ["telegram-workshop"],
    queryFn: () => apiClient.get<BotSettings>(url),
    refetchInterval: 8000,
  });
  const refresh = () => client.invalidateQueries({ queryKey: ["telegram-workshop"] });
  const save = useMutation({
    mutationFn: (body: { token?: string; enabled: boolean }) =>
      apiClient.put<BotSettings>(url, body),
    onSuccess: () => {
      setToken("");
      setInvitation(null);
      refresh();
      toast.success("Настройки рабочего бота сохранены");
    },
    onError: (e: Error) => toast.error(e.message || "Не удалось сохранить настройки"),
  });
  const invite = useMutation({
    mutationFn: (name: string) => apiClient.post<Invitation>(url + "/invites", { displayName: name }),
    onSuccess: (result) => {
      setInvitation(result);
      toast.success("Одноразовая ссылка создана");
    },
    onError: (e: Error) => toast.error(e.message || "Не удалось создать приглашение"),
  });
  const setRecipient = useMutation({
    mutationFn: (body: { id: number; enabled: boolean }) =>
      apiClient.patch(url + "/recipients/" + body.id, { enabled: body.enabled }),
    onSuccess: () => {
      refresh();
      toast.success("Доступ сотрудника обновлён");
    },
    onError: (e: Error) => toast.error(e.message || "Не удалось изменить доступ"),
  });
  const test = useMutation({
    mutationFn: (id: number) => apiClient.post(url + "/recipients/" + id + "/test", {}),
    onSuccess: () => toast.success("Тест отправлен в Telegram"),
    onError: (e: Error) => toast.error(e.message || "Telegram не принял сообщение"),
  });

  const copyInvitation = async () => {
    if (!invitation) return;
    try {
      await navigator.clipboard.writeText(invitation.link);
      toast.success("Ссылка скопирована — отправьте её сотруднику");
    } catch {
      toast.error("Не удалось скопировать. Выделите и скопируйте ссылку вручную.");
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="p-6 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3 font-serif text-2xl">
            <Send className="h-6 w-6 text-primary" />
            Telegram · Trosheen Workshop
          </CardTitle>
          <Badge variant={data?.enabled ? "default" : "secondary"}>
            {data?.enabled ? "Бот работает" : "Бот выключен"}
          </Badge>
        </div>
        <CardDescription className="text-base leading-relaxed">
          Только оплаченные заказы SumUp. Бот сам подключается к Telegram по HTTPS:
          на Raspberry Pi не нужно открывать порты или раскрывать IP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-7 p-6 pt-3">
        {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            Не удалось загрузить настройки: {(error as Error).message}
            <Button variant="link" onClick={() => refetch()}>Повторить</Button>
          </p>
        )}

        <section className="space-y-4 rounded-xl border border-border p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">1. Подключить отдельного бота</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Создайте нового бота через <a className="underline underline-offset-4"
            href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer">@BotFather</a>.
            Вставьте полученный токен ниже. Токен сохраняется в зашифрованном виде
            и никогда не показывается после сохранения. Публичный бот для журнала не затрагивается.
          </p>
          <div className="space-y-2">
            <Label htmlFor="workshop-token">Токен API нового Telegram-бота</Label>
            <Input id="workshop-token" type="password" autoComplete="off"
              value={token} onChange={(e) => setToken(e.target.value)}
              placeholder={data?.configured ? "Токен уже сохранён — оставьте пустым" : "123456789:AA..."}
              className="h-12" />
          </div>
          {data?.username && (
            <p className="text-base">
              Подключён: <a className="font-semibold text-primary underline"
                href={"https://t.me/" + data.username} target="_blank" rel="noopener noreferrer">
                @{data.username}
              </a>
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button className="h-12 min-w-48" disabled={save.isPending || (!data?.configured && !token)}
              onClick={() => save.mutate({ token: token.trim() || undefined, enabled: true })}>
              {save.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                <Check className="mr-2 h-4 w-4" />}
              Сохранить и включить
            </Button>
            {data?.enabled && (
              <Button variant="outline" className="h-12" disabled={save.isPending}
                onClick={() => save.mutate({ enabled: false })}>Выключить уведомления</Button>
            )}
          </div>
          {data?.lastError && (
            <p className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive" role="alert">
              Ошибка соединения: {data.lastError}
            </p>
          )}
          {data?.configured && (
            <p className="text-xs text-muted-foreground">
              При замене токена на бота с другим ID подключённых сотрудников потребуется пригласить заново.
            </p>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-border p-5">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">2. Пригласить сотрудника</h3>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Впишите имя, создайте ссылку и отправьте её отцу в Telegram.
            Ему нужно лишь нажать ссылку и кнопку «Начать». Приглашение одноразовое,
            действительно 15 минут. Случайные пользователи бота заказов не видят.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1 space-y-2">
              <Label htmlFor="workshop-name">Имя сотрудника</Label>
              <Input id="workshop-name" className="h-12" maxLength={80}
                value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button variant="secondary" className="h-12 self-end"
              disabled={!data?.enabled || invite.isPending || !displayName.trim()}
              onClick={() => invite.mutate(displayName.trim())}>
              {invite.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                <UserPlus className="mr-2 h-4 w-4" />}
              Создать приглашение
            </Button>
          </div>
          {invitation && (
            <div className="space-y-3 rounded-lg border border-primary/30 bg-muted/30 p-4">
              <p className="text-sm font-medium">Ссылка действительна {invitation.expiresInMinutes} минут:</p>
              <Input readOnly value={invitation.link} className="h-12 font-mono text-sm"
                onFocus={(e) => e.target.select()} aria-label="Одноразовая ссылка для подключения" />
              <Button className="h-12" onClick={copyInvitation}>
                <Copy className="mr-2 h-4 w-4" /> Скопировать ссылку
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-border p-5">
          <h3 className="text-lg font-semibold">3. Подключённые сотрудники</h3>
          {!data?.recipients?.length ? (
            <p className="text-sm text-muted-foreground">
              Никто пока не подключён. После нажатия приглашения сотрудник появится здесь автоматически.
            </p>
          ) : (
            <div className="space-y-3">
              {data.recipients.map((person) => (
                <div key={person.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold">{person.displayName}</p>
                    <p className="text-sm text-muted-foreground">
                      {person.telegramUsername ? "@" + person.telegramUsername + " · " : ""}
                      {person.enabled ? "Уведомления включены" : "Доступ отключён"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="h-11" disabled={!data.enabled || !person.enabled || test.isPending}
                      onClick={() => test.mutate(person.id)}>
                      <Send className="mr-2 h-4 w-4" /> Тест
                    </Button>
                    <Button variant={person.enabled ? "destructive" : "secondary"}
                      className="h-11" disabled={setRecipient.isPending}
                      onClick={() => setRecipient.mutate({ id: person.id, enabled: !person.enabled })}>
                      {person.enabled ? "Отключить" : "Включить"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs leading-relaxed text-muted-foreground">
            В сообщения попадают имя, сумма и номер заказа. Состав, телефон и адрес доступны
            только подключённым сотрудникам по кнопкам внутри личного чата с ботом.
          </p>
        </section>
      </CardContent>
    </Card>
  );
}
