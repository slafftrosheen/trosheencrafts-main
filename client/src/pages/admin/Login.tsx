import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/LanguageContext";
import { BrandAssets } from "@/lib/imageAssets";
import { apiClient } from "@/lib/apiClient";
import type { User } from "@/hooks/useApi";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: (data: typeof formData) => apiClient.post<User>("/auth/login", data),
    onSuccess: (user) => {
      queryClient.setQueryData(["currentUser"], user);
      toast.success(t("admin.login_success"));
      setLocation("/admin");
    },
    onError: (error: any) => {
      toast.error(error?.message || t("admin.login_error"));
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-5">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <img src={BrandAssets.logo} alt="Trosheen Crafts" className="h-12 w-12 object-contain" />
          <div>
            <p className="font-serif text-xl font-semibold">Trosheen.Crafts</p>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Workshop admin
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-3 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="font-serif text-3xl font-semibold">{t("admin.login_title")}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">{t("admin.login_subtitle")}</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t("admin.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("admin.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loginMutation.isPending ? t("admin.logging_in") : t("admin.login_button")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Administrative access only · trosheen.shop
        </p>
      </div>
    </div>
  );
}
