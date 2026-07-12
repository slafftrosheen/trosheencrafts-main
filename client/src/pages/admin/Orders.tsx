import { useState } from 'react';
import { Eye, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { Spinner } from '@/components/shared/LoadingStates';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/LanguageContext';

const statusColors = {
  pending: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
} as const;

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => apiClient.get('/orders'),
  });

  return (
    <div className="space-y-8">
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold">{t('admin.orders_title')}</h1>
          <p className="text-muted-foreground">{t('admin.orders_subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : orders.length > 0 ? (
          <Card className="rounded-[2.5rem] border-2 border-border/40 overflow-hidden bg-card/40 shadow-xl">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-8">{t('admin.order_id')}</TableHead>
                  <TableHead>{t('admin.customer')}</TableHead>
                  <TableHead>{t('admin.artefacts')}</TableHead>
                  <TableHead>{t('admin.total')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead className="text-right px-8">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order.id} className="hover:bg-muted/30">
                    <TableCell className="px-8 font-mono text-xs font-bold text-primary">#{order.id}</TableCell>
                    <TableCell>
                      <div className="font-bold">{order.shippingAddress?.name || 'Guest'}</div>
                      <div className="text-xs text-muted-foreground">{order.shippingAddress?.country}</div>
                    </TableCell>
                    <TableCell className="text-sm">{t('shop.items')}</TableCell>
                    <TableCell className="font-serif font-bold">€{(order.totalAmount / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[order.status as keyof typeof statusColors] || 'default'} className="rounded-lg capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <Button variant="ghost" size="icon" className="rounded-xl"><Eye size={18} /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="text-center py-32 bg-card/40 rounded-[3rem] border-2 border-dashed border-border/60">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-serif font-bold text-muted-foreground">{t('admin.no_orders')}</h3>
          </div>
        )}
      </div>
    </div>
  );
}
