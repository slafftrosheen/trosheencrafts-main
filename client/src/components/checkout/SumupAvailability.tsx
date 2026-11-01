import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';

const copy = {
  en: { loading: 'Checking payment availability…', unavailable: 'Online payments are temporarily unavailable. Your basket is saved. Please contact the workshop or check again later.', retry: 'Check again', secure: 'Secure card payment through SumUp' },
  lv: { loading: 'Pārbaudām maksājumu pieejamību…', unavailable: 'Tiešsaistes maksājumi īslaicīgi nav pieejami. Grozs ir saglabāts. Sazinieties ar darbnīcu vai pārbaudiet vēlāk.', retry: 'Pārbaudīt vēlreiz', secure: 'Drošs kartes maksājums ar SumUp' },
  ru: { loading: 'Проверяем доступность оплаты…', unavailable: 'Онлайн-оплата временно недоступна. Корзина сохранена. Свяжитесь с мастерской или проверьте позже.', retry: 'Проверить ещё раз', secure: 'Безопасная оплата картой через SumUp' },
  pl: { loading: 'Sprawdzamy dostępność płatności…', unavailable: 'Płatności online są chwilowo niedostępne. Koszyk został zachowany. Skontaktuj się z warsztatem lub sprawdź później.', retry: 'Sprawdź ponownie', secure: 'Bezpieczna płatność kartą przez SumUp' },
  uk: { loading: 'Перевіряємо доступність оплати…', unavailable: 'Онлайн-оплата тимчасово недоступна. Кошик збережено. Зверніться до майстерні або перевірте пізніше.', retry: 'Перевірити ще раз', secure: 'Безпечна оплата карткою через SumUp' },
};
export function useSumupAvailability() {
  const { language } = useLanguage();
  const query = useQuery<{ available: boolean; currency: string }>({
    queryKey: ['sumup-availability'],
    queryFn: async () => {
      const response = await fetch('/api/checkout/availability', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Payment availability could not be checked');
      return response.json();
    },
    retry: 1, refetchInterval: 15000, staleTime: 5000,
  });
  return { available: query.data?.available === true && !query.isError, loading: query.isPending,
    refreshing: query.isFetching, refresh: query.refetch, copy: copy[language] || copy.en };
}
export function SumupAvailabilityNotice({ payment }: { payment: ReturnType<typeof useSumupAvailability> }) {
  if (payment.available) return null;
  return <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed" role="status" aria-live="polite">
    <p>{payment.loading ? payment.copy.loading : payment.copy.unavailable}</p>
    {!payment.loading && <Button type="button" variant="outline" className="min-h-11" disabled={payment.refreshing}
      onClick={() => void payment.refresh()}>{payment.copy.retry}</Button>}
  </div>;
}
