import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Mail, Search, UserCheck, UserX } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";

interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
  unsubscribedAt?: string | null;
  source?: string | null;
  isActive: boolean;
}

interface SubscriberResponse {
  subscribers: Subscriber[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
};

export default function NewsletterSubscribersPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["newsletter-subscribers"],
    queryFn: () =>
      apiClient.get<SubscriberResponse>("/newsletter/subscribers", {
        params: { page: 1, limit: 100 },
      }),
    retry: 1,
  });

  const subscribers = data?.subscribers || [];

  const visibleSubscribers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return subscribers.filter((subscriber) => {
      if (filter === "active" && !subscriber.isActive) return false;
      if (filter === "inactive" && subscriber.isActive) return false;
      if (!term) return true;
      return [subscriber.email, subscriber.source].filter(Boolean).join(" ").toLowerCase().includes(term);
    });
  }, [subscribers, search, filter]);

  const activeCount = subscribers.filter((subscriber) => subscriber.isActive).length;
  const inactiveCount = subscribers.length - activeCount;

  const exportSubscribers = () => {
    const rows = [
      ["Эл. почта", "Дата подписки", "Источник", "Статус"],
      ...visibleSubscribers.map((subscriber) => [
        subscriber.email,
        new Date(subscriber.subscribedAt).toISOString(),
        subscriber.source || "",
        subscriber.isActive ? "Активен" : "Отписался",
      ]),
    ];

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <header className="border-b border-border pb-6">
        <p className="text-sm font-medium text-muted-foreground">Аудитория</p>
        <h1 className="mt-1 font-serif text-4xl font-semibold tracking-tight">Подписчики рассылки</h1>
        <p className="mt-2 text-muted-foreground">
          Просматривайте состояние подписок, источник привлечения и экспортируйте отфильтрованный список.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Загружено", value: subscribers.length, note: `${data?.pagination.total || 0} записей всего`, icon: Mail },
          { label: "Активные", value: activeCount, note: "Получают рассылку", icon: UserCheck },
          { label: "Отписавшиеся", value: inactiveCount, note: "Неактивные записи", icon: UserX },
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
            placeholder="Поиск по email или источнику"
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все подписчики</SelectItem>
            <SelectItem value="active">Активные</SelectItem>
            <SelectItem value="inactive">Отписавшиеся</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => refetch()}>Обновить</Button>
        <Button variant="outline" onClick={exportSubscribers} disabled={!visibleSubscribers.length}>
          <Download className="mr-2 h-4 w-4" />
          Экспорт CSV
        </Button>
      </div>

      {error ? (
        <Card className="p-8 text-center">
          <p className="font-semibold">Не удалось загрузить подписчиков</p>
          <p className="mt-1 text-sm text-muted-foreground">{(error as any)?.message}</p>
          <Button className="mt-4" onClick={() => refetch()}>Повторить</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-6">Эл. почта</TableHead>
                <TableHead>Подписан</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    Загрузка подписчиков…
                  </TableCell>
                </TableRow>
              ) : visibleSubscribers.length ? (
                visibleSubscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="px-6 font-medium">{subscriber.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(subscriber.subscribedAt).toLocaleString("ru-RU")}
                    </TableCell>
                    <TableCell className="capitalize">{subscriber.source || "сайт"}</TableCell>
                    <TableCell>
                      <Badge variant={subscriber.isActive ? "default" : "secondary"}>
                        {subscriber.isActive ? "Активен" : "Отписался"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                    Нет подписчиков, соответствующих фильтру.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
