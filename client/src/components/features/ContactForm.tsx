import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useContactForm } from "@/hooks/useApi";
import { useLanguage } from "@/lib/LanguageContext";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(200),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { mutate: submitContact, isPending, isSuccess } = useContactForm();
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = (data: ContactFormData) => {
    submitContact(data, { onSuccess: () => reset() });
  };

  if (isSuccess) {
    return (
      <div className="py-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="mt-5 font-serif text-3xl font-semibold">{t("contact.form_success_title")}</h3>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">{t("contact.form_success_desc")}</p>
      </div>
    );
  }

  const inputClass = "h-12 rounded-xl border-border bg-background px-4";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("admin.name")}</Label>
          <Input
            {...register("name")}
            placeholder={t("contact.form.name_placeholder")}
            className={inputClass}
            disabled={isPending}
            autoComplete="name"
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t("admin.email")}</Label>
          <Input
            type="email"
            {...register("email")}
            placeholder={t("contact.form.email_placeholder")}
            className={inputClass}
            disabled={isPending}
            autoComplete="email"
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t("contact.subject")}</Label>
        <Input
          {...register("subject")}
          placeholder={t("contact.form.subject_placeholder")}
          className={inputClass}
          disabled={isPending}
        />
        {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t("admin.message")}</Label>
        <Textarea
          {...register("message")}
          placeholder={t("contact.form.message_placeholder")}
          className="min-h-40 rounded-xl border-border bg-background p-4"
          disabled={isPending}
        />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {t("contact.send")}
      </Button>
    </form>
  );
}
