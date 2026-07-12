import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCurrentUser } from '@/hooks/useApi';
import { useLanguage } from '@/lib/LanguageContext';
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
  const { t } = useLanguage();
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
      toast.success(t('admin.settings_saved') || 'Contact settings saved');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update contact'),
  });

  const socialMutation = useMutation({
    mutationFn: (data: typeof socialForm) => apiClient.put('/site-config/admin/social', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminSiteConfig'] });
      toast.success(t('admin.settings_saved') || 'Social settings saved');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update social'),
  });

  const hoursMutation = useMutation({
    mutationFn: (data: typeof hoursForm) => apiClient.put('/site-config/admin/business-hours', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteConfig'] });
      queryClient.invalidateQueries({ queryKey: ['adminSiteConfig'] });
      toast.success(t('admin.settings_saved') || 'Business hours saved');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to update hours'),
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
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">
            {t('admin.site_config') || 'Site Config'} <span className="text-primary italic">&amp; {t('nav.settings') || 'Settings'}</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium">
            Manage your store configuration, contact info, and social links
          </p>
        </header>

        {/* Contact Information */}
        <Card className="rounded-[2.5rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden relative group hover:border-primary/20 transition-all">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              {t('admin.contact_info') || 'Contact Info'}
            </CardTitle>
            <CardDescription className="font-medium">
              This information is displayed across all website pages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSaveContact} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email Address
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
                <Label htmlFor="phone" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Phone Number
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
                <Label htmlFor="address" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Address / Location
                </Label>
                <Input
                  id="address"
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                  placeholder="Daugavpils, Latvia"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <Separator className="my-6 opacity-40" />

              <Button
                type="submit"
                disabled={contactMutation.isPending}
                className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
              >
                {contactMutation.isPending ? (
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

        {/* Social Links */}
        <Card className="rounded-[2.5rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden relative group hover:border-primary/20 transition-all">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Instagram className="w-6 h-6 text-primary" />
              {t('admin.social_links') || 'Social Links'}
            </CardTitle>
            <CardDescription className="font-medium">
              Social media links displayed in footer and contact pages
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSaveSocial} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="facebook" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
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
                <Label htmlFor="instagram" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
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
                <Label htmlFor="twitter" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
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
                <Label htmlFor="youtube" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
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
                <Label htmlFor="telegram" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
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

              <Separator className="my-6 opacity-40" />

              <Button
                type="submit"
                disabled={socialMutation.isPending}
                className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
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
        <Card className="rounded-[2.5rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden relative group hover:border-primary/20 transition-all">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="font-serif text-2xl flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              {t('admin.business_hours') || 'Business Hours'}
            </CardTitle>
            <CardDescription className="font-medium">
              Your workshop hours displayed on the website
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSaveHours} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="monFri" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Monday - Friday
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
                <Label htmlFor="satSun" className="font-bold uppercase tracking-widest text-[10px] ml-1 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Saturday - Sunday
                </Label>
                <Input
                  id="satSun"
                  value={hoursForm.satSun}
                  onChange={(e) => setHoursForm({ ...hoursForm, satSun: e.target.value })}
                  placeholder="Family Time"
                  className="rounded-xl border-2 focus:border-primary/40 h-12"
                />
              </div>

              <Separator className="my-6 opacity-40" />

              <Button
                type="submit"
                disabled={hoursMutation.isPending}
                className="rounded-2xl h-12 px-8 font-bold shadow-lg shadow-primary/20"
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
    </div>
  );
}