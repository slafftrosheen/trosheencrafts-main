import { MessageSquare, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function AdminMessages() {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: () => apiClient.get('/contact/admin/all'),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      apiClient.patch(`/contact/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      toast.success(t("admin.common.update"));
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <header className="mb-8">
          <h1 className="text-3xl font-serif font-bold">{t('admin.messages_title')}</h1>
          <p className="text-muted-foreground">{t('admin.messages_subtitle')}</p>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : messages.length > 0 ? (
          <Card className="rounded-[2.5rem] border-2 border-border/40 overflow-hidden bg-card/40 shadow-xl">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-8">{t('admin.sender')}</TableHead>
                  <TableHead>{t('admin.subject')}</TableHead>
                  <TableHead>{t('admin.message')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead className="text-right px-8">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((msg: any) => (
                  <TableRow key={msg.id} className="hover:bg-muted/30">
                    <TableCell className="px-8">
                      <div className="font-bold">{msg.name}</div>
                      <div className="text-xs text-muted-foreground">{msg.email}</div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">{msg.subject}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm italic">"{msg.message}"</TableCell>
                    <TableCell>
                      <Badge variant={msg.status === 'new' ? 'default' : 'secondary'} className="rounded-lg capitalize">
                        {msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        {msg.status === 'new' && (
                          <Button variant="ghost" size="icon" className="rounded-xl text-primary" onClick={() => mutation.mutate({ id: msg.id, status: 'read' })}><CheckCircle2 size={18} /></Button>
                        )}
                        <a href={`mailto:${msg.email}`}><Button variant="ghost" size="icon" className="rounded-xl"><Mail size={18} /></Button></a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="text-center py-32 bg-card/40 rounded-[3rem] border-2 border-dashed border-border/60">
            <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
            <h3 className="text-2xl font-serif font-bold text-muted-foreground">{t('admin.inbox_empty')}</h3>
          </div>
        )}
      </div>
    </div>
  );
}