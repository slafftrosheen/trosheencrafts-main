import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, FileCheck2, Loader2, Mail } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/apiClient";
import { useLanguage } from "@/lib/LanguageContext";

type Step = "form" | "review" | "success";

const copy = {
  en: {
    eyebrow: "Consumer rights",
    title: "Withdraw from contract",
    intro: "Use this function to send a clear withdrawal notice for an online order. We will email a timestamped acknowledgement to the address you provide.",
    name: "Your name",
    email: "Email for confirmation",
    order: "Order / contract reference",
    note: "Optional note",
    review: "Review withdrawal",
    reviewTitle: "Confirm your withdrawal",
    reviewText: "By confirming, you state that you are withdrawing from the distance contract identified below.",
    confirm: "Confirm withdrawal",
    edit: "Edit details",
    successTitle: "Withdrawal submitted",
    successText: "Your notice has been recorded. A confirmation email with the submitted details and timestamp has been sent to you.",
    back: "Back to shop",
    exception: "Legal exceptions may apply to certain goods, including items made to your specifications or clearly personalised. Submitting this notice does not remove any rights you have under applicable consumer law.",
  },
  lv: {
    eyebrow: "Patērētāju tiesības",
    title: "Atteikties no līguma",
    intro: "Izmantojiet šo funkciju, lai iesniegtu skaidru atteikuma paziņojumu par tiešsaistes pasūtījumu. Uz norādīto e-pastu nosūtīsim apstiprinājumu ar iesniegšanas laiku.",
    name: "Jūsu vārds",
    email: "E-pasts apstiprinājumam",
    order: "Pasūtījuma / līguma numurs",
    note: "Papildu piezīme",
    review: "Pārskatīt atteikumu",
    reviewTitle: "Apstiprināt atteikumu",
    reviewText: "Apstiprinot, jūs paziņojat, ka atsakāties no zemāk norādītā distances līguma.",
    confirm: "Apstiprināt atteikumu",
    edit: "Labot datus",
    successTitle: "Atteikums iesniegts",
    successText: "Jūsu paziņojums ir reģistrēts. Uz norādīto e-pastu nosūtīts apstiprinājums ar iesniegtajiem datiem un laiku.",
    back: "Atpakaļ uz veikalu",
    exception: "Atsevišķām precēm var būt piemērojami likumā noteikti izņēmumi, tostarp precēm, kas izgatavotas pēc jūsu norādījumiem vai ir nepārprotami personalizētas.",
  },
  ru: {
    eyebrow: "Права потребителя",
    title: "Отказаться от договора",
    intro: "Используйте эту форму, чтобы направить заявление об отказе от дистанционного договора. Мы отправим подтверждение с отметкой времени на указанный email.",
    name: "Ваше имя",
    email: "Email для подтверждения",
    order: "Номер заказа / договора",
    note: "Комментарий, если нужен",
    review: "Проверить заявление",
    reviewTitle: "Подтвердить отказ",
    reviewText: "Подтверждая, вы заявляете об отказе от указанного ниже дистанционного договора.",
    confirm: "Подтвердить отказ",
    edit: "Изменить данные",
    successTitle: "Заявление отправлено",
    successText: "Ваше заявление зарегистрировано. Подтверждение с данными и временем отправлено на указанный email.",
    back: "Вернуться в магазин",
    exception: "Для некоторых товаров действуют предусмотренные законом исключения, включая товары, изготовленные по вашим указаниям или явно персонализированные.",
  },
  pl: {
    eyebrow: "Prawa konsumenta",
    title: "Odstąp od umowy",
    intro: "Użyj tego formularza, aby złożyć oświadczenie o odstąpieniu od umowy zawartej na odległość. Potwierdzenie z datą i godziną wyślemy e-mailem.",
    name: "Imię i nazwisko",
    email: "E-mail do potwierdzenia",
    order: "Numer zamówienia / umowy",
    note: "Opcjonalna wiadomość",
    review: "Sprawdź oświadczenie",
    reviewTitle: "Potwierdź odstąpienie",
    reviewText: "Potwierdzając, oświadczasz, że odstępujesz od wskazanej poniżej umowy zawartej na odległość.",
    confirm: "Potwierdź odstąpienie",
    edit: "Edytuj dane",
    successTitle: "Oświadczenie wysłane",
    successText: "Oświadczenie zostało zapisane. Potwierdzenie z przesłanymi danymi i znacznikiem czasu wysłaliśmy e-mailem.",
    back: "Wróć do sklepu",
    exception: "W odniesieniu do niektórych towarów mogą mieć zastosowanie ustawowe wyjątki, w tym do produktów wykonanych według specyfikacji klienta lub wyraźnie spersonalizowanych.",
  },
  uk: {
    eyebrow: "Права споживача",
    title: "Відмовитися від договору",
    intro: "Скористайтеся цією формою, щоб подати заяву про відмову від дистанційного договору. Ми надішлемо підтвердження з часовою позначкою на вашу електронну пошту.",
    name: "Ваше ім’я",
    email: "Email для підтвердження",
    order: "Номер замовлення / договору",
    note: "Необов’язкова примітка",
    review: "Перевірити заяву",
    reviewTitle: "Підтвердити відмову",
    reviewText: "Підтверджуючи, ви заявляєте про відмову від зазначеного нижче дистанційного договору.",
    confirm: "Підтвердити відмову",
    edit: "Змінити дані",
    successTitle: "Заяву подано",
    successText: "Вашу заяву зареєстровано. Підтвердження з даними та часовою позначкою надіслано електронною поштою.",
    back: "Повернутися до магазину",
    exception: "Для окремих товарів можуть діяти передбачені законом винятки, зокрема для товарів, виготовлених за вашими вказівками або явно персоналізованих.",
  },
} as const;

