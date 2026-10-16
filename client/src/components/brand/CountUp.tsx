import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./lottieRuntime";

interface CountUpProps {
  value: number;
  /** Years count down from value-30, other numbers from 0 (kit default). */
  from?: number;
  durationMs?: number;
  className?: string;
}

/** Count-up numbers — port of the kit's `[data-count]` behaviour (trosheen-v4.js §14). */
export function CountUp({ value, from, durationMs = 1400, className }: CountUpProps) {
  const start = from ?? (value > 1000 ? value - 30 : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : start));

  useEffect(() => {
    const node = ref.current;
    if (!node || prefersReducedMotion() || !("IntersectionObserver" in window)) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          observer.unobserve(entry.target);
          const startedAt = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - startedAt) / durationMs);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(Math.round(start + (value - start) * eased));
            if (p < 1) frame = requestAnimationFrame(tick);
          };
          frame = requestAnimationFrame(tick);
        });
      },
      { threshold: 0.6 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, start, durationMs]);

  return (
    <span ref={ref} className={className} data-count={value}>
      {display}
    </span>
  );
}
