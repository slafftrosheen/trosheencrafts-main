import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useContactForm } from "@/hooks/useApi";
import { useLanguage } from "@/lib/LanguageContext";
import { BrandMotion } from "@/components/shared/BrandMotion";

function contactSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(2, t("forms.min_2")).max(100, t("forms.too_long")),
    email: z.string().trim().email(t("forms.invalid_email")),
    subject: z.string().trim().min(5, t("forms.min_5")).max(200, t("forms.too_long")),
    message: z.string().trim().min(10, t("forms.min_10")).max(2000, t("forms.too_long")),
  });
}
type ContactFormData = z.infer<ReturnType<typeof contactSchema>>;

export function ContactForm() {
  const { t } = useLanguage();
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema(t)) });

  const { mutate: submitContact, isPending, isSuccess, isError } = useContactForm({
    onSuccess: () => { reset(); toast.success(t("contact.form_success_title")); },
    onError: () => toast.error(t("contact.form_error")),
  });
  const onSubmit = (data: ContactFormData) => submitContact(data);

  if (isSuccess) {
    return (
      <div className="py-10 text-center" role="status">
        <BrandMotion name="stamp" mode="view" className="mx-auto h-36 w-36" poster="/brand/seal-spruce.svg" />
        <h3 className="mt-5 font-serif text-3xl font-semibold">{t("contact.form_success_title")}</h3>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">{t("contact.form_success_desc")}</p>
      </div>
    );
  }

  const inputClass = "h-12 border-border bg-background px-4";
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-busy={isPending}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">{t("admin.name")}</Label>
          <Input id="contact-name" {...register("name")} placeholder={t("contact.form.name_placeholder")}
            className={inputClass} disabled={isPending} autoComplete="name" required
            aria-invalid={!!errors.name} aria-describedby={errors.name ? "contact-name-error" : undefined} />
          {errors.name && <p id="contact-name-error" role="alert" className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">{t("admin.email")}</Label>
          <Input id="contact-email" type="email" {...register("email")} placeholder={t("contact.form.email_placeholder")}
            className={inputClass} disabled={isPending} autoComplete="email" required
            aria-invalid={!!errors.email} aria-describedby={errors.email ? "contact-email-error" : undefined} />
          {errors.email && <p id="contact-email-error" role="alert" className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-subject">{t("contact.subject")}</Label>
        <Input id="contact-subject" {...register("subject")} placeholder={t("contact.form.subject_placeholder")}
          className={inputClass} disabled={isPending} required
          aria-invalid={!!errors.subject} aria-describedby={errors.subject ? "contact-subject-error" : undefined} />
        {errors.subject && <p id="contact-subject-error" role="alert" className="text-xs text-destructive">{errors.subject.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("admin.message")}</Label>
        <Textarea id="contact-message" {...register("message")} placeholder={t("contact.form.message_placeholder")}
          className="min-h-40 border-border bg-background p-4" disabled={isPending} required
          aria-invalid={!!errors.message} aria-describedby={errors.message ? "contact-message-error" : undefined} />
        {errors.message && <p id="contact-message-error" role="alert" className="text-xs text-destructive">{errors.message.message}</p>}
      </div>
      {isError && <p role="alert" className="text-sm text-destructive">{t("contact.form_error")}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {t("contact.send")}
      </Button>
    </form>
  );
}
