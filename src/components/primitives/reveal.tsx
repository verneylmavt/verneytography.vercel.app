"use client";

import { useEffect, useRef } from "react";

import { ensureGsap } from "@/components/motion/gsap";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** vertical offset in px */
  y?: number;
  delay?: number;
};

/**
 * Scroll-triggered fade-up wrapper (GSAP). Animates once on enter.
 * Under prefers-reduced-motion it renders fully visible with no motion.
 */
export function Reveal({ children, className, y = 22, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      el.style.opacity = "1";
      el.style.transform = "none";
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [y, delay]);

  return (
    <div ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}
