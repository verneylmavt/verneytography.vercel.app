import Link from "next/link";

import { site } from "@/content/site";
import {
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
} from "@/components/icons";
import { AnimatedHairline } from "@/components/primitives/animated-hairline";
import { HashtagLabel } from "@/components/primitives/hashtag-label";
import { HeadingReveal } from "@/components/primitives/heading-reveal";
import { Reveal } from "@/components/primitives/reveal";

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

function displayHandle(label: string, href: string): string {
  if (label === "Email") return href.replace(/^mailto:/, "");
  try {
    const url = new URL(href);
    const path = url.pathname.replace(/\/+$/, "");
    if (label === "Instagram") {
      const handle = path.split("/").filter(Boolean).pop();
      return handle ? `@${handle}` : url.host;
    }
    return url.host.replace(/^www\./, "") + path;
  } catch {
    return href;
  }
}

const links = [
  { label: "Email", href: site.contact.email, Icon: MailIcon },
  { label: "LinkedIn", href: site.contact.linkedin, Icon: LinkedInIcon },
  { label: "Instagram", href: site.contact.instagram, Icon: InstagramIcon },
];

export function ContactSection() {
  const year = new Date().getFullYear();

  return (
    <section id="contact" className="u-rule-t scroll-mt-24">
      <div className="u-shell py-20 sm:py-28">
        <HashtagLabel index="05" label="reach me" />

        <HeadingReveal
          as="h2"
          text="Let's talk"
          redWords={[1]}
          className="u-display text-h1 mt-6 max-w-[12ch]"
        />
        <AnimatedHairline className="mt-5 h-px w-40 max-w-full" />
        <Reveal delay={0.05}>
          <p className="mt-6 max-w-xl text-[0.875rem] leading-[1.55] text-ink md:text-[1rem]">
            Let's collaborate and build something meaningful.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-3">
          {links.map((link, i) => {
            const http = isHttpUrl(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                target={http ? "_blank" : undefined}
                rel={http ? "noopener noreferrer" : undefined}
                className="group relative block overflow-hidden bg-paper p-4 sm:p-8"
              >
                <span
                  aria-hidden
                  className="absolute inset-0 origin-bottom scale-y-0 bg-red transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100 motion-reduce:transition-none"
                />
                <span className="relative z-10 flex h-full flex-col justify-between gap-12">
                  <span className="flex items-center justify-between text-[0.6875rem] uppercase tracking-[0.06em] text-mute transition-colors group-hover:text-paper group-focus-visible:text-paper">
                    <span className="flex items-center gap-2">
                      <link.Icon size={14} className="shrink-0" />
                      {link.label}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="u-tabular">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span aria-hidden>↗</span>
                    </span>
                  </span>
                  <span className="break-words text-[0.875rem] text-ink transition-colors group-hover:text-paper group-focus-visible:text-paper md:text-[1rem]">
                    {displayHandle(link.label, link.href)}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>

        <Reveal>
          <footer className="u-grid mt-16 items-center gap-y-3 border-t border-rule pt-8">
            <p className="u-label col-span-12 flex items-center gap-2 sm:col-span-4">
              <span aria-hidden className="inline-block h-1.5 w-1.5 bg-red" />
              ©{site.brand}
            </p>
            <p className="u-label col-span-12 text-center text-mute sm:col-span-4">
              Built w/ Next.js 15
            </p>
            <p className="u-label col-span-12 text-left sm:col-span-4 sm:text-right">
              Swiss Design
            </p>
          </footer>
        </Reveal>
      </div>
    </section>
  );
}
