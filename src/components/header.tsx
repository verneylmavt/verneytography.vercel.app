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
import { animate, stagger } from "animejs";

import { site } from "@/content/site";
import { ThemeToggle } from "@/components/theme-toggle";

type Section = { id: string; label: string };

const sections: Section[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "stats", label: "Stats" },
  { id: "work", label: "Works" },
  { id: "info", label: "Info" },
  { id: "contact", label: "Contact" },
];

function useActiveSection(sectionIds: string[]) {
  const [active, setActive] = useState("");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((value): value is HTMLElement => Boolean(value));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));

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
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);
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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (mobileMenuButtonRef.current?.contains(target)) return;
      if (mobileMenuRef.current?.contains(target)) return;
      setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mobileMenuOpen]);

  // Subtle on-load slide-in for the desktop nav links (Anime.js). Slide only
  // (no opacity) so links stay visible without JS and there's no flash.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const links = nav.querySelectorAll("a");
    if (!links.length) return;
    const anim = animate(links, {
      translateY: [-8, 0],
      duration: 500,
      delay: stagger(45, { start: 150 }),
      ease: "out(3)",
    });
    return () => anim.pause();
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-40 w-full border-b border-rule transition-colors",
        scrolled
          ? "bg-[rgb(var(--paper)/0.9)] backdrop-blur-md"
          : "bg-[rgb(var(--paper)/0.65)] backdrop-blur-sm",
      ].join(" ")}
    >
      <div className="u-shell flex h-16 items-center justify-between gap-4">
        <Link
          href="#home"
          className="u-link shrink-0 text-sm font-medium uppercase tracking-[0.06em] text-ink"
        >
          {site.brand}
          <span className="text-red">©</span>
        </Link>

        <nav className="hidden md:block" aria-label="Sections">
          <ul ref={navRef} className="relative flex h-16 items-center gap-7">
            <span
              aria-hidden
              className={[
                "pointer-events-none absolute bottom-0 left-0 h-[2px] bg-red",
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
                      "text-[0.75rem] uppercase tracking-[0.06em] transition-colors",
                      active ? "text-ink" : "text-mute hover:text-ink",
                    ].join(" ")}
                  >
                    {section.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="u-label border border-rule px-3 py-2 text-ink transition-colors hover:border-ink md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
          >
            {mobileMenuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <div
        ref={mobileMenuRef}
        id="mobile-nav"
        className={[
          "md:hidden",
          "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
          mobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          <div className="u-shell grid gap-px border-t border-rule py-2">
            {sections.map((section) => {
              const active = activeId === section.id;
              return (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "flex items-center justify-between border-b border-rule py-4 text-[0.875rem] uppercase tracking-[0.06em] transition-colors",
                    active ? "text-red" : "text-ink hover:text-red",
                  ].join(" ")}
                >
                  <span>{section.label}</span>
                  <span aria-hidden className="text-mute">
                    ↗
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
