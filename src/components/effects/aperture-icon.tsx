"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

/**
 * Animated lens aperture (iris). Six blade-edges inside a ring; on mount the
 * iris twists open (Anime.js), then breathes almost imperceptibly. Colour comes
 * from `currentColor` (set `text-red` on the parent). Decorative: aria-hidden.
 * Under prefers-reduced-motion it renders fully open with no animation.
 */
const R = 46; // outer ring radius (viewBox 100)
const r = 13; // inner hole radius

function bladePoints() {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let k = 0; k < 6; k++) {
    const a = (k * 60 * Math.PI) / 180;
    const b = ((k * 60 + 60) * Math.PI) / 180;
    lines.push({
      x1: 50 + R * Math.cos(a),
      y1: 50 + R * Math.sin(a),
      x2: 50 + r * Math.cos(b),
      y2: 50 + r * Math.sin(b),
    });
  }
  return lines;
}

export function ApertureIcon({
  size = 44,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const bladesRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const blades = bladesRef.current;
    if (!blades) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const anims: Array<{ pause: () => void }> = [];

    anims.push(
      animate(blades, {
        rotate: [-55, 0],
        scale: [0.55, 1],
        opacity: [0, 1],
        duration: 900,
        ease: "out(4)",
        onComplete: () => {
          anims.push(
            animate(blades, {
              rotate: [0, 5, 0],
              scale: [1, 1.04, 1],
              duration: 5200,
              loop: true,
              ease: "inOut(2)",
            }),
          );
        },
      }),
    );

    return () => anims.forEach((a) => a.pause());
  }, []);

  const lines = bladePoints();

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      fill="none"
    >
      <circle
        cx="50"
        cy="50"
        r={R}
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.85"
      />
      <g
        ref={bladesRef}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}
