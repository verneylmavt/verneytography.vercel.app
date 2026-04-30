"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { site } from "@/content/site";

type Section = { id: string; label: string };

const sections: Section[] = [
  { id: "home", label: "Home" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
];

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState(sectionIds[0] ?? "home");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((value): value is HTMLElement => Boolean(value));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0),
          );

        const top = visible[0];
        if (top?.target instanceof HTMLElement) setActive(top.target.id);
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.1, 0.25, 0.4, 0.6],
      },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [sectionIds]);

  return active;
}

export function Header() {
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const activeId = useActiveSection(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLUListElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [highlight, setHighlight] = useState<{
    x: number;
    width: number;
    ready: boolean;
  }>({ x: 0, width: 0, ready: false });

  const updateHighlight = useCallback(() => {
    const link = linkRefs.current[activeId];
    if (!link) {
      setHighlight((current) =>
        current.ready ? { ...current, ready: false } : current,
      );
      return;
    }

    setHighlight({ x: link.offsetLeft, width: link.offsetWidth, ready: true });
  }, [activeId]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    updateHighlight();
  }, [updateHighlight]);

  useEffect(() => {
    window.addEventListener("resize", updateHighlight);
    return () => window.removeEventListener("resize", updateHighlight);
  }, [updateHighlight]);

  useEffect(() => {
    const list = navRef.current;
    if (!list) return;
    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => updateHighlight());
    observer.observe(list);
    return () => observer.disconnect();
  }, [updateHighlight]);

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full",
        scrolled
          ? "bg-[rgb(var(--background)/0.6)] backdrop-blur-xl"
          : "bg-[rgb(var(--background)/0.15)] backdrop-blur-md",
      ].join(" ")}
    >
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 sm:gap-3 sm:px-6 lg:px-8">
        <Link
          href="#home"
          className="min-w-0 max-w-[12rem] truncate justify-self-start text-xs font-semibold tracking-tight text-foreground transition hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:max-w-none sm:text-sm"
        >
          {site.brand}
        </Link>

        <div className="justify-self-center">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Sections">
            <ul
              ref={navRef}
              className="relative flex items-center gap-1 rounded-full border border-[rgb(var(--border)/0.14)] bg-[rgb(var(--background)/0.35)] p-1 backdrop-blur-md"
            >
              <span
                aria-hidden
                className={[
                  "pointer-events-none absolute inset-y-1 left-0 rounded-full bg-[rgb(var(--foreground)/0.08)]",
                  "transition-[transform,width,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                  highlight.ready ? "opacity-100" : "opacity-0",
                ].join(" ")}
                style={{
                  width: highlight.width,
                  transform: `translateX(${highlight.x}px)`,
                }}
              />
              {sections.map((section) => {
                const active = activeId === section.id;
                return (
                  <li key={section.id}>
                    <Link
                      href={`#${section.id}`}
                      ref={(node) => {
                        linkRefs.current[section.id] = node;
                      }}
                      aria-current={active ? "page" : undefined}
                      className={[
                        "relative z-10 rounded-full px-3 py-2 text-sm transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        active
                          ? "text-foreground"
                          : "text-muted hover:text-foreground",
                      ].join(" ")}
                    >
                      {section.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Dialog.Root open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className={[
                  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgb(var(--border)/0.14)] md:hidden",
                  "bg-[rgb(var(--background)/0.35)] text-foreground/90 backdrop-blur-md transition",
                  "hover:border-[rgb(var(--border)/0.22)] hover:bg-[rgb(var(--background)/0.55)] hover:text-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                ].join(" ")}
                aria-label="Open menu"
              >
                <Menu aria-hidden className="h-5 w-5" />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm data-[state=open]:animate-[fadeIn_220ms_ease-out] data-[state=closed]:animate-[fadeOut_180ms_ease-in]" />
              <Dialog.Content className="fixed left-1/2 top-[4.5rem] z-50 w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-[rgb(var(--border)/0.14)] bg-[rgb(var(--background)/0.75)] p-2 shadow-2xl backdrop-blur-xl focus:outline-none data-[state=open]:animate-[zoomIn_220ms_ease-out] data-[state=closed]:animate-[zoomOut_180ms_ease-in]">
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="text-xs font-semibold tracking-tight text-foreground/90">
                    Navigate
                  </p>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgb(var(--border)/0.14)] bg-[rgb(var(--background)/0.35)] text-foreground/90 backdrop-blur transition hover:border-[rgb(var(--border)/0.22)] hover:bg-[rgb(var(--background)/0.55)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)]"
                      aria-label="Close menu"
                    >
                      <X aria-hidden className="h-4 w-4" />
                    </button>
                  </Dialog.Close>
                </div>

                <div className="grid gap-1 p-1">
                  {sections.map((section) => {
                    const active = activeId === section.id;

                    return (
                      <Link
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={[
                          "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors",
                          active
                            ? "border-[rgb(var(--border)/0.20)] bg-[rgb(var(--foreground)/0.08)] text-foreground"
                            : "border-[rgb(var(--border)/0.12)] bg-[rgb(var(--surface)/0.25)] text-foreground/85 hover:border-[rgb(var(--border)/0.18)] hover:bg-[rgb(var(--surface)/0.35)]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        ].join(" ")}
                      >
                        <span>{section.label}</span>
                        <span className="text-foreground/55">{"\u2192"}</span>
                      </Link>
                    );
                  })}
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>

        <div className="justify-self-end" aria-hidden />
      </div>
    </header>
  );
}
