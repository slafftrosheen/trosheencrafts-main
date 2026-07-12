import { useCurrentUser } from '@/hooks/useApi';
import { 
  Package, 
  ShoppingCart, 
  MessageSquare, 
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminDashboard() {
  const { data: user } = useCurrentUser();
  const { t } = useLanguage();

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => apiClient.get<any>('/admin/stats'),
    enabled: !!user && user.role === 'admin'
  });

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-5xl font-serif font-bold tracking-tight mb-2">
          {t('admin.analytics_title').split(' ').slice(0, -1).join(' ')}{' '}
          <span className="text-primary italic">{t('admin.analytics_title').split(' ').slice(-1)}</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium">{t('admin.analytics_subtitle')}</p>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'admin.live_artefacts', val: stats?.products || 0, icon: Package },
          { label: 'admin.total_orders', val: stats?.orders || 0, icon: ShoppingCart },
          { label: 'admin.new_messages', val: stats?.unreadMessages || 0, icon: MessageSquare },
          { label: 'admin.journal_posts', val: stats?.blogPosts || 0, icon: BookOpen },
        ].map((stat, i) => (
          <Card key={i} className="rounded-[2.5rem] border-2 border-border/40 bg-card/40 shadow-xl overflow-hidden relative group hover:border-primary/20 transition-all">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">{t(stat.label)}</CardTitle>
              <stat.icon size={16} className="text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-serif font-bold tracking-tighter">{stat.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
