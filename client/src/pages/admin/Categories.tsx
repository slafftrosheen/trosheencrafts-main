import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Loader2, AlertCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useCurrentUser, Product } from '@/hooks/useApi';

interface Category {
  name: string;
  slug: string;
  count?: number;
}

export default function Categories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [, navigate] = useLocation();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    if (!userLoading && (!user || user.role !== 'admin')) {
      navigate('/admin/login');
    }
  }, [user, userLoading, navigate]);

  // Fetch categories
  const { data: categories, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      return apiClient.get<Category[]>('/categories');
    },
    enabled: !!user && user.role === 'admin',
    retry: 2,
  });

  // Get products to count by category
  const { data: products } = useQuery({
    queryKey: ['products-for-categories'],
    queryFn: async () => {
      return apiClient.get<Product[]>('/products');
    },
    enabled: !!user && user.role === 'admin',
  });

  // Calculate category counts using a Map for better performance
  const productCountsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    if (products) {
      products.forEach(p => {
        if (p.category) {
          const key = p.category;
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      });
    }
    return counts;
  }, [products]);

  const categoriesWithCount = categories?.map(cat => ({
    ...cat,
    count: productCountsByCategory.get(cat.slug) || productCountsByCategory.get(cat.name) || 0,
  })) || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      if (editingCategory) {
        const slug = editingCategory.toLowerCase().replace(/\s+/g, '-');
        await apiClient.put(`/categories/${slug}`, { name });
        toast.success(`Category renamed to "${name}"`);
      } else {
        await apiClient.post('/categories', { name });
        toast.success(`Category "${name}" created. Add products to populate it.`);
      }
      refetch();
      setIsDialogOpen(false);
      setEditingCategory(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryName: string) => {
    if (window.confirm(`Delete category "${categoryName}"? All products in this category will become uncategorized.`)) {
      try {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        await apiClient.delete(`/categories/${slug}`);
        toast.success(`Category "${categoryName}" deleted`);
        refetch();
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete category');
      }
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/40 p-8">
        <Card className="p-8 text-center rounded-[2.5rem] border-2 border-border/40">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Categories</h2>
          <p className="text-muted-foreground mb-4">
            {(error as any)?.message || 'Failed to load categories'}
          </p>
          <Button onClick={() => refetch()} className="rounded-2xl">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">
              Product <span className="text-primary italic">Categories</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage product categories
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => setEditingCategory(null)}
                className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-2 border-border/40">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editingCategory ? 'Update category name.' : 'Add a new category for your artefacts.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold uppercase tracking-widest text-xs">
                    Category Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Planters, Decor"
                    defaultValue={editingCategory || ''}
                    className="rounded-xl border-2 focus:border-primary/40 h-12"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="rounded-xl">
                    {editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Category Stats */}
        <Card className="rounded-xl border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Categories
            </CardTitle>
            <Tag className="h-5 w-5 text-primary opacity-60" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-serif">{categoriesWithCount.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Categories are auto-generated from products
            </p>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card className="overflow-hidden border-border bg-card shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="px-6">Category Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesWithCount.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                      No categories found. Add products with categories to auto-generate.
                    </TableCell>
                  </TableRow>
                ) : (
                  categoriesWithCount.map((category) => (
                    <TableRow key={category.slug} className="hover:bg-muted/30">
                      <TableCell className="px-6 font-medium">{category.name}</TableCell>
                      <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                      <TableCell>{category.count} products</TableCell>
                      <TableCell className="text-right px-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl"
                          onClick={() => {
                            setEditingCategory(category.name);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(category.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Help Section */}
        <Card className="rounded-xl border-border bg-card shadow-sm p-6">
          <h3 className="font-serif text-xl font-bold mb-3">How Categories Work</h3>
          <p className="text-muted-foreground text-sm">
            Categories are automatically generated from the products in your catalog. 
            To add a new category, create a product and assign it to the desired category name. 
            Categories with no products will be automatically removed.
          </p>
        </Card>
      </div>
    </div>
  );
}
