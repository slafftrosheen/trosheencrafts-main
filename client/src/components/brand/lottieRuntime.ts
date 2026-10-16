/**
 * Lottie runtime loader for the Trosheen v4 design system.
 *
 * The kit ships lottie-web as a plain vendor script (13-code/vendor/lottie.min.js),
 * copied to /public/vendor/lottie.min.js. We inject it on demand instead of blocking
 * first paint, and share one promise across every <Lottie> instance.
 */

export interface LottieAnimation {
  play: () => void;
  stop: () => void;
  pause: () => void;
  destroy: () => void;
  goToAndPlay: (frame: number, isFrame: boolean) => void;
  goToAndStop: (value: number, isFrame?: boolean) => void;
  addEventListener: (name: string, callback: () => void) => void;
  isLoaded?: boolean;
  totalFrames: number;
}

export interface LottieRuntime {
  loadAnimation: (params: Record<string, unknown>) => LottieAnimation;
}

declare global {
  interface Window {
    lottie?: LottieRuntime;
    TROSHEEN_LOTTIE_PATH?: string;
  }
}

export const LOTTIE_PATH = "/brand/lottie/";

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

let runtimePromise: Promise<LottieRuntime | null> | null = null;

/** Injects the vendor lottie script once and resolves with the global runtime. */
export function loadLottieRuntime(): Promise<LottieRuntime | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.lottie) return Promise.resolve(window.lottie);
  if (runtimePromise) return runtimePromise;

  runtimePromise = new Promise<LottieRuntime | null>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-trosheen-lottie]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.lottie ?? null));
      existing.addEventListener("error", () => { runtimePromise = null; resolve(null); });
      return;
    }
    const script = document.createElement("script");
    script.src = "/vendor/lottie.min.js";
    script.async = true;
    script.dataset.trosheenLottie = "true";
    script.addEventListener("load", () => resolve(window.lottie ?? null));
    script.addEventListener("error", () => { runtimePromise = null; script.remove(); resolve(null); });
    document.head.appendChild(script);
  });

  return runtimePromise;
}
