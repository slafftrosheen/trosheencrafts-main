import { translations } from "@/lib/LanguageContext";

export function adminT(key: string): string {
  return translations[key]?.ru || key;
}
