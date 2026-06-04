"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { site } from "@/content/site";
import { HalftoneBackground } from "@/components/effects/halftone-background";
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

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduce) {
      lines.forEach((line) => {
        line.style.opacity = "1";
        line.style.transform = "none";
      });
      return;
    }

    const gsap = ensureGsap();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        lines,
        { yPercent: 110 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.09,
          ease: "expo.out",
          delay: 0.1,
          // Once revealed, drop the inline transform so a later viewport
          // resize can't strand the lines at a stale translate inside the clip.
          clearProps: "transform",
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  const lastIndex = site.hero.nameLines.length - 1;

  return (
    <section
      id="home"
      aria-label="Intro"
      ref={rootRef}
      className="relative isolate flex min-h-svh flex-col overflow-hidden"
    >
      <HalftoneBackground className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

      <div className="u-shell flex items-start justify-between gap-4 pt-24 sm:pt-28">
        <HashtagLabel index="01" label="Index" />
        <span className="u-label text-right leading-relaxed">
          {site.hero.location}
          <span className="u-slash mx-2">/</span>
          <span className="u-tabular">{site.hero.coords}</span>
        </span>
      </div>

      <div className="u-shell flex flex-1 flex-col justify-center py-10">
        <h1 className="font-medium tracking-[-0.025em] uppercase leading-[0.85] text-[clamp(3rem,18vw,11rem)]">
          {site.hero.nameLines.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <span
                data-hero-line
                className={`hero-line block ${i === lastIndex ? "text-red" : ""}`}
                style={{ opacity: 0, transform: "translateY(110%)" }}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div className="u-shell grid gap-8 border-t border-rule py-8 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="max-w-xl">
          <p className="text-[0.875rem] leading-[1.55] text-ink md:text-[1rem] md:leading-[1.55]">
            {site.hero.statement}
          </p>
          <p className="u-label mt-4">
            Photographer
            <span className="u-slash mx-1.5">/</span>
            {site.hero.location}
            <span className="u-slash mx-1.5">/</span>
            <span className="u-tabular">2018—2019</span>
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
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

        <a
          href="#work"
          className="u-link u-label inline-flex items-center gap-2 self-end text-ink"
          aria-label="Scroll to works"
        >
          [ Scroll
          <span aria-hidden>↓</span>]
        </a>
      </div>
    </section>
  );
}
