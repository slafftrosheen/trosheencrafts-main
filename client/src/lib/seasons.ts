/** Seasons of the courtyard — port of the kit's `SEASONS` map (trosheen-v4.js §6). */

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface SeasonInfo {
  accent: string;
  line: { lv: string; en: string };
  lottie: string;
}

export const SEASONS: Record<Season, SeasonInfo> = {
  spring: {
    accent: "#8C9A7B",
    line: {
      lv: "Ceriņi zied pie darbnīcas durvīm.",
      en: "Lilacs bloom by the workshop door.",
    },
    lottie: "trosheen-spring-ambient.json",
  },
  summer: {
    accent: "#B89150",
    line: {
      lv: "Garas vasaras dienas pagalmā.",
      en: "Long summer days in the courtyard.",
    },
    lottie: "trosheen-summer-ambient.json",
  },
  autumn: {
    accent: "#8E5636",
    line: {
      lv: "Lapas krīt, darbnīcā smaržo vasks.",
      en: "Leaves fall, the workshop smells of wax.",
    },
    lottie: "trosheen-autumn-ambient.json",
  },
  winter: {
    accent: "#24412F",
    line: {
      lv: "Sniegs krājas pie sētas. Darbnīcā deg sveces.",
      en: "Snow gathers by the fence. Candles burn in the workshop.",
    },
    lottie: "trosheen-winter-ambient.json",
  },
};

/** Month-based season, overridable with <html data-season="winter">. */
export function currentSeason(date: Date = new Date()): Season {
  if (typeof document !== "undefined") {
    const override = document.documentElement.getAttribute("data-season");
    if (override && override in SEASONS) return override as Season;
  }
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

/** Publishes the accent colour and season attribute the CSS/JS read. */
export function applySeason(season: Season): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-season", season);
  document.documentElement.style.setProperty("--season", SEASONS[season].accent);
}
