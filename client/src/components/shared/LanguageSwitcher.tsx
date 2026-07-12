import { useLanguage } from '@/lib/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "lv", flag: "🇱🇻", label: "Latviešu" },
  { code: "ru", flag: "🇷🇺", label: "Русский" },
  { code: "pl", flag: "🇵🇱", label: "Polski" },
  { code: "uk", flag: "🇺🇦", label: "Українська" }
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useLanguage();
  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 text-xl", className)}>
          {currentLang.flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[150px] rounded-xl">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "flex items-center gap-3 cursor-pointer py-2 px-3 rounded-lg font-medium",
              language === lang.code && "bg-primary/10 text-primary"
            )}
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
