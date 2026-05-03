import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  Camera,
  Globe2,
  Link as LinkIcon,
  Mail,
} from "lucide-react";

import { site } from "@/content/site";

type HeroLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function HeroSection() {
  const links: HeroLink[] = [
    { label: "Email", href: site.contact.email, icon: Mail },
    { label: "LinkedIn", href: site.contact.linkedin, icon: LinkIcon },
    { label: "Instagram", href: site.contact.instagram, icon: Camera },
  ];

  const personalWebsiteHost = (() => {
    try {
      return new URL(site.personalWebsiteUrl).hostname.replace(/^www\./, "");
    } catch {
      return site.personalWebsiteUrl;
    }
  })();

  return (
    <section
      id="home"
      aria-label="Intro"
      className="relative isolate flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden bg-transparent py-16"
    >
      <div className="relative z-10 mx-auto w-full max-w-4xl px-6 text-center">
        {site.hero.location ? (
          <p className="animate-[fadeUp_700ms_ease-out] text-sm text-muted">
            {site.hero.location}
          </p>
        ) : null}

        <h1 className="mx-auto mt-6 animate-[fadeUp_700ms_ease-out_80ms_both] max-w-3xl text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl font-[family:var(--font-serif)]">
          {site.hero.name}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl animate-[fadeUp_700ms_ease-out_140ms_both] text-pretty text-lg leading-relaxed text-muted sm:text-xl">
          {site.hero.tagline}
        </p>

        <div className="mt-10 flex animate-[fadeUp_700ms_ease-out_200ms_both] flex-wrap items-center justify-center gap-3">
          {links.map((link) => {
            const isHttpLink = isHttpUrl(link.href);
            const target = isHttpLink ? "_blank" : undefined;
            const rel = isHttpLink ? "noopener noreferrer" : undefined;
            const Icon = link.icon;

            return (
              <Link
                key={link.label}
                href={link.href}
                target={target}
                rel={rel}
                className={[
                  "liquid-glass liquid-glass--premium group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm transition",
                  "text-foreground/90 hover:text-foreground",
                ].join(" ")}
              >
                <Icon
                  aria-hidden
                  className="h-4 w-4 text-foreground/85 transition duration-200 motion-reduce:transition-none"
                />
                <span className="text-foreground/90">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex animate-[fadeUp_700ms_ease-out_240ms_both] justify-center">
          <Link
            href={site.personalWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={[
              "liquid-glass group relative flex w-full max-w-md items-center gap-4 rounded-2xl px-5 py-4 text-left transition",
              "text-foreground/90 hover:text-foreground",
              "transform-gpu hover:-translate-y-0.5 motion-reduce:transform-none",
            ].join(" ")}
            aria-label="Personal Website"
          >
            <span
              aria-hidden
              className={[
                "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
                "bg-[radial-gradient(80%_120%_at_15%_0%,rgb(var(--accent)/0.22),transparent_60%)]",
                "group-hover:opacity-100 motion-reduce:transition-none",
              ].join(" ")}
            />
            <span
              aria-hidden
              className={[
                "pointer-events-none absolute -left-1/3 top-0 h-full w-1/3 skew-x-12 opacity-0 blur-xl",
                "bg-white/10 transition duration-700 group-hover:translate-x-[260%] group-hover:opacity-100",
                "motion-reduce:hidden",
              ].join(" ")}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--accent)/0.7)] to-transparent opacity-80"
            />

            <span
              aria-hidden
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[rgb(var(--border)/0.14)] bg-[rgb(var(--foreground)/0.04)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              <Globe2 className="h-5 w-5 text-foreground/80" />
            </span>

            <div className="relative min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                Personal Website
              </p>
              <p className="mt-1 truncate text-sm text-muted">
                {personalWebsiteHost}
              </p>
            </div>

            <ArrowUpRight
              aria-hidden
              className="relative h-5 w-5 shrink-0 text-foreground/65 transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground motion-reduce:transition-none"
            />
          </Link>
        </div>

        <a
          href="#gallery"
          className="group mt-12 inline-flex animate-[fadeUp_700ms_ease-out_300ms_both] items-center justify-center gap-3 text-sm text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Scroll to Gallery"
        >
          <span className="underline underline-offset-4 decoration-[rgb(var(--foreground)/0.25)] group-hover:decoration-[rgb(var(--foreground)/0.45)]">
            Scroll
          </span>
          <span className="inline-flex h-px w-10 bg-[rgb(var(--foreground)/0.25)]" />
          <span className="text-foreground/75">{"\u2193"}</span>
        </a>
      </div>
    </section>
  );
}