export default function WithdrawalPage() {
  const { language } = useLanguage();
  const c = useMemo(() => copy[language as keyof typeof copy] || copy.en, [language]);
  const [step, setStep] = useState<Step>("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    orderNumber: "",
    note: "",
  });

  const canReview =
    form.name.trim().length >= 2 &&
    form.email.includes("@") &&
    form.orderNumber.trim().length >= 1;

  const submit = async () => {
    setSubmitting(true);
    setError("");

    try {
      const result = await apiClient.post<{ submittedAt: string }>("/contact/withdrawal", form);
      setSubmittedAt(result.submittedAt);
      setStep("success");
    } catch (e: any) {
      setError(e?.message || "Unable to submit the withdrawal notice. Please contact us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="page-shell border-b border-border">
        <div className="site-container max-w-5xl">
          <Link
            href="/terms"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Terms
          </Link>
          <p className="eyebrow mt-8">{c.eyebrow}</p>
          <h1 className="display-title mt-4">{c.title}</h1>
          <p className="lead mt-6 max-w-3xl">{c.intro}</p>
        </div>
      </section>

      <section className="section-space pt-10 sm:pt-14">
        <div className="site-container max-w-3xl">
          {step === "success" ? (
            <div className="surface p-7 text-center sm:p-10">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h2 className="mt-5 font-serif text-3xl font-semibold">{c.successTitle}</h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-muted-foreground">{c.successText}</p>
              {submittedAt && (
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {new Date(submittedAt).toLocaleString(language)}
                </p>
              )}
              <Button asChild className="mt-7">
                <Link href="/shop">{c.back}</Link>
              </Button>
            </div>
          ) : step === "review" ? (
            <div className="surface p-7 sm:p-10">
              <FileCheck2 className="h-6 w-6 text-primary" />
              <h2 className="mt-4 font-serif text-3xl font-semibold">{c.reviewTitle}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{c.reviewText}</p>

              <dl className="mt-7 divide-y divide-border border-y border-border">
                <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{c.name}</dt>
                  <dd className="font-semibold">{form.name}</dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{c.email}</dt>
                  <dd className="font-semibold">{form.email}</dd>
                </div>
                <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
                  <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{c.order}</dt>
                  <dd className="font-semibold">{form.orderNumber}</dd>
                </div>
                {form.note.trim() && (
                  <div className="grid gap-1 py-4 sm:grid-cols-[180px_1fr]">
                    <dt className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{c.note}</dt>
                    <dd>{form.note}</dd>
                  </div>
                )}
              </dl>

              {error && <p className="mt-5 text-sm font-medium text-destructive">{error}</p>}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="sm:flex-1" onClick={() => setStep("form")} disabled={submitting}>
                  {c.edit}
                </Button>
                <Button className="sm:flex-1" onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {c.confirm}
                </Button>
              </div>
            </div>
          ) : (
            <div className="surface p-7 sm:p-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="withdrawal-name">{c.name}</Label>
                  <Input
                    id="withdrawal-name"
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="h-12 rounded-xl"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawal-email">{c.email}</Label>
                  <Input
                    id="withdrawal-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="h-12 rounded-xl"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawal-order">{c.order}</Label>
                  <Input
                    id="withdrawal-order"
                    value={form.orderNumber}
                    onChange={(event) => setForm((current) => ({ ...current, orderNumber: event.target.value }))}
                    className="h-12 rounded-xl"
                    placeholder="e.g. 1042"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="withdrawal-note">{c.note}</Label>
                  <Textarea
                    id="withdrawal-note"
                    value={form.note}
                    onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                    className="min-h-28 rounded-xl p-4"
                    maxLength={1000}
                  />
                </div>
              </div>

              <p className="mt-6 text-xs leading-6 text-muted-foreground">{c.exception}</p>

              <Button className="mt-7 w-full" size="lg" disabled={!canReview} onClick={() => setStep("review")}>
                {c.review}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
