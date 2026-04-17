"use client";

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
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="#home"
          className="justify-self-start text-sm font-semibold tracking-tight text-foreground transition hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent)/0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {site.brand}
        </Link>

        <nav
          className="flex items-center gap-1 justify-self-center"
          aria-label="Sections"
        >
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
                      active ? "text-foreground" : "text-muted hover:text-foreground",
                    ].join(" ")}
                  >
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="justify-self-end" aria-hidden />
      </div>
    </header>
  );
}
