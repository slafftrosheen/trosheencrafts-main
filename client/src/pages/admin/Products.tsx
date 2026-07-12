import { useState } from 'react';
import { Plus, Edit, Trash2, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProducts } from '@/hooks/useApi';
import { ProductDialog } from '@/components/admin/ProductDialog';
import { Spinner } from '@/components/shared/LoadingStates';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/LanguageContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function AdminProducts() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const { data: products = [], isLoading, error, refetch } = useProducts({
    retry: 3,
    retryDelay: 1000,
  });
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t("admin.artefact_updated"));
    },
    onError: (error: any) => {
      toast.error(error?.message || t("common.error"));
    },
  });

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("common.delete") + "?")) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-muted/40 flex">
        <div className="flex-1 p-8">
          <Card className="p-8 text-center rounded-[2.5rem] border-2 border-border/40">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-2">{t("common.error")}</h2>
            <p className="text-muted-foreground mb-4">
              {(error as any)?.message || t("admin.login_error")}
            </p>
            <Button onClick={() => refetch()} className="rounded-2xl">
              {t("common.try_again")}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold">{t('admin.products_title')}</h1>
            <p className="text-muted-foreground">{t('admin.products_subtitle')}</p>
          </div>
          <Button onClick={() => { setEditingProduct(null); setDialogOpen(true); }} className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
            <Plus size={20} className="mr-2" /> {t('admin.add_artefact')}
          </Button>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : (
          <Card className="rounded-[2.5rem] border-2 border-border/40 overflow-hidden bg-card/40 shadow-xl">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-8">{t('admin.item')}</TableHead>
                  <TableHead>{t('admin.category')}</TableHead>
                  <TableHead>{t('admin.price')}</TableHead>
                  <TableHead>{t('admin.stock')}</TableHead>
                  <TableHead className="text-right px-8">{t('admin.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      {t("shop.no_items")}
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/30">
                      <TableCell className="px-8 font-medium">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden">
                            {product.image ? <img src={product.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20} className="text-muted-foreground" /></div>}
                          </div>
                          {product.name}
                        </div>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>€{(Number(product.price) / 100).toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={cn("px-2 py-1 rounded-full text-xs font-bold", product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          {product.inStock ? t('admin.in_stock') : t('admin.out_of_stock')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => handleEdit(product)}><Edit size={18} /></Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <ProductDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        product={editingProduct} 
      />
    </div>
  );
}
