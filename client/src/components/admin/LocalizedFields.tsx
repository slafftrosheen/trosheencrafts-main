import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export type Locale = "lv" | "en" | "ru" | "pl" | "uk";
export type LocaleMap = Partial<Record<Locale, string>>;
const LANGUAGES: { code: Locale; label: string }[] = [
  { code: "lv", label: "Latviešu" }, { code: "en", label: "English" },
  { code: "ru", label: "Русский" }, { code: "pl", label: "Polski" },
  { code: "uk", label: "Українська" },
];

/** The same five-language control is used for gallery items and categories. */
export function LocalizedFields({
  names, descriptions, onNameChange, onDescriptionChange,
}: {
  names: LocaleMap; descriptions: LocaleMap;
  onNameChange: (value: LocaleMap) => void;
  onDescriptionChange: (value: LocaleMap) => void;
}) {
  const [language, setLanguage] = useState<Locale>("lv");
  return (
    <fieldset className="col-span-2 min-w-0 space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
      <legend className="px-2 font-semibold">Переводы для посетителей</legend>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Язык перевода">
        {LANGUAGES.map(({ code, label }) => (
          <Button type="button" size="sm" key={code}
            variant={language === code ? "default" : "outline"}
            aria-pressed={language === code} onClick={() => setLanguage(code)}>{label}</Button>
        ))}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Пустые переводы используют исходное название и описание.
      </p>
      <div>
        <Label htmlFor={"local-name-" + language}>Название · {language.toUpperCase()}</Label>
        <Input id={"local-name-" + language} className="mt-2"
          value={names[language] || ""}
          onChange={event => onNameChange({ ...names, [language]: event.target.value })} />
      </div>
      <div>
        <Label htmlFor={"local-desc-" + language}>Описание · {language.toUpperCase()}</Label>
        <Textarea id={"local-desc-" + language} className="mt-2" rows={3}
          value={descriptions[language] || ""}
          onChange={event => onDescriptionChange({ ...descriptions, [language]: event.target.value })} />
      </div>
    </fieldset>
  );
}
