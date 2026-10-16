import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, RotateCcw, Save, Search, Languages } from "lucide-react";
import { toast } from "sonner";
import { translations, type SiteCopyOverrides } from "@/lib/LanguageContext";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";

const LANGUAGES = [
  { code: "lv", label: "Latviešu" },
  { code: "en", label: "English" },
  { code: "ru", label: "Русский" },
  { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
] as const;
type Language = (typeof LANGUAGES)[number]["code"];

const copyKeys = Object.keys(translations)
  .filter(key => !/^(admin[._-]|settings[._-])/.test(key))
  .sort();
const sections: Record<string, string> = {
  "nav": "Навигация", "hero": "Главный экран", "letter": "Приветствие",
  "pillars": "Принципы", "cats": "Категории", "works": "Работы",
  "fresh": "Новинки", "steps": "Процесс", "band": "История",
  "custom": "На заказ", "duo": "Галерея и журнал", "news": "Рассылка",
  "footer": "Подвал", "shop": "Магазин", "wiz": "Конструктор",
  "pdp": "Карточка товара", "story": "Наша история", "care": "Уход",
  "contact": "Контакты", "gallery": "Галерея", "journal": "Журнал",
  "tagline": "Фирменный слоган", "intro": "Вступление", "location": "Локация",
};

export default function WebsiteContent() {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<Language>("ru");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(copyKeys[0] || "");
  const [draft, setDraft] = useState("");
  const { data: overrides = {}, isLoading, isError, refetch } = useQuery<SiteCopyOverrides>({
    queryKey: ["siteCopy"],
    queryFn: () => apiClient.get<SiteCopyOverrides>("/site-config/content"),
    retry: 1,
  });

  const original = translations[selected]?.[language] ?? "";
  const current = overrides[selected]?.[language] || original;
  const hasOverride = Boolean(overrides[selected]?.[language]?.trim());
  const dirty = draft !== current;

  useEffect(() => {
    setDraft(current);
  }, [selected, language, current]);

  const visibleKeys = useMemo(() => copyKeys.filter((key) =>
    key.toLowerCase().includes(search.toLowerCase().trim()) ||
    (translations[key]?.[language] || "").toLowerCase().includes(search.toLowerCase().trim())
  ), [search, language]);

  const mutation = useMutation({
    mutationFn: (value: string | null) =>
      apiClient.put("/site-config/admin/content", { key: selected, language, value }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["siteCopy"] });
      toast.success("Текст опубликован для выбранного языка.");
    },
    onError: (error: Error) => toast.error(error.message || "Не удалось сохранить текст."),
  });

  return (
    <div className="space-y-7">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Контент · Trosheen v4.3</p>
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Тексты сайта</h1>
        <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
          Редактируйте тексты публичных страниц, магазина, конструктора и форм на пяти языках.
          Изменения сохраняются в базе данных и сразу доступны на сайте. Исходные тексты
          брендбука остаются резервными и могут быть восстановлены одной кнопкой.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-3">
        <Languages className="h-5 w-5 text-primary" />
        <label className="text-sm font-semibold" htmlFor="content-language">Язык версии сайта</label>
        <select id="content-language" className="h-11 rounded-xl border border-border bg-card px-4 text-sm"
          value={language} onChange={(event) => {
            if (dirty && !window.confirm("Есть несохранённые изменения. Сменить язык без сохранения?")) return;
            setLanguage(event.target.value as Language);
          }}>
          {LANGUAGES.map(({ code, label }) => <option value={code} key={code}>{label}</option>)}
        </select>
        <span className="text-xs text-muted-foreground">{copyKeys.length} редактируемых строк</span>
      </div>
      {isError ? (
        <div className="rounded-xl border border-destructive p-5" role="alert">
          Не удалось получить тексты из базы данных.
          <Button variant="outline" className="ml-3" onClick={() => void refetch()}>Повторить</Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(240px,340px)_minmax(0,1fr)]">
          <section className="overflow-hidden rounded-3xl border border-border bg-card">
            <div className="sticky top-0 border-b border-border bg-card p-4">
              <label htmlFor="copy-search" className="mb-2 flex items-center gap-2 text-xs font-semibold">
                <Search className="h-4 w-4" /> Поиск по ключу или тексту
              </label>
              <input id="copy-search" type="search" value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
                placeholder="Например, gallery или свеча…" />
            </div>
            <div className="max-h-[min(65vh,720px)] overflow-y-auto p-2" role="list">
              {visibleKeys.map((key) => (
                <button key={key} type="button" role="listitem" onClick={() => {
                  if (dirty && !window.confirm("Есть несохранённые изменения. Перейти без сохранения?")) return;
                  setSelected(key);
                }} className={"mb-1 w-full rounded-xl px-3 py-3 text-left transition-colors " +
                  (selected === key ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  <span className="block text-xs font-semibold opacity-75">
                    {sections[key.split(".")[1]] || key.split(".")[1]} · {key}
                  </span>
                  <span className="mt-1 block truncate text-sm">
                    {overrides[key]?.[language] || translations[key]?.[language] || key}
                  </span>
                </button>
              ))}
              {!visibleKeys.length && <p className="p-4 text-sm text-muted-foreground">Совпадений не найдено.</p>}
            </div>
          </section>
          <section className="min-w-0 rounded-3xl border border-border bg-card p-5 sm:p-7">
            {isLoading ? <p role="status">Загрузка текстов…</p> : selected ? (
              <>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">{selected}</p>
                    <h2 className="mt-2 font-serif text-2xl">Редактирование</h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs">
                    {hasOverride ? "Изменён" : "Брендбук"}
                  </span>
                </div>
                <label className="mb-2 block text-sm font-semibold" htmlFor="copy-draft">Текст на выбранном языке</label>
                <textarea id="copy-draft" className="min-h-40 w-full resize-y rounded-2xl border border-border bg-background p-4 text-base leading-relaxed"
                  value={draft} maxLength={4000} onChange={(event) => setDraft(event.target.value)}
                  disabled={mutation.isPending} />
                <p className="mt-2 text-right text-xs text-muted-foreground">{draft.length} / 4000</p>
                <div className="mt-4 rounded-2xl bg-muted/50 p-4 text-sm">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Исходный текст брендбука</p>
                  <p className="whitespace-pre-wrap leading-relaxed">{original}</p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => mutation.mutate(draft.trim())}
                    disabled={mutation.isPending || !dirty || !draft.trim()}>
                    {mutation.isPending ? <Check className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}
                    Сохранить и опубликовать
                  </Button>
                  <Button variant="outline" disabled={mutation.isPending || (!hasOverride && !dirty)}
                    onClick={() => mutation.mutate(null)}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Восстановить брендбук
                  </Button>
                </div>
                {dirty && <p className="mt-4 text-xs text-amber-700">Текущие изменения не сохранены.</p>}
              </>
            ) : <p className="text-muted-foreground">Нет доступных строк для редактирования.</p>}
          </section>
        </div>
      )}
    </div>
  );
}
