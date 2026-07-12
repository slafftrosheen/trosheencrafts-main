import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useContactForm } from '@/hooks/useApi';
import { useLanguage } from '@/lib/LanguageContext';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
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
    submitContact(data, {
      onSuccess: () => reset()
    });
  };

  if (isSuccess) {
    return (
      <Card className="border-2 border-primary/20 bg-primary/5 rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-12 text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" />
          <h3 className="text-3xl font-serif font-bold mb-4">{t("contact.form_success_title")}</h3>
          <p className="text-muted-foreground text-lg">
            {t("contact.form_success_desc")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-border/40 rounded-[2.5rem] overflow-hidden bg-card/40 shadow-xl">
      <CardContent className="p-8 md:p-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("admin.name")}</label>
              <Input
                {...register('name')}
                placeholder={t("contact.form.name_placeholder")}
                className="h-14 rounded-2xl border-2 focus:border-primary/40 bg-background/50"
                disabled={isPending}
              />
              {errors.name && <p className="text-xs text-destructive font-bold ml-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("admin.email")}</label>
              <Input
                type="email"
                {...register('email')}
                placeholder={t("contact.form.email_placeholder")}
                className="h-14 rounded-2xl border-2 focus:border-primary/40 bg-background/50"
                disabled={isPending}
              />
              {errors.email && <p className="text-xs text-destructive font-bold ml-1">{errors.email.message}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("contact.subject")}</label>
            <Input
              {...register('subject')}
              placeholder={t("contact.form.subject_placeholder")}
              className="h-14 rounded-2xl border-2 focus:border-primary/40 bg-background/50"
              disabled={isPending}
            />
            {errors.subject && <p className="text-xs text-destructive font-bold ml-1">{errors.subject.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">{t("admin.message")}</label>
            <Textarea
              {...register('message')}
              placeholder={t("contact.form.message_placeholder")}
              className="min-h-[200px] rounded-3xl border-2 focus:border-primary/40 bg-background/50 p-6"
              disabled={isPending}
            />
            {errors.message && <p className="text-xs text-destructive font-bold ml-1">{errors.message.message}</p>}
          </div>

          <Button type="submit" size="lg" className="w-full h-16 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-[0.98]" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                {t("contact.send")}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}