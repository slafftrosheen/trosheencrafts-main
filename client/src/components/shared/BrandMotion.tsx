import { useEffect, useRef } from "react";

/** Progressive enhancement of supplied brand animations with a static reduced-motion fallback. */
const motionFiles = {
  seal: "trosheen-01-seal-stamp-loop.json", stamp: "trosheen-01-seal-stamp-once.json",
  cart: "trosheen-02-add-to-cart.json", heart: "trosheen-03-wishlist-heart.json",
  planter: "trosheen-04-sprouting-planter.json", candle: "trosheen-05-living-candle.json",
  ripple: "trosheen-06-fountain-ripple.json", imprint: "trosheen-07-botanical-imprint.json",
  parcel: "trosheen-08-wrapped-and-sealed.json", frost: "trosheen-09-frost-to-drop.json",
  notFound: "trosheen-10-404-rolling-stone.json", empty: "trosheen-11-empty-shop-plant.json",
  signature: "trosheen-signature-ar-siltam-rokam-olegs.json",
  familySignature: "trosheen-signature-trosheen-gimene.json",
} as const;
type MotionName = keyof typeof motionFiles;
type LottieInstance = {
  destroy(): void;
  goToAndPlay(frame: number, isFrame: boolean): void;
  addEventListener(event: string, callback: () => void): void;
};
type LottiePlayer = {
  loadAnimation(options: { container: HTMLElement; renderer: "svg"; loop: boolean; autoplay: boolean;
    path: string; rendererSettings: { preserveAspectRatio: string } }): LottieInstance;
};
declare global { interface Window { lottie?: LottiePlayer } }
let playerPromise: Promise<LottiePlayer> | undefined;
function loadPlayer(): Promise<LottiePlayer> {
  if (window.lottie) return Promise.resolve(window.lottie);
  if (!playerPromise) {
    playerPromise = new Promise<LottiePlayer>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "/brand/lottie/lottie.min.js";
      script.async = true;
      script.onload = () => window.lottie ? resolve(window.lottie) : reject(new Error("Lottie runtime unavailable"));
      script.onerror = () => reject(new Error("Cannot load Lottie"));
      document.head.appendChild(script);
    }).catch(error => { playerPromise = undefined; throw error; });
  }
  return playerPromise;
}

type Props = {
  name: MotionName;
  className?: string;
  mode?: "loop" | "view" | "manual";
  trigger?: number;
  label?: string;
  poster?: string;
};
export function BrandMotion({ name, className = "", mode = "view", trigger = 0,
  label, poster = "/brand/icons/handmade.svg" }: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const player = useRef<LottieInstance | null>(null);
  const triggerRef = useRef(trigger);
  triggerRef.current = trigger;

  useEffect(() => {
    const el = host.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let active = true;
    let observer: IntersectionObserver | undefined;
    loadPlayer().then(lottie => {
      if (!active) return;
      const instance = lottie.loadAnimation({
        container: el, renderer: "svg", loop: mode === "loop", autoplay: mode === "loop",
        path: "/brand/lottie/" + motionFiles[name],
        rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
      });
      player.current = instance;
      instance.addEventListener("DOMLoaded", () => { if (active) el.parentElement?.classList.add("brand-motion-ready"); });
      if (mode === "view") {
        observer = new IntersectionObserver(entries => {
          if (entries.some(entry => entry.isIntersecting)) {
            instance.goToAndPlay(0, true);
            observer?.disconnect();
          }
        }, { threshold: 0.35 });
        observer.observe(el);
      } else if (mode === "manual" && triggerRef.current > 0) {
        instance.goToAndPlay(0, true);
      }
    }).catch(() => { /* leave static poster visible */ });
    return () => {
      active = false;
      observer?.disconnect();
      player.current?.destroy();
      player.current = null;
      el.parentElement?.classList.remove("brand-motion-ready");
    };
  }, [name, mode]);

  useEffect(() => {
    if (mode === "manual" && trigger > 0) player.current?.goToAndPlay(0, true);
  }, [trigger, mode]);

  return (
    <span className={"brand-motion " + className} role={label ? "img" : undefined}
      aria-label={label} aria-hidden={label ? undefined : true}>
      <span className="brand-motion-frame" ref={host} />
      <img className="brand-motion-poster" src={poster} alt="" loading="lazy" />
    </span>
  );
}
