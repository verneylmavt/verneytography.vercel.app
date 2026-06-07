"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { animate } from "animejs";

import { site } from "@/content/site";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { ApertureIcon } from "@/components/effects/aperture-icon";
import { ViewfinderOverlay } from "@/components/effects/viewfinder-overlay";
import { AnimatedHairline } from "@/components/primitives/animated-hairline";
import {
  GlobeIcon,
  MailIcon,
  LinkedInIcon,
  InstagramIcon,
} from "@/components/icons";
import { ensureGsap } from "@/components/motion/gsap";

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

const socials = [
  { label: "Email", href: site.contact.email, Icon: MailIcon },
  { label: "LinkedIn", href: site.contact.linkedin, Icon: LinkedInIcon },
  { label: "Instagram", href: site.contact.instagram, Icon: InstagramIcon },
];

const metaRows = [
  { label: "Location", value: site.hero.location },
  { label: "Coordinates", value: site.hero.coords },
  { label: "From", value: '2017' },
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
      <ViewfinderOverlay />

      <div className="u-shell flex min-h-0 flex-1 flex-col py-16 sm:py-20">
        <div className="grid flex-1 gap-y-12 md:grid-cols-12 md:gap-x-6">
          {/* Entire Left column — intro label, name, tagline, links */}
          <div className="flex min-w-0 flex-col md:col-span-8 md:pt-2">
            <div ref={topStripRef} style={{ opacity: 0 }}>
              <HashtagLabel index="00" label="i'm" />
            </div>

            <div className="flex flex-col pt-8 sm:pt-2.5">
              
            <h1 className="font-medium tracking-[-0.025em] uppercase leading-[0.9] text-[clamp(2.75rem,16vw,8rem)]">
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
              {/* Viewfinder-framed tagline */}
              <div className="relative inline-flex max-w-full flex-col gap-3 border border-rule p-4 sm:p-5">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2 border-red"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2 border-red"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2 border-red"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-red"
                />

                <div className="flex items-center gap-3">
                  <ApertureIcon size={36} className="shrink-0 text-red" />
                  <span className="hero-tagline text-[clamp(1rem,2vw,1.5rem)] font-medium uppercase leading-[1.1] tracking-[-0.01em] text-ink">
                    <span className="hero-tagline-focus">
                      {site.hero.tagline}
                    </span>
                  </span>
                </div>

                <div className="u-label u-tabular flex flex-wrap items-center gap-2.5 text-mute">
                  <span>{site.hero.viewfinder.aperture}</span>
                  <span aria-hidden className="u-slash">
                    /
                  </span>
                  <span>{site.hero.viewfinder.shutter}</span>
                  <span aria-hidden className="u-slash">
                    /
                  </span>
                  <span>{site.hero.viewfinder.iso}</span>
                </div>
              </div>

              {/* Social links — beneath the tagline */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {socials.map((social) => {
                  const http = isHttpUrl(social.href);
                  return (
                    <Link
                      key={social.label}
                      href={social.href}
                      target={http ? "_blank" : undefined}
                      rel={http ? "noopener noreferrer" : undefined}
                      className="group inline-flex items-center gap-2 border border-rule px-4 py-2 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-ink transition-colors hover:border-ink hover:text-red"
                    >
                      <social.Icon size={14} className="shrink-0" />
                      {social.label}
                      <span
                        aria-hidden
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        ↗
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
            </div>
          </div>

          {/* Right column — metadata, main site, scroll */}
          <aside className="flex min-w-0 flex-col md:col-span-4 md:pt-2">
            {/* Metadata header — red tick accent + a hairline that draws in */}
            <p className="u-label mb-3 flex items-center gap-2 text-mute">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-red" />
              [ Metadata ]
            </p>
            <AnimatedHairline className="h-px w-full" />

            <dl className="mt-5 space-y-3.5">
              {metaRows.map((row) => (
                <div key={row.label} className="group flex items-center gap-3">
                  <dt className="u-label shrink-0 transition-colors group-hover:text-ink">
                    {row.label}
                  </dt>
                  <span
                    aria-hidden
                    className="min-w-0 flex-1 self-center border-b border-dotted border-rule transition-colors group-hover:border-[rgb(var(--mute)/0.7)]"
                  />
                  <dd className="u-tabular shrink-0 text-[0.8125rem] text-ink transition-colors group-hover:text-red">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Divider between metadata and the Main Site button */}
            <div aria-hidden className="mt-8 h-px w-full bg-rule" />

            {/* Main Site — full column width, matching the metadata panel */}
            <Link
              href={site.personalWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 flex w-full items-center justify-between gap-2 bg-red px-5 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-paper shadow-[3px_3px_0_rgb(var(--ink))] transition-all hover:bg-ink hover:shadow-[1px_1px_0_rgb(var(--red))]"
            >
              <span className="inline-flex items-center gap-2">
                <GlobeIcon size={16} className="shrink-0 text-paper" />
                Main Site
              </span>
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </Link>

            {/* Scroll — directly beneath Main Site */}
            <a
              href="#work"
              aria-label="Scroll to works"
              className="group u-label mt-6 inline-flex items-center gap-3 text-mute transition-colors hover:text-ink"
            >
              <span
                aria-hidden
                className="h-px w-10 bg-rule transition-all duration-300 group-hover:w-16 group-hover:bg-red"
              />
              <span ref={scrollArrowRef} aria-hidden className="inline-block">
                ↓
              </span>
              scroll
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
