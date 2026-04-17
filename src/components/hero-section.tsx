import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Camera, Link as LinkIcon, Mail } from "lucide-react";

import { site } from "@/content/site";
import type { Photo } from "@/lib/types";

type HeroLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function HeroSection({ featuredPhoto }: { featuredPhoto: Photo }) {
  const links: HeroLink[] = [
    { label: "Email", href: site.contact.email, icon: Mail },
    { label: "LinkedIn", href: site.contact.linkedin, icon: LinkIcon },
    { label: "Instagram", href: site.contact.instagram, icon: Camera },
  ];

  return (
    <section
      id="home"
      aria-label="Intro"
      className="relative flex min-h-[calc(100svh-4rem)] items-center justify-center overflow-hidden py-16"
    >
      <Image
        src={featuredPhoto.fullUrl}
        alt={featuredPhoto.description}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-30 saturate-75"
      />
      <div className="absolute inset-0 bg-black/80" />

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
                  "group inline-flex items-center gap-2 rounded-full border border-[rgb(var(--border)/0.14)] px-4 py-2 text-sm",
                  "bg-[rgb(var(--background)/0.4)] backdrop-blur-md transition",
                  "hover:border-[rgb(var(--border)/0.22)] hover:bg-[rgb(var(--background)/0.55)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                ].join(" ")}
              >
                <Icon aria-hidden className="h-4 w-4 text-foreground/85" />
                <span className="text-foreground/90">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <a
          href="#gallery"
          className="group mt-16 inline-flex animate-[fadeUp_700ms_ease-out_260ms_both] items-center justify-center gap-3 text-sm text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
