"use client";

import { useEffect, useRef } from "react";
import { animate, svg } from "animejs";

/**
 * A thin red rule that draws itself left-to-right (Anime.js SVG draw) the first
 * time it scrolls into view. Under prefers-reduced-motion it renders fully drawn.
 * Decorative: aria-hidden.
 */
export function AnimatedHairline({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const path = el.querySelector<SVGLineElement>("line");
    if (!path) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce) return; // CSS leaves it fully drawn

    const [drawable] = svg.createDrawable(path);
    // Start hidden, draw in on first intersection.
    animate(drawable, { draw: "0 0", duration: 0 });

    const io = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          animate(drawable, {
            draw: ["0 0", "0 1"],
            duration: 900,
            ease: "inOut(3)",
          });
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      aria-hidden
      viewBox="0 0 100 1"
      preserveAspectRatio="none"
      className={className}
    >
      <line
        x1="0"
        y1="0.5"
        x2="100"
        y2="0.5"
        stroke="rgb(var(--red))"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
