import { useLanguage } from '@/lib/LanguageContext';
import { Construction } from 'lucide-react';

export default function ShopPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-8 h-8 text-primary" />
      </div>
      <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">
        Coming Soon...
      </h1>
      <p className="text-muted-foreground text-lg max-w-md mx-auto">
        We are currently updating our shop to bring you an even better experience. Please check back later!
      </p>
    </div>
  );
}