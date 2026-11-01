import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Copy, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { SumupAdminSettings, SumupDraft, SumupMerchant, SumupTestCheckout } from '../../../../shared/sumup';

const endpoint = '/admin/sumup';
const queryKey = ['admin-sumup'];
const time = (value: string) => new Date(value).toLocaleString('ru-RU', { timeZone: 'Europe/Riga' });

export function SumupSettings() {
  const [reloadKey, setReloadKey] = useState(0);
  const query = useQuery<SumupAdminSettings>({ queryKey, queryFn: () => apiClient.get<SumupAdminSettings>(endpoint), retry: 1, refetchOnWindowFocus: false });
  return (
    <Card id="sumup" className="scroll-mt-24 overflow-hidden border-border bg-card shadow-sm">
      <CardHeader className="p-6">
        <CardTitle className="flex items-center gap-3 font-serif text-2xl"><CreditCard className="h-6 w-6 text-primary" /> SumUp · Оплата на сайте</CardTitle>
        <CardDescription className="text-base leading-relaxed">Подключение оплаты картой через защищённую страницу SumUp. Это настройка интернет-магазина, не привязка физического терминала.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-6 pt-0">
        {query.isLoading && <p role="status" className="flex items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Загружаем настройки оплаты…</p>}
        {query.isError && <div role="alert" className="space-y-3 rounded-xl border border-destructive/40 p-4">
          <p>Настройки недоступны. {query.error.message}</p>
          <Button type="button" variant="outline" onClick={() => void query.refetch()}>Повторить загрузку</Button>
        </div>}
        {query.data && <SumupForm key={`${query.data.version}:${reloadKey}`} settings={query.data} reload={() => { void query.refetch().then((result) => { if (!result.isError) setReloadKey((key) => key + 1); }); }} />}
      </CardContent>
    </Card>
  );
}
function SumupForm({ settings, reload }: { settings: SumupAdminSettings; reload: () => void }) {
  const client = useQueryClient();
  const [form, setForm] = useState<SumupDraft>({ expectedVersion: settings.version, apiKey: '',
    merchantCode: settings.merchantCode, siteUrl: settings.siteUrl, descriptionPrefix: settings.descriptionPrefix });
  const [probe, setProbe] = useState<SumupMerchant | null>(null);
  const [problem, setProblem] = useState('');
  const [confirm, setConfirm] = useState<'enable' | 'disable' | 'sandbox' | 'reload' | null>(null);
  const [testCheckout, setTestCheckout] = useState<SumupTestCheckout | null>(null);
  const dirty = Boolean(form.apiKey?.trim() || form.merchantCode !== settings.merchantCode || form.siteUrl !== settings.siteUrl || form.descriptionPrefix !== settings.descriptionPrefix);
  const changed = (key: 'apiKey' | 'merchantCode' | 'siteUrl' | 'descriptionPrefix', value: string) => {
    setForm((old) => ({ ...old, [key]: value })); setProbe(null); setProblem('');
  };
  const onError = (error: Error) => { setConfirm(null); setProblem(error.message || 'Не удалось выполнить действие.'); };
  const saved = (data: SumupAdminSettings) => {
    client.setQueryData(queryKey, data);
    void client.invalidateQueries({ queryKey: ['sumup-availability'] });
  };
  const check = useMutation({ mutationFn: () => apiClient.post<SumupMerchant>(endpoint + '/check', form),
    onSuccess: (result) => { setProbe(result); setProblem(''); }, onError });
  const save = useMutation({ mutationFn: () => apiClient.put<SumupAdminSettings>(endpoint, form),
    onSuccess: (result) => { saved(result); toast.success('Настройки сохранены. Для запуска магазина отдельно включите оплату.'); }, onError });
  const toggle = useMutation({ mutationFn: (enabled: boolean) => apiClient.patch<SumupAdminSettings>(endpoint + '/enabled', { enabled, expectedVersion: settings.version, confirm: true }),
    onSuccess: (result) => { saved(result); toast.success(result.enabled ? 'Приём новых платежей включён' : 'Приём новых платежей выключен'); }, onError });
  const sandbox = useMutation({ mutationFn: () => apiClient.post<SumupTestCheckout>(endpoint + '/sandbox-checkouts', { expectedVersion: settings.version, confirm: true }),
    onSuccess: (result) => { setTestCheckout(result); setConfirm(null); setProblem(''); }, onError });
  const checkTest = useMutation({ mutationFn: (id: string) => apiClient.get<SumupTestCheckout>(endpoint + '/sandbox-checkouts/' + encodeURIComponent(id)),
    onSuccess: (result) => { setTestCheckout(result); setProblem(''); }, onError });
  const busy = check.isPending || save.isPending || toggle.isPending || sandbox.isPending || checkTest.isPending;
  const profile = probe || settings.profile;
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); toast.success('Адрес скопирован'); }
    catch { toast.error('Выделите адрес и скопируйте вручную.'); }
  };
  const confirmAction = () => {
    setProblem('');
    if (confirm === 'reload') { setConfirm(null); reload(); return; }
    if (confirm === 'sandbox') sandbox.mutate();
    else toggle.mutate(confirm === 'enable');
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Badge className="px-3 py-1.5 text-base" variant={settings.enabled ? 'default' : 'secondary'}>{settings.enabled ? 'Приём платежей включён' : 'Приём платежей выключен'}</Badge>
      <Button type="button" variant="outline" className="min-h-11" disabled={busy} onClick={() => dirty ? setConfirm('reload') : reload()}>Обновить настройки</Button>
    </div>
    {settings.source === 'environment' && <p className="rounded-xl border border-border p-4 text-sm leading-relaxed">Сейчас используются ключи из настроек сервера. После первого сохранения этим подключением можно управлять здесь без редактирования .env и без перезапуска. Оставьте поле ключа пустым, чтобы перенести текущий ключ.</p>}
    {!settings.encryptionReady && <p role="alert" className="rounded-xl border border-destructive/40 p-4 text-destructive">Не настроено шифрование: серверу нужен постоянный SESSION_SECRET или PAYMENTS_ENCRYPTION_SECRET не короче 32 символов. Секрет шифрования хранится только на сервере.</p>}
    <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed">
      <p className="font-semibold">1. Получите данные в своём аккаунте SumUp</p>
      <p className="mt-2">В кабинете SumUp откройте Settings → For Developers → API Keys и создайте секретный API key. Merchant code укажите из того же аккаунта. Публичный ключ, affiliate key, Client ID и Client Secret для этого подключения не нужны.</p>
      <div className="mt-3 flex flex-wrap gap-4">
        <a className="underline underline-offset-4" href="https://me.sumup.com/settings/api-keys" target="_blank" rel="noopener noreferrer">Открыть ключи SumUp ↗</a>
        <a className="underline underline-offset-4" href="https://developer.sumup.com/tools/authorization/api-keys/" target="_blank" rel="noopener noreferrer">Инструкция SumUp ↗</a>
      </div>
    </div>
    <form className="space-y-4 rounded-xl border border-border p-4 sm:p-5" onSubmit={(event) => { event.preventDefault(); setProblem(''); save.mutate(); }}>
      <h3 className="text-lg font-semibold">2. Подключение и проверка</h3>
      <div className="space-y-2"><Label htmlFor="sumup-api-key">Секретный API key</Label>
        <Input id="sumup-api-key" type="password" autoComplete="new-password" spellCheck={false} maxLength={512} className="min-h-12"
          value={form.apiKey} onChange={(e) => changed('apiKey', e.target.value)} disabled={busy}
          placeholder={settings.keyConfigured ? 'Ключ уже настроен — оставьте пустым, чтобы не менять' : 'Вставьте секретный API key'} />
        <p className="text-sm text-muted-foreground">Ключ шифруется в базе и никогда не возвращается в браузер. Не отправляйте его в чат или репозиторий.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="sumup-merchant">Merchant code</Label><Input id="sumup-merchant" required maxLength={32} className="min-h-12" spellCheck={false} autoComplete="off"
          value={form.merchantCode} onChange={(e) => changed('merchantCode', e.target.value)} disabled={busy} placeholder="M…" /></div>
        <div className="space-y-2"><Label htmlFor="sumup-currency">Валюта магазина</Label><Input id="sumup-currency" value="EUR — евро" readOnly className="min-h-12" /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="sumup-site">Публичный HTTPS-адрес сайта</Label><Input id="sumup-site" type="url" required maxLength={300} className="min-h-12" value={form.siteUrl}
        onChange={(e) => changed('siteUrl', e.target.value)} disabled={busy} placeholder="https://trosheen.shop" />
        <p className="text-sm text-muted-foreground">Только домен, без пути. Адрес сервера Raspberry Pi или локальный IP здесь не нужен.</p></div>
      <div className="space-y-2"><Label htmlFor="sumup-description">Начало описания платежа</Label><Input id="sumup-description" required maxLength={100} className="min-h-12"
        value={form.descriptionPrefix} onChange={(e) => changed('descriptionPrefix', e.target.value)} disabled={busy} />
        <p className="text-sm text-muted-foreground">Пример: {form.descriptionPrefix || 'Trosheen'} #123. Номер заказа добавится автоматически.</p></div>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="min-h-12 whitespace-normal" disabled={busy} onClick={() => { setProblem(''); check.mutate(); }}>
          {check.isPending ? 'Проверяем…' : 'Проверить без сохранения'}
        </Button>
        <Button type="submit" className="min-h-12 whitespace-normal" disabled={busy || !settings.encryptionReady}>{save.isPending ? 'Проверяем и сохраняем…' : 'Проверить и сохранить'}</Button>
      </div>
      <p className="text-sm font-medium">Сохранение выключит приём новых платежей до отдельного включения. Проверка и сохранение не списывают деньги и не создают заказ.</p>
      {profile && <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-4" role="status">
        <p className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 shrink-0" />{probe ? 'Результат проверки введённых данных' : 'Сохранённый проверенный аккаунт'}</p>
        <p>{profile.businessName} · {profile.merchantCode} · {profile.country} · {profile.currency}</p>
        <Badge variant={profile.sandbox ? 'secondary' : 'outline'}>{profile.sandbox ? 'Sandbox — тестовый аккаунт' : 'Live — рабочий аккаунт'}</Badge>
        {settings.checkedAt && !probe && <p className="text-sm text-muted-foreground">Проверен: {time(settings.checkedAt)} · время Риги</p>}
        <p className="text-sm">Проверен доступ к продавцу, режим аккаунта и EUR. Это не проверка получения денег, доступности callback или завершения подключения онлайн-платежей в SumUp.</p>
      </div>}
    </form>
    {problem && <div role="alert" className="rounded-xl border border-destructive/40 p-4 text-destructive">{problem}</div>}
    <section className="space-y-4 rounded-xl border border-border p-4 sm:p-5">
      <h3 className="text-lg font-semibold">3. Запуск оплаты</h3>
      <p className="text-sm leading-relaxed">Рабочий аккаунт включается отдельно и проверяется повторно. Выключение не мешает подтвердить уже созданные платежи. Sandbox никогда не используется для заказов покупателей.</p>
      {dirty && <p className="text-sm font-medium">Есть несохранённые изменения. Сначала сохраните или отмените их.</p>}
      <div className="flex flex-wrap gap-3">
        <Button type="button" className="min-h-12 whitespace-normal" disabled={busy || dirty || settings.enabled || settings.profile?.sandbox !== false || settings.source !== 'database' || !settings.encryptionReady}
          onClick={() => setConfirm('enable')}>Включить оплату покупателей</Button>
        <Button type="button" variant="outline" className="min-h-12" disabled={busy || !settings.enabled} onClick={() => setConfirm('disable')}>Выключить оплату</Button>
      </div>
    </section>
    <section className="space-y-4 rounded-xl border border-border p-4 sm:p-5">
      <h3 className="text-lg font-semibold">4. Проверочная оплата в Sandbox</h3>
      <p className="text-sm leading-relaxed">Сохраните секретный ключ и Merchant code тестового аккаунта. Создайте тестовую страницу на 1 EUR и пройдите оплату тестовой картой SumUp. Это не заказ магазина: производство, остатки и Telegram-уведомления не меняются.</p>
      <a className="text-sm underline underline-offset-4" href="https://developer.sumup.com/online-payments/testing/" target="_blank" rel="noopener noreferrer">Тестовые карты и сценарии SumUp ↗</a>
      <div><Button type="button" variant="outline" className="min-h-12 whitespace-normal" disabled={busy || dirty || settings.profile?.sandbox !== true || !settings.encryptionReady}
        onClick={() => setConfirm('sandbox')}>Создать тестовую страницу оплаты</Button></div>
      {testCheckout && <div className="space-y-3 rounded-xl bg-muted/40 p-4" role="status">
        <p className="font-semibold">Тест на {testCheckout.amount.toFixed(2)} EUR · {({ PENDING: 'Ожидает оплаты', PAID: 'Оплачен в Sandbox', FAILED: 'Не прошёл', EXPIRED: 'Истёк', UNKNOWN: 'Неизвестный статус' } as Record<string,string>)[testCheckout.status] || 'Неизвестный статус'}</p>
        <p className="break-all text-sm text-muted-foreground">{testCheckout.id}</p>
        <a className="inline-flex min-h-12 items-center underline underline-offset-4" href={testCheckout.url} target="_blank" rel="noopener noreferrer">Открыть тестовую оплату ↗</a>
        <Button type="button" variant="outline" className="ml-0 min-h-12 sm:ml-4" disabled={busy} onClick={() => checkTest.mutate(testCheckout.id)}>Проверить результат</Button>
      </div>}
    </section>
    <details className="rounded-xl border border-border p-4 sm:p-5">
      <summary className="cursor-pointer py-2 text-base font-semibold">Адреса подключения и запуск на сервере</summary>
      <div className="mt-3 space-y-4 text-sm leading-relaxed">
        <p>Адреса ниже относятся к сохранённым настройкам. Callback передаётся SumUp автоматически при создании оплаты; вручную регистрировать его не нужно.</p>
        {([['Уведомление SumUp → сайт', settings.webhookUrl], ['Возврат покупателя', settings.returnUrl]] as const).map(([label, value]) => <div key={label} className="space-y-2">
          <p className="font-medium">{label}</p><Input readOnly value={value} className="min-h-12 text-sm" aria-label={label} onFocus={(e) => e.target.select()} />
          <Button type="button" variant="outline" className="min-h-11" disabled={!value} onClick={() => void copy(value)}><Copy className="mr-2 h-4 w-4" />Скопировать</Button>
        </div>)}
        <p>Callback должен быть доступен SumUp через домен Cloudflare без входа в админку, Cloudflare Access и интерактивных проверок. Новый порт на Raspberry Pi не требуется.</p>
        <p>Перед запуском примените миграцию 0017. Не меняйте постоянный секрет шифрования сервера без плана переноса ключей. Старые ключи хранятся зашифрованными для проверки уже выданных платежей.</p>
      </div>
    </details>
    <AlertDialog open={confirm !== null} onOpenChange={(open) => { if (!open && !busy) setConfirm(null); }}>
      <AlertDialogContent><AlertDialogHeader>
        <AlertDialogTitle>{confirm === 'enable' ? 'Включить настоящую оплату?' : confirm === 'disable' ? 'Остановить приём новых платежей?' : confirm === 'reload' ? 'Отменить несохранённые изменения?' : 'Создать оплату только в Sandbox?'}</AlertDialogTitle>
        <AlertDialogDescription>{confirm === 'enable' ? `Покупатели смогут платить реальными деньгами продавцу ${settings.merchantCode}. Проверьте аккаунт и домен ${settings.siteUrl}.` : confirm === 'disable' ? 'Новые платёжные страницы не будут выдаваться. Уже созданные оплаты продолжат проверяться.' : confirm === 'reload' ? 'Введённый ключ и другие несохранённые поля будут сброшены после загрузки настроек.' : 'Будет создана тестовая страница на 1 EUR. Денежное списание с рабочего аккаунта и заказ магазина не создаются.'}</AlertDialogDescription>
      </AlertDialogHeader><AlertDialogFooter>
        <AlertDialogCancel disabled={busy}>Нет, вернуться</AlertDialogCancel>
        <AlertDialogAction disabled={busy} onClick={(event) => { event.preventDefault(); confirmAction(); }}>{busy ? 'Выполняется…' : 'Да, подтвердить'}</AlertDialogAction>
      </AlertDialogFooter></AlertDialogContent>
    </AlertDialog>
  </div>;
}
