import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Loader2, Sparkles, Droplets, Wind, Package } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface NameTranslations {
  en: string;
  lv?: string;
  ru?: string;
  pl?: string;
  uk?: string;
}

interface DescTranslations {
  en?: string;
  lv?: string;
  ru?: string;
  pl?: string;
  uk?: string;
}

interface ConstructorOption {
  id: number;
  type: string;
  key: string;
  nameTranslations: NameTranslations;
  descTranslations: DescTranslations;
  price: string;
  color: string | null;
  border: string | null;
  imageUrl: string | null;
  active: boolean;
  sortOrder: number;
}

const optionTypeLabels: Record<string, string> = {
  vessel: "Сосуды",
  finish: "Отделка",
  wax: "Воск",
  aroma: "Ароматы",
};

const optionTypeSingular: Record<string, string> = {
  vessel: "сосуд",
  finish: "вариант отделки",
  wax: "вариант воска",
  aroma: "аромат",
};

const optionTypeGenitive: Record<string, string> = {
  vessel: "сосудов",
  finish: "вариантов отделки",
  wax: "вариантов воска",
  aroma: "ароматов",
};

export default function ConstructorConfig() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('finish');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<ConstructorOption | null>(null);

  const { data: options = [], isLoading } = useQuery<ConstructorOption[]>({
    queryKey: ['adminConstructorOptions'],
    queryFn: () => apiClient.get<ConstructorOption[]>('/constructor-options/admin'),
  });

  const [formData, setFormData] = useState<Partial<ConstructorOption>>({
    type: 'finish',
    key: '',
    nameTranslations: { en: '', lv: '', ru: '', pl: '', uk: '' },
    descTranslations: { en: '', lv: '', ru: '', pl: '', uk: '' },
    price: '0.00',
    color: '',
    border: '',
    imageUrl: '',
    active: true,
    sortOrder: 0,
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<ConstructorOption>) => apiClient.post('/constructor-options/admin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConstructorOptions'] });
      queryClient.invalidateQueries({ queryKey: ['constructorOptions'] });
      toast.success('Опция создана');
      setIsDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message || 'Не удалось создать опцию'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ConstructorOption> }) => 
      apiClient.put(`/constructor-options/admin/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConstructorOptions'] });
      queryClient.invalidateQueries({ queryKey: ['constructorOptions'] });
      toast.success('Опция обновлена');
      setIsDialogOpen(false);
    },
    onError: (error: any) => toast.error(error.message || 'Не удалось обновить опцию'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/constructor-options/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminConstructorOptions'] });
      queryClient.invalidateQueries({ queryKey: ['constructorOptions'] });
      toast.success('Опция удалена');
    },
    onError: (error: any) => toast.error(error.message || 'Не удалось удалить опцию'),
  });

  const openDialog = (type: string, option?: ConstructorOption) => {
    if (option) {
      setEditingOption(option);
      setFormData({
        ...option,
        nameTranslations: { en: '', lv: '', ru: '', pl: '', uk: '', ...option.nameTranslations },
        descTranslations: { en: '', lv: '', ru: '', pl: '', uk: '', ...(option.descTranslations || {}) }
      });
    } else {
      setEditingOption(null);
      setFormData({
        type,
        key: '',
        nameTranslations: { en: '', lv: '', ru: '', pl: '', uk: '' },
        descTranslations: { en: '', lv: '', ru: '', pl: '', uk: '' },
        price: '0.00',
        color: type === 'finish' ? '#cccccc' : '',
        border: type === 'finish' ? '#999999' : '',
        imageUrl: type === 'vessel' ? '' : null,
        active: true,
        sortOrder: 0,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOption) {
      updateMutation.mutate({ id: editingOption.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const renderOptionsTable = (type: string) => {
    const filteredOptions = options.filter(o => o.type === type).sort((a, b) => a.sortOrder - b.sortOrder);
    
    if (isLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (filteredOptions.length === 0) {
      return (
        <div className="text-center p-12 bg-muted/20 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground mb-4">Пока нет настроенных {optionTypeGenitive[type] || type}.</p>
          <Button onClick={() => openDialog(type)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить {optionTypeSingular[type] || type}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredOptions.map((option) => (
          <div key={option.id} className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-4">
              {type === 'vessel' && option.imageUrl && (
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-muted/20 rounded-xl overflow-hidden">
                  <img src={option.imageUrl} alt={option.key} className="w-full h-full object-contain" />
                </div>
              )}
              {type === 'finish' && (
                <div 
                  className="w-12 h-12 rounded-full shadow-inner flex-shrink-0"
                  style={{ 
                    background: option.color || '#ccc',
                    border: option.border ? `2px solid ${option.border}` : 'none'
                  }}
                />
              )}
              <div>
                <h4 className="font-bold">{option.nameTranslations.en} <span className="text-muted-foreground text-sm font-normal">({option.key})</span></h4>
                <div className="flex gap-2 mt-1">
                  <span className={`text-[11px] uppercase font-semibold px-2 py-0.5 rounded-full ${option.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {option.active ? 'Активна' : 'Отключена'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">+{option.price}€</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => openDialog(type, option)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => {
                if (window.confirm('Удалить эту опцию?')) {
                  deleteMutation.mutate(option.id);
                }
              }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-serif font-bold tracking-tight mb-2">
            Настройки <span className="text-primary italic">конструктора</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Управляйте сосудами, отделкой, воском и ароматами для конструктора свечей.
          </p>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card border border-border p-1 rounded-2xl mb-8 flex w-full max-w-2xl">
          <TabsTrigger value="vessel" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Package className="w-4 h-4" /> Vessels
          </TabsTrigger>
          <TabsTrigger value="finish" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Sparkles className="w-4 h-4" /> Finishes
          </TabsTrigger>
          <TabsTrigger value="wax" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Droplets className="w-4 h-4" /> Waxes
          </TabsTrigger>
          <TabsTrigger value="aroma" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
            <Wind className="w-4 h-4" /> Aromas
          </TabsTrigger>
        </TabsList>

        <Card className="overflow-hidden border-border bg-card shadow-sm">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-serif text-2xl capitalize">{optionTypeLabels[activeTab] || activeTab}</CardTitle>
              <CardDescription className="font-medium">
                Настройте доступные {optionTypeGenitive[activeTab] || activeTab} и переводы.
              </CardDescription>
            </div>
            <Button onClick={() => openDialog(activeTab)} className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Добавить {optionTypeSingular[activeTab] || activeTab}
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            {renderOptionsTable(activeTab)}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">
              {editingOption ? 'Редактировать опцию' : 'Добавить опцию'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Внутренний ключ (уникальный)</Label>
                <Input 
                  value={formData.key} 
                  onChange={e => setFormData({...formData, key: e.target.value})} 
                  placeholder="например: white-stone"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Доплата (€)</Label>
                <Input 
                  type="number" step="0.01" 
                  value={formData.price} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  required
                />
              </div>
            </div>
            
            {formData.type === 'vessel' && (
              <div className="space-y-2 p-4 bg-muted/30 rounded-2xl border border-border">
                <Label>URL изображения</Label>
                <Input 
                  value={formData.imageUrl || ''} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                  placeholder="например: /images/vessel.png"
                  required
                />
              </div>
            )}

            {formData.type === 'finish' && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-2xl border border-border">
                <div className="space-y-2">
                  <Label>Цвет (Hex или CSS)</Label>
                  <Input 
                    value={formData.color || ''} 
                    onChange={e => setFormData({...formData, color: e.target.value})} 
                    placeholder="#ffffff или linear-gradient(...)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Цвет границы (необязательно)</Label>
                  <Input 
                    value={formData.border || ''} 
                    onChange={e => setFormData({...formData, border: e.target.value})} 
                    placeholder="#cccccc"
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2">Переводы названия</h3>
              {['en', 'lv', 'ru', 'pl', 'uk'].map(lang => (
                <div key={`name-${lang}`} className="grid grid-cols-[50px_1fr] items-center gap-2">
                  <Label className="uppercase font-bold text-muted-foreground">{lang}</Label>
                  <Input 
                    value={formData.nameTranslations?.[lang as keyof NameTranslations] || ''} 
                    onChange={e => setFormData({
                      ...formData, 
                      nameTranslations: { ...formData.nameTranslations!, [lang]: e.target.value }
                    })} 
                    required={lang === 'en'}
                    placeholder={`Название на ${lang.toUpperCase()}`}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-bold border-b pb-2">Переводы описания (необязательно)</h3>
              {['en', 'lv', 'ru', 'pl', 'uk'].map(lang => (
                <div key={`desc-${lang}`} className="grid grid-cols-[50px_1fr] items-center gap-2">
                  <Label className="uppercase font-bold text-muted-foreground">{lang}</Label>
                  <Input 
                    value={formData.descTranslations?.[lang as keyof DescTranslations] || ''} 
                    onChange={e => setFormData({
                      ...formData, 
                      descTranslations: { ...formData.descTranslations!, [lang]: e.target.value }
                    })} 
                    placeholder={`Описание на ${lang.toUpperCase()}`}
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted/30 rounded-2xl border border-border">
              <Switch 
                id="active" 
                checked={formData.active} 
                onCheckedChange={checked => setFormData({...formData, active: checked})} 
              />
              <Label htmlFor="active" className="font-bold cursor-pointer">Опция активна и видна покупателям</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Отмена</Button>
              <Button type="submit" className="rounded-xl shadow-lg shadow-primary/20" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Сохранить опцию
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
