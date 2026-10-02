import { useState } from "react";
import { Plus, Edit, Trash2, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useProducts } from "@/hooks/useApi";
import { ProductDialog } from "@/components/admin/ProductDialog";
import { Spinner } from "@/components/shared/LoadingStates";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";

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
    mutationFn: (id: number) => apiClient.delete("/products/" + id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(t("admin.artefact_updated"));
    },
    onError: (mutationError: any) => {
      toast.error(mutationError?.message || t("common.error"));
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
      <Card className="p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive" />
        <h2 className="text-xl font-semibold text-destructive">{t("common.error")}</h2>
        <p className="mt-2 text-muted-foreground">
          {(error as any)?.message || t("admin.login_error")}
        </p>
        <Button onClick={() => refetch()} className="mt-5">
          {t("common.try_again")}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-4xl font-semibold tracking-tight">{t("admin.products_title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("admin.products_subtitle")}</p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {t("admin.add_artefact")}
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <Card className="overflow-hidden border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-6">{t("admin.item")}</TableHead>
                <TableHead>{t("admin.category")}</TableHead>
                <TableHead>{t("admin.price")}</TableHead>
                <TableHead>{t("admin.stock")}</TableHead>
                <TableHead className="px-6 text-right">{t("admin.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    {t("shop.no_items")}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="px-6 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-xl bg-muted">
                          {product.image ? (
                            <img src={product.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        {product.name}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>€{Number(product.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          product.inStock
                            ? "bg-primary/10 text-primary"
                            : "bg-destructive/10 text-destructive"
                        )}
                      >
                        {product.inStock ? t("admin.in_stock") : t("admin.out_of_stock")}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
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

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
      />
    </div>
  );
}
