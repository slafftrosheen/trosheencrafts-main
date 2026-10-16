import { useEffect } from "react";
import { prefersReducedMotion } from "@/components/brand/lottieRuntime";

/**
 * Storefront motion runtime — a React port of Trosheen-Website-Kit-v4.3/13-code/js/trosheen-v4.js.
 *
 * The kit scanned the DOM once per page load. Here a MutationObserver keeps watching the
 * storefront subtree, so lazily loaded routes and data-driven lists animate exactly like
 * the static prototype. Everything is opt-in through data-attributes:
 *   data-reveal[="fade"|"scale"|"image"] · data-ink · data-draw · data-stagger · mark[data-mark]
 */
export function useBrandMotion(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof window === "undefined") return;
    const reduced = prefersReducedMotion();

    /* ---------- scroll progress bar ---------- */
    let bar = document.querySelector<HTMLDivElement>(".scroll-progress");
    if (!bar) {
      bar = document.createElement("div");
      bar.className = "scroll-progress";
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
    }
    const progressBar = bar;

    /* ---------- reveal observer ---------- */
    const watched = new WeakSet<Element>();
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-in");
                io?.unobserve(entry.target);
              });
            },
            { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
          )
        : null;

    const watch = (element: Element) => {
      if (watched.has(element)) return;
      watched.add(element);

      if (element.hasAttribute("data-stagger")) {
        Array.from(element.children).forEach((child, index) => {
          if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "");
          (child as HTMLElement).style.setProperty("--delay", `${index * 110}ms`);
          watch(child);
        });
        return;
      }

      if (io) io.observe(element);
      else element.classList.add("is-in");
    };

    const scan = (scope: ParentNode) => {
      scope
        .querySelectorAll(
          "[data-reveal],[data-ink],[data-draw],[data-stagger],mark[data-mark],.timeline,[data-count]",
        )
        .forEach(watch);
    };

    scan(root);
    root.querySelectorAll<HTMLElement>(".step").forEach((step) => {
      if (!step.hasAttribute("data-reveal")) step.setAttribute("data-reveal", "");
      watch(step);
    });

    // Hero arrival (words rise, photo breathes).
    root.querySelectorAll<HTMLElement>(".hero").forEach((hero) => {
      requestAnimationFrame(() => hero.classList.add("is-in"));
    });

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches?.("[data-reveal],[data-ink],[data-draw],[data-stagger],mark[data-mark]")) {
            watch(node);
          }
          scan(node);
          node.querySelectorAll?.(".step").forEach((step) => watch(step));
          node.querySelectorAll?.(".hero").forEach((hero) => {
            requestAnimationFrame(() => hero.classList.add("is-in"));
          });
        });
      });
    });
    mutations.observe(root, { childList: true, subtree: true });

    /* ---------- magnetic buttons (fine pointers only) ---------- */
    const finePointer = window.matchMedia("(pointer:fine)").matches;
    if (finePointer && !reduced) {
      root.querySelectorAll<HTMLElement>(".btn").forEach((btn) => btn.classList.add("is-magnet"));
    }

    /* ---------- scroll-driven effects: progress, hero parallax, timeline ---------- */
    let ticking = false;
    const onFrame = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.setProperty("--sp", max > 0 ? (window.scrollY / max).toFixed(4) : "0");

      if (!reduced) {
        const heroImg = root.querySelector<HTMLElement>(".hero__media img");
        if (heroImg && window.scrollY < window.innerHeight * 1.2) {
          heroImg.style.setProperty("--py", `${(window.scrollY * 0.25).toFixed(1)}px`);
        }
        root.querySelectorAll<HTMLElement>(".timeline").forEach((timeline) => {
          const rect = timeline.getBoundingClientRect();
          const progress = Math.min(
            1,
            Math.max(0, (window.innerHeight * 0.8 - rect.top) / rect.height),
          );
          timeline.style.setProperty("--progress", progress.toFixed(3));
        });
      }
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(onFrame);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onFrame();

    /* ---------- delegated pointer effects (survive React re-renders) ---------- */
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer || reduced) return;
      const target = event.target as Element | null;
      const btn = target?.closest?.(".btn");
      if (!(btn instanceof HTMLElement)) return;
      btn.classList.add("is-magnet");
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.18;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.28;
      btn.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    };
    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const btn = target?.closest?.(".btn");
      if (btn instanceof HTMLElement) btn.style.transform = "";
    };
    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerout", onPointerOut);

    /* ---------- story chapter navigation highlight ---------- */
    const chapterLinks = Array.from(
      root.querySelectorAll<HTMLAnchorElement>(".chapter-nav a[href^='#']"),
    );
    let chapterObserver: IntersectionObserver | null = null;
    if (chapterLinks.length && "IntersectionObserver" in window) {
      chapterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            chapterLinks.forEach((link) =>
              link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`),
            );
          });
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      chapterLinks.forEach((link) => {
        const section = root.querySelector(link.getAttribute("href") ?? "");
        if (section) chapterObserver?.observe(section);
      });
    }

    return () => {
      mutations.disconnect();
      io?.disconnect();
      chapterObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerout", onPointerOut);
    };
  }, [rootRef]);
}
