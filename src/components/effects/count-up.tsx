"use client";

import { useEffect, useRef } from "react";

import { ensureGsap } from "@/components/motion/gsap";

function format(
  value: number,
  pad: number,
  decimals: number,
  suffix: string,
): string {
  const numeric =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  const padded = pad > 0 ? numeric.padStart(pad, "0") : numeric;
  return padded + suffix;
}

/**
 * Counts up from 0 to `value` when scrolled into view (GSAP ScrollTrigger).
 * SSR renders the final value (no-JS friendly); under prefers-reduced-motion
 * the final value is shown immediately with no tween. Supports a fixed number
 * of `decimals` and a trailing `suffix` (e.g. "k").
 */
export function CountUp({
  value,
  pad = 0,
  decimals = 0,
  suffix = "",
  className = "",
}: {
  value: number;
  pad?: number;
  decimals?: number;
  suffix?: string;
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
      el.textContent = format(value, pad, decimals, suffix);
      return;
    }

    const gsap = ensureGsap();
    const counter = { n: 0 };
    el.textContent = format(0, pad, decimals, suffix);

    const ctx = gsap.context(() => {
      gsap.to(counter, {
        n: value,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = format(counter.n, pad, decimals, suffix);
        },
        onComplete: () => {
          el.textContent = format(value, pad, decimals, suffix);
        },
      });
    }, el);

    return () => ctx.revert();
  }, [value, pad, decimals, suffix]);

  return (
    <span ref={ref} className={className}>
      {format(value, pad, decimals, suffix)}
    </span>
  );
}
