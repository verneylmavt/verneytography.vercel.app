"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate } from "animejs";

import { site } from "@/content/site";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { ensureGsap } from "@/components/motion/gsap";

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

const socials = [
  { label: "Email", href: site.contact.email },
  { label: "LinkedIn", href: site.contact.linkedin },
  { label: "Instagram", href: site.contact.instagram },
];

// Per-character accent map (matches v3): VER · NEYLMAV · T render red.
const NAME_RED: readonly (readonly boolean[])[] = [
  [false, false, true, true, true, false], // Elvern → VER
  [true, true, true, true, true, true, true], // Neylmav → all
  [true, false, false, false, false], // Tanny → T
];

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const topStripRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const chars = root.querySelectorAll<HTMLElement>("[data-hero-char]");
    const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");
    const topStrip = topStripRef.current;
    const arrow = scrollArrowRef.current;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Open the wipe masks so the hover lift and 'y' descenders never clip.
    const openMasks = () =>
      lines.forEach((line) => {
        line.style.overflow = "visible";
      });

    if (reduce) {
      chars.forEach((char) => {
        char.style.opacity = "1";
        char.style.transform = "none";
      });
      openMasks();
      if (topStrip) topStrip.style.opacity = "1";
      return;
    }

    const anims: Array<{ pause: () => void }> = [];

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { yPercent: 110 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.025,
          ease: "expo.out",
          delay: 0.1,
          // Once revealed, drop the inline transform so a later viewport
          // resize can't strand the letters at a stale translate inside the
          // clip — and so the CSS hover lift can take over — then open the
          // masks so the lift and descenders are no longer clipped.
          clearProps: "transform",
          onComplete: openMasks,
        },
      );
    }, root);

    // Anime.js flourishes (skip under reduced motion above).
    if (topStrip) {
      anims.push(
        animate(topStrip, {
          opacity: [0, 1],
          translateY: [-6, 0],
          duration: 600,
          delay: 250,
          ease: "out(3)",
        }),
      );
    }
    if (arrow) {
      anims.push(
        animate(arrow, {
          translateY: [0, 4, 0],
          duration: 1600,
          loop: true,
          ease: "inOut(2)",
        }),
      );
    }

    return () => {
      ctx.revert();
      anims.forEach((a) => a.pause());
    };
  }, []);

  return (
    <section
      id="home"
      aria-label="Intro"
      ref={rootRef}
      className="relative isolate flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden"
    >
      <div
        ref={topStripRef}
        className="u-shell flex items-start justify-between gap-4 pt-20 sm:pt-24"
        style={{ opacity: 0 }}
      >
        <HashtagLabel index="01" label="Index" />
        <span className="u-label text-right leading-relaxed">
          {site.hero.location}
          <span className="u-slash mx-2">/</span>
          <span className="u-tabular">{site.hero.coords}</span>
        </span>
      </div>

      <div className="u-shell flex min-h-0 flex-1 flex-col py-6">
        <div className="my-auto">
          <h1 className="font-medium tracking-[-0.025em] uppercase leading-[0.9] text-[clamp(2.5rem,min(14vw,13vh),9rem)]">
            {site.hero.nameLines.map((line, li) => (
              <span
                key={line}
                data-hero-line
                className="block overflow-hidden"
              >
                {line.split("").map((ch, ci) => (
                  <span
                    key={ci}
                    data-hero-char
                    className={`hero-char inline-block ${NAME_RED[li]?.[ci] ? "text-red" : ""}`}
                    style={{ opacity: 0, transform: "translateY(110%)" }}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            ))}
          </h1>

          <div className="mt-8 max-w-xl sm:mt-10">
            <span className="inline-flex items-center gap-2 self-start border border-rule px-3 py-1.5 u-label text-ink">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red" />
              {site.hero.tagline}
            </span>
            <p className="u-label mt-4">
              Photographer
              <span className="u-slash mx-1.5">/</span>
              {site.hero.location}
              <span className="u-slash mx-1.5">/</span>
              <span className="u-tabular">2018—2019</span>
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              {socials.map((social) => {
                const http = isHttpUrl(social.href);
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    target={http ? "_blank" : undefined}
                    rel={http ? "noopener noreferrer" : undefined}
                    className="u-link u-label inline-flex items-center gap-1 text-ink"
                  >
                    {social.label}
                    <span aria-hidden>↗</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="u-shell flex justify-end pb-6">
        <a
          href="#work"
          className="u-link u-label inline-flex items-center gap-2 text-ink"
          aria-label="Scroll to works"
        >
          [ Scroll
          <span ref={scrollArrowRef} aria-hidden className="inline-block">
            ↓
          </span>
          ]
        </a>
      </div>
    </section>
  );
}
