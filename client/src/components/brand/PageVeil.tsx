import { useEffect, useRef, useState } from "react";
import { Lottie } from "./Lottie";

/**
 * Soft page-to-page veil with the seal loader (kit §13).
 * Covers the very first paint, then fades; later route changes re-use it briefly.
 */
export function PageVeil({ routeKey }: { routeKey: string }) {
  const [on, setOn] = useState(true);
  const firstPaint = useRef(true);

  // Lift the curtain once the first page has actually painted.
  useEffect(() => {
    const lift = () => setOn(false);
    if (document.readyState === "complete") {
      const timer = window.setTimeout(lift, 250);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(lift, 250);
    window.addEventListener("load", lift);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("load", lift);
    };
  }, []);

  // Brief veil on subsequent client-side navigations.
  useEffect(() => {
    if (firstPaint.current) {
      firstPaint.current = false;
      return;
    }
    setOn(true);
    const timer = window.setTimeout(() => setOn(false), 320);
    return () => window.clearTimeout(timer);
  }, [routeKey]);

  return (
    <div className={"page-veil " + (on ? "is-on" : "is-off")} aria-hidden="true">
      <Lottie file="trosheen-28-loader-seal.json" mode="loop" className="page-veil__seal" />
    </div>
  );
}
