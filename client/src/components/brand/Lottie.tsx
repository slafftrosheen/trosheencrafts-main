import { useEffect, useRef } from "react";
import {
  LOTTIE_PATH,
  loadLottieRuntime,
  prefersReducedMotion,
  type LottieAnimation,
} from "./lottieRuntime";

export type LottiePlayMode = "loop" | "view" | "hover" | "once" | "manual" | "ambient";

interface LottieProps {
  file: string;
  mode?: LottiePlayMode;
  className?: string;
  style?: React.CSSProperties;
  trigger?: number;
  cover?: boolean;
  ariaHidden?: boolean;
}

/**
 * Lazy Lottie mount: JSON/SVG is only parsed close to the viewport.
 * All ambient/loop animations pause off-screen and when the tab is hidden.
 * Touch devices treat hover-only decoration as a single view-triggered run.
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
  const seenTrigger = useRef(trigger);
  const pendingManual = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = prefersReducedMotion();
    const touch = window.matchMedia("(hover:none)").matches;
    const repeat = mode === "loop" || mode === "ambient";
    const playOnView = mode === "view" || mode === "once" || (mode === "hover" && touch);
    let animation: LottieAnimation | null = null;
    let observer: IntersectionObserver | null = null;
    let hovered = false;
    let visible = false;
    let loaded = false;
    let loading = false;
    let played = false;
    let disposed = false;
    const hoverTarget = mode === "hover" && !touch
      ? host.closest<HTMLElement>("[data-lottie-host]") ?? host
      : null;

    const syncPlayback = () => {
      if (!animation || !loaded || disposed) return;
      if (reduced) {
        animation.goToAndStop(Math.max(0, animation.totalFrames - 1), true);
        return;
      }
      if (document.visibilityState === "hidden" || !visible) {
        animation.pause();
        return;
      }
      if (repeat) {
        animation.play();
      } else if (playOnView && !played) {
        played = true;
        animation.goToAndPlay(0, true);
      } else if (mode === "hover" && hovered) {
        hovered = false;
        animation.goToAndPlay(0, true);
      } else if (mode === "manual" && pendingManual.current) {
        pendingManual.current = false;
        animation.goToAndPlay(0, true);
      }
    };

    const mount = () => {
      if (loading || disposed) return;
      loading = true;
      void loadLottieRuntime().then((runtime) => {
        if (disposed || !runtime || !hostRef.current) return;
        animation = runtime.loadAnimation({
          container: hostRef.current,
          renderer: "svg",
          loop: repeat,
          autoplay: false,
          path: LOTTIE_PATH + file,
          rendererSettings: {
            preserveAspectRatio: cover || mode === "ambient" ? "xMidYMid slice" : "xMidYMid meet",
          },
        });
        (host as unknown as { _lottie?: LottieAnimation })._lottie = animation;
        animation.addEventListener("DOMLoaded", () => {
          loaded = true;
          syncPlayback();
        });
      });
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          visible = entries.some((entry) => entry.isIntersecting);
          if (visible) mount();
          syncPlayback();
        },
        { rootMargin: "100px 0px 100px 0px", threshold: 0.01 },
      );
      observer.observe(host);
    } else {
      visible = true;
      mount();
    }

    const onHover = () => {
      hovered = true;
      if (visible) mount();
      syncPlayback();
    };
    hoverTarget?.addEventListener("mouseenter", onHover);
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      disposed = true;
      observer?.disconnect();
      hoverTarget?.removeEventListener("mouseenter", onHover);
      document.removeEventListener("visibilitychange", syncPlayback);
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
    const animation = (hostRef.current as unknown as { _lottie?: LottieAnimation } | null)?._lottie;
    if (animation?.isLoaded) animation.goToAndPlay(0, true);
    else pendingManual.current = true;
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
