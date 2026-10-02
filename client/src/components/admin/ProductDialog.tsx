import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { toast } from "sonner";
import { useLanguage } from "@/lib/LanguageContext";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive(),
  category: z.string().min(1, "Category is required"),
  image: z.string().optional(),
  stock: z.coerce.number().int().min(0).default(1),
  inStock: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export function ProductDialog({
  open,
  onOpenChange,
  product,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: any;
}) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const isEditing = !!product;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { inStock: true, stock: 1 },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name || "",
        description: product.description || "",
        price: Number(product.price) || 0,
        category: product.category || "",
        image: product.image || product.images?.[0] || "",
        stock: Number(product.stock ?? 0),
        inStock: product.inStock !== false,
      });
    } else {
      reset({
        name: "",
        description: "",
        price: 0,
        category: "",
        image: "",
        stock: 1,
        inStock: true,
      });
    }
  }, [product, reset]);

  const inStock = watch("inStock");

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        price: data.price,
        stock: data.inStock ? data.stock : 0,
      };

      return isEditing
        ? apiClient.put("/products/" + product.id, payload)
        : apiClient.post("/products", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-products"] });
      toast.success(isEditing ? t("admin.artefact_updated") : t("admin.artefact_added"));
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || t("common.error"));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-semibold">
            {isEditing ? t("admin.edit_artefact") : t("admin.add_artefact")}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isEditing ? "Update the catalogue piece." : "Add a new piece to the catalogue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="mt-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>{t("admin.name")}</Label>
                <Input {...register("name")} className="h-11 rounded-xl" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t("admin.price")} (€)</Label>
                <Input type="number" min="0.01" step="0.01" {...register("price")} className="h-11 rounded-xl" />
                {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>{t("admin.category")}</Label>
                <Input {...register("category")} className="h-11 rounded-xl" />
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Stock quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  {...register("stock")}
                  className="h-11 rounded-xl"
                  disabled={!inStock}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("admin.image")}</Label>
              <ImageUpload
                value={watch("image")}
                onChange={(url) => setValue("image", url)}
                onRemove={() => setValue("image", "")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("admin.description")}</Label>
            <Textarea {...register("description")} className="min-h-[120px] rounded-xl p-4" />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
            <div>
              <Label>{t("admin.stock")}</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Turning this off sets the available stock to zero.
              </p>
            </div>
            <Switch
              checked={inStock}
              onCheckedChange={(value) => setValue("inStock", value)}
            />
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEditing ? (
              t("admin.update_artefact")
            ) : (
              t("admin.create_artefact")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
