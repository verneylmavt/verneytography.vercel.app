"use client";

import { useEffect, useRef } from "react";

import { ensureGsap } from "@/components/motion/gsap";

type HeadingRevealProps = {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
  /** Word indices (0-based) to render in the red accent colour. */
  redWords?: number[];
};

// Non-breaking space so the gap between inline-block words always renders.
const NBSP = String.fromCharCode(160);

/**
 * Section heading that rises word-by-word (GSAP, manual word split — no premium
 * plugin) when scrolled into view. No clip mask, so descenders never clip.
 * Under prefers-reduced-motion it renders fully visible with no motion.
 */
export function HeadingReveal({
  text,
  as = "h2",
  className = "",
  redWords,
}: HeadingRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce) {
      words.forEach((word) => {
        word.style.opacity = "1";
        word.style.transform = "none";
      });
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 40, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const Tag = as;
  const words = text.split(" ");

  return (
    <Tag ref={ref} className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          data-word
          className={`inline-block${redWords?.includes(i) ? " text-red" : ""}`}
          style={{ opacity: 0, transform: "translateY(40%)" }}
        >
          {i < words.length - 1 ? word + NBSP : word}
        </span>
      ))}
    </Tag>
  );
}
