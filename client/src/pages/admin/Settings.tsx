import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useApi';
import { adminT as t } from "@/lib/adminI18n";
import { apiClient } from '@/lib/apiClient';
import { Loader2, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send, Twitter, Clock } from 'lucide-react';

interface SiteConfig {
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    telegram: string;
  };
  businessHours: {
    monFri: string;
    satSun: string;
  };
}

export default function Settings() {
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const queryClient = useQueryClient();

  const { data: config, isLoading: configLoading } = useQuery<SiteConfig>({
    queryKey: ['adminSiteConfig'],
    queryFn: () => apiClient.get<SiteConfig>('/site-config'),
  });

  const [contactForm, setContactForm] = useState({
    email: '',
    phone: '',
    address: '',
  });

  const [socialForm, setSocialForm] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    telegram: '',
  });

  const [hoursForm, setHoursForm] = useState({
    monFri: '',
    satSun: '',
  });

  useEffect(() => {
    if (config) {
      setContactForm(config.contact);
      setSocialForm(config.social);
      setHoursForm(config.businessHours);
    }
  }, [config]);

  // Mutations
  const contactMutation = useMutation({
    mutationFn: (data: typeof contactForm) => apiClient.put('/site-config/admin/contact', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminSiteConfig'] });
      toast.success(t('admin.settings_saved') || 'Контактные данные сохранены');
    },
    onError: (error: any) => toast.error(error.message || 'Не удалось обновить контактные данные'),
  });

  const socialMutation = useMutation({
    mutationFn: (data: typeof socialForm) => apiClient.put('/site-config/admin/social', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminSiteConfig'] });
      toast.success(t('admin.settings_saved') || 'Ссылки на соцсети сохранены');
    },
    onError: (error: any) => toast.error(error.message || 'Не удалось обновить ссылки на соцсети'),
  });

  const hoursMutation = useMutation({
    mutationFn: (data: typeof hoursForm) => apiClient.put('/site-config/admin/business-hours', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminSiteConfig'] });
      toast.success(t('admin.settings_saved') || 'Часы работы сохранены');
    },
    onError: (error: any) => toast.error(error.message || 'Не удалось обновить часы работы'),
  });

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(contactForm);
  };

  const handleSaveSocial = (e: React.FormEvent) => {
    e.preventDefault();
    socialMutation.mutate(socialForm);
  };

  const handleSaveHours = (e: React.FormEvent) => {
    e.preventDefault();
    hoursMutation.mutate(hoursForm);
  };

  if (userLoading || configLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
        <header className="border-b border-border pb-6">
          <h1 className="font-serif text-4xl font-semibold tracking-tight">
            {t('admin.site_config') || 'Настройки сайта'} <span className="text-primary italic">&amp; {t('nav.settings') || 'Настройки'}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Управляйте контактами, социальными сетями и основными параметрами сайта.
          </p>
        </header>

        {/* Contact Information */}
        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              {t('admin.contact_info') || 'Контактная информация'}
            </CardTitle>
            <CardDescription className="font-medium">
              Эти данные отображаются на страницах сайта.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveContact} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="hello@trosheen.shop"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Телефон
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                  placeholder="+371 XXX XXXXX"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Адрес / местоположение
                </Label>
                <Input
                  id="address"
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  placeholder="Даугавпилс, Латвия"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <Separator className="my-6" />

              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="h-11 px-6"
              >
                {contactMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  t('admin.save_changes') || 'Сохранить изменения'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Instagram className="w-6 h-6 text-primary" />
              {t('admin.social_links') || 'Социальные сети'}
            </CardTitle>
            <CardDescription className="font-medium">
              Ссылки на социальные сети в футере и на странице контактов.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveSocial} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Facebook className="w-3 h-3" /> Facebook
                </Label>
                <Input
                  id="facebook"
                  type="url"
                  value={socialForm.facebook}
                  onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                  placeholder="https://facebook.com/yourpage"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Instagram className="w-3 h-3" /> Instagram
                </Label>
                <Input
                  id="instagram"
                  type="url"
                  value={socialForm.instagram}
                  onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                  placeholder="https://instagram.com/yourhandle"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitter" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Twitter className="w-3 h-3" /> Twitter / X
                </Label>
                <Input
                  id="twitter"
                  type="url"
                  value={socialForm.twitter}
                  onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                  placeholder="https://twitter.com/yourhandle"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Youtube className="w-3 h-3" /> YouTube
                </Label>
                <Input
                  id="youtube"
                  type="url"
                  value={socialForm.youtube}
                  onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                  placeholder="https://youtube.com/@yourchannel"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telegram" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Send className="w-3 h-3" /> Telegram
                </Label>
                <Input
                  id="telegram"
                  type="url"
                  value={socialForm.telegram}
                  onChange={(e) => setSocialForm({ ...socialForm, telegram: e.target.value })}
                  placeholder="https://t.me/yourchannel"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <Separator className="my-6" />

              <Button
                type="submit"
                disabled={socialMutation.isPending}
                className="h-11 px-6"
              >
                {socialMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  t('admin.save_changes') || 'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              {t('admin.business_hours') || 'Часы работы'}
            </CardTitle>
            <CardDescription className="font-medium">
              Часы работы мастерской, отображаемые на сайте.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveHours} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monFri" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Понедельник — пятница
                </Label>
                <Input
                  id="monFri"
                  value={hoursForm.monFri}
                  onChange={(e) => setHoursForm({ ...hoursForm, monFri: e.target.value })}
                  placeholder="09:00 - 18:00"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="satSun" className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Суббота — воскресенье
                </Label>
                <Input
                  id="satSun"
                  value={hoursForm.satSun}
                  onChange={(e) => setHoursForm({ ...hoursForm, satSun: e.target.value })}
                  placeholder="Выходной / по договорённости"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <Separator className="my-6" />

              <Button
                type="submit"
                disabled={hoursMutation.isPending}
                className="h-11 px-6"
              >
                {hoursMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  t('admin.save_changes') || 'Save Changes'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
    </div>
  );
}