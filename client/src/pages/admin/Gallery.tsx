import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  Grid3x3,
  Images,
  Eye,
  EyeOff,
  Star,
  StarOff,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/LanguageContext';
import { DualFileUploader } from '@/components/admin/DualFileUploader';
import { BatchPhotoUploader } from '@/components/admin/BatchPhotoUploader';
import { BatchEditDialog } from '@/components/admin/BatchEditDialog';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

interface GalleryItem {
  id: number;
  title: string;
  slug: string;
  description?: string;
  type: '3d' | 'photo' | 'video';
  categoryId?: number;
  mediaUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  viewCount: number;
  likes: number;
  sortOrder: number;
  metadata?: any;
}

interface GalleryCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type: '3d' | 'photo' | 'video';
  featured: boolean;
  sortOrder: number;
}

function CategoryManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    type: '3d' as '3d' | 'photo' | 'video',
    featured: false,
    sortOrder: 0,
  });

  const { data: categories } = useQuery<GalleryCategory[]>({
    queryKey: ['adminGalleryCategories'],
    queryFn: () => apiClient.get('/gallery/admin/categories'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/gallery/admin/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryCategories'] });
      toast({ title: t('admin.category_created') || 'Category created' });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.put(`/gallery/admin/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryCategories'] });
      toast({ title: t('admin.category_updated') || 'Category updated' });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/gallery/admin/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryCategories'] });
      toast({ title: t('admin.category_deleted') || 'Category deleted' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: '3d',
      featured: false,
      sortOrder: 0,
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: GalleryCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      type: category.type,
      featured: category.featured,
      sortOrder: category.sortOrder,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">{t('admin.gallery.categories')}</h2>
        <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" />
          {t('admin.gallery.add_category')}
        </Button>
      </div>

      <div className="rounded-2xl border-2 border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('admin.name')}</TableHead>
              <TableHead>{t('admin.category.type')}</TableHead>
              <TableHead>{t('admin.category.featured')}</TableHead>
              <TableHead>{t('admin.category.sort_order')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">
                    {cat.type === '3d' ? <Grid3x3 className="w-3 h-3 mr-1" /> : <Images className="w-3 h-3 mr-1" />}
                    {cat.type === '3d' ? '3D Models' : 'Photos'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {cat.featured ? (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ) : (
                    <StarOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>{cat.sortOrder}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(cat)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(cat.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingCategory ? t('admin.gallery.edit_category') : t('admin.gallery.add_category')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingCategory ? 'Update the details of this gallery category.' : 'Create a new category to organize your gallery items.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>{t('admin.name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>{t('admin.gallery.slug')}</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>{t('admin.description')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="rounded-xl"
                rows={3}
              />
            </div>
            <div>
              <Label>{t('admin.category.type')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value: '3d' | 'photo' | 'video') => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3d">3D Models</SelectItem>
                  <SelectItem value="photo">Photos</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  id="featured"
                />
                <Label htmlFor="featured">{t('admin.category.featured')}</Label>
              </div>
              <div className="flex-1">
                <Label>{t('admin.category.sort_order')}</Label>
                <Input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  className="rounded-xl"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} className="rounded-full">
              {editingCategory ? t('common.update') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ItemManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [isBatchEditOpen, setIsBatchEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: galleryData, isLoading } = useQuery({
    queryKey: ['adminGalleryItems', page],
    queryFn: () => apiClient.get<any>(`/gallery/admin/items?limit=${limit}&offset=${(page - 1) * limit}`),
  });

  const { data: categories = [] } = useQuery<GalleryCategory[]>({
    queryKey: ['adminGalleryCategories'],
    queryFn: () => apiClient.get('/gallery/admin/categories'),
  });

  const items = galleryData?.items || [];
  const total = galleryData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.post('/gallery/admin/items', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryItems'] });
      toast({ title: t('admin.gallery.item_created') || 'Item created' });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiClient.put(`/gallery/admin/items/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryItems'] });
      toast({ title: t('admin.gallery.item_updated') || 'Item updated' });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/gallery/admin/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminGalleryItems'] });
      toast({ title: t('admin.gallery.item_deleted') || 'Item deleted' });
    },
  });

  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', type: '3d' as '3d' | 'photo' | 'video',
    categoryId: null as number | null, mediaUrl: '', thumbnailUrl: '',
    tags: [] as string[], featured: false, published: true, sortOrder: 0, metadata: {},
  });
  const [tagInput, setTagInput] = useState('');

  const resetForm = () => {
    setFormData({
      title: '', slug: '', description: '', type: '3d', categoryId: null,
      mediaUrl: '', thumbnailUrl: '', tags: [], featured: false, published: true,
      sortOrder: 0, metadata: {},
    });
    setEditingItem(null);
    setTagInput('');
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title, slug: item.slug, description: item.description || '',
      type: item.type, categoryId: item.categoryId || null, mediaUrl: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl || '', tags: item.tags || [],
      featured: item.featured, published: item.published, sortOrder: item.sortOrder,
      metadata: item.metadata || {},
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    });
  };

  const addTag = () => {
    if (tagInput && !formData.tags.includes(tagInput)) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === items.length && items.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">{t('admin.gallery.items')}</h2>
        <div className="flex gap-3">
          {selectedIds.length > 0 && (
            <Button onClick={() => setIsBatchEditOpen(true)} className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 border-2 border-primary/20 shadow-lg shadow-primary/5">
              <Settings2 className="w-4 h-4 mr-2" />
              Batch Edit ({selectedIds.length})
            </Button>
          )}
          <Button onClick={() => setIsBatchDialogOpen(true)} variant="outline" className="rounded-full border-2">
            <Images className="w-4 h-4 mr-2" />
            Batch Upload
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="rounded-full">
            <Plus className="w-4 h-4 mr-2" />
            {t('admin.gallery.add_item')}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-border/40 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 px-4 text-center">
                <input 
                  type="checkbox" 
                  checked={items.length > 0 && selectedIds.length === items.length}
                  onChange={toggleSelectAll}
                  className="rounded border-primary/30 text-primary focus:ring-primary/30"
                />
              </TableHead>
              <TableHead>{t('admin.gallery.preview')}</TableHead>
              <TableHead>{t('admin.name')}</TableHead>
              <TableHead>{t('admin.category.type')}</TableHead>
              <TableHead>{t('admin.status')}</TableHead>
              <TableHead>{t('admin.gallery.stats')}</TableHead>
              <TableHead className="text-right">{t('admin.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items?.map((item) => (
              <TableRow key={item.id} className={cn("hover:bg-muted/30 transition-colors", selectedIds.includes(item.id) && "bg-primary/5")}>
                <TableCell className="px-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="rounded border-primary/30 text-primary focus:ring-primary/30"
                  />
                </TableCell>
                <TableCell>
                  <img
                    src={item.thumbnailUrl || item.mediaUrl}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full">
                    {item.type === '3d' ? '3D' : item.type === 'video' ? 'Video' : 'Photo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.published ? (
                      <Eye className="w-4 h-4 text-green-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    {item.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    <div>{item.viewCount} views</div>
                    <div>{item.likes} likes</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="bg-muted/30 px-8 py-4 flex items-center justify-between border-t border-border/40">
            <p className="text-sm text-muted-foreground font-medium">
              {t('admin.common.showing') || 'Showing'} <span className="font-bold text-foreground">{(page - 1) * limit + 1}</span>-
              <span className="font-bold text-foreground">{Math.min(page * limit, total)}</span> {t('admin.common.of') || 'of'} <span className="font-bold text-foreground">{total}</span>
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  setSelectedIds([]);
                }} 
                disabled={page === 1}
                className="rounded-xl h-9 px-4"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> {t('common.prev') || 'Prev'}
              </Button>
              <div className="flex items-center px-2 text-sm font-bold">
                {page} / {totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  setSelectedIds([]);
                }} 
                disabled={page === totalPages}
                className="rounded-xl h-9 px-4"
              >
                {t('common.next') || 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingItem ? t('admin.gallery.edit_item') : t('admin.gallery.add_item')}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {editingItem ? 'Update the details of this gallery piece.' : 'Add a new masterpiece to your gallery showcase.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>{t('admin.gallery.title')}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2">
                <Label>{t('admin.gallery.slug')}</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="col-span-2">
                <Label>{t('admin.description')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="rounded-xl"
                  rows={3}
                />
              </div>
              <div>
                <Label>{t('admin.category.type')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: '3d' | 'photo' | 'video') => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3d">3D Model</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('admin.category')}</Label>
                <Select
                  value={formData.categoryId?.toString() || 'none'}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value === 'none' ? null : parseInt(value) })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('admin.gallery.no_category')}</SelectItem>
                    {categories?.filter(c => c.type === formData.type).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <DualFileUploader
                  type={formData.type}
                  onMediaUpload={(url) => setFormData(prev => ({ ...prev, mediaUrl: url }))}
                  onThumbnailUpload={(url) => setFormData(prev => ({ ...prev, thumbnailUrl: url }))}
                  currentMediaUrl={formData.mediaUrl}
                  currentThumbnailUrl={formData.thumbnailUrl}
                />
              </div>
              <div className="col-span-2">
                <Label>{t('admin.gallery.tags')}</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="rounded-xl"
                    placeholder={t('admin.gallery.add_tag')}
                  />
                  <Button type="button" onClick={addTag} variant="outline" className="rounded-xl">
                    {t('common.add')}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-2">×</button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    id="item-featured"
                  />
                  <Label htmlFor="item-featured">{t('admin.gallery.featured')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    id="item-published"
                  />
                  <Label htmlFor="item-published">{t('admin.gallery.published')}</Label>
                </div>
                <div className="flex-1">
                  <Label>{t('admin.category.sort_order')}</Label>
                  <Input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                    className="rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} className="rounded-full">
              {editingItem ? t('common.update') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BatchPhotoUploader 
        open={isBatchDialogOpen} 
        onOpenChange={setIsBatchDialogOpen} 
      />

      <BatchEditDialog 
        open={isBatchEditOpen} 
        onOpenChange={setIsBatchEditOpen} 
        selectedIds={selectedIds}
        onSuccess={() => setSelectedIds([])}
      />
    </div>
  );
}

export default function AdminGalleryPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl font-bold mb-2">{t('admin.gallery.title')}</h1>
        <p className="text-muted-foreground">{t('admin.gallery.subtitle')}</p>
      </div>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 rounded-full bg-muted/50 p-1">
          <TabsTrigger value="items" className="rounded-full font-bold">
            <FolderOpen className="w-4 h-4 mr-2" />
            {t('admin.gallery.items')}
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-full font-bold">
            <Grid3x3 className="w-4 h-4 mr-2" />
            {t('admin.gallery.categories')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-8">
          <ItemManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-8">
          <CategoryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}