"use client";

import { useEffect, useRef } from "react";

import { ensureGsap } from "@/components/motion/gsap";

function format(value: number, pad: number): string {
  const rounded = String(Math.round(value));
  return pad > 0 ? rounded.padStart(pad, "0") : rounded;
}

/**
 * Counts up from 0 to `value` when scrolled into view (GSAP ScrollTrigger).
 * SSR renders the final value (no-JS friendly); under prefers-reduced-motion
 * the final value is shown immediately with no tween.
 */
export function CountUp({
  value,
  pad = 0,
  className = "",
}: {
  value: number;
  pad?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      el.textContent = format(value, pad);
      return;
    }

    const gsap = ensureGsap();
    const counter = { n: 0 };
    el.textContent = format(0, pad);

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        n: value,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = format(counter.n, pad);
        },
        onComplete: () => {
          el.textContent = format(value, pad);
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, pad]);

  return (
    <span ref={ref} className={className}>
      {format(value, pad)}
    </span>
  );
}
