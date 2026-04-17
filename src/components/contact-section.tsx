import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Camera, Link as LinkIcon, Mail } from "lucide-react";

import { site } from "@/content/site";

type ContactLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const links: ContactLink[] = [
  { label: "Email", href: site.contact.email, icon: Mail },
  { label: "LinkedIn", href: site.contact.linkedin, icon: LinkIcon },
  { label: "Instagram", href: site.contact.instagram, icon: Camera },
];

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function ContactSection() {
  return (
    <section id="contact" className="scroll-mt-28 py-24">
      <div className="flex items-end justify-between gap-6 border-t border-[rgb(var(--border)/0.10)] pt-10">
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl font-[family:var(--font-serif)]">
            Contact
          </h2>
          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted">
            Let’s collaborate. I’m always open to exchanging ideas!
          </p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
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
                "group inline-flex items-center justify-center gap-2 rounded-full border border-[rgb(var(--border)/0.14)] px-5 py-2.5 text-sm",
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

      <footer className="mt-16 pb-10 text-sm text-muted">
        <p>©verneytography. Inspired by https://verneylmavt.com/.</p>
      </footer>
    </section>
  );
}
