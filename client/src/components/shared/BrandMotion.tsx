import { useEffect, useRef } from "react";
import {
  loadLottieRuntime,
  type LottieAnimation,
} from "@/components/brand/lottieRuntime";

/** The supplied Trosheen Lotties are progressive enhancement, not a dependency for navigation. */
const motionFiles = {
  seal: "trosheen-01-seal-stamp-loop.json",
  stamp: "trosheen-01-seal-stamp-once.json",
  cart: "trosheen-02-add-to-cart.json",
  heart: "trosheen-03-wishlist-heart.json",
  planter: "trosheen-04-sprouting-planter.json",
  candle: "trosheen-05-living-candle.json",
  ripple: "trosheen-06-fountain-ripple.json",
  imprint: "trosheen-07-botanical-imprint.json",
  parcel: "trosheen-08-wrapped-and-sealed.json",
  frost: "trosheen-09-frost-to-drop.json",
  notFound: "trosheen-10-404-rolling-stone.json",
  empty: "trosheen-11-empty-shop-plant.json",
  signature: "trosheen-signature-ar-siltam-rokam-olegs.json",
  familySignature: "trosheen-signature-trosheen-gimene.json",
} as const;type MotionName = keyof typeof motionFiles;
type LottieInstance = LottieAnimation;

interface Props {
  name: MotionName;
  className?: string;
  mode?: "loop" | "view" | "manual";
  /** Increment only after a confirmed action; an early trigger is replayed on load. */
  trigger?: number;
  label?: string;
  poster?: string;
}

export function BrandMotion({
  name, className = "", mode = "view", trigger = 0,
  label, poster = "/brand/icons/handmade.svg",
}: Props) {
  const host = useRef<HTMLSpanElement>(null);
  const player = useRef<LottieInstance | null>(null);
  const ready = useRef(false);
  const latestTrigger = useRef(trigger);
  latestTrigger.current = trigger;

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let mounted = true;
    let started = false;
    let lazyObserver: IntersectionObserver | undefined;
    let visibilityObserver: IntersectionObserver | undefined;

    const stop = () => {
      lazyObserver?.disconnect();
      visibilityObserver?.disconnect();
      lazyObserver = undefined;
      visibilityObserver = undefined;
      player.current?.destroy();
      player.current = null;
      ready.current = false;
      started = false;
      element.parentElement?.classList.remove("brand-motion-ready");
    };

    const start = () => {
      if (!mounted || started || reducedMotion.matches) return;
      started = true;
      loadLottieRuntime().then(lottie => {
        if (!lottie) {
          started = false;
          return;
        }
        if (!mounted || reducedMotion.matches) return;
        let instance: LottieInstance;
        try {
          instance = lottie.loadAnimation({
            container: element,
            renderer: "svg",
            loop: mode === "loop",
            autoplay: false,
            path: "/brand/lottie/" + motionFiles[name],
            rendererSettings: { preserveAspectRatio: "xMidYMid meet" },
          });
        } catch {
          started = false;
          return;
        }
        player.current = instance;

        const onReady = () => {
          if (!mounted || reducedMotion.matches || ready.current) return;
          ready.current = true;

          // Manual icons retain their poster until an actual successful action.
          if (mode !== "manual" || latestTrigger.current > 0) {
            element.parentElement?.classList.add("brand-motion-ready");
            if (mode === "loop") instance.play();
            else instance.goToAndPlay(0, true);
          }

          // Do not spend battery rendering an off-screen continuous animation.
          if (mode === "loop" && "IntersectionObserver" in window) {
            visibilityObserver = new IntersectionObserver(entries => {
              if (entries[0]?.isIntersecting && !reducedMotion.matches) instance.play();
              else instance.pause();
            }, { threshold: 0 });
            visibilityObserver.observe(element);
          }
        };
        if (instance.isLoaded) onReady();
        else instance.addEventListener("DOMLoaded", onReady);
      }).catch(() => { started = false; /* Retain the SVG fallback. */ });
    };

    const init = () => {
      if (reducedMotion.matches) return;
      if (mode === "manual" || !("IntersectionObserver" in window)) {
        start();
      } else {
        // View animations start only when meaningfully visible; loops preload close to viewport.
        lazyObserver = new IntersectionObserver(entries => {
          if (entries[0]?.isIntersecting) {
            lazyObserver?.disconnect();
            start();
          }
        }, { threshold: mode === "view" ? 0.3 : 0, rootMargin: mode === "loop" ? "160px 0px" : "0px" });
        lazyObserver.observe(element);
      }
    };

    const onPreferenceChange = () => {
      if (reducedMotion.matches) stop();
      else init();
    };
    init();
    reducedMotion.addEventListener("change", onPreferenceChange);
    return () => {
      mounted = false;
      reducedMotion.removeEventListener("change", onPreferenceChange);
      stop();
    };
  }, [name, mode]);

  useEffect(() => {
    if (mode !== "manual" || trigger <= 0 || !ready.current || !player.current) return;
    host.current?.parentElement?.classList.add("brand-motion-ready");
    player.current.goToAndPlay(0, true);
  }, [trigger, mode]);

  return (
    <span className={"brand-motion " + className} role={label ? "img" : undefined}
      aria-label={label} aria-hidden={label ? undefined : true}>
      <span className="brand-motion-frame" ref={host} />
      <img className="brand-motion-poster" src={poster} alt="" loading="lazy" />
    </span>
  );
}
