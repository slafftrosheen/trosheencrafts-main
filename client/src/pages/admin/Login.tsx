import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { BrandAssets } from '@/lib/imageAssets';
import { apiClient } from '@/lib/apiClient';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const loginMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return apiClient.post('/auth/login', data);
    },
    onSuccess: () => {
      toast.success(t('admin.login_success'));
      setLocation('/admin');
    },
    onError: () => {
      toast.error(t('admin.login_error'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 selection:bg-primary/20">
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 noise" />
      
      <Card className="w-full max-w-md relative z-10 rounded-[3rem] border-2 border-border/40 bg-card/40 shadow-2xl overflow-hidden">
        <CardHeader className="text-center p-10 pb-4">
          <div className="w-24 h-24 mx-auto mb-6">
            <img 
              src={BrandAssets.logo} 
              alt="Trosheen Crafts Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <CardTitle className="text-4xl font-serif font-bold tracking-tight">
            {t("admin.login_title").split(' ').map((word, i) => (
              <span key={i} className={i === 1 ? "text-primary italic" : ""}>{word} </span>
            ))}
          </CardTitle>
          <p className="text-muted-foreground mt-2 font-medium">{t('admin.login_subtitle')}</p>
        </CardHeader>
        <CardContent className="p-10 pt-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold uppercase tracking-widest text-[10px] ml-1">{t('admin.email')}</Label>
              <Input
                id="email"
                type="email"
                required
                className="h-12 rounded-xl border-2 focus:border-primary/40"
                placeholder="admin@trosheen.shop"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold uppercase tracking-widest text-[10px] ml-1">{t('admin.password')}</Label>
              <Input
                id="password"
                type="password"
                className="h-12 rounded-xl border-2 focus:border-primary/40"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? t('admin.logging_in') : t('admin.login_button')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}