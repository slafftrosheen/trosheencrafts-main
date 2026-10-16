/** Fallback to genuine authored copy, never to missing-key placeholders. */
export function localizedText(
  original: string | null | undefined,
  translations: Record<string, string> | null | undefined,
  language: string,
): string {
  const candidates = [translations?.[language], translations?.lv, translations?.en, original];
  return candidates.find(value => typeof value === "string" && value.trim().length > 0)?.trim() || "";
}
