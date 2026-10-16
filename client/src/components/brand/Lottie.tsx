import { useEffect, useRef } from "react";
import {
  LOTTIE_PATH,
  loadLottieRuntime,
  prefersReducedMotion,
  type LottieAnimation,
} from "./lottieRuntime";

export type LottiePlayMode = "loop" | "view" | "hover" | "once" | "manual" | "ambient";

interface LottieProps {
  /** File name inside /public/brand/lottie, e.g. "trosheen-13-step-recipe.json". */
  file: string;
  mode?: LottiePlayMode;
  className?: string;
  style?: React.CSSProperties;
  /** Increment to replay a `manual` animation (cart pour, wishlist heart…). */
  trigger?: number;
  /** Renders the animation scaled to fill its box (ambient season overlays). */
  cover?: boolean;
  ariaHidden?: boolean;
}

/**
 * Port of the kit's `[data-lottie]` slot behaviour.
 * loop     — autoplays and loops
 * view     — plays once when scrolled into view
 * hover    — replays from the start on hover of the nearest [data-lottie-host]
 * once     — plays once on mount (hero seal)
 * manual   — only plays when `trigger` changes
 * ambient  — loops, sliced to cover the container
 */
export function Lottie({
  file,
  mode = "view",
  className,
  style,
  trigger,
  cover,
  ariaHidden = true,
}: LottieProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  // A manual animation must not play on initial mount, and an early trigger
  // must survive the asynchronous vendor-script and JSON loading.
  const seenTrigger = useRef(trigger);
  const pendingManual = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let animation: LottieAnimation | null = null;
    let observer: IntersectionObserver | null = null;
    let hoverTarget: HTMLElement | null = null;
    let hoverListener: [HTMLElement, () => void] | null = null;
    let disposed = false;
    const reduced = prefersReducedMotion();

    void loadLottieRuntime().then((runtime) => {
      if (disposed || !runtime || !hostRef.current) return;

      animation = runtime.loadAnimation({
        container: hostRef.current,
        renderer: "svg",
        loop: mode === "loop" || mode === "ambient",
        autoplay: !reduced && (mode === "loop" || mode === "ambient" || mode === "once"),
        path: LOTTIE_PATH + file,
        rendererSettings: {
          preserveAspectRatio: cover || mode === "ambient" ? "xMidYMid slice" : "xMidYMid meet",
        },
      });

      animation.addEventListener("DOMLoaded", () => {
        if (reduced) {
          animation?.goToAndStop(animation.totalFrames - 1, true);
        } else if (mode === "manual" && pendingManual.current) {
          pendingManual.current = false;
          animation?.goToAndPlay(0, true);
        }
      });

      // Exposed on the DOM node so a `manual` sibling can replay it (kit parity).
      (host as unknown as { _lottie?: LottieAnimation })._lottie = animation;

      if (mode === "view" && observer === null && "IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting || reduced) return;
              animation?.goToAndPlay(0, true);
              observer?.unobserve(entry.target);
            });
          },
          { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
        );
        observer.observe(host);
      } else if (mode === "view" && !reduced) {
        animation.play();
      }

      if (mode === "hover") {
        hoverTarget = host.closest<HTMLElement>("[data-lottie-host]") ?? host;
        const onEnter = () => {
          if (reduced) return;
          animation?.goToAndPlay(0, true);
        };
        hoverTarget.addEventListener("mouseenter", onEnter);
        hoverListener = [hoverTarget, onEnter];
      }
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      if (hoverListener) hoverListener[0].removeEventListener("mouseenter", hoverListener[1]);
      animation?.destroy();
      delete (host as unknown as { _lottie?: LottieAnimation })._lottie;
      pendingManual.current = false;
      host.replaceChildren();
    };
  }, [file, mode, cover]);

  useEffect(() => {
    if (mode !== "manual" || trigger === undefined) return;
    if (trigger === seenTrigger.current) return;
    seenTrigger.current = trigger;
    if (trigger <= 0 || prefersReducedMotion()) return;
    const host = hostRef.current;
    const animation = (host as unknown as { _lottie?: LottieAnimation })?._lottie;
    if (animation && animation.isLoaded !== false) {
      animation.goToAndPlay(0, true);
    } else {
      pendingManual.current = true;
    }
  }, [mode, trigger]);

  return (
    <span
      ref={hostRef}
      data-lottie={file}
      data-play={mode}
      className={className}
      style={style}
      aria-hidden={ariaHidden ? "true" : undefined}
    />
  );
}
