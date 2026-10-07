import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileWarning,
  Mail,
  MessageSquare,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";
import { Spinner } from "@/components/shared/LoadingStates";
import { toast } from "sonner";
import { adminT as t } from "@/lib/adminI18n";

type MessageStatus = "new" | "read" | "resolved";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
}

const statusVariant: Record<MessageStatus, "default" | "secondary" | "outline"> = {
  new: "default",
  read: "secondary",
  resolved: "outline",
};

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: messages = [], isLoading, error, refetch } = useQuery<ContactMessage[]>({
    queryKey: ["contact-submissions"],
    queryFn: () => apiClient.get<ContactMessage[]>("/contact/admin/all"),
    retry: 1,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: MessageStatus }) =>
      apiClient.patch(`/contact/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-overview"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics-dashboard"] });
      toast.success("Статус сообщения обновлён");
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || "Не удалось обновить сообщение");
    },
  });

  const isWithdrawal = (message: ContactMessage) =>
    message.subject.toLowerCase().startsWith("withdrawal request");

  const visibleMessages = useMemo(() => {
    const term = search.trim().toLowerCase();

    return messages.filter((message) => {
      if (filter === "new" && message.status !== "new") return false;
      if (filter === "open" && message.status === "resolved") return false;
      if (filter === "resolved" && message.status !== "resolved") return false;
      if (filter === "withdrawal" && !isWithdrawal(message)) return false;

      if (!term) return true;
      return [message.name, message.email, message.subject, message.message]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [messages, search, filter]);

  const newCount = messages.filter((message) => message.status === "new").length;
  const withdrawalCount = messages.filter(isWithdrawal).length;
  const openCount = messages.filter((message) => message.status !== "resolved").length;
  const resolvedCount = messages.filter((message) => message.status === "resolved").length;

  const setStatus = (id: number, status: MessageStatus) => mutation.mutate({ id, status });

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-muted-foreground">Обращения клиентов</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">{t("admin.messages_title")}</h1>
        <p className="mt-2 text-muted-foreground">
          Обращения клиентов и заявления об отказе от договора в одной очереди.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Новые", value: newCount, note: "Ещё не просмотрены", icon: Mail },
          { label: "Открытые", value: openCount, note: "Новые + прочитанные", icon: MessageSquare },
          { label: "Отказы от договора", value: withdrawalCount, note: "Заявления на отказ от договора", icon: FileWarning },
          { label: "Закрытые", value: resolvedCount, note: "Завершённые обращения", icon: CheckCircle2 },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <Icon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="font-serif text-3xl font-semibold">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по отправителю, email, теме или сообщению"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все сообщения</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="open">Открытые</SelectItem>
            <SelectItem value="withdrawal">Отказы от договора</SelectItem>
            <SelectItem value="resolved">Закрытые</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()}>Обновить</Button>
      </div>

      {error ? (
        <Card className="p-8 text-center">
          <p className="font-semibold">Не удалось загрузить сообщения</p>
          <p className="mt-1 text-sm text-muted-foreground">{(error as any)?.message}</p>
          <Button className="mt-4" onClick={() => refetch()}>Повторить</Button>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : visibleMessages.length ? (
        <div className="space-y-3">
          {visibleMessages.map((message) => {
            const withdrawal = isWithdrawal(message);
            const expanded = expandedId === message.id;
            const rowPending = mutation.isPending && mutation.variables?.id === message.id;

            return (
              <Card key={message.id} className={withdrawal ? "border-amber-500/40" : undefined}>
                <CardContent className="p-0">
                  <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{message.subject}</h2>
                        <Badge variant={statusVariant[message.status]} className="capitalize">
                          {message.status === "new" ? "Новое" : message.status === "read" ? "Прочитано" : "Закрыто"}
                        </Badge>
                        {withdrawal && (
                          <Badge variant="outline" className="border-amber-500/50 text-amber-700">
                            Withdrawal
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{message.name}</span>
                        <span>{message.email}</span>
                        <span>{new Date(message.createdAt).toLocaleString("ru-RU")}</span>
                      </div>
                      {!expanded && (
                        <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">{message.message}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {message.status === "new" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={rowPending}
                          onClick={() => setStatus(message.id, "read")}
                        >
                          Отметить прочитанным
                        </Button>
                      )}
                      {message.status !== "resolved" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={rowPending}
                          onClick={() => setStatus(message.id, "resolved")}
                        >
                          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                          Закрыть
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={rowPending}
                          onClick={() => setStatus(message.id, "read")}
                        >
                          Открыть снова
                        </Button>
                      )}
                      <a
                        href={`mailto:${message.email}?subject=${encodeURIComponent("Re: " + message.subject)}`}
                      >
                        <Button size="sm" variant="outline">
                          <Mail className="mr-2 h-3.5 w-3.5" />
                          Ответить
                        </Button>
                      </a>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setExpandedId(expanded ? null : message.id)}
                        aria-label={expanded ? "Свернуть сообщение" : "Развернуть сообщение"}
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="border-t border-border bg-muted/20 p-5">
                      <p className="whitespace-pre-wrap text-sm leading-6">{message.message}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-20 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
          <h3 className="mt-5 font-serif text-2xl font-semibold">Подходящих сообщений нет</h3>
          <p className="mt-1 text-sm text-muted-foreground">По выбранному фильтру сообщений нет.</p>
        </div>
      )}
    </div>
  );
}
