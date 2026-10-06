import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
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
import { BlogPostDialog } from '@/components/admin/BlogPostDialog';
import { Spinner } from '@/components/shared/LoadingStates';
import { useLanguage } from '@/lib/LanguageContext';
import { toast } from 'sonner';

export default function AdminBlog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog-posts'],
    queryFn: () => apiClient.get('/blog/admin/all'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success(t('admin.entry_deleted') || 'Entry deleted');
    },
    onError: () => toast.error(t('admin.delete_error') || 'Failed to delete'),
  });

  const handleDelete = (id: number) => {
    if (window.confirm(t('admin.confirm_delete') || 'Are you sure you want to delete this entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">{t('admin.blog_title')}</h1>
            <p className="text-muted-foreground">{t('admin.blog_subtitle')}</p>
          </div>
          <Button onClick={() => { setEditingPost(null); setDialogOpen(true); }} className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus size={20} className="mr-2" /> {t('admin.write_entry')}
          </Button>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <Card className="overflow-hidden border-border bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-8">{t('admin.article')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead>{t('admin.author')}</TableHead>
                  <TableHead>{t('admin.date')}</TableHead>
                  <TableHead className="text-right px-8">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post: any) => (
                  <TableRow key={post.id} className="hover:bg-muted/30">
                    <TableCell className="px-8 py-4 font-bold max-w-md truncate">
                      {post.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.publishedAt ? "default" : "secondary"} className="rounded-lg">
                        {post.publishedAt ? t('admin.published') : t('admin.draft')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{post.author}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex justify-end gap-2">
                        {post.publishedAt && (
                          <Link href={`/blog/${post.slug}`}>
                            <a target="_blank"><Button variant="ghost" size="icon" className="rounded-xl"><Eye size={18} /></Button></a>
                          </Link>
                        )}
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => handleEdit(post)}><Edit size={18} /></Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(post.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <BlogPostDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        post={editingPost} 
      />
    </div>
  );
}