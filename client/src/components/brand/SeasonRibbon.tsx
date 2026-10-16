import { useEffect, useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { SEASONS, applySeason, currentSeason } from "@/lib/seasons";
import { Lottie } from "./Lottie";

/** Thin spruce ribbon above the header: this month's courtyard line. */
export function SeasonRibbon() {
  const { language } = useLanguage();
  const season = useMemo(() => currentSeason(), []);

  useEffect(() => {
    applySeason(season);
  }, [season]);

  const info = SEASONS[season];
  const line = language === "lv" ? info.line.lv : info.line.en;

  return (
    <div className="season-ribbon">
      <span className="dot" aria-hidden="true" />
      <span>{line}</span>
    </div>
  );
}

/** Ambient season Lottie overlay (hero and dark banner sections). */
export function SeasonAmbient({ className }: { className?: string }) {
  const season = useMemo(() => currentSeason(), []);
  return (
    <Lottie
      file={SEASONS[season].lottie}
      mode="ambient"
      cover
      className={className ?? "hero__ambient"}
    />
  );
}
