import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Download, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function NewsletterSubscribersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const res = await fetch('/api/newsletter/subscribers');
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      return res.json();
    },
  });

  const exportSubscribers = () => {
    if (!data?.subscribers) return;
    
    const csv = [
      ['Email', 'Subscribed At', 'Source', 'Status'].join(','),
      ...data.subscribers.map((sub: any) =>
        [
          sub.email,
          new Date(sub.subscribedAt).toLocaleDateString(),
          sub.source,
          sub.isActive ? 'Active' : 'Unsubscribed'
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) return <div className="p-8">Loading...</div>;

  const activeCount = data?.subscribers?.filter((s: any) => s.isActive).length || 0;
  const totalCount = data?.subscribers?.length || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold mb-2">Newsletter Subscribers</h1>
        <p className="text-muted-foreground">Manage your email subscriber list</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-card border-2 border-border/40"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalCount}</p>
              <p className="text-sm text-muted-foreground">Total Subscribers</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-2xl bg-card border-2 border-border/40"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-card border-2 border-border/40"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
              <UserX className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold">{totalCount - activeCount}</p>
              <p className="text-sm text-muted-foreground">Unsubscribed</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Subscriber List</h2>
        <Button onClick={exportSubscribers} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <div className="rounded-2xl border-2 border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.subscribers?.map((subscriber: any) => (
              <TableRow key={subscriber.id}>
                <TableCell className="font-medium">{subscriber.email}</TableCell>
                <TableCell>
                  {new Date(subscriber.subscribedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="capitalize">{subscriber.source}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${subscriber.isActive
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {subscriber.isActive ? (
                      <>
                        <UserCheck className="w-3 h-3" /> Active
                      </>
                    ) : (
                      <>
                        <UserX className="w-3 h-3" /> Unsubscribed
                      </>
                    )}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
